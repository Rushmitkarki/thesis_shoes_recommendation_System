import axios from 'axios';
import type { Shoe, UserMeasurements } from '../types';

const API_URL = 'http://localhost:8000/api';

export const api = {
  async getShoes(): Promise<Shoe[]> {
    const response = await axios.get(`${API_URL}/shoes`);
    return response.data;
  },

  async getShoe(id: string): Promise<Shoe> {
    const response = await axios.get(`${API_URL}/shoes/${id}`);
    return response.data;
  },

  async getRecommendations(measurements: UserMeasurements): Promise<Shoe[]> {
    const response = await axios.post(`${API_URL}/recommendations`, measurements);
    return response.data;
  },

  async virtualTryOn(footImage: File, shoeId: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', footImage);
    formData.append('shoe_id', shoeId);
    
    const response = await axios.post(`${API_URL}/virtual-tryon`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.image;
  },
};