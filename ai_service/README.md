# MindWell AI Mood Service

A lightweight Python Flask microservice that uses **OpenCV** and **DeepFace** to detect facial emotions from images.

## Requirements

- Python 3.9 or higher
- pip

## Setup

```bash
# 1. Navigate to this directory
cd ai_service

# 2. (Recommended) Create a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the service
python app.py
```

The service will start at **http://localhost:8000**.

## API Endpoints

### `GET /health`
Returns service status.

### `POST /analyze`
Analyzes a face image and returns the dominant emotion.

**Request body:**
```json
{
  "image": "<base64-encoded image string>"
}
```

**Success response:**
```json
{
  "emotion": "happy",
  "scores": {
    "angry": 0.01,
    "disgust": 0.00,
    "fear": 0.02,
    "happy": 92.5,
    "sad": 1.3,
    "surprise": 0.8,
    "neutral": 5.37
  }
}
```

**Error responses:**
- `400` — No image provided or image decode failure
- `422` — No face detected in the image
- `500` — Internal analysis error

## Notes

- First run will download DeepFace model weights (~100 MB). This is a one-time download.
- The service runs on port **8000** to avoid conflicts with the Node.js server (port 5000).
