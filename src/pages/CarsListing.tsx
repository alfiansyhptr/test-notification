import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { CarCard } from '../features/cars/CarCard';
import { carService } from '../services/carService';
import type { Car } from '../services/carService';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { Input } from '../components/common/Input';

export const CarsListing: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const data = await carService.getAll();
        setCars(data);
        setFilteredCars(data);
      } catch (error) {
        console.error('Failed to load cars', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCars();
  }, []);

  useEffect(() => {
    let result = cars;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        c => c.name.toLowerCase().includes(q) || c.brand.toLowerCase().includes(q)
      );
    }
    if (selectedType !== 'All') {
      result = result.filter(c => c.type === selectedType);
    }
    setFilteredCars(result);
  }, [searchQuery, selectedType, cars]);

  const carTypes = ['All', ...Array.from(new Set(cars.map(c => c.type)))];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Our Fleet</h1>
        <p className="text-slate-500">Find the perfect vehicle for your needs.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-1/3 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <Input 
            placeholder="Search by make or model..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {carTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedType === type 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : filteredCars.length === 0 ? (
        <EmptyState 
          title="No cars found" 
          description="We couldn't find any cars matching your search criteria. Try adjusting your filters." 
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedType('All');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCars.map(car => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
};
