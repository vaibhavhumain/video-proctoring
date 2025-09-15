import React, { forwardRef } from "react";
import Webcam from "react-webcam";

const VideoFeed = forwardRef(({ canvasRef }, webcamRef) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6 relative">
      <Webcam
        ref={webcamRef}
        audio={false}
        className="w-[640px] h-[480px] absolute rounded-2xl"
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute rounded-2xl"
      />
    </div>
  );
});

export default VideoFeed;
