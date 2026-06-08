import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Car, CalendarDays, ArrowLeft } from 'lucide-react';
import { cn } from '../components/common/Button';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Cars', path: '/admin/cars', icon: Car },
    { name: 'Bookings', path: '/admin/bookings', icon: CalendarDays },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white shrink-0">
        <div className="flex h-16 items-center px-6 border-b border-slate-200">
          <span className="text-lg font-bold text-slate-900">Admin Portal</span>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Exact match for dashboard, prefix match for others
            const isActive = item.path === '/admin' 
              ? location.pathname === '/admin' 
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-blue-700" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
          
          <div className="mt-8 pt-8 border-t border-slate-200">
            <Link
              to="/"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="mr-3 h-5 w-5 text-slate-400" />
              Back to Main Site
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
