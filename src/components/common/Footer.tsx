import React from 'react';
import { Car } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <Car className="h-6 w-6 text-slate-400" />
          <span className="text-xl font-bold tracking-tight text-slate-900">AutoRent</span>
        </div>
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} AutoRent. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
