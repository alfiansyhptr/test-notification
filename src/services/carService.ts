import { initialCars } from './mockData';

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

const CARS_STORAGE_KEY = 'autorent_cars';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getStoredCars = (): Car[] => {
  const stored = localStorage.getItem(CARS_STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(CARS_STORAGE_KEY, JSON.stringify(initialCars));
  return initialCars;
};

const saveCars = (cars: Car[]) => {
  localStorage.setItem(CARS_STORAGE_KEY, JSON.stringify(cars));
};

export const carService = {
  getAll: async () => {
    await delay(300);
    return getStoredCars();
  },
  getById: async (id: string) => {
    await delay(200);
    const cars = getStoredCars();
    const car = cars.find(c => c.id === id);
    if (!car) throw new Error('Car not found');
    return car;
  },
  create: async (carData: Omit<Car, 'id'>) => {
    await delay(300);
    const cars = getStoredCars();
    const newCar = { ...carData, id: Math.random().toString(36).substring(2, 9) };
    saveCars([...cars, newCar]);
    return newCar;
  },
  update: async (id: string, carData: Partial<Car>) => {
    await delay(300);
    const cars = getStoredCars();
    const index = cars.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Car not found');
    
    const updatedCar = { ...cars[index], ...carData };
    cars[index] = updatedCar;
    saveCars(cars);
    return updatedCar;
  },
  delete: async (id: string) => {
    await delay(300);
    const cars = getStoredCars();
    const newCars = cars.filter(c => c.id !== id);
    saveCars(newCars);
  }
};
