import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, MapPin, Clock, Users } from 'lucide-react';
import restaurantService from '../../services/restaurantService';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Card, { CardContent, CardHeader } from '../atoms/Card';
import toast from 'react-hot-toast';

const RestaurantForm = ({ restaurant, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  // Limpiar la imagen inicial si es [object Object]
  const initialImage = restaurant?.image && restaurant.image !== '[object Object]' ? restaurant.image : '';
  const [imagePreview, setImagePreview] = useState(initialImage);
  const [imageFile, setImageFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: restaurant?.name || '',
      cuisine_type: restaurant?.cuisine_type || '',
      description: restaurant?.description || '',
      address: restaurant?.address || '',
      phone: restaurant?.phone || '',
      email: restaurant?.email || '',
      opening_time: restaurant?.opening_time || '',
      closing_time: restaurant?.closing_time || '',
      capacity: restaurant?.capacity || '',
      rating: restaurant?.rating || '',
      image: initialImage,
      status: restaurant?.status || 'active'
    }
  });

  const cuisineTypes = [
    'Italiana', 'Mexicana', 'Japonesa', 'China', 'Thai', 'Francesa', 
    'India', 'Americana', 'Mediterránea', 'Española', 'Fusión', 
    'Vegetariana', 'Peruana', 'Tailandesa', 'Chino', 'Internacional'
  ];

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Si hay un archivo de imagen, lo procesamos
      if (imageFile) {
        // Para archivos, necesitamos usar FormData
        const formData = new FormData();
        
        // Agregar todos los campos del formulario
        Object.keys(data).forEach(key => {
          if (key !== 'image') {
            formData.append(key, data[key]);
          }
        });
        
        // Agregar el archivo de imagen
        formData.append('image', imageFile);
        
        if (restaurant) {
          try {
            const response = await restaurantService.update(restaurant.id, formData);
          } catch (error) {
            console.error('Error en la petición PUT:', error);
            throw error;
          }
        } else {
          try {
            const response = await restaurantService.create(formData);
          } catch (error) {
            console.error('Error en la petición POST:', error);
            throw error;
          }
        }
      } else {
        // Si no hay archivo nuevo, enviar los datos normalmente
        // pero incluir la URL de la imagen existente si hay una
        if (imagePreview && !imagePreview.startsWith('data:')) {
          data.image = imagePreview;
        } else if (!imagePreview) {
          // Si no hay vista previa, limpiar el campo de imagen
          data.image = '';
        }
        
        if (restaurant) {
          await restaurantService.update(restaurant.id, data);
        } else {
          await restaurantService.create(data);
        }
      }
      
      toast.success(`Restaurante ${restaurant ? 'actualizado' : 'creado'} exitosamente`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving restaurant:', error);
      
      // Mostrar errores específicos del backend
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        backendErrors.forEach(err => {
          toast.error(`${err.msg || err.message}`);
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al guardar el restaurante');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
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
            {restaurant ? 'Editar Restaurante' : 'Agregar Restaurante'}
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
                <Input
                  label="Nombre del Restaurante *"
                  placeholder="Ej: La Mar"
                  {...register('name', {
                    required: 'El nombre es requerido',
                    minLength: {
                      value: 2,
                      message: 'El nombre debe tener al menos 2 caracteres'
                    }
                  })}
                  error={errors.name?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Cocina *
                </label>
                <select
                  {...register('cuisine_type', { required: 'El tipo de cocina es requerido' })}
                  className="input"
                >
                  <option value="">Seleccionar tipo...</option>
                  {cuisineTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.cuisine_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.cuisine_type.message}</p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                {...register('description', { 
                  required: 'La descripción es requerida',
                  minLength: {
                    value: 10,
                    message: 'La descripción debe tener al menos 10 caracteres'
                  },
                  maxLength: {
                    value: 1000,
                    message: 'La descripción no puede exceder 1000 caracteres'
                  }
                })}
                rows={4}
                placeholder="Describe el restaurante, su especialidad, ambiente, etc. (mínimo 10 caracteres)"
                className="input min-h-[100px] resize-none"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Dirección *"
                  placeholder="Av. Principal 123, Miraflores"
                  {...register('address', { 
                    required: 'La dirección es requerida',
                    minLength: {
                      value: 10,
                      message: 'La dirección debe tener al menos 10 caracteres'
                    },
                    maxLength: {
                      value: 200,
                      message: 'La dirección no puede exceder 200 caracteres'
                    }
                  })}
                  error={errors.address?.message}
                />
              </div>

              <div>
                <Input
                  label="Teléfono *"
                  placeholder="+51 1 234-5678"
                  {...register('phone', { 
                    required: 'El teléfono es requerido',
                    minLength: {
                      value: 10,
                      message: 'El teléfono debe tener al menos 10 caracteres'
                    },
                    maxLength: {
                      value: 20,
                      message: 'El teléfono no puede exceder 20 caracteres'
                    }
                  })}
                  error={errors.phone?.message}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Email *"
                  type="email"
                  placeholder="contacto@restaurante.com"
                  {...register('email', {
                    required: 'El email es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                  error={errors.email?.message}
                />
              </div>

              <div>
                <Input
                  label="Capacidad *"
                  type="number"
                  placeholder="50"
                  {...register('capacity', {
                    required: 'La capacidad es requerida',
                    min: {
                      value: 1,
                      message: 'La capacidad debe ser al menos 1'
                    },
                    max: {
                      value: 500,
                      message: 'La capacidad no puede exceder 500'
                    }
                  })}
                  error={errors.capacity?.message}
                />
              </div>
            </div>

            {/* Horarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-2" />
                  Horario de Apertura *
                </label>
                <select
                  {...register('opening_time', { required: 'El horario de apertura es requerido' })}
                  className="input"
                >
                  <option value="">Seleccionar...</option>
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                      {i.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
                {errors.opening_time && (
                  <p className="text-red-500 text-sm mt-1">{errors.opening_time.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-2" />
                  Horario de Cierre *
                </label>
                <select
                  {...register('closing_time', { required: 'El horario de cierre es requerido' })}
                  className="input"
                >
                  <option value="">Seleccionar...</option>
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                      {i.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
                {errors.closing_time && (
                  <p className="text-red-500 text-sm mt-1">{errors.closing_time.message}</p>
                )}
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating (1-5)
              </label>
              <select
                {...register('rating', {
                  min: { value: 1, message: 'El rating mínimo es 1' },
                  max: { value: 5, message: 'El rating máximo es 5' }
                })}
                className="input"
                step="0.1"
              >
                <option value="">Seleccionar rating...</option>
                {[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1].map(rating => (
                  <option key={rating} value={rating}>{rating}</option>
                ))}
              </select>
              {errors.rating && (
                <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>
              )}
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="inline h-4 w-4 mr-2" />
                Imagen del Restaurante
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
                    onClick={() => {
                      setImagePreview('');
                      setImageFile(null);
                    }}
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
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
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
                {restaurant ? 'Actualizar' : 'Crear'} Restaurante
              </Button>
            </div>
          </form>
        </CardContent>
      </div>
    </div>
  );
};

export default RestaurantForm;
