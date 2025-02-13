import React, { useEffect, useRef, useState } from "react";

interface VirtualTryOnProps {
  onClose: () => void;
  selectedShoe: { _id: string; image: string }; 
}

export const VirtualTryOn: React.FC<VirtualTryOnProps> = ({
  onClose,
  selectedShoe,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processedImage, setProcessedImage] = useState("");

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    startCamera();
  }, []);

  useEffect(() => {
    const captureAndProcessFrame = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob || !selectedShoe.image) {
          console.error("Invalid shoe image URL:", selectedShoe.image);
          return;
        }

        const formData = new FormData();
        formData.append("frame", blob, "frame.jpg");
        formData.append("shoe_id", selectedShoe._id);
        formData.append("shoe_image", selectedShoe.image);

        try {
          const response = await fetch("http://localhost:5000/process_frame", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          console.log("Response from server:", data); // Debugging response
          if (data.image) {
            setProcessedImage(`data:image/jpeg;base64,${data.image}`);
          } else {
            console.error("Server error:", data);
          }
        } catch (error) {
          console.error("Error processing frame:", error);
        }
      }, "image/jpeg");

      requestAnimationFrame(captureAndProcessFrame);
    };

    const interval = setInterval(captureAndProcessFrame, 2000);
    return () => clearInterval(interval);
  }, [selectedShoe]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Virtual Try-On</h2>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full rounded-lg"
        ></video>
        <canvas ref={canvasRef} className="hidden"></canvas>

        {processedImage && (
          <img
            src={processedImage}
            className="w-full rounded-lg border mt-4"
            alt="Try-On Result"
          />
        )}

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
};
