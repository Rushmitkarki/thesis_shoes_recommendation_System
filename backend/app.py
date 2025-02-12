from flask import Flask, Response, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from pymongo import MongoClient
import os
from bson import ObjectId
from rembg import remove

app = Flask(__name__)
CORS(app)

# MongoDB Connection
client = MongoClient('mongodb://127.0.0.1:27017')
db = client['shoes']
shoes_collection = db['shoes']

from flask import Flask, Response, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

# MongoDB Connection
client = MongoClient('mongodb://127.0.0.1:27017')
db = client['shoes']
shoes_collection = db['shoes']

@app.route('/shoes', methods=['GET'])
def get_shoes():
    """Fetch shoes from the database with optional category filtering."""
    category = request.args.get('category')
    query = {}
    if category:
        query['category'] = category

    shoes = list(shoes_collection.find(query, {"_id": 1, "name": 1, "brand": 1, "category": 1, "price": 1, "image": 1, "sizes": 1, "colors": 1}))
    for shoe in shoes:
        shoe["_id"] = str(shoe["_id"])
    return jsonify(shoes)



# Detect and use an external camera
def get_external_camera():
    for index in range(5):  # Check up to 5 camera indexes
        cap = cv2.VideoCapture(index)
        if cap.isOpened():
            cap.release()
            return index
    return None

camera_index = get_external_camera()
if camera_index is None:
    raise RuntimeError("No external camera detected!")

camera = cv2.VideoCapture(camera_index)

def remove_background(image_path):
    """Removes the background from a shoe image using rembg."""
    with open(image_path, "rb") as f:
        image_data = f.read()
    
    output_data = remove(image_data)
    
    np_array = np.frombuffer(output_data, np.uint8)
    processed_image = cv2.imdecode(np_array, cv2.IMREAD_UNCHANGED)

    return processed_image

def detect_foot(frame):
    """Detects the foot region in the frame using color thresholding."""
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    lower_skin = np.array([0, 20, 70], dtype=np.uint8)
    upper_skin = np.array([20, 255, 255], dtype=np.uint8)
    mask = cv2.inRange(hsv, lower_skin, upper_skin)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if contours:
        largest_contour = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest_contour)
        return x, y, w, h
    return None

def overlay_shoe(frame, shoe_image, x, y, w, h):
    """Overlays the shoe image onto the detected foot region."""
    if shoe_image is None or shoe_image.shape[0] == 0 or shoe_image.shape[1] == 0:
        return frame

    shoe_resized = cv2.resize(shoe_image, (w, h), interpolation=cv2.INTER_AREA)

    if shoe_resized.shape[2] == 3:
        shoe_resized = cv2.cvtColor(shoe_resized, cv2.COLOR_BGR2BGRA)
        shoe_resized[:, :, 3] = 255  # Ensure transparency

    overlay_result = frame.copy()
    for c in range(3):
        overlay_result[y:y+h, x:x+w, c] = np.where(
            shoe_resized[:, :, 3] == 0,
            frame[y:y+h, x:x+w, c],
            shoe_resized[:, :, c]
        )

    return overlay_result

@app.route('/video_feed/<shoe_id>')
def video_feed(shoe_id):
    """Streams processed video frames with shoe overlay."""
    global camera
    if not camera or not camera.isOpened():  # Ensure camera is opened
        camera = cv2.VideoCapture(get_external_camera())

    shoe = shoes_collection.find_one({'_id': ObjectId(shoe_id)})
    if not shoe:
        return jsonify({'error': 'Shoe not found'}), 404

    shoe_image_path = shoe.get('image')
    if not shoe_image_path or not os.path.exists(shoe_image_path):
        return jsonify({'error': 'Shoe image not found'}), 500

    shoe_image = remove_background(shoe_image_path)

    def generate_frames():
        while True:
            success, frame = camera.read()
            if not success:
                break

            foot_region = detect_foot(frame)
            if foot_region:
                x, y, w, h = foot_region
                processed_frame = overlay_shoe(frame, shoe_image, x, y, w, h)
            else:
                processed_frame = frame

            _, buffer = cv2.imencode('.jpg', processed_frame)
            frame_data = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_data + b'\r\n')

    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/stop_camera', methods=['POST'])
def stop_camera():
    """Stops the camera feed when virtual try-on is closed."""
    global camera
    if camera and camera.isOpened():
        camera.release()
        return jsonify({'message': 'Camera released successfully'}), 200
    return jsonify({'error': 'No active camera'}), 400


if __name__ == '__main__':
    try:
        app.run(debug=True, port=5000)
    finally:
        if camera:
            camera.release()
