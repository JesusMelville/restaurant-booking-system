import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Users, MapPin } from 'lucide-react';
import tableService from '../../services/tableService';
import restaurantService from '../../services/restaurantService';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Card, { CardContent, CardHeader } from '../atoms/Card';
import Badge from '../atoms/Badge';
import toast from 'react-hot-toast';

const TableForm = ({ table, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [imagePreview, setImagePreview] = useState(table?.image || '');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      restaurant_id: table?.restaurant_id || '',
      table_number: table?.table_number || '',
      capacity: table?.capacity || '',
      min_capacity: table?.min_capacity || 1,
      table_type: table?.table_type || 'standard',
      location: table?.location || '',
      status: table?.status || 'available'
    }
  });

  const tableTypes = [
    { value: 'standard', label: 'Estándar' },
    { value: 'vip', label: 'VIP' },
    { value: 'private', label: 'Privada' },
    { value: 'outdoor', label: 'Exterior' }
  ];

  const locations = [
    { value: 'interior', label: 'Interior' },
    { value: 'terraza', label: 'Terraza' },
    { value: 'privada', label: 'Privada' },
    { value: 'barra', label: 'Barra' },
    { value: 'jardín', label: 'Jardín' },
    { value: 'teppanyaki', label: 'Teppanyaki' },
    { value: 'tatami', label: 'Tatami' },
    { value: 'juice-bar', label: 'Juice Bar' },
    { value: 'banquete', label: 'Banquete' },
    { value: 'lounge', label: 'Lounge' }
  ];

  React.useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await restaurantService.getAll({ limit: 100 });
        setRestaurants(response.restaurants);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      }
    };

    fetchRestaurants();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (table) {
        await tableService.update(table.id, data);
        toast.success('Mesa actualizada exitosamente');
      } else {
        await tableService.create(data);
        toast.success('Mesa creada exitosamente');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving table:', error);
      
      // Mostrar errores específicos del backend
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        backendErrors.forEach(err => {
          toast.error(`${err.msg || err.message}`);
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al guardar la mesa');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {table ? 'Editar Mesa' : 'Agregar Mesa'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurantes *
                </label>
                <select
                  {...register('restaurant_id', { required: 'El restaurante es requerido' })}
                  className="input"
                >
                  <option value="">Seleccionar restaurante...</option>
                  {restaurants.map(restaurant => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
                {errors.restaurant_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.restaurant_id.message}</p>
                )}
              </div>

              <div>
                <Input
                  label="Número de Mesa *"
                  placeholder="M1, M2, etc."
                  {...register('table_number', {
                    required: 'El número de mesa es requerido',
                    pattern: {
                      value: /^[A-Z0-9]+$/i,
                      message: 'Solo letras y números permitidos'
                    }
                  })}
                  error={errors.table_number?.message}
                />
              </div>
            </div>

            {/* Capacidad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Capacidad *"
                  type="number"
                  placeholder="4"
                  {...register('capacity', {
                    required: 'La capacidad es requerida',
                    min: {
                      value: 1,
                      message: 'La capacidad debe ser al menos 1'
                    },
                    max: {
                      value: 20,
                      message: 'La capacidad no puede exceder 20'
                    }
                  })}
                  error={errors.capacity?.message}
                />
              </div>

              <div>
                <Input
                  label="Capacidad Mínima"
                  type="number"
                  placeholder="1"
                  {...register('min_capacity', {
                    required: 'La capacidad mínima es requerida',
                    min: {
                      value: 1,
                      message: 'La capacidad mínima debe ser al menos 1'
                    },
                    max: {
                      value: 20,
                      message: 'La capacidad mínima no puede exceder 20'
                    }
                  })}
                  error={errors.min_capacity?.message}
                />
              </div>
            </div>

            {/* Tipo y Ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Mesa *
                </label>
                <select
                  {...register('table_type', { required: 'El tipo de mesa es requerido' })}
                  className="input"
                >
                  <option value="">Seleccionar tipo...</option>
                  {tableTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {errors.table_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.table_type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-2" />
                  Ubicación *
                </label>
                <select
                  {...register('location', { required: 'La ubicación es requerida' })}
                  className="input"
                >
                  <option value="">Seleccionar ubicación...</option>
                  {locations.map(location => (
                    <option key={location.value} value={location.value}>{location.label}</option>
                  ))}
                </select>
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                )}
              </div>
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="inline h-4 w-4 mr-2" />
                Imagen de la Mesa
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full h-32 px-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Vista previa"
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Upload className="h-8 w-8 mb-2" />
                        <span className="text-sm">Click para subir imagen</span>
                      </div>
                    )}
                  </label>
                </div>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => setImagePreview('')}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Eliminar imagen
                  </button>
                )}
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                {...register('status')}
                className="input"
              >
                <option value="available">Disponible</option>
                <option value="unavailable">No disponible</option>
                <option value="maintenance">En mantenimiento</option>
              </select>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
              >
                {table ? 'Actualizar' : 'Crear'} Mesa
              </Button>
            </div>
          </form>
        </CardContent>
      </div>
    </div>
  );
};

export default TableForm;
