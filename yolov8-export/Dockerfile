# Use official Python base
FROM python:3.10-slim

WORKDIR /app

# System deps (needed by OpenCV, mediapipe, etc.)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files (including yolov8n.pt)
COPY . .

EXPOSE 8080

# Start FastAPI
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
