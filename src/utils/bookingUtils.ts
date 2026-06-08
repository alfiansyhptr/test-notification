import { differenceInDays, parseISO, startOfDay, endOfDay } from 'date-fns';

export interface BookingRange {
  startDate: string;
  endDate: string;
}

export const calculateRentalDays = (startDate: string | Date, endDate: string | Date): number => {
  const start = startOfDay(typeof startDate === 'string' ? parseISO(startDate) : startDate);
  const end = startOfDay(typeof endDate === 'string' ? parseISO(endDate) : endDate);
  
  const days = differenceInDays(end, start);
  // If same day return 1, else return difference
  return days === 0 ? 1 : days;
};

export const calculateTotalPrice = (pricePerDay: number, days: number): number => {
  return pricePerDay * days;
};

export const isDateRangeAvailable = (
  checkStart: string | Date,
  checkEnd: string | Date,
  existingBookings: BookingRange[]
): boolean => {
  const cStart = startOfDay(typeof checkStart === 'string' ? parseISO(checkStart) : checkStart);
  const cEnd = endOfDay(typeof checkEnd === 'string' ? parseISO(checkEnd) : checkEnd);

  // Check if checkEnd is before checkStart
  if (cEnd < cStart) return false;

  for (const booking of existingBookings) {
    const bStart = startOfDay(parseISO(booking.startDate));
    const bEnd = endOfDay(parseISO(booking.endDate));

    // Overlap condition:
    // cStart <= bEnd AND cEnd >= bStart
    if (cStart <= bEnd && cEnd >= bStart) {
      return false; // overlap found
    }
  }

  return true;
};

export const getBookedDates = (existingBookings: BookingRange[]): Date[] => {
  const bookedDates: Date[] = [];
  
  existingBookings.forEach(booking => {
    let current = startOfDay(parseISO(booking.startDate));
    const end = startOfDay(parseISO(booking.endDate));
    
    while (current <= end) {
      bookedDates.push(current);
      current = new Date(current);
      current.setDate(current.getDate() + 1);
    }
  });
  
  return bookedDates;
};
