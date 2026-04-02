import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est obligatoire')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
});

export type CreateDepartment = z.infer<typeof createDepartmentSchema>;

export const updateDepartmentSchema = createDepartmentSchema;
export type UpdateDepartment = CreateDepartment;
