import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import * as storage from '../utils/storage';
import { registerForPushNotifications } from '../services/pushNotifications';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await storage.getItem('token');
        const userStr = await storage.getItem('user');
        if (token && userStr) {
          setUser(JSON.parse(userStr));
          const { data } = await api.get('/auth/me');
          setUser(data.data);
          await storage.setItem('user', JSON.stringify(data.data));
          registerForPushNotifications().catch(() => {});
        }
      } catch {
        await storage.removeItem('token');
        await storage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (identifier, password) => {
    const { data } = await api.post('/auth/login', {
      identifier: identifier.trim(),
      password: password.trim(),
    });
    await storage.setItem('token', data.token);
    await storage.setItem('user', JSON.stringify(data.data));
    setUser(data.data);
    registerForPushNotifications().catch(() => {});
    return data;
  };

  const logout = async () => {
    await storage.removeItem('token');
    await storage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
