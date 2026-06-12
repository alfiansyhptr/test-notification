import { initialBookings } from './mockData';

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

const BOOKINGS_STORAGE_KEY = 'autorent_bookings';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getStoredBookings = (): Booking[] => {
  const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(initialBookings));
  return initialBookings as Booking[];
};

const saveBookings = (bookings: Booking[]) => {
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
};

export const bookingService = {
  getAll: async () => {
    await delay(300);
    return getStoredBookings();
  },
  getById: async (id: string) => {
    await delay(200);
    const bookings = getStoredBookings();
    const booking = bookings.find(b => b.id === id);
    if (!booking) throw new Error('Booking not found');
    return booking;
  },
  getByCarId: async (carId: string) => {
    await delay(200);
    return getStoredBookings().filter(b => b.carId === carId);
  },
  create: async (bookingData: Omit<Booking, 'id'>) => {
    await delay(400);
    const bookings = getStoredBookings();
    const newBooking = { ...bookingData, id: Math.random().toString(36).substring(2, 9) };
    saveBookings([...bookings, newBooking]);
    return newBooking;
  },
  update: async (id: string, bookingData: Partial<Booking>) => {
    await delay(300);
    const bookings = getStoredBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Booking not found');
    
    const updatedBooking = { ...bookings[index], ...bookingData };
    bookings[index] = updatedBooking;
    saveBookings(bookings);
    return updatedBooking;
  },
  delete: async (id: string) => {
    await delay(300);
    const bookings = getStoredBookings();
    const newBookings = bookings.filter(b => b.id !== id);
    saveBookings(newBookings);
  }
};
