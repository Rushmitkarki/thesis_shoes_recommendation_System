import React, { useEffect, useState } from "react";

interface VirtualTryOnProps {
  onClose: () => void;
  selectedShoe: { image: string; name: string; id: string };
}

export const VirtualTryOn: React.FC<VirtualTryOnProps> = ({
  onClose,
  selectedShoe,
}) => {
  const [videoUrl, setVideoUrl] = useState<string>("");

  useEffect(() => {
    if (selectedShoe?.id) {
      setVideoUrl(`http://localhost:5000/video_feed/${selectedShoe.id}`);
    }
  }, [selectedShoe]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Virtual Try-On</h2>

        {/* Display the video stream */}
        {videoUrl && (
          <img
            src={videoUrl}
            alt="Virtual Try-On"
            className="w-full rounded-lg border"
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
