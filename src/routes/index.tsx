import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// Public Pages
import { Home } from '../pages/Home';
import { CarsListing } from '../pages/CarsListing';
import { CarDetail } from '../pages/CarDetail';
import { BookingConfirmation } from '../pages/BookingConfirmation';

// Admin Pages
import { Dashboard } from '../pages/admin/Dashboard';
import { Cars as AdminCars } from '../pages/admin/Cars';
import { Bookings as AdminBookings } from '../pages/admin/Bookings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/cars', element: <CarsListing /> },
      { path: '/cars/:id', element: <CarDetail /> },
      { path: '/booking-confirmation/:id', element: <BookingConfirmation /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: '', element: <Dashboard /> },
      { path: 'cars', element: <AdminCars /> },
      { path: 'bookings', element: <AdminBookings /> },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
