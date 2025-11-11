import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../config/axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bypassMode, setBypassMode] = useState(false);

  useEffect(() => {
    const bypassUser = localStorage.getItem('bypassUser');
    const token = localStorage.getItem('token');
    
    if (bypassUser) {
      setUser(JSON.parse(bypassUser));
      setBypassMode(true);
      setLoading(false);
    } else if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const response = await axios.post('/api/auth/login', { username, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    return user;
  };

  const bypassLogin = (role = 'admin') => {
    const mockUser = {
      id: 1,
      username: 'dev_user',
      email: 'dev@example.com',
      full_name: 'Development User',
      role: role,
      unit_kerja: 'Development',
      is_active: true
    };
    
    localStorage.setItem('bypassUser', JSON.stringify(mockUser));
    setUser(mockUser);
    setBypassMode(true);
    return mockUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('bypassUser');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setBypassMode(false);
  };

  const value = {
    user,
    loading,
    bypassMode,
    login,
    bypassLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
