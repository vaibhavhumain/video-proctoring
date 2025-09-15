import { useEffect } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";

const useFaceMeshDetection = (webcamRef, canvasRef, addLog) => {
  useEffect(() => {
    let lastEyeTime = Date.now();
    let eyesForward = true;

    let lastFaceTime = Date.now();
    let faceVisible = true;

    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true, 
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    faceMesh.onResults((results) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        if (faceVisible) {
          lastFaceTime = Date.now();
          faceVisible = false;
        }
        if (Date.now() - lastFaceTime > 3000) {
          addLog("Face not visible or obstructed!");
          lastFaceTime = Date.now();
        }
        return;
      }

      faceVisible = true;
      const landmarks = results.multiFaceLandmarks[0];

      const leftEye = landmarks[33];  
      const rightEye = landmarks[263]; 
      const nose = landmarks[1];    

      const eyeCenterX = (leftEye.x + rightEye.x) / 2;
      const offset = Math.abs(eyeCenterX - nose.x);

      if (offset > 0.04) {
        if (eyesForward) {
          lastEyeTime = Date.now();
          eyesForward = false;
        }
        if (Date.now() - lastEyeTime > 3000) {
          addLog("Candidate looking away");
          lastEyeTime = Date.now();
        }
      } else {
        eyesForward = true;
      }

      ctx.fillStyle = "red";
      [leftEye, rightEye, nose].forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x * canvas.width, p.y * canvas.height, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    });

    if (webcamRef.current) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          await faceMesh.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, [webcamRef, canvasRef, addLog]);
};

export default useFaceMeshDetection;
