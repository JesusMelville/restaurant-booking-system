import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import tableService from '../../services/tableService';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Card, { CardContent, CardHeader } from '../../components/atoms/Card';
import Badge from '../../components/atoms/Badge';
import TableForm from '../../components/molecules/TableForm';
import toast from 'react-hot-toast';

const AdminTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    restaurant_id: '',
    status: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  const reset = (values) => {
    setFilters(values);
  };

  useEffect(() => {
    fetchTables();
  }, [filters]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await tableService.getAll(filters);
      setTables(response.tables);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error('Error al cargar mesas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta mesa?')) {
      return;
    }

    try {
      await tableService.delete(id);
      toast.success('Mesa eliminada exitosamente');
      fetchTables();
    } catch (error) {
      console.error('Error deleting table:', error);
      toast.error('Error al eliminar la mesa');
    }
  };

  const handleEdit = (table) => {
    setEditingTable(table);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingTable(null);
    setShowModal(true);
  };

  if (loading && tables.length === 0) {
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
            Mesas
          </h1>
          <p className="text-gray-600">
            Gestiona las mesas de los restaurantes
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Mesa
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar mesas..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="input"
            >
              <option value="">Todos los estados</option>
              <option value="available">Disponible</option>
              <option value="unavailable">No disponible</option>
              <option value="maintenance">En mantenimiento</option>
            </select>

            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tables List */}
      {tables.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron mesas
            </h3>
            <p className="text-gray-600 mb-4">
              Comienza agregando tu primera mesa
            </p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Mesa
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {tables.map((table) => (
              <Card key={table.id} className="hover:shadow-md transition-shadow">
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Mesa {table.table_number}
                        </h3>
                        <Badge status={table.status}>
                          {table.status === 'available' ? 'Disponible' : 
                           table.status === 'unavailable' ? 'No disponible' : 'En mantenimiento'}
                        </Badge>
                        <Badge variant="default">
                          {table.table_type}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Restaurante</p>
                          <p className="font-medium">{table.restaurant_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Capacidad</p>
                          <p className="font-medium">{table.capacity} personas</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Cap. mínima</p>
                          <p className="font-medium">{table.min_capacity} personas</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Ubicación</p>
                          <p className="font-medium">{table.location || 'Sin asignar'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(table)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(table.id)}
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

      {/* Modal para crear/editar mesa */}
      {showModal && (
        <TableForm
          table={editingTable}
          onClose={() => {
            setShowModal(false);
            setEditingTable(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingTable(null);
            fetchTables();
            reset({
              search: filters.search,
              restaurant_id: filters.restaurant_id,
              status: filters.status,
              page: 1,
              limit: 20
            });
          }}
        />
      )}
    </div>
  );
};

export default AdminTables;
