# Use official Python base (3.10 is compatible with mediapipe)
FROM python:3.10-slim

# Set work directory inside container
WORKDIR /app

# Install system dependencies (needed for opencv, mediapipe, torch)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose port
EXPOSE 8080

# Run app with uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
