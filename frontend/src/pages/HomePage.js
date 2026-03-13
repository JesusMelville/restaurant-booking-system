import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, Star, Clock, Users, Calendar, ArrowRight } from 'lucide-react';
import Button from '../components/atoms/Button';

const HomePage = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Search,
      title: 'Búsqueda Inteligente',
      description: 'Encuentra el restaurante perfecto según tus preferencias y disponibilidad.'
    },
    {
      icon: Calendar,
      title: 'Reservas Rápidas',
      description: 'Reserva tu mesa en segundos con nuestro sistema intuitivo y seguro.'
    },
    {
      icon: Users,
      title: 'Gestión de Grupos',
      description: 'Reservas para grupos grandes con opciones personalizadas.'
    },
    {
      icon: Clock,
      title: 'Confirmación Instantánea',
      description: 'Recibe confirmación inmediata y recordatorios automáticos.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Restaurantes' },
    { number: '50K+', label: 'Reservas' },
    { number: '4.9', label: 'Rating' },
    { number: '24/7', label: 'Soporte' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Reserva en los Mejores Restaurantes
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Sistema de reservas premium para restaurantes 5 estrellas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/restaurants">
                <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                  Explorar Restaurantes
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {user ? (
                <Link to="/reservations">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600">
                    Mis Reservas
                  </Button>
                </Link>
              ) : (
                <Link to="/auth/register">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600">
                    Registrarse
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary-600">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Características Premium
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitas para una experiencia de reserva excepcional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cómo Funciona
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Reserva tu mesa en 3 simples pasos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Busca Restaurantes
              </h3>
              <p className="text-gray-600">
                Explora nuestra selección de restaurantes premium y filtra por cocina, ubicación o disponibilidad.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Selecciona y Reserva
              </h3>
              <p className="text-gray-600">
                Elige tu fecha, hora y número de personas. Confirma tu reserva en segundos.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Disfruta tu Experiencia
              </h3>
              <p className="text-gray-600">
                Recibe confirmación instantánea y disfruta de tu experiencia gastronómica.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para tu Próxima Reserva?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Únete a miles de clientes que ya disfrutan de la mejor experiencia 
            de reserva en restaurantes premium.
          </p>
          <Link to="/restaurants">
            <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
              Comenzar Ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
