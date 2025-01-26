import React, { useRef, useState } from 'react';
import { Camera } from 'lucide-react';

interface VirtualTryOnProps {
  onClose: () => void;
}

export const VirtualTryOn: React.FC<VirtualTryOnProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please make sure you have granted camera permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Virtual Try-On</h2>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
          {!isStreaming ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={startCamera}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Camera className="w-5 h-5" />
                Start Camera
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>Position your feet in the camera view to try on the shoes virtually.</p>
          <p className="mt-2">Note: This is a demo interface. Connect to your OpenCV backend for actual virtual try-on functionality.</p>
        </div>
      </div>
    </div>
  );
};