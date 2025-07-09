import axios from 'axios';
import { JWTconfig } from '../config-global';

// ----------------------------------------------------------------------

const apiClient = axios.create({
  baseURL: `${JWTconfig.apiUrl}/${JWTconfig.apiV}`
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  const companyId = localStorage.getItem('companyId');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (companyId) {
    config.headers['company-id'] = companyId;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default apiClient;
