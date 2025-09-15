from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64, cv2, time
import numpy as np
from ultralytics import YOLO
import mediapipe as mp
import requests

app = FastAPI()

origins = ["http://localhost:5173", "http://127.0.0.1:5173" , "https://videoproctoringapp.netlify.app"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO("yolov8n.onnx")

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True, max_num_faces=1)

last_state = {
    "person": 0,
    "cell phone": False,
    "book": False,
    "laptop": False,
    "looking": True
}
away_start_time = None  

class FrameData(BaseModel):
    candidateId: str
    image: str 


@app.post("/process-frame")
async def process_frame(data: FrameData):
    global last_state, away_start_time

    img_data = base64.b64decode(data.image.split(",")[1])
    np_arr = np.frombuffer(img_data, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

 
    results = model.predict(frame, conf=0.3)

    persons = 0
    current_state = {"cell phone": False, "book": False, "laptop": False}

    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0])
            label = model.names[cls]

            if label == "person":
                persons += 1
            elif label in current_state:
                current_state[label] = True

    if persons == 0 and last_state["person"] != 0:
        log_event(data.candidateId, "⚠️ No person detected!")
    elif persons == 1 and last_state["person"] != 1:
        log_event(data.candidateId, "✅ Candidate detected")
    elif persons > 1 and last_state["person"] <= 1:
        log_event(data.candidateId, f"⚠️ Multiple persons detected! ({persons})")
    last_state["person"] = persons

    for obj, present in current_state.items():
        if present and not last_state[obj]:
            log_event(data.candidateId, f"⚠️ {obj} detected!")
        elif not present and last_state[obj]:
            log_event(data.candidateId, f"✅ {obj} removed")
        last_state[obj] = present

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = face_mesh.process(rgb)

    looking_at_screen = True
    if result.multi_face_landmarks:
        face_landmarks = result.multi_face_landmarks[0]

        left_eye = [33, 133]  
        right_eye = [362, 263]

        h, w, _ = frame.shape
        lx1, ly1 = int(face_landmarks.landmark[left_eye[0]].x * w), int(face_landmarks.landmark[left_eye[0]].y * h)
        lx2, ly2 = int(face_landmarks.landmark[left_eye[1]].x * w), int(face_landmarks.landmark[left_eye[1]].y * h)
        rx1, ry1 = int(face_landmarks.landmark[right_eye[0]].x * w), int(face_landmarks.landmark[right_eye[0]].y * h)
        rx2, ry2 = int(face_landmarks.landmark[right_eye[1]].x * w), int(face_landmarks.landmark[right_eye[1]].y * h)

        if abs((lx2 - lx1)) < 15 or abs((rx2 - rx1)) < 15:
            looking_at_screen = False
    else:
        looking_at_screen = False

    if not looking_at_screen:
        if away_start_time is None:
            away_start_time = time.time()
        elif time.time() - away_start_time > 5 and last_state["looking"]:
            log_event(data.candidateId, "⚠️ Candidate looking away for >5s")
            last_state["looking"] = False
    else:
        if not last_state["looking"]:
            log_event(data.candidateId, "✅ Candidate looking back at screen")
        last_state["looking"] = True
        away_start_time = None

    return {"status": "ok"}


def log_event(candidateId, event):
    try:
        requests.post("https://video-proctoring.onrender.com/api/logs", json={
            "candidateId": candidateId,
            "event": event
        })
        print(f"✅ Sent log: {event}")
    except Exception as e:
        print("❌ Error sending log:", e)


@app.get("/")
async def root():
    return {"message": "YOLO + Eye Tracking API running"}


import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port)
