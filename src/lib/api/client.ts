import axios from 'axios';
import { getKeycloak } from '../keycloak';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const kc = getKeycloak();
  if (kc.token) {
    // Only refresh if token expires within 60s — avoids a Keycloak round-trip on every request
    if (kc.isTokenExpired(60)) {
      await kc.updateToken(60).catch(() => kc.login());
    }
    config.headers.Authorization = `Bearer ${kc.token}`;
  }
  return config;
});

export default apiClient;
