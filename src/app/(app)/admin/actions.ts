'use server';

import { serverPatch } from '@/lib/api/server-client';
import { revalidatePath } from 'next/cache';

export async function updateUserRoleAction(userId: string, role: string) {
  await serverPatch(`/users/${userId}/role`, { role });
  revalidatePath('/admin');
}
