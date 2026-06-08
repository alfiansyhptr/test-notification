import { api } from './api';

export interface Car {
  id: string;
  name: string;
  brand: string;
  type: string;
  seats: number;
  transmission: string;
  pricePerDay: number;
  image: string;
  description: string;
  features: string[];
  status: 'available' | 'unavailable';
}

export const carService = {
  getAll: async () => {
    const response = await api.get<Car[]>('/cars');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<Car>(`/cars/${id}`);
    return response.data;
  },
  create: async (car: Omit<Car, 'id'>) => {
    const response = await api.post<Car>('/cars', car);
    return response.data;
  },
  update: async (id: string, car: Partial<Car>) => {
    const response = await api.put<Car>(`/cars/${id}`, car);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/cars/${id}`);
  }
};
