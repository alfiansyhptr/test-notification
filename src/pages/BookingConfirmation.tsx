import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Calendar, User, Phone, CreditCard } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { bookingService } from '../services/bookingService';
import type { Booking } from '../services/bookingService';
import { carService } from '../services/carService';
import type { Car } from '../services/carService';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { Card, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { formatCurrency } from '../utils/formatUtils';

export const BookingConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (!id) return;
        const bookingData = await bookingService.getById(id);
        setBooking(bookingData);
        
        const carData = await carService.getById(bookingData.carId);
        setCar(carData);
      } catch (error) {
        console.error('Failed to load booking details', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDetails();
  }, [id]);

  if (isLoading) return <LoadingState />;
  if (!booking || !car) return <ErrorState message="Booking not found." />;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
        <p className="text-slate-500">Your reservation has been successfully placed. Booking ID: #{booking.id}</p>
      </div>

      <Card className="mb-8 overflow-hidden">
        <div className="bg-slate-50 p-6 border-b border-slate-200 flex flex-col md:flex-row gap-6 items-center">
          <div className="w-full md:w-1/3 aspect-[16/10] rounded-lg overflow-hidden bg-white border border-slate-200">
            <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
          </div>
          <div className="w-full md:w-2/3">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">{car.name}</h2>
            <p className="text-slate-500">{car.brand} • {car.type}</p>
          </div>
        </div>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            <div className="p-6 space-y-6">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" /> Rental Period
              </h3>
              <div>
                <p className="text-sm text-slate-500 mb-1">Pick-up Date</p>
                <p className="font-medium text-slate-900">{format(parseISO(booking.startDate), 'EEEE, MMMM dd, yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Drop-off Date</p>
                <p className="font-medium text-slate-900">{format(parseISO(booking.endDate), 'EEEE, MMMM dd, yyyy')}</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" /> Customer Details
              </h3>
              <div>
                <p className="text-sm text-slate-500 mb-1">Name</p>
                <p className="font-medium text-slate-900">{booking.customerName}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <p className="font-medium text-slate-900">{booking.phone}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-blue-50 border-t border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-slate-900">Total Price</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">{formatCurrency(booking.totalPrice)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Link to="/cars">
          <Button variant="outline" className="mr-4">Book Another Car</Button>
        </Link>
        <Link to="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    </div>
  );
};
