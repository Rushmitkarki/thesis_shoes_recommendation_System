export interface Shoe {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  sizes: number[];
  colors: string[];
  category: string;
  style: string;
  rating: number;
}

export interface FilterState {
  priceRange: [number, number];
  brands: string[];
  categories: string[];
  styles: string[];
}