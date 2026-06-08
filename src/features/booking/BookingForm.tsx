import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import type { Car } from '../../services/carService';
import { bookingService } from '../../services/bookingService';
import type { Booking } from '../../services/bookingService';
import { isDateRangeAvailable, getBookedDates, calculateRentalDays, calculateTotalPrice } from '../../utils/bookingUtils';
import { formatCurrency } from '../../utils/formatUtils';

interface BookingFormProps {
  car: Car;
}

interface FormData {
  customerName: string;
  phone: string;
  startDate: string;
  endDate: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({ car }) => {
  const navigate = useNavigate();
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookings = await bookingService.getByCarId(car.id);
        const activeBookings = bookings.filter(b => b.status === 'confirmed');
        setExistingBookings(activeBookings);
        setBookedDates(getBookedDates(activeBookings));
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      }
    };
    fetchBookings();
  }, [car.id]);

  let rentalDays = 0;
  let totalPrice = 0;

  if (startDate && endDate && startDate <= endDate) {
    rentalDays = calculateRentalDays(startDate, endDate);
    totalPrice = calculateTotalPrice(car.pricePerDay, rentalDays);
  }

  const onSubmit = async (data: FormData) => {
    setErrorMsg(null);
    if (car.status !== 'available') {
      setErrorMsg('This car is currently unavailable for booking.');
      return;
    }

    if (new Date(data.startDate) < new Date(new Date().toDateString())) {
      setErrorMsg('Start date cannot be in the past.');
      return;
    }

    if (data.endDate < data.startDate) {
      setErrorMsg('End date cannot be before start date.');
      return;
    }

    if (!isDateRangeAvailable(data.startDate, data.endDate, existingBookings)) {
      setErrorMsg('The selected dates overlap with an existing booking. Please choose different dates.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newBooking = await bookingService.create({
        carId: car.id,
        customerName: data.customerName,
        phone: data.phone,
        startDate: data.startDate,
        endDate: data.endDate,
        totalPrice,
        status: 'confirmed'
      });
      
      navigate(`/booking-confirmation/${newBooking.id}`);
    } catch (error) {
      setErrorMsg('Failed to process booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input 
          label="Full Name" 
          placeholder="John Doe"
          {...register('customerName', { required: 'Name is required' })}
          error={errors.customerName?.message}
        />
        
        <Input 
          label="Phone Number" 
          placeholder="+1 234 567 8900"
          type="tel"
          {...register('phone', { required: 'Phone is required' })}
          error={errors.phone?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Pick-up Date" 
            type="date"
            min={format(new Date(), 'yyyy-MM-dd')}
            {...register('startDate', { required: 'Start date is required' })}
            error={errors.startDate?.message}
          />
          <Input 
            label="Drop-off Date" 
            type="date"
            min={startDate || format(new Date(), 'yyyy-MM-dd')}
            {...register('endDate', { required: 'End date is required' })}
            error={errors.endDate?.message}
          />
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
            {errorMsg}
          </div>
        )}

        {totalPrice > 0 && !errorMsg && (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mt-6">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>{formatCurrency(car.pricePerDay)} x {rentalDays} days</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-2 mt-2">
              <span>Total</span>
              <span className="text-blue-600">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full mt-6 h-12 text-lg" 
          isLoading={isSubmitting}
          disabled={car.status !== 'available'}
        >
          {car.status === 'available' ? 'Confirm Booking' : 'Not Available'}
        </Button>
      </form>

      <AvailabilityCalendar bookedDates={bookedDates} />
    </div>
  );
};
