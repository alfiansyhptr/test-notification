import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, MapPin } from 'lucide-react';
import { Button } from '../components/common/Button';
import { CarCard } from '../features/cars/CarCard';
import { carService } from '../services/carService';
import type { Car } from '../services/carService';
import { LoadingState } from '../components/common/LoadingState';

export const Home: React.FC = () => {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const cars = await carService.getAll();
        // Just take the first 3 for featured
        setFeaturedCars(cars.slice(0, 3));
      } catch (error) {
        console.error('Failed to load cars', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCars();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80" 
            alt="Hero Car" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Premium Car Rental <br/> <span className="text-blue-400">For Your Next Journey</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Experience the thrill of driving our exclusive collection of premium vehicles. 
            Flexible booking, transparent pricing, and impeccable service.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/cars">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                Browse Fleet <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose AutoRent</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">We provide the best car rental experience with premium vehicles and outstanding customer service.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Secure & Safe</h3>
              <p className="text-slate-600">All our vehicles undergo strict maintenance and safety checks before every rental.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Fast Booking</h3>
              <p className="text-slate-600">Book your dream car in minutes with our seamless online reservation system.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">Many Locations</h3>
              <p className="text-slate-600">Pick up and drop off your vehicle at any of our convenient locations nationwide.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Featured Vehicles</h2>
              <p className="text-slate-500">Explore our most popular premium models.</p>
            </div>
            <Link to="/cars" className="hidden sm:flex text-blue-600 hover:text-blue-700 font-medium items-center transition-colors">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          {isLoading ? (
            <LoadingState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCars.map(car => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
          
          <div className="mt-10 sm:hidden text-center">
            <Link to="/cars">
              <Button variant="outline" className="w-full">View All Fleet</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready for an unforgettable drive?</h2>
          <p className="text-blue-100 max-w-2xl mx-auto mb-10 text-lg">
            Join thousands of satisfied customers who have experienced the premium AutoRent difference.
          </p>
          <Link to="/cars">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 font-semibold px-10">
              Start Your Booking
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
