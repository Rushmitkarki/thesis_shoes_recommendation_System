import React from 'react';
import { X, Star } from 'lucide-react';
import type { Shoe } from '../types';

interface ShoeDetailProps {
  shoe: Shoe;
  onClose: () => void;
}

export function ShoeDetail({ shoe, onClose }: ShoeDetailProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{shoe.name}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <img
            src={shoe.imageUrl}
            alt={shoe.name}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="font-medium">{shoe.brand}</span>
            </div>
            
            <p className="text-gray-600">{shoe.description}</p>
            
            <div>
              <h3 className="font-semibold mb-2">Available Sizes</h3>
              <div className="flex gap-2 flex-wrap">
                {shoe.sizes.map((size) => (
                  <button
                    key={size}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Colors</h3>
              <div className="flex gap-2">
                {shoe.colors.map((color) => (
                  <div
                    key={color}
                    className="w-8 h-8 rounded-full border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            
            <div className="pt-4">
              <span className="text-2xl font-bold text-blue-600">
                ${shoe.price}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}