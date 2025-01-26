import React, { useState } from 'react';
import { Ruler } from 'lucide-react';

interface SizeCalculatorProps {
  onSizeCalculated: (size: number) => void;
}

export function SizeCalculator({ onSizeCalculated }: SizeCalculatorProps) {
  const [footLength, setFootLength] = useState<number>(0);

  const calculateSize = (length: number) => {
    // Basic size calculation formula (can be adjusted)
    const calculatedSize = Math.floor((length + 2) / 0.65);
    onSizeCalculated(calculatedSize);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Ruler className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold">Size Calculator</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Foot Length (cm)
          </label>
          <input
            type="number"
            value={footLength}
            onChange={(e) => setFootLength(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter foot length in cm"
          />
        </div>
        
        <button
          onClick={() => calculateSize(footLength)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Calculate Size
        </button>
      </div>
    </div>
  );
}