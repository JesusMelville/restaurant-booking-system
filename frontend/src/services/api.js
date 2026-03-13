import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Verificar que estamos conectados al backend correcto
console.log('API Base URL:', process.env.REACT_APP_API_URL || 'http://localhost:5000/api');

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000, // 10 segundos timeout
  // No establecer Content-Type por defecto para permitir FormData
});

// Interceptor para añadir token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Petición enviada:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => {
    console.log('Respuesta recibida:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Error en petición:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;
