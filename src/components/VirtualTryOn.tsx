import React, { useRef, useState } from "react";
import axios from "axios";
import { Camera } from "lucide-react";

interface VirtualTryOnProps {
  onClose: () => void;
  selectedShoeId: string;
}

export const VirtualTryOn: React.FC<VirtualTryOnProps> = ({
  onClose,
  selectedShoeId,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert(
        "Could not access camera. Please make sure you have granted permissions."
      );
    }
  };

  const captureFootImage = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const footImageData = canvas.toDataURL("image/jpeg");

    sendImageToBackend(footImageData);
  };

  const sendImageToBackend = async (footImageData: string) => {
    try {
      const response = await axios.post("http://localhost:5000/api/try-on", {
        footImage: footImageData,
        shoeId: selectedShoeId,
      });

      if (response.data.result) {
        setProcessedImage(`data:image/jpeg;base64,${response.data.result}`);
      }
    } catch (error) {
      console.error("Try-on error:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Virtual Try-On</h2>

        {processedImage ? (
          <img
            src={processedImage}
            alt="Try-on result"
            className="w-full rounded-lg"
          />
        ) : (
          <div className="flex flex-col items-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
            />
            <canvas ref={canvasRef} className="hidden" />

            <button
              onClick={captureFootImage}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Capture & Try
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};
