import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit, Trash2, Shield, User } from 'lucide-react';
import userService from '../../services/userService';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import Card, { CardContent, CardHeader } from '../../components/atoms/Card';
import Badge from '../../components/atoms/Badge';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll(filters);
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await userService.updateRole(userId, { role: newRole });
      toast.success('Rol actualizado exitosamente');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Error al actualizar el rol');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await userService.delete(userId);
      toast.success('Usuario eliminado exitosamente');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar el usuario');
    }
  };

  if (loading && users.length === 0) {
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
          Usuarios
        </h1>
        <p className="text-gray-600">
          Gestiona las cuentas de usuarios del sistema
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar usuarios..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>

            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }))}
              className="input"
            >
              <option value="">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="client">Cliente</option>
            </select>

            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {users.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron usuarios
            </h3>
            <p className="text-gray-600">
              No hay usuarios que coincidan con los filtros seleccionados
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.name}
                        </h3>
                        <Badge variant={user.role === 'admin' ? 'primary' : 'default'}>
                          {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-500">Email</p>
                          <p className="font-medium">{user.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Teléfono</p>
                          <p className="font-medium">{user.phone || 'No registrado'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Reservas</p>
                          <p className="font-medium">{user.reservation_count || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Miembro desde</p>
                          <p className="font-medium">
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {user.role === 'client' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoleUpdate(user.id, 'admin')}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {user.role === 'admin' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoleUpdate(user.id, 'client')}
                        >
                          <User className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        disabled={user.role === 'admin'}
                        title={user.role === 'admin' ? 'No se puede eliminar administrador' : 'Eliminar usuario'}
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
    </div>
  );
};

export default AdminUsers;
