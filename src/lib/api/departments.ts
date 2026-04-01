import apiClient from './client';

export interface Department {
  id: string;
  name: string;
  createdAt: string;
  _count?: { tickets: number };
}

export const departmentsApi = {
  getAll: () => apiClient.get<Department[]>('/departments').then((r) => r.data),
  create: (data: { name: string }) => apiClient.post<Department>('/departments', data).then((r) => r.data),
  update: (id: string, data: { name: string }) => apiClient.patch<Department>(`/departments/${id}`, data).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/departments/${id}`).then((r) => r.data),
};
