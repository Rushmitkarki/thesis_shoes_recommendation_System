import React from "react";

export const Dashboard: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">Live Camera Feed</h2>
      <img
        src="http://localhost:5000/dashboard_feed"
        className="w-full rounded-lg border"
        alt="Camera Feed"
      />
    </div>
  );
};
