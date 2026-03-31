import apiClient from './client';

export interface Attachment {
  id: string;
  ticketId: string;
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
  createdAt: string;
}

export const attachmentsApi = {
  getByTicket: (ticketId: string) =>
    apiClient.get<Attachment[]>(`/tickets/${ticketId}/attachments`).then((r) => r.data),

  upload: (ticketId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiClient
      .post<Attachment>(`/tickets/${ticketId}/attachments`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },

  getDownloadUrl: (id: string) =>
    apiClient.get<{ url: string }>(`/tickets/attachments/${id}/download`).then((r) => r.data),

  // The download endpoint is nested under ticketId in the backend
  getDownloadUrlForTicket: (ticketId: string, id: string) =>
    apiClient.get<{ url: string }>(`/tickets/${ticketId}/attachments/${id}/download`).then((r) => r.data),

  delete: (ticketId: string, id: string) =>
    apiClient.delete(`/tickets/${ticketId}/attachments/${id}`).then((r) => r.data),
};
