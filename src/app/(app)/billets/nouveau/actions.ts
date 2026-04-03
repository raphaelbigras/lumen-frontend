'use server';

import { serverPost } from '@/lib/api/server-client';
import { createTicketSchema } from '@/lib/schemas/ticket.schema';
import { redirect } from 'next/navigation';

export interface CreateTicketState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createTicketAction(
  _prevState: CreateTicketState,
  formData: FormData,
): Promise<CreateTicketState> {
  const raw = {
    title: (formData.get('title') as string)?.trim(),
    description: (formData.get('description') as string)?.trim(),
    priority: formData.get('priority') as string,
    categoryId: formData.get('categoryId') as string || undefined,
    departmentId: formData.get('departmentId') as string || undefined,
    site: formData.get('site') as string || undefined,
  };

  const result = createTicketSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  try {
    const ticket = await serverPost<{ id: string }>('/tickets', result.data);
    redirect(`/billets/${ticket.id}`);
  } catch (error: any) {
    // redirect throws a special error — rethrow it
    if (error?.digest?.startsWith('NEXT_REDIRECT')) throw error;
    return { error: error?.message || 'Erreur lors de la creation' };
  }
}
