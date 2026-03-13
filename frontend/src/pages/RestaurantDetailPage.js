import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  Users, 
  ArrowLeft,
  Utensils,
  Check
} from 'lucide-react';
import restaurantService from '../services/restaurantService';
import Button from '../components/atoms/Button';
import Card, { CardContent, CardHeader } from '../components/atoms/Card';
import Badge from '../components/atoms/Badge';
import { formatDate, formatTime, normalizeDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const RestaurantDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [availability, setAvailability] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const response = await restaurantService.getById(id);
      setRestaurant(response);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      toast.error('Error al cargar el restaurante');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!selectedDate) {
      toast.error('Por favor selecciona una fecha');
      return;
    }

    try {
      setLoadingAvailability(true);
      const response = await restaurantService.getAvailability(id, selectedDate, partySize);
      setAvailability(response);
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Error al verificar disponibilidad');
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleBooking = () => {
    if (!user) {
      toast.error('Debes iniciar sesión para hacer una reserva');
      navigate('/auth/login');
      return;
    }

    if (!selectedDate || !availability) {
      toast.error('Por favor verifica la disponibilidad primero');
      return;
    }

    // Normalizar la fecha para evitar problemas de zona horaria
    const normalizedDate = normalizeDate(selectedDate);
    console.log('Fecha seleccionada original:', selectedDate);
    console.log('Fecha normalizada para reserva:', normalizedDate);

    navigate(`/booking/${id}`, {
      state: {
        restaurant,
        date: normalizedDate,
        partySize,
        availability
      }
    });
  };

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Restaurante no encontrado
          </h2>
          <Button onClick={() => navigate('/restaurants')}>
            Volver a restaurantes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/restaurants')}
        className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver a restaurantes</span>
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {restaurant.name}
                </h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="font-semibold">{restaurant.rating}</span>
                  </div>
                  <Badge status={restaurant.status}>
                    {restaurant.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                  <Badge variant="default">
                    {restaurant.cuisine_type}
                  </Badge>
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-lg">
              {restaurant.description}
            </p>
          </div>

          {/* Image */}
          <div className="h-64 md:h-96 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl overflow-hidden">
            {restaurant.image && restaurant.image !== '[object Object]' && restaurant.image.trim() !== '' ? (
              <img 
                src={restaurant.image} 
                alt={restaurant.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Utensils className="h-16 w-16 text-white opacity-50" />
              </div>
            )}
          </div>

          {/* Restaurant Info */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold text-gray-900">
                Información del Restaurante
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Dirección</p>
                      <p className="text-gray-600">{restaurant.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Teléfono</p>
                      <p className="text-gray-600">{restaurant.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Horario</p>
                      <p className="text-gray-600">
                        {restaurant.opening_time} - {restaurant.closing_time}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Capacidad</p>
                      <p className="text-gray-600">{restaurant.capacity} personas</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tables */}
          {restaurant.tables && restaurant.tables.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">
                  Mesas Disponibles
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {restaurant.tables.map((table) => (
                    <div key={table.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">
                          Mesa {table.table_number}
                        </span>
                        <Badge status={table.status}>
                          {table.status === 'available' ? 'Disponible' : 'Ocupada'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Capacidad: {table.capacity} personas</p>
                        {table.location && <p>Ubicación: {table.location}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <h3 className="text-xl font-semibold text-gray-900">
                Hacer una Reserva
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de personas
                </label>
                <select
                  value={partySize}
                  onChange={(e) => setPartySize(parseInt(e.target.value))}
                  className="input"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'persona' : 'personas'}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={checkAvailability}
                disabled={loadingAvailability || !selectedDate}
                loading={loadingAvailability}
                className="w-full"
              >
                Ver Disponibilidad
              </Button>

              {availability && (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="font-medium text-green-800 mb-2">
                      Horarios disponibles para {formatDate(selectedDate)}
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availability.availability
                        .filter(slot => slot.available)
                        .slice(0, 6)
                        .map((slot, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{formatTime(slot.time)}</span>
                            <Check className="h-4 w-4 text-green-600" />
                          </div>
                        ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleBooking}
                    className="w-full"
                    disabled={!user}
                  >
                    {user ? 'Continuar Reserva' : 'Inicia sesión para reservar'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailPage;
