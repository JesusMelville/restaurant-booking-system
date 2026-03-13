import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import toast from 'react-hot-toast';

const RegisterForm = () => {
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      console.log('Enviando datos de registro:', data);
      
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone
      });
      
      console.log('Resultado del registro:', result);
      
      if (result.success) {
        toast.success('¡Cuenta creada exitosamente!');
        navigate('/');
      } else {
        console.error('Error de registro:', result.error);
        toast.error(result.error || 'Error al crear cuenta');
      }
    } catch (error) {
      console.error('Error inesperado en registro:', error);
      toast.error('Error inesperado al crear cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Input
            label="Nombre completo"
            type="text"
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
            label="Email"
            type="email"
            placeholder="tu@email.com"
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
        </div>

        <div>
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            {...register('password', {
              required: 'La contraseña es requerida',
              minLength: {
                value: 6,
                message: 'La contraseña debe tener al menos 6 caracteres'
              }
            })}
            error={errors.password?.message}
          />
        </div>

        <div>
          <Input
            label="Confirmar contraseña"
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword', {
              required: 'Confirma tu contraseña',
              validate: value => value === password || 'Las contraseñas no coinciden'
            })}
            error={errors.confirmPassword?.message}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={loading}
          disabled={loading}
        >
          Crear Cuenta
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link 
              to="/auth/login" 
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
