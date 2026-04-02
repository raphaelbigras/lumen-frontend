import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z
    .string()
    .min(1, 'Le commentaire ne peut pas être vide'),
});

export type CreateComment = z.infer<typeof createCommentSchema>;
