import apiClient from './client';

export interface Comment {
  id: string;
  body: string;
  author: { id: string; firstName: string; lastName: string };
  createdAt: string;
}

export const commentsApi = {
  getByTicket: (ticketId: string) =>
    apiClient.get<Comment[]>(`/tickets/${ticketId}/comments`).then((r) => r.data),
  create: (ticketId: string, body: string) =>
    apiClient.post<Comment>(`/tickets/${ticketId}/comments`, { body }).then((r) => r.data),
  delete: (ticketId: string, id: string) =>
    apiClient.delete(`/tickets/${ticketId}/comments/${id}`).then((r) => r.data),
};
