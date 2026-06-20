import axios from 'axios';

const api = axios.create({
  // Substitua pelo endereço real da sua API do Railway quando ela estiver online!
  baseURL: 'http://localhost:8000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configuração opcional: Envia o token de autenticação automaticamente se ele existir no navegador
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@TaskFlow:token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;