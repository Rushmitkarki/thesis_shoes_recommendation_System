from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from pymongo import MongoClient
import base64
import json
from bson import ObjectId

app = Flask(__name__)
CORS(app)

# MongoDB Connection
client = MongoClient('mongodb://localhost:27017/')
db = client['shoe_store']
shoes_collection = db['shoes']

def get_available_camera():
    """Detects available camera index."""
    for index in range(5):  # Check camera indexes 0 to 4
        cap = cv2.VideoCapture(index)
        if cap.isOpened():
            cap.release()
            return index
    return None

# Automatically detect the available camera index
camera_index = get_available_camera()
if camera_index is None:
    print("No available camera found.")
    camera = None
else:
    camera = cv2.VideoCapture(camera_index)
    print(f"Using camera index: {camera_index}")

def remove_background(image_path):
    """Remove background from the shoe image using OpenCV."""
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply threshold to remove white background
    _, mask = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    
    # Apply mask to keep only shoe
    result = cv2.bitwise_and(image, image, mask=mask)
    return result

def detect_foot(frame):
    """Detect foot in the camera frame using contours."""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blurred, 100, 255, cv2.THRESH_BINARY)

    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        foot_contour = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(foot_contour)
        return x, y, w, h
    return None

@app.route('/api/shoes', methods=['GET'])
def get_shoes():
    """Fetch shoe data from MongoDB."""
    shoes = list(shoes_collection.find())
    for shoe in shoes:
        shoe['_id'] = str(shoe['_id'])  # Convert ObjectId to string for JSON
    return jsonify(shoes)

@app.route('/api/try-on', methods=['POST'])
def virtual_try_on():
    """Capture camera feed, detect foot, overlay shoe, and return image."""
    if camera is None:
        return jsonify({'error': 'No available camera detected'})

    data = request.json
    shoe_id = data['shoeId']
    
    # Retrieve shoe image from MongoDB
    shoe = shoes_collection.find_one({'_id': ObjectId(shoe_id)})
    shoe_image_path = shoe.get('image', None)
    if not shoe_image_path:
        return jsonify({'error': 'Shoe image not found'})

    # Capture camera frame
    ret, frame = camera.read()
    if not ret:
        return jsonify({'error': 'Failed to capture camera frame'})

    # Detect foot in the frame
    foot_bbox = detect_foot(frame)
    if foot_bbox is None:
        return jsonify({'error': 'Foot not detected'})

    x, y, w, h = foot_bbox

    # Process shoe image
    shoe_image = remove_background(shoe_image_path)
    shoe_resized = cv2.resize(shoe_image, (w, h))

    # Overlay shoe onto detected foot
    overlay_result = frame.copy()
    for c in range(0, 3):
        overlay_result[y:y+h, x:x+w, c] = np.where(
            shoe_resized[:, :, c] == 0,
            frame[y:y+h, x:x+w, c],
            shoe_resized[:, :, c]
        )

    # Convert processed image to Base64
    _, buffer = cv2.imencode('.jpg', overlay_result)
    processed_image = base64.b64encode(buffer).decode('utf-8')

    return jsonify({'result': processed_image})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
