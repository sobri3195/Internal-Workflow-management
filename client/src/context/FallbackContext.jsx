import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../config/axios';

const FallbackContext = createContext();

export function useFallback() {
  return useContext(FallbackContext);
}

export function FallbackProvider({ children }) {
  const [fallbackMode, setFallbackMode] = useState(false);

  useEffect(() => {
    const checkFallbackMode = setInterval(() => {
      const bypassUser = localStorage.getItem('bypassUser');
      const mockDocs = localStorage.getItem('mockDocuments');
      
      if (bypassUser && mockDocs) {
        setFallbackMode(true);
      }
    }, 1000);

    return () => clearInterval(checkFallbackMode);
  }, []);

  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        if (response.statusText === 'OK (localStorage)' || response.statusText === 'Created (localStorage)') {
          setFallbackMode(true);
        }
        return response;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const value = {
    fallbackMode,
  };

  return <FallbackContext.Provider value={value}>{children}</FallbackContext.Provider>;
}
