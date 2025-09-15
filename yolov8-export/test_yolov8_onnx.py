import cv2
import onnxruntime as ort
import numpy as np
import requests
import time

# ==== Backend config ====
BACKEND_URL = "https://video-proctoring.onrender.com/api/logs"
CANDIDATE_ID = "cand123"  # later make dynamic

def log_event(event):
    payload = {"candidateId": CANDIDATE_ID, "event": event}
    try:
        requests.post(BACKEND_URL, json=payload, timeout=5)
        print("✅ Sent log:", payload)
    except Exception as e:
        print("❌ Error sending log:", e)

# ==== Load YOLO ONNX model ====
model_path = "yolov8n.onnx"
session = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])

input_name = session.get_inputs()[0].name
input_shape = session.get_inputs()[0].shape
output_name = session.get_outputs()[0].name

print("YOLOv8 ONNX model loaded:", model_path)

# ==== Open webcam ====
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Preprocess frame
    img = cv2.resize(frame, (640, 640))
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_transposed = np.transpose(img_rgb, (2, 0, 1))
    img_norm = img_transposed / 255.0
    img_input = np.expand_dims(img_norm, axis=0).astype(np.float32)

    # Run inference
    outputs = session.run([output_name], {input_name: img_input})[0]

    # Parse results (simplified for demo)
    for det in outputs[0]:
        conf = det[4]
        if conf > 0.5:  # confidence threshold
            cls_id = int(det[5])
            # Map YOLO COCO class IDs manually (YOLOv8 has 80 classes)
            # e.g., 67 = "cell phone", 73 = "laptop", 84 = "book" in COCO
            if cls_id == 67:
                log_event("⚠️ Mobile phone detected!")
            elif cls_id == 73:
                log_event("⚠️ Laptop detected!")
            elif cls_id == 84:
                log_event("⚠️ Book / notes detected!")

    # Show webcam preview
    cv2.imshow("YOLOv8 ONNX Detection", frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
