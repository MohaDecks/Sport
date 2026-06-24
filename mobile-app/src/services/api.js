import axios from 'axios';
import { getApiUrl } from '../constants/theme';
import * as storage from '../utils/storage';

const api = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  config.baseURL = getApiUrl();
  const token = await storage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
