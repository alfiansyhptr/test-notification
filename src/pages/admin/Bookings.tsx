import React, { useEffect, useState } from 'react';
import { bookingService } from '../../services/bookingService';
import type { Booking } from '../../services/bookingService';
import { DataTable } from '../../features/dashboard/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { formatCurrency } from '../../utils/formatUtils';
import { Edit2, Trash2 } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';

export const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusInput, setStatusInput] = useState<'confirmed' | 'cancelled'>('confirmed');

  const loadBookings = async () => {
    setIsLoading(true);
    const data = await bookingService.getAll();
    // Sort by id descending just to see newest first
    setBookings(data.sort((a,b) => Number(b.id) - Number(a.id)));
    setIsLoading(false);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setStatusInput(booking.status);
    setIsModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (selectedBooking) {
      await bookingService.update(selectedBooking.id, { status: statusInput });
      setIsModalOpen(false);
      loadBookings();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      await bookingService.delete(id);
      loadBookings();
    }
  };

  const columns = [
    { key: 'id', label: 'ID', render: (item: Booking) => `#${item.id}` },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'dates', label: 'Rental Period', render: (item: Booking) => `${item.startDate} to ${item.endDate}` },
    { key: 'totalPrice', label: 'Total', render: (item: Booking) => formatCurrency(item.totalPrice) },
    { key: 'status', label: 'Status', render: (item: Booking) => <StatusBadge status={item.status} /> },
    { key: 'actions', label: 'Actions', render: (item: Booking) => (
      <div className="flex gap-2">
        <button onClick={() => handleEdit(item)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={() => handleDelete(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )}
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Manage Bookings</h1>
        <p className="text-slate-500">View and update customer reservations.</p>
      </div>

      {isLoading ? <LoadingState /> : <DataTable columns={columns} data={bookings} />}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Booking Status"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Update status for booking <span className="font-bold">#{selectedBooking?.id}</span> 
            ({selectedBooking?.customerName})
          </p>
          
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700 mb-1">Status</label>
            <select 
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value as any)}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex justify-end pt-4 gap-3 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveStatus}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
