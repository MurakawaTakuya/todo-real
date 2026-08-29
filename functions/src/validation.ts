import { Response } from "express";
import { z } from "zod";

export const documentIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .refine((value) => !value.includes("/"), "Invalid document ID");

const dateSchema = z
  .union([z.string().min(1), z.date()])
  .transform((value) => new Date(value))
  .refine((value) => !Number.isNaN(value.getTime()), "Invalid date");

export const userCreateSchema = z
  .object({
    name: z.string().trim().min(1).max(30),
    fcmToken: z.string().max(4096).optional().default(""),
  })
  .strict();

export const userUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(30).optional(),
    fcmToken: z.string().max(4096).optional(),
  })
  .strict()
  .refine((value) => value.name !== undefined || value.fcmToken !== undefined, {
    message: "At least one field is required",
  });

export const goalCreateSchema = z
  .object({
    userId: documentIdSchema.optional(),
    deadline: dateSchema,
    text: z.string().trim().min(1).max(100),
  })
  .strict()
  .refine((value) => value.deadline.getTime() > Date.now(), {
    message: "Deadline must be in the future",
    path: ["deadline"],
  });

export const goalUpdateSchema = z
  .object({
    deadline: dateSchema.optional(),
    text: z.string().trim().min(1).max(100).optional(),
  })
  .strict()
  .refine((value) => value.deadline !== undefined || value.text !== undefined, {
    message: "At least one field is required",
  })
  .refine(
    (value) => !value.deadline || value.deadline.getTime() > Date.now(),
    { message: "Deadline must be in the future", path: ["deadline"] }
  );

export const postUpdateSchema = z
  .object({
    goalId: documentIdSchema,
    userId: documentIdSchema.optional(),
    text: z.string().trim().max(100).default(""),
    storedId: z.string().trim().min(3).max(300),
    submittedAt: dateSchema.optional(),
  })
  .strict();

export const reactionUpdateSchema = z
  .object({
    userId: documentIdSchema.optional(),
    reactionType: z
      .enum(["laugh", "surprised", "clap", "sad", "angry", "muscle"])
      .or(z.literal("")),
  })
  .strict();

export const resultQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(10),
    offset: z.coerce.number().int().min(0).max(10000).default(0),
    onlyPending: z.enum(["true", "false"]).optional(),
    onlyFinished: z.enum(["true", "false"]).optional(),
  })
  .strict()
  .refine(
    (value) => !(value.onlyPending === "true" && value.onlyFinished === "true"),
    { message: "onlyPending and onlyFinished cannot both be true" }
  );

export const notificationSchema = z
  .object({
    goalId: documentIdSchema,
    marginTime: z.number().int().min(1).max(1440),
  })
  .strict();

export const parseInput = <T>(
  schema: z.ZodType<T>,
  value: unknown,
  res: Response
): T | null => {
  const result = schema.safeParse(value);
  if (result.success) {
    return result.data;
  }

  res.status(400).json({
    message: "Invalid request",
    issues: result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  });
  return null;
};
