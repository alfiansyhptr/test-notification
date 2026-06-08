import React, { useEffect, useState } from 'react';
import { Car, CalendarDays, DollarSign, CheckCircle } from 'lucide-react';
import { MetricsCard } from '../../features/dashboard/MetricsCard';
import { carService } from '../../services/carService';
import type { Car as CarType } from '../../services/carService';
import { bookingService } from '../../services/bookingService';
import type { Booking } from '../../services/bookingService';
import { formatCurrency } from '../../utils/formatUtils';
import { LoadingState } from '../../components/common/LoadingState';

export const Dashboard: React.FC = () => {
  const [cars, setCars] = useState<CarType[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [carsData, bookingsData] = await Promise.all([
          carService.getAll(),
          bookingService.getAll()
        ]);
        setCars(carsData);
        setBookings(bookingsData);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (isLoading) return <LoadingState />;

  const activeBookings = bookings.filter(b => b.status === 'confirmed');
  const availableCars = cars.filter(c => c.status === 'available').length;
  const totalRevenue = activeBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricsCard 
          title="Total Cars" 
          value={cars.length} 
          icon={<Car className="w-8 h-8" />} 
        />
        <MetricsCard 
          title="Available Cars" 
          value={availableCars} 
          icon={<CheckCircle className="w-8 h-8" />} 
        />
        <MetricsCard 
          title="Active Bookings" 
          value={activeBookings.length} 
          icon={<CalendarDays className="w-8 h-8" />} 
        />
        <MetricsCard 
          title="Revenue Estimate" 
          value={formatCurrency(totalRevenue)} 
          icon={<DollarSign className="w-8 h-8" />} 
          trend="Based on all confirmed bookings"
          trendUp={true}
        />
      </div>

      <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Bookings</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Booking ID</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Customer</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Dates</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Amount</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.slice(-5).reverse().map(booking => (
              <tr key={booking.id}>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">#{booking.id}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{booking.customerName}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{booking.startDate} to {booking.endDate}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatCurrency(booking.totalPrice)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
