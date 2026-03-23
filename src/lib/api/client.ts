import axios from 'axios';
import { getKeycloak } from '../keycloak';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api',
});

apiClient.interceptors.request.use(async (config) => {
  const kc = getKeycloak();
  if (kc.token) {
    await kc.updateToken(30).catch(() => kc.login());
    config.headers.Authorization = `Bearer ${kc.token}`;
  }
  return config;
});

export default apiClient;
