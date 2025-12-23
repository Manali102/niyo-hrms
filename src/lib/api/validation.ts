import { z } from "zod";
import { messages } from "@/constants/messages";

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: z.string().email(messages.invalidEmail),
  password: z
    .string()
    .min(8, messages.passwordMin)
    .regex(/[A-Z]/, messages.passwordUpper)
    .regex(/[a-z]/, messages.passwordLower)
    .regex(/[0-9]/, messages.passwordNumber),
    keepLoggedIn: z.boolean().optional().default(false),
});

/**
 * Register form schema
 */
export const registerSchema = z
  .object({
    ownerName: z.string().min(1, messages.required),
    ownerEmail: z.string().min(1, messages.required).email(messages.invalidEmail),
    name: z.string().min(2, "Company name must be at least 2 characters"),
    companyEmail: z.string().min(1, messages.required).email(messages.invalidEmail),
    password: z
      .string()
      .min(8, messages.passwordMin)
      .regex(/[A-Z]/, messages.passwordUpper)
      .regex(/[a-z]/, messages.passwordLower)
      .regex(/[0-9]/, messages.passwordNumber),
    confirmPassword: z.string().min(1, messages.required),
    terms: z.boolean().refine((val) => val === true, { message: messages.acceptTerms }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: messages.passwordsMismatch,
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;


