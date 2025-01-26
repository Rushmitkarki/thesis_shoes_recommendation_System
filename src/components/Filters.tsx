import React from 'react';
import { FilterState } from '../types';
import { Sliders } from 'lucide-react';

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export const Filters: React.FC<FiltersProps> = ({ filters, onFilterChange }) => {
  const brands = ['Nike', 'Adidas', 'The North Face', 'Puma'];
  const categories = ['Running', 'Casual', 'Hiking'];
  const styles = ['Athletic', 'Streetwear', 'Outdoor', 'Classic'];

  const handleBrandChange = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    onFilterChange({ ...filters, brands: newBrands });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <Sliders className="w-5 h-5 mr-2" />
        <h2 className="text-lg font-semibold">Filters</h2>
      </div>

      <div className="mb-4">
        <h3 className="font-medium mb-2">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="20000"
            value={filters.priceRange[1]}
            onChange={(e) => onFilterChange({
              ...filters,
              priceRange: [0, parseInt(e.target.value)]
            })}
            className="w-full"
          />
          <span>NPR {filters.priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-medium mb-2">Brands</h3>
        <div className="space-y-2">
          {brands.map(brand => (
            <label key={brand} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() => handleBrandChange(brand)}
                className="mr-2"
              />
              {brand}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-medium mb-2">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              className={`px-3 py-1 rounded-full text-sm ${
                filters.categories.includes(category)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}
              onClick={() => {
                const newCategories = filters.categories.includes(category)
                  ? filters.categories.filter(c => c !== category)
                  : [...filters.categories, category];
                onFilterChange({ ...filters, categories: newCategories });
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};