import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      api.get('/auth/me').then(({ data }) => {
        if (data.data.role !== 'admin') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          return;
        }
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
      }).catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (identifier, password) => {
    const { data } = await api.post('/auth/admin-login', { identifier, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.data));
    setUser(data.data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const { data } = await api.get('/auth/me');
    if (data.data.role !== 'admin') {
      logout();
      return null;
    }
    setUser(data.data);
    localStorage.setItem('user', JSON.stringify(data.data));
    return data.data;
  }, []);

  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    return user.permissions?.includes(permission);
  }, [user]);

  const hasAnyPermission = useCallback((...permissions) => {
    return permissions.some((p) => hasPermission(p));
  }, [hasPermission]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasPermission, hasAnyPermission, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
