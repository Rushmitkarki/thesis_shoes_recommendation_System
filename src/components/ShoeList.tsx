import React from 'react';
import { Shoe } from '../types';

interface ShoeListProps {
  shoes: Shoe[];
  onSelect: (shoe: Shoe) => void;
}

export const ShoeList: React.FC<ShoeListProps> = ({ shoes, onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {shoes.map((shoe) => (
        <div 
          key={shoe._id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <img
            src={shoe.imageUrl}
            alt={shoe.name}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900">{shoe.name}</h3>
            <p className="text-sm text-gray-500">{shoe.brand}</p>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">${shoe.price}</span>
              <button
                onClick={() => onSelect(shoe)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try On
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}