import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Users, Settings, Gauge } from 'lucide-react';
import { carService } from '../services/carService';
import type { Car } from '../services/carService';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { formatCurrency } from '../utils/formatUtils';
import { BookingForm } from '../features/booking/BookingForm';

export const CarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        if (!id) return;
        setIsLoading(true);
        const data = await carService.getById(id);
        setCar(data);
      } catch (err) {
        setError('Failed to load car details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  if (isLoading) return <LoadingState />;
  if (error || !car) return <ErrorState message={error || 'Car not found'} onRetry={() => window.location.reload()} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to fleet
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Image */}
          <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-video">
            <img 
              src={car.image} 
              alt={car.name} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1 uppercase tracking-wider">{car.brand}</p>
                <h1 className="text-3xl font-bold text-slate-900">{car.name}</h1>
              </div>
              <StatusBadge status={car.status} className="mt-2" />
            </div>
            
            <p className="text-lg text-slate-600 mb-8">{car.description}</p>

            <h2 className="text-xl font-bold text-slate-900 mb-4">Specifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">Seats</p>
                  <p className="font-semibold text-slate-900">{car.seats} Adults</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <Settings className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">Transmission</p>
                  <p className="font-semibold text-slate-900">{car.transmission}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <Gauge className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">Type</p>
                  <p className="font-semibold text-slate-900">{car.type}</p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-4">Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
              {car.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="mb-6">
                <p className="text-sm text-slate-500 mb-1">Price per day</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-slate-900">{formatCurrency(car.pricePerDay)}</span>
                  <span className="text-slate-500">/day</span>
                </div>
              </div>
              
              <BookingForm car={car} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
