import { api } from './api';

export interface Booking {
  id: string;
  carId: string;
  customerName: string;
  phone: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'confirmed' | 'cancelled';
}

export const bookingService = {
  getAll: async () => {
    const response = await api.get<Booking[]>('/bookings');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<Booking>(`/bookings/${id}`);
    return response.data;
  },
  getByCarId: async (carId: string) => {
    const response = await api.get<Booking[]>(`/bookings?carId=${carId}`);
    return response.data;
  },
  create: async (booking: Omit<Booking, 'id'>) => {
    const response = await api.post<Booking>('/bookings', booking);
    return response.data;
  },
  update: async (id: string, booking: Partial<Booking>) => {
    const response = await api.put<Booking>(`/bookings/${id}`, booking);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/bookings/${id}`);
  }
};
