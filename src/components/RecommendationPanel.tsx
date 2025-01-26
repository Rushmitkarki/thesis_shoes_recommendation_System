import React from 'react';
import { Shoe } from '../types';

interface RecommendationPanelProps {
  shoes: Shoe[];
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({ shoes }) => {
  const recommendedShoes = shoes.slice(0, 3); // Simple recommendation logic

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
      <div className="space-y-4">
        {recommendedShoes.map((shoe) => (
          <div
            key={shoe._id}
            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50"
          >
            <img
              src={shoe.imageUrl}
              alt={shoe.name}
              className="w-20 h-20 object-cover rounded-md"
            />
            <div>
              <h3 className="font-medium text-gray-900">{shoe.name}</h3>
              <p className="text-sm text-gray-500">{shoe.brand}</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                ${shoe.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}