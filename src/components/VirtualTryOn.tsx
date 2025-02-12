import React, { useEffect, useRef } from "react";
import axios from "axios";

interface VirtualTryOnProps {
  onClose: () => void;
  selectedShoe: { id: string };
}

export const VirtualTryOn: React.FC<VirtualTryOnProps> = ({
  onClose,
  selectedShoe,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (selectedShoe?.id) {
      const video = videoRef.current;
      if (video) {
        video.src = `http://localhost:5000/video_feed/${selectedShoe.id}`;
        video.load();
        video.play();
      }
    }

    return () => {
      axios
        .post("http://localhost:5000/stop_camera")
        .catch((error) => console.error("Error stopping camera:", error));
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
      }
    };
  }, [selectedShoe]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Virtual Try-On</h2>

        <video
          ref={videoRef}
          className="w-full rounded-lg border"
          autoPlay
          playsInline
        />

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
