import os

os.environ["TF_USE_LEGACY_KERAS"] = "1"
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2' 

import base64
import numpy as np
import cv2
from deepface import DeepFace
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint to verify the service is running."""
    return jsonify({
        "status": "active",
        "service": "MindWell AI Emotion Service",
        "port": 8000
    })

@app.route('/analyze-emotion', methods=['POST'])
def analyze_emotion():
    """
    Analyze a base64-encoded image and return facial emotion analysis.
    Expected JSON: { "image": "data:image/jpeg;base64,..." }
    """
    data = request.get_json(silent=True)
    if not data or 'image' not in data:
        return jsonify({"error": "No image data found in request."}), 400

    try:
        # 1. Process Base64 Image
        image_data = data['image']
        if ',' in image_data:
            # Strip data-URL prefix (e.g., "data:image/jpeg;base64,")
            image_data = image_data.split(',', 1)[1]

        # Decode base64 to numpy array
        img_bytes = base64.b64decode(image_data)
        np_arr = np.frombuffer(img_bytes, dtype=np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({"error": "Failed to decode image. Ensure it's a valid Base64 string."}), 400

        # 2. DeepFace Emotion Analysis + Detection
        # Using 'opencv' for maximum speed in real-time detection
        results = DeepFace.analyze(
            img_path=img,
            actions=['emotion'],
            enforce_detection=True,
            detector_backend='opencv',
            align=True,
            silent=True
        )

        # DeepFace returns a list if multiple faces are detected
        if isinstance(results, list):
            results = results[0]

        dominant_emotion = results.get('dominant_emotion', 'neutral')
        emotion_scores = results.get('emotion', {})
        
        # Extract face coordinates from DeepFace region
        region = results.get('region', {})
        rx, ry, rw, rh = region.get('x', 0), region.get('y', 0), region.get('w', 0), region.get('h', 0)
        
        # Add significant padding to ensure it covers the WHOLE head (hair, chin, etc)
        pad_w = int(rw * 0.30)
        pad_h = int(rh * 0.40)
        
        face_rect = {
            "x": max(0, int(rx - pad_w)),
            "y": max(0, int(ry - pad_h)),
            "w": int(rw + 2 * pad_w),
            "h": int(rh + 2 * pad_h)
        }

        print(f"DEBUG: Detected {dominant_emotion} at {face_rect} in {img.shape[1]}x{img.shape[0]} image")

        return jsonify({
            "success": True,
            "emotion": dominant_emotion,
            "scores": {k: round(float(v), 2) for k, v in emotion_scores.items()},
            "face_rect": face_rect,
            "img_dims": {"w": img.shape[1], "h": img.shape[0]}
        })

    except ValueError as ve:
        # Specific error if DeepFace fails to find a face despite OpenCV finding one
        if "face could not be detected" in str(ve).lower():
            return jsonify({"error": "Face detected by system but quality is too low for AI analysis. Improve lighting."}), 422
        return jsonify({"error": f"Value Error: {str(ve)}"}), 400
    except Exception as e:
        print(f"Server Error: {str(e)}")
        return jsonify({"error": f"AI Service Error: {str(e)}"}), 500

if __name__ == '__main__':
    print("MindWell AI Service running on http://localhost:8000")
    # Using host='0.0.0.0' allows connections from outside the container/local host
    app.run(host='0.0.0.0', port=8000, debug=True)
