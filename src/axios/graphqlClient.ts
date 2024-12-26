// src/axios/graphqlClient.ts
import axios from 'axios';
import { JWTconfig } from '../config-global';

const graphqlClient = axios.create({
  baseURL: `${JWTconfig.apiUrl}/${JWTconfig.apiV}/graphql`
});

graphqlClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export const graphqlRequest = (query: string, variables: object = {}) => {
  const localUser = localStorage.getItem('accessToken');
  return graphqlClient.post(
    '',
    { query, variables },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localUser}`
      }
    }
  );
};

export default graphqlClient;
