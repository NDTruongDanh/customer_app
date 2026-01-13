import { z } from "zod";

// Login Schema
export const loginSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9+\-\s()]+$/, "Please enter a valid phone number")
    .min(9, "Phone number must be at least 9 digits"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Signup Schema
export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be less than 100 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^[0-9+\-\s()]+$/, "Please enter a valid phone number")
      .min(9, "Phone number must be at least 9 digits"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

// Edit Profile Schema
export const editProfileSchema = z.object({
  fullName: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 2,
      "Full name must be at least 2 characters"
    )
    .refine(
      (val) => !val || val.length <= 100,
      "Full name must be less than 100 characters"
    ),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "Please enter a valid email address"
    ),
  idNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 5,
      "ID number must be at least 5 characters"
    )
    .refine(
      (val) => !val || val.length <= 20,
      "ID number must be less than 20 characters"
    ),
  address: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length <= 500,
      "Address must be less than 500 characters"
    ),
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;

// Helper function to get field error from Zod validation result
export const getFieldError = (
  errors: z.ZodIssue[] | undefined,
  field: string
): string | undefined => {
  if (!errors) return undefined;
  const error = errors.find((e) => e.path.includes(field));
  return error?.message;
};

// Helper function to validate form data
export const validateForm = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodIssue[] } => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error.issues };
};
