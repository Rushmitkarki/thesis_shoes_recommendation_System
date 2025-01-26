import React from 'react';
import { Star } from 'lucide-react';
import { Shoe } from '../types';

interface ShoeCardProps {
  shoe: Shoe;
  onSelect: (shoe: Shoe) => void;
}

export const ShoeCard: React.FC<ShoeCardProps> = ({ shoe, onSelect }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
      onClick={() => onSelect(shoe)}
    >
      <img 
        src={shoe.image} 
        alt={shoe.name} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{shoe.name}</h3>
        <p className="text-gray-600">{shoe.brand}</p>
        <div className="flex items-center mt-2">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="ml-1 text-sm">{shoe.rating}</span>
        </div>
        <p className="mt-2 text-lg font-bold">NPR {shoe.price.toLocaleString()}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {shoe.colors.map(color => (
            <span 
              key={color}
              className="px-2 py-1 text-xs bg-gray-100 rounded-full"
            >
              {color}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};