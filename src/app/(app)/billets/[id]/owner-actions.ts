'use server';

import { serverPatch, serverPost } from '@/lib/api/server-client';
import { revalidatePath } from 'next/cache';

export async function closeOwnTicketAction(ticketId: string, reason: string) {
  await serverPost(`/tickets/${ticketId}/comments`, {
    body: `R\u00e9solu par le demandeur : ${reason}`,
  });
  await serverPatch(`/tickets/${ticketId}`, { status: 'CLOSED' });
  revalidatePath(`/billets/${ticketId}`);
}

export async function reopenOwnTicketAction(ticketId: string, reason: string) {
  await serverPost(`/tickets/${ticketId}/comments`, {
    body: `Billet r\u00e9ouvert par le demandeur : ${reason}`,
  });
  await serverPatch(`/tickets/${ticketId}`, { status: 'OPEN' });
  revalidatePath(`/billets/${ticketId}`);
}
