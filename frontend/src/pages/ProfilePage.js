import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Save, Edit2 } from 'lucide-react';
import authService from '../services/authService';
import Button from '../components/atoms/Button';
import Input from '../components/atoms/Input';
import Card, { CardContent, CardHeader } from '../components/atoms/Card';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [userStats, setUserStats] = useState({
    total: 0,
    completed: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    no_show: 0
  });
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || ''
    }
  });

  // Cargar estadísticas del usuario
  useEffect(() => {
    const loadUserStats = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (response.user && response.user.stats) {
          setUserStats(response.user.stats);
        }
      } catch (error) {
        console.error('Error loading user stats:', error);
      }
    };

    loadUserStats();
  }, [user]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authService.updateProfile(data);
      updateUser(response.user);
      toast.success('Perfil actualizado exitosamente');
      setEditing(false);
      
      // Recargar estadísticas después de actualizar
      const userResponse = await authService.getCurrentUser();
      if (userResponse.user && userResponse.user.stats) {
        setUserStats(userResponse.user.stats);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset({
      name: user?.name || '',
      phone: user?.phone || ''
    });
    setEditing(false);
  };

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mi Perfil
          </h1>
          <p className="text-gray-600">
            Gestiona tu información personal
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Información Personal
              </h3>
              {!editing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!editing ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Nombre completo</p>
                    <p className="font-medium text-gray-900">{user?.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                  </div>
                </div>

                {user?.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Teléfono</p>
                      <p className="font-medium text-gray-900">{user.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Rol</p>
                    <p className="font-medium text-gray-900">
                      {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Miembro desde</p>
                    <p className="font-medium text-gray-900">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'No disponible'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="Nombre completo"
                  {...register('name', {
                    required: 'El nombre es requerido',
                    minLength: {
                      value: 2,
                      message: 'El nombre debe tener al menos 2 caracteres'
                    }
                  })}
                  error={errors.name?.message}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="input bg-gray-100"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    El email no puede ser modificado
                  </p>
                </div>

                <Input
                  label="Teléfono (opcional)"
                  type="tel"
                  placeholder="+51 987 654 321"
                  {...register('phone', {
                    pattern: {
                      value: /^\+?[1-9]\d{1,14}$/,
                      message: 'Teléfono inválido'
                    }
                  })}
                  error={errors.phone?.message}
                />

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card className="mt-6">
          <CardHeader>
            <h3 className="text-xl font-semibold text-gray-900">
              Estadísticas de Cuenta
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-primary-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary-600">{userStats.total}</div>
                <div className="text-sm text-gray-600">Reservas Totales</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{userStats.completed}</div>
                <div className="text-sm text-gray-600">Completadas</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">{userStats.pending + userStats.confirmed}</div>
                <div className="text-sm text-gray-600">Pendientes</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">{userStats.cancelled + userStats.no_show}</div>
                <div className="text-sm text-gray-600">Canceladas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
