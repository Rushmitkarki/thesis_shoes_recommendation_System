export interface Shoe {
  _id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  description: string;
  sizes: number[];
  colors: string[];
  category: string;
  gender: 'men' | 'women' | 'unisex';
}