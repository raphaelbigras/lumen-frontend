import apiClient from './client';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  submitter: { id: string; firstName: string; lastName: string; email: string };
  assignments: { agent: { id: string; firstName: string; lastName: string } }[];
  department?: { id: string; name: string };
  category?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTickets {
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateTicketData {
  title: string;
  description: string;
  priority?: string;
  departmentId?: string;
  categoryId?: string;
}

export const ticketsApi = {
  getAll: (params?: Record<string, string>) =>
    apiClient.get<PaginatedTickets>('/tickets', { params }).then((r) => r.data),
  getById: (id: string) => apiClient.get<Ticket>(`/tickets/${id}`).then((r) => r.data),
  create: (data: CreateTicketData) => apiClient.post<Ticket>('/tickets', data).then((r) => r.data),
  update: (id: string, data: Partial<Ticket>) =>
    apiClient.patch<Ticket>(`/tickets/${id}`, data).then((r) => r.data),
  assign: (id: string, agentId: string) =>
    apiClient.post(`/tickets/${id}/assign`, { agentId }).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/tickets/${id}`).then((r) => r.data),
};
