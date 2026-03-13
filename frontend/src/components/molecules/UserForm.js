import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Mail, Phone, User, Shield } from 'lucide-react';
import userService from '../../services/userService';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Card, { CardContent, CardHeader } from '../atoms/Card';
import Badge from '../atoms/Badge';
import toast from 'react-hot-toast';

const UserForm = ({ user, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(user?.image || '');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || 'client',
      password: '',
      confirmPassword: ''
    }
  });

  const roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'manager', label: 'Gerente' },
    { value: 'client', label: 'Cliente' }
  ];

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (user) {
        // Solo enviar los campos permitidos para actualizar
        const updateData = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role
        };
        
        if (data.password) {
          updateData.password = data.password;
        }
        
        await userService.update(user.id, updateData);
        toast.success('Usuario actualizado exitosamente');
      } else {
        // Para nuevos usuarios, siempre requerir contraseña
        if (!data.password) {
          toast.error('La contraseña es requerida para nuevos usuarios');
          setLoading(false);
          return;
        }
        
        await userService.create(data);
        toast.success('Usuario creado exitosamente');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Error al guardar el usuario');
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
            {user ? 'Editar Usuario' : 'Agregar Usuario'}
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
            {/* Información Personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Nombre Completo *"
                  placeholder="Juan Pérez"
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
                <Input
                  label="Email *"
                  type="email"
                  placeholder="usuario@ejemplo.com"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Teléfono"
                  placeholder="+51 987 654 321"
                  {...register('phone')}
                  error={errors.phone?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="inline h-4 w-4 mr-2" />
                  Rol *
                </label>
                <select
                  {...register('role', { required: 'El rol es requerido' })}
                  className="input"
                >
                  <option value="">Seleccionar rol...</option>
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
                )}
              </div>
            </div>

            {/* Contraseñas - solo mostrar si es nuevo usuario o si se quiere cambiar */}
            <div className="space-y-6">
              <div>
                <Input
                  label={user ? "Nueva Contraseña (dejar en blanco para mantener actual)" : "Contraseña *"}
                  type="password"
                  placeholder="•••••••••"
                  {...register('password', {
                    required: user ? false : 'La contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres'
                    }
                  })}
                  error={errors.password?.message}
                />
              </div>

              {(user?.password || !user) && (
                <div>
                  <Input
                    label="Confirmar Contraseña *"
                    type="password"
                    placeholder="•••••••••"
                    {...register('confirmPassword', {
                      required: user ? false : 'Debe confirmar la contraseña',
                      validate: (value) => {
                        const password = document.querySelector('input[name="password"]').value;
                        return value === password || 'Las contraseñas no coinciden';
                      }
                    })}
                  error={errors.confirmPassword?.message}
                  />
                </div>
              )}
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="inline h-4 w-4 mr-2" />
                Foto de Perfil
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
                        <User className="h-8 w-8 mb-2" />
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
                {user ? 'Actualizar' : 'Crear'} Usuario
              </Button>
            </div>
          </form>
        </CardContent>
      </div>
    </div>
  );
};

export default UserForm;
