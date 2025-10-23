import { z } from "zod";

const userFields = {
    email: z.email(),
    name: z.string().min(2),
    password: z.string().min(6),
}

const { name, ...loginFields } = userFields;

const loginSchema = z.object(loginFields);
const registerSchema = z.object(userFields);

export { loginSchema, registerSchema };
