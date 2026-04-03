'use server';

import { serverPost, serverPatch, serverDelete } from '@/lib/api/server-client';
import { revalidatePath } from 'next/cache';
import { createCategorySchema } from '@/lib/schemas/category.schema';
import { createDepartmentSchema } from '@/lib/schemas/department.schema';

export async function createCategoryAction(name: string) {
  const result = createCategorySchema.safeParse({ name });
  if (!result.success) return { error: result.error.issues[0].message };
  await serverPost('/categories', result.data);
  revalidatePath('/categories');
  return {};
}

export async function updateCategoryAction(id: string, name: string) {
  const result = createCategorySchema.safeParse({ name });
  if (!result.success) return { error: result.error.issues[0].message };
  await serverPatch(`/categories/${id}`, { name: result.data.name });
  revalidatePath('/categories');
  return {};
}

export async function deleteCategoryAction(id: string) {
  await serverDelete(`/categories/${id}`);
  revalidatePath('/categories');
}

export async function createDepartmentAction(name: string) {
  const result = createDepartmentSchema.safeParse({ name });
  if (!result.success) return { error: result.error.issues[0].message };
  await serverPost('/departments', result.data);
  revalidatePath('/categories');
  return {};
}

export async function updateDepartmentAction(id: string, name: string) {
  const result = createDepartmentSchema.safeParse({ name });
  if (!result.success) return { error: result.error.issues[0].message };
  await serverPatch(`/departments/${id}`, { name: result.data.name });
  revalidatePath('/categories');
  return {};
}

export async function deleteDepartmentAction(id: string) {
  await serverDelete(`/departments/${id}`);
  revalidatePath('/categories');
}
