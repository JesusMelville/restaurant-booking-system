import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import restaurantService from '../../services/restaurantService';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Card, { CardContent, CardHeader } from '../../components/atoms/Card';
import Badge from '../../components/atoms/Badge';
import RestaurantForm from '../../components/molecules/RestaurantForm';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/helpers';

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    cuisine_type: '',
    status: '',
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);

  const reset = (values) => {
    setFilters(values);
  };

  useEffect(() => {
    fetchRestaurants();
  }, [filters]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await restaurantService.getAll(filters);
      setRestaurants(response.restaurants);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Error al cargar restaurantes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este restaurante?')) {
      return;
    }

    try {
      await restaurantService.delete(id);
      toast.success('Restaurante eliminado exitosamente');
      fetchRestaurants();
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast.error('Error al eliminar el restaurante');
    }
  };

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingRestaurant(null);
    setShowModal(true);
  };

  const cuisineTypes = [
    'Italiana', 'Peruana', 'Japonesa', 'Francesa', 
    'Mexicana', 'Española', 'China', 'Tailandesa',
    'Internacional', 'Vegetariana', 'Americana', 'India'
  ];

  if (loading && restaurants.length === 0) {
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Restaurantes
          </h1>
          <p className="text-gray-600">
            Gestiona los restaurantes del sistema
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Restaurante
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar restaurantes..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>

            <select
              value={filters.cuisine_type}
              onChange={(e) => setFilters(prev => ({ ...prev, cuisine_type: e.target.value, page: 1 }))}
              className="input"
            >
              <option value="">Todos los tipos</option>
              {cuisineTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="input"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>

            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Restaurants List */}
      {restaurants.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron restaurantes
            </h3>
            <p className="text-gray-600 mb-4">
              Comienza agregando tu primer restaurante
            </p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Restaurante
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {restaurants.map((restaurant) => (
              <Card key={restaurant.id} className="hover:shadow-md transition-shadow">
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {restaurant.name}
                        </h3>
                        <Badge status={restaurant.status}>
                          {restaurant.status === 'active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Badge variant="default">
                          {restaurant.cuisine_type}
                        </Badge>
                      </div>

                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {restaurant.description}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Dirección</p>
                          <p className="font-medium">{restaurant.address}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Teléfono</p>
                          <p className="font-medium">{restaurant.phone}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Capacidad</p>
                          <p className="font-medium">{restaurant.capacity} personas</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Horario</p>
                          <p className="font-medium">
                            {restaurant.opening_time} - {restaurant.closing_time}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <span>Rating: {restaurant.rating}</span>
                        <span>Mesas: {restaurant.tables?.length || 0}</span>
                        <span>Creado: {new Date(restaurant.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(restaurant)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(restaurant.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

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
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
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
        </>
      )}

      {/* Modal para crear/editar restaurante */}
      {showModal && (
        <RestaurantForm
          restaurant={editingRestaurant}
          onClose={() => {
            setShowModal(false);
            setEditingRestaurant(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingRestaurant(null);
            fetchRestaurants();
            reset({
              search: filters.search,
              cuisine_type: filters.cuisine_type,
              status: filters.status,
              page: 1,
              limit: 12
            });
          }}
        />
      )}
    </div>
  );
};

export default AdminRestaurants;
