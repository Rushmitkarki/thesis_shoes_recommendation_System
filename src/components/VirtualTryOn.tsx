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
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    startCamera();

    // Stop camera and clear interval on component unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        setIsCameraActive(false);
      }
    };
  }, []);

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
        if (data.image) {
          drawOverlay(data.image);
        }
      } catch (error) {
        console.error("Error processing frame:", error);
      }
    }, "image/jpeg");

    requestAnimationFrame(captureAndProcessFrame);
  };

  useEffect(() => {
    if (isCameraActive) {
      captureAndProcessFrame();
    }
  }, [isCameraActive, selectedShoe]);

  const drawOverlay = (imageData: string) => {
    if (!outputCanvasRef.current) return;
    const canvas = outputCanvasRef.current;
    const context = canvas.getContext("2d");
    const image = new Image();
    image.src = `data:image/jpeg;base64,${imageData}`;
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context?.clearRect(0, 0, canvas.width, canvas.height);
      context?.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden w-full max-w-4xl h-[90vh]">
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
          <h2 className="text-white text-2xl font-bold">Virtual Try-On</h2>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-full"
          >
            Close
          </button>
        </div>

        <div className="relative w-full h-full flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          <canvas
            ref={outputCanvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent flex justify-between items-center">
          <p className="text-white">Camera Active</p>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
            Take Photo
          </button>
        </div>
      </div>
    </div>
  );
};
