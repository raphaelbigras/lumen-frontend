'use server';

import { serverPatch, serverPost, serverDelete } from '@/lib/api/server-client';
import { revalidatePath } from 'next/cache';

export async function updateTicketAction(ticketId: string, data: Record<string, unknown>) {
  await serverPatch(`/tickets/${ticketId}`, data);
  revalidatePath(`/billets/${ticketId}`);
}

export async function addCommentAction(ticketId: string, body: string) {
  await serverPost(`/tickets/${ticketId}/comments`, { body });
  revalidatePath(`/billets/${ticketId}`);
}

export async function closeTicketAction(ticketId: string, reason: string) {
  await serverPost(`/tickets/${ticketId}/comments`, { body: `Résolu par le demandeur : ${reason}` });
  await serverPatch(`/tickets/${ticketId}`, { status: 'CLOSED' });
  revalidatePath(`/billets/${ticketId}`);
}

export async function reopenTicketAction(ticketId: string, reason: string) {
  await serverPost(`/tickets/${ticketId}/comments`, { body: `Billet réouvert par le demandeur : ${reason}` });
  await serverPatch(`/tickets/${ticketId}`, { status: 'OPEN' });
  revalidatePath(`/billets/${ticketId}`);
}

export async function deleteAttachmentAction(ticketId: string, attachmentId: string) {
  await serverDelete(`/tickets/${ticketId}/attachments/${attachmentId}`);
  revalidatePath(`/billets/${ticketId}`);
}
