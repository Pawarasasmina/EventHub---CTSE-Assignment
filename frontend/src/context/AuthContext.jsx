import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/services';
import { clearStoredAuth, getStoredAuth, setStoredAuth } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(getStoredAuth());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const stored = getStoredAuth();

      if (!stored?.token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.me();
        const nextAuth = { token: stored.token, user: response.data.data };
        setAuth(nextAuth);
        setStoredAuth(nextAuth);
      } catch {
        clearStoredAuth();
        setAuth(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (payload) => {
    const response = await authApi.login(payload);
    const nextAuth = response.data.data;
    setAuth(nextAuth);
    setStoredAuth(nextAuth);
    return nextAuth;
  };

  const register = async (payload) => {
    const response = await authApi.register(payload);
    const nextAuth = response.data.data;
    setAuth(nextAuth);
    setStoredAuth(nextAuth);
    return nextAuth;
  };

  const logout = () => {
    clearStoredAuth();
    setAuth(null);
  };

  return <AuthContext.Provider value={{ auth, user: auth?.user, token: auth?.token, loading, login, register, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
