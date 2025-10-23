import { z } from 'zod';

export const paginateSchema = z.object({
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 1)),
    pageSize: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .refine((val) => val > 0 && val <= 200, {
            message: 'pageSize must be between 1 and 200',
        }),
});
