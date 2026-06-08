import React from 'react';
import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';
import { Button } from './Button';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Car className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold tracking-tight text-slate-900">AutoRent</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <Link to="/cars" className="hover:text-blue-600 transition-colors">Fleet</Link>
          <Link to="/admin" className="hover:text-blue-600 transition-colors">Admin Dashboard</Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="hidden sm:inline-flex">Sign In</Button>
          <Link to="/cars">
            <Button>Book Now</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
