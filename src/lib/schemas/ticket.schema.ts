import { z } from 'zod';

export const createTicketSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est obligatoire')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères'),
  description: z
    .string()
    .min(1, 'La description est obligatoire'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
    message: 'Priorité invalide',
  }),
  categoryId: z
    .uuid({ message: 'La catégorie est obligatoire' }),
  departmentId: z
    .uuid({ message: 'Le département est obligatoire' }),
  site: z
    .string({ message: 'Le site est obligatoire' })
    .min(1, 'Le site est obligatoire'),
});

export type CreateTicket = z.infer<typeof createTicketSchema>;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
