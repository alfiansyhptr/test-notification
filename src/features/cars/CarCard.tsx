import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Settings, Gauge } from 'lucide-react';
import { Card, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatUtils';
import type { Car } from '../../services/carService';

interface CarCardProps {
  car: Car;
}

export const CarCard: React.FC<CarCardProps> = ({ car }) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg flex flex-col h-full group">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={car.image} 
          alt={car.name} 
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        {car.status !== 'available' && (
          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-slate-900/80 text-white px-4 py-2 rounded-full font-medium tracking-wide">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1 uppercase tracking-wider">{car.brand}</p>
            <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{car.name}</h3>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-blue-600">{formatCurrency(car.pricePerDay)}</span>
            <span className="text-sm text-slate-500 block">/day</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-600 mt-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{car.seats} Seats</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Settings className="w-4 h-4" />
            <span>{car.transmission}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge className="w-4 h-4" />
            <span>{car.type}</span>
          </div>
        </div>
        
        <div className="mt-auto pt-4">
          <Link 
            to={`/cars/${car.id}`} 
            className="block w-full"
            onClick={() => {
              if (car.status === 'available') {
                (window as any).dataLayer = (window as any).dataLayer || [];
                (window as any).dataLayer.push({
                  event: "general_event",
                  event_name: car.name.toLowerCase().replace(/\s+/g, '_')
                });
              }
            }}
          >
            <Button className="w-full" variant={car.status === 'available' ? 'primary' : 'secondary'} disabled={car.status !== 'available'}>
              {car.status === 'available' ? 'View Details' : 'Unavailable'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
