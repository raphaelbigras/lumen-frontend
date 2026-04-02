import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est obligatoire')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
});

export type CreateCategory = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema;
export type UpdateCategory = CreateCategory;
