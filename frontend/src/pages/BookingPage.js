import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Calendar, Users } from 'lucide-react';
import reservationService from '../services/reservationService';
import Button from '../components/atoms/Button';
import Card, { CardContent, CardHeader } from '../components/atoms/Card';
import { formatDate, formatTime, generateTimeSlots, normalizeDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const BookingPage = () => {
  const { state } = useLocation();
  const { restaurant, date, partySize, availability } = state || {};
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    if (!restaurant || !date || !availability) {
      navigate('/restaurants');
    }
  }, [restaurant, date, availability, navigate]);

  const availableSlots = availability?.availability?.filter(slot => slot.available) || [];

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    const slot = availability.availability.find(s => s.time === time);
    setSelectedTable(slot?.tables[0] || null);
  };

  const onSubmit = async (data) => {
    if (!selectedTime || !selectedTable) {
      toast.error('Por favor selecciona un horario disponible');
      return;
    }

    setLoading(true);
    try {
      // Normalizar la fecha para evitar problemas de zona horaria
      const normalizedDate = normalizeDate(date);
      console.log('Fecha original:', date);
      console.log('Fecha normalizada:', normalizedDate);
      
      const reservationData = {
        restaurant_id: restaurant.id,
        table_id: selectedTable.id,
        reservation_date: normalizedDate,
        reservation_time: selectedTime,
        party_size: partySize,
        occasion: data.occasion,
        special_requests: data.special_requests
      };

      console.log('Datos de reserva:', reservationData);
      const response = await reservationService.create(reservationData);
      
      toast.success(`¡Reserva confirmada! Código: ${response.confirmationCode}`);
      navigate('/reservations');
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error(error.response?.data?.message || 'Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  if (!restaurant || !date || !availability) {
    return null;
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver</span>
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Completar Reserva
        </h1>
        
        <div className="flex items-center space-x-4 text-gray-600">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(date)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{partySize} {partySize === 1 ? 'persona' : 'personas'}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold text-gray-900">
                Detalles de la Reserva
              </h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Selecciona un horario
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => handleTimeSelect(slot.time)}
                        className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                          selectedTime === slot.time
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {formatTime(slot.time)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table Selection */}
                {selectedTime && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Mesa asignada
                    </label>
                    {selectedTable ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">
                              Mesa {selectedTable.table_number}
                            </p>
                            <p className="text-sm text-gray-600">
                              Capacidad: {selectedTable.capacity} personas
                              {selectedTable.location && ` • ${selectedTable.location}`}
                            </p>
                          </div>
                          <div className="text-green-600">
                            ✓ Disponible
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No hay mesas disponibles para este horario</p>
                    )}
                  </div>
                )}

                {/* Occasion */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ocasión (opcional)
                  </label>
                  <select {...register('occasion')} className="input">
                    <option value="">Selecciona una ocasión</option>
                    <option value="cumpleaños">Cumpleaños</option>
                    <option value="aniversario">Aniversario</option>
                    <option value="cita_romantica">Cita romántica</option>
                    <option value="reunion_familiar">Reunión familiar</option>
                    <option value="negocios">Negocios</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Solicitudes especiales (opcional)
                  </label>
                  <textarea
                    {...register('special_requests')}
                    rows={4}
                    placeholder="Alguna alergia, preferencia dietética, o solicitud especial..."
                    className="input"
                  />
                </div>

                {/* User Info Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Datos de reserva</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Nombre:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    {user.phone && <p><strong>Teléfono:</strong> {user.phone}</p>}
                  </div>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  disabled={!selectedTime || !selectedTable}
                  className="w-full"
                >
                  {loading ? 'Procesando...' : 'Confirmar Reserva'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Restaurant Summary */}
          <Card className="mb-6">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                {restaurant.name}
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Fecha</span>
                <span className="font-medium">{formatDate(date)}</span>
              </div>
              {selectedTime && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Hora</span>
                  <span className="font-medium">{formatTime(selectedTime)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Personas</span>
                <span className="font-medium">{partySize}</span>
              </div>
              {selectedTable && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Mesa</span>
                  <span className="font-medium">Mesa {selectedTable.table_number}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Policies */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                Políticas de Reserva
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Las reservas pueden ser canceladas hasta 2 horas antes del horario</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Por favor llega puntual, las mesas se retendrán por 15 minutos</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Confirmarás recibirás un código de confirmación vía email</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Para grupos grandes, contáctanos directamente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
