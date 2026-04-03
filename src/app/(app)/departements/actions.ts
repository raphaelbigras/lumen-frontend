'use server';

import { serverPost, serverPatch, serverDelete } from '@/lib/api/server-client';
import { revalidatePath } from 'next/cache';
import { createDepartmentSchema } from '@/lib/schemas/department.schema';

export async function createDepartmentAction(name: string) {
  const result = createDepartmentSchema.safeParse({ name });
  if (!result.success) return { error: result.error.issues[0].message };
  await serverPost('/departments', result.data);
  revalidatePath('/departements');
  return {};
}

export async function updateDepartmentAction(id: string, name: string) {
  const result = createDepartmentSchema.safeParse({ name });
  if (!result.success) return { error: result.error.issues[0].message };
  await serverPatch(`/departments/${id}`, { name: result.data.name });
  revalidatePath('/departements');
  return {};
}

export async function deleteDepartmentAction(id: string) {
  await serverDelete(`/departments/${id}`);
  revalidatePath('/departements');
}
