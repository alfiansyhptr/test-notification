import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { carService } from '../../services/carService';
import type { Car } from '../../services/carService';
import { DataTable } from '../../features/dashboard/DataTable';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { formatCurrency } from '../../utils/formatUtils';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { useForm } from 'react-hook-form';

export const Cars: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  const { register, handleSubmit, reset } = useForm<Omit<Car, 'id'>>();

  const loadCars = async () => {
    setIsLoading(true);
    const data = await carService.getAll();
    setCars(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadCars();
  }, []);

  const handleOpenModal = (car?: Car) => {
    if (car) {
      setEditingCar(car);
      reset(car);
    } else {
      setEditingCar(null);
      reset({
        name: '', brand: '', type: 'Sedan', seats: 4, transmission: 'Automatic', pricePerDay: 0, image: '', description: '', features: [], status: 'available'
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: any) => {
    // Process features string to array if needed
    const formattedData = {
      ...data,
      pricePerDay: Number(data.pricePerDay),
      seats: Number(data.seats),
      features: Array.isArray(data.features) ? data.features : data.features.split(',').map((f:string) => f.trim())
    };

    if (editingCar) {
      await carService.update(editingCar.id, formattedData);
    } else {
      await carService.create(formattedData);
    }
    
    setIsModalOpen(false);
    loadCars();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this car?')) {
      await carService.delete(id);
      loadCars();
    }
  };

  const columns = [
    { key: 'image', label: 'Image', render: (item: Car) => <img src={item.image} alt={item.name} className="w-16 h-10 object-cover rounded" /> },
    { key: 'name', label: 'Name', render: (item: Car) => <span className="font-medium">{item.name}</span> },
    { key: 'brand', label: 'Brand' },
    { key: 'pricePerDay', label: 'Price/Day', render: (item: Car) => formatCurrency(item.pricePerDay) },
    { key: 'status', label: 'Status', render: (item: Car) => <StatusBadge status={item.status} /> },
    { key: 'actions', label: 'Actions', render: (item: Car) => (
      <div className="flex gap-2">
        <button onClick={() => handleOpenModal(item)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Cars</h1>
          <p className="text-slate-500">Add, edit, or remove vehicles from your fleet.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" /> Add New Car
        </Button>
      </div>

      {isLoading ? <LoadingState /> : <DataTable columns={columns} data={cars} />}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCar ? 'Edit Car' : 'Add New Car'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" {...register('name', { required: true })} />
            <Input label="Brand" {...register('brand', { required: true })} />
            <Input label="Type" {...register('type', { required: true })} />
            <Input label="Seats" type="number" {...register('seats', { required: true })} />
            <Input label="Transmission" {...register('transmission', { required: true })} />
            <Input label="Price/Day" type="number" {...register('pricePerDay', { required: true })} />
          </div>
          
          <Input label="Image URL" {...register('image', { required: true })} />
          
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea 
              {...register('description')} 
              className="rounded-md border border-slate-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
            />
          </div>
          
          <Input label="Features (comma separated)" {...register('features')} />
          
          <div className="flex flex-col">
            <label className="text-sm font-medium text-slate-700 mb-1">Status</label>
            <select 
              {...register('status')}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          <div className="flex justify-end pt-4 gap-3 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Car</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
