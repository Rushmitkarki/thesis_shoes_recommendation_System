from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np
import os
import base64
import requests
from rembg import remove
from pymongo import MongoClient
from concurrent.futures import ThreadPoolExecutor

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

# Paths
base_dir = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(base_dir, 'uploaded_images')
PROCESSED_FOLDER = os.path.join(base_dir, 'processed_images')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

# Thread pool for processing
executor = ThreadPoolExecutor(max_workers=4)

# Initialize MediaPipe Pose detection
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()

def download_and_process_shoe(shoe_image_url, shoe_id):
    """Downloads, removes background, and saves shoe image."""
    shoe_path = os.path.join(UPLOAD_FOLDER, f"{shoe_id}.png")
    
    response = requests.get(shoe_image_url, stream=True)
    if response.status_code == 200:
        with open(shoe_path, "wb") as file:
            file.write(response.content)
    
    shoe_image = cv2.imread(shoe_path, cv2.IMREAD_UNCHANGED)
    if shoe_image is None:
        return None

    shoe_no_bg = remove(shoe_image)

    processed_shoe_path = os.path.join(PROCESSED_FOLDER, f"{shoe_id}_processed.png")
    cv2.imwrite(processed_shoe_path, shoe_no_bg)
    return processed_shoe_path

def overlay_shoe(frame, shoe_path, landmarks):
    """Overlays shoe image on detected foot region."""
    shoe = cv2.imread(shoe_path, cv2.IMREAD_UNCHANGED)
    if shoe is None:
        print("Failed to load shoe image.")
        return frame

    try:
        left_ankle = landmarks[mp_pose.PoseLandmark.LEFT_ANKLE]
        right_ankle = landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE]
        heel = landmarks[mp_pose.PoseLandmark.LEFT_HEEL]

        # Calculate shoe width and height
        shoe_width = int(abs(right_ankle.x - left_ankle.x) * frame.shape[1])
        shoe_height = int(abs(heel.y - left_ankle.y) * frame.shape[0])

        # Resize shoe
        shoe_resized = cv2.resize(shoe, (shoe_width, shoe_height), interpolation=cv2.INTER_AREA)

        # Calculate position for shoe overlay
        x1 = int(left_ankle.x * frame.shape[1] - shoe_width // 2)
        y1 = int(left_ankle.y * frame.shape[0] - shoe_height // 2)
        x2, y2 = x1 + shoe_width, y1 + shoe_height

        # Ensure overlay stays within frame bounds
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(frame.shape[1], x2), min(frame.shape[0], y2)

        # Overlay shoe on frame
        if shoe.shape[2] == 4:  # Ensure the image has an alpha channel
            shoe_alpha = shoe_resized[:, :, 3] / 255.0
            for c in range(3):
                frame[y1:y2, x1:x2, c] = (
                    (1 - shoe_alpha) * frame[y1:y2, x1:x2, c]
                    + shoe_alpha * shoe_resized[:, :, c]
                )
        else:
            frame[y1:y2, x1:x2] = shoe_resized

    except Exception as e:
        print(f"Error overlaying shoe: {e}")

    return frame


@app.route('/process_frame', methods=['POST'])
def process_frame():
    """Processes frame and overlays shoe."""
    shoe_id = request.form.get('shoe_id') or request.json.get('shoe_id')
    shoe_image_url = request.form.get('shoe_image') or request.json.get('shoe_image')

    if not shoe_id or not shoe_image_url:
        return jsonify({"error": "Missing shoe ID or image URL"}), 400

    print(f"Received shoe_id: {shoe_id}, shoe_image_url: {shoe_image_url}")

    if shoe_image_url == "undefined" or not shoe_image_url.startswith("http"):
        return jsonify({"error": "Invalid shoe image URL"}), 400

    # shoe_path = download_and_process_shoe(shoe_image_url, shoe_id)
    shoe_path = "processed_images/67ab7c854ee3363e276eddb0_processed.png"
    if not shoe_path:
        return jsonify({"error": "Failed to process shoe"}), 400

    print(f"Shoe processed: {shoe_path}")

    file = request.files.get('frame')
    if not file:
        return jsonify({"error": "No frame received"}), 400

    frame = np.frombuffer(file.read(), np.uint8)
    frame = cv2.imdecode(frame, cv2.IMREAD_COLOR)

    results = pose.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    if results.pose_landmarks:
        print("Pose landmarks detected:", results.pose_landmarks)

        frame = overlay_shoe(frame, shoe_path, results.pose_landmarks.landmark)
    else:
        print("No pose landmarks detected")

    _, buffer = cv2.imencode('.jpg', frame)
    encoded_image = base64.b64encode(buffer).decode('utf-8')
    return jsonify({'image': encoded_image})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)