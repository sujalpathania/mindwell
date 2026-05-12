import cv2
from deepface import DeepFace
import logging

# Disable DeepFace logging for a cleaner console
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

def main():
    # 1. Initialize Webcam
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    print("--- Face Detection Test Started ---")
    print("Press 'q' to quit.")

    # 2. Load OpenCV's Haar Cascade for fast initial detection
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    while True:
        # Capture frame-by-frame
        ret, frame = cap.read()
        if not ret:
            break

        # Optional: Mirror the frame
        frame = cv2.flip(frame, 1)

        # 3. Detect faces using OpenCV (fast)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))

        for (x, y, w, h) in faces:
            # Draw rectangle around the face
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            cv2.putText(frame, 'Face Detected', (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

            # 4. Optional: DeepFace validation (more accurate but slower)
            # In a real app, you might only do this occasionally or on capture
            try:
               
                pass
            except Exception as e:
                pass

        cv2.imshow('MindWell - Face Detection Test', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # When everything done, release the capture
    cap.release()
    cv2.destroyAllWindows()
    print("--- Test Ended ---")

if __name__ == "__main__":
    main()
