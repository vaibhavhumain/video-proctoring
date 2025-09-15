import { useEffect, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

const useObjectDetection = (webcamRef, addLog, canvasRef) => {
  const [model, setModel] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
      console.log("✅ Object detection model loaded");
    };
    loadModel();
  }, []);

  useEffect(() => {
    if (!model) return;

    const interval = setInterval(async () => {
      if (webcamRef.current && webcamRef.current.video.readyState === 4) {
        const predictions = await model.detect(webcamRef.current.video);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        predictions.forEach((p) => {
          if (p.score < 0.6) return; // only confident detections

          const item = p.class.toLowerCase();

          // Draw bounding box
          ctx.strokeStyle = "red";
          ctx.lineWidth = 3;
          ctx.strokeRect(p.bbox[0], p.bbox[1], p.bbox[2], p.bbox[3]);
          ctx.fillStyle = "red";
          ctx.font = "14px Arial";
          ctx.fillText(`${p.class} (${Math.round(p.score * 100)}%)`, p.bbox[0], p.bbox[1] > 10 ? p.bbox[1] - 5 : 10);

          if (item.includes("cell phone")) {
            addLog("⚠️ Mobile phone detected!");
          } else if (item.includes("book")) {
            addLog("⚠️ Book / notes detected!");
          } else if (
            item.includes("laptop") ||
            item.includes("tv") ||
            item.includes("monitor")
          ) {
            addLog("⚠️ Extra electronic device detected!");
          }
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [model, webcamRef, addLog, canvasRef]);
};

export default useObjectDetection;
