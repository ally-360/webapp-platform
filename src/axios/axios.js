import axios from 'axios';
import { JWTconfig } from '../config-global';

// ----------------------------------------------------------------------

const apiClient = axios.create({
  baseURL: `${JWTconfig.apiUrl}/${JWTconfig.apiV}`
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default apiClient;
