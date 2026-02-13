import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function useApi() {
  const navigate = useNavigate();

  const request = useCallback(async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      throw new Error('Session expired');
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  }, [navigate]);

  const get = useCallback((endpoint) => request(endpoint), [request]);

  const post = useCallback(
    (endpoint, body) =>
      request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    [request]
  );

  const put = useCallback(
    (endpoint, body) =>
      request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    [request]
  );

  const del = useCallback(
    (endpoint) => request(endpoint, { method: 'DELETE' }),
    [request]
  );

  return { get, post, put, del };
}

export default useApi;
