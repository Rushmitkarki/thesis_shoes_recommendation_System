from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from pymongo import MongoClient
import base64
import json
from bson import ObjectId
import os

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient('mongodb://localhost:27017/')
db = client['shoe_store']
shoes_collection = db['shoes']
users_collection = db['users']

# Virtual try-on model setup
def process_virtual_tryon(foot_image, shoe_image):
    # This would contain the actual ML model implementation
    # For now, we'll use basic image processing as a placeholder
    try:
        foot = cv2.imread(foot_image)
        shoe = cv2.imread(shoe_image)
        
        # Resize shoe to match foot dimensions
        shoe_resized = cv2.resize(shoe, (foot.shape[1], foot.shape[0]))
        
        # Basic blending - in reality, you'd use a sophisticated ML model here
        result = cv2.addWeighted(foot, 0.3, shoe_resized, 0.7, 0)
        
        # Convert to base64 for sending to frontend
        _, buffer = cv2.imencode('.jpg', result)
        return base64.b64encode(buffer).decode('utf-8')
    except Exception as e:
        return str(e)

@app.route('/api/shoes', methods=['GET'])
def get_shoes():
    shoes = list(shoes_collection.find())
    # Convert ObjectId to string for JSON serialization
    for shoe in shoes:
        shoe['_id'] = str(shoe['_id'])
    return jsonify(shoes)

@app.route('/api/try-on', methods=['POST'])
def virtual_try_on():
    data = request.json
    foot_image = data['footImage']
    shoe_id = data['shoeId']
    
    # Get shoe image from database
    shoe = shoes_collection.find_one({'_id': ObjectId(shoe_id)})
    
    # Process images for virtual try-on
    result = process_virtual_tryon(foot_image, shoe['image'])
    
    return jsonify({'result': result})

if __name__ == '__main__':
    app.run(debug=True, port=5000)