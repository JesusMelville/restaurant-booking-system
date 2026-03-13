import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Filter, Search, Eye, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import reservationService from '../services/reservationService';
import Button from '../components/atoms/Button';
import Input from '../components/atoms/Input';
import Card, { CardContent, CardHeader } from '../components/atoms/Card';
import Badge from '../components/atoms/Badge';
import { formatDate, formatTime, formatDateTime, getStatusText, getStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';

const ReservationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    date_from: '',
    date_to: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);

  useEffect(() => {
    fetchReservations();
  }, [filters]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationService.getAll(filters);
      setReservations(response.reservations);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({ 
      ...prev, 
      status: status === filters.status ? '' : status,
      page: 1 
    }));
  };

  const handleDateFilter = (field, value) => {
    setFilters(prev => ({ 
      ...prev, 
      [field]: value,
      page: 1 
    }));
  };

  const handleCancelReservation = async (reservationId) => {
    const reason = prompt('¿Por qué deseas cancelar esta reserva? (opcional)');
    
    try {
      await reservationService.cancel(reservationId, reason);
      toast.success('Reserva cancelada exitosamente');
      fetchReservations();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      toast.error('Error al cancelar la reserva');
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'confirmed', label: 'Confirmada' },
    { value: 'cancelled', label: 'Cancelada' },
    { value: 'completed', label: 'Completada' },
    { value: 'no_show', label: 'No asistió' }
  ];

  if (loading && reservations.length === 0) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mis Reservas
        </h1>
        <p className="text-gray-600">
          Gestiona y revisa el estado de tus reservas
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar reservas..."
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desde
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleDateFilter('date_from', e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleDateFilter('date_to', e.target.value)}
                className="input"
              />
            </div>

            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </Button>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusFilter(option.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filters.status === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      {reservations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tienes reservas
            </h3>
            <p className="text-gray-600 mb-4">
              ¡Es hora de reservar en tu restaurante favorito!
            </p>
            <Button onClick={() => navigate('/restaurants')}>
              Explorar Restaurantes
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <Card key={reservation.id} className="hover:shadow-md transition-shadow">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {reservation.restaurant_name}
                      </h3>
                      <Badge status={reservation.status}>
                        {getStatusText(reservation.status)}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {formatDate(reservation.reservation_date)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {formatTime(reservation.reservation_time)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {reservation.party_size} {reservation.party_size === 1 ? 'persona' : 'personas'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Mesa:</span>
                        <span className="font-medium">{reservation.table_number}</span>
                      </div>
                    </div>

                    {reservation.occasion && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-600">
                          Ocasión: <span className="font-medium">{reservation.occasion}</span>
                        </span>
                      </div>
                    )}

                    {reservation.special_requests && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-600">
                          Solicitudes: <span className="font-medium">{reservation.special_requests}</span>
                        </span>
                      </div>
                    )}

                    <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                      <span>Código: {reservation.confirmation_code}</span>
                      <span>Creada: {formatDateTime(reservation.created_at, reservation.created_at.substring(11, 16))}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReservation(reservation)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelReservation(reservation.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => setFilters(prev => ({ ...prev, page: pagination.page - 1 }))}
          >
            Anterior
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page, index) => (
              <button
                key={`page-${page}`}
                onClick={() => setFilters(prev => ({ ...prev, page }))}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  page === pagination.page
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            disabled={pagination.page === pagination.pages}
            onClick={() => setFilters(prev => ({ ...prev, page: pagination.page + 1 }))}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Detalles de la Reserva
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedReservation(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Restaurante</p>
                    <p className="font-medium">{selectedReservation.restaurant_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <Badge status={selectedReservation.status}>
                      {getStatusText(selectedReservation.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha</p>
                    <p className="font-medium">{formatDate(selectedReservation.reservation_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Hora</p>
                    <p className="font-medium">{formatTime(selectedReservation.reservation_time)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mesa</p>
                    <p className="font-medium">Mesa {selectedReservation.table_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Personas</p>
                    <p className="font-medium">{selectedReservation.party_size}</p>
                  </div>
                </div>

                {selectedReservation.occasion && (
                  <div>
                    <p className="text-sm text-gray-600">Ocasión</p>
                    <p className="font-medium">{selectedReservation.occasion}</p>
                  </div>
                )}

                {selectedReservation.special_requests && (
                  <div>
                    <p className="text-sm text-gray-600">Solicitudes especiales</p>
                    <p className="font-medium">{selectedReservation.special_requests}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">Código de confirmación</p>
                  <p className="font-mono font-bold text-lg">{selectedReservation.confirmation_code}</p>
                </div>

                <div className="text-sm text-gray-500">
                  <p>Reserva creada: {formatDateTime(selectedReservation.created_at, selectedReservation.created_at.substring(11, 16))}</p>
                  <p>Última actualización: {formatDateTime(selectedReservation.updated_at, selectedReservation.updated_at.substring(11, 16))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ReservationsPage;
