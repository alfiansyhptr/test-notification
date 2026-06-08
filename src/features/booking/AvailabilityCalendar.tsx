import React from 'react';
import { format } from 'date-fns';

interface AvailabilityCalendarProps {
  bookedDates: Date[];
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ bookedDates }) => {
  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
      <h4 className="text-sm font-medium text-slate-900 mb-2">Booked Dates</h4>
      {bookedDates.length === 0 ? (
        <p className="text-sm text-slate-500">No upcoming bookings. All dates available!</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {bookedDates.slice(0, 10).map((date, idx) => (
            <span key={idx} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-md">
              {format(date, 'MMM dd, yyyy')}
            </span>
          ))}
          {bookedDates.length > 10 && (
            <span className="text-xs px-2 py-1 bg-slate-200 text-slate-700 rounded-md">
              +{bookedDates.length - 10} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};
