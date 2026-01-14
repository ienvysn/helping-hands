const { z } = require("zod");

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[0-9]/, "Password must contain at least one number"),
  userType: z.enum(["volunteer", "organization"], {
    errorMap: () => ({ message: "User type must be 'volunteer' or 'organization'" }),
  }),
  displayName: z.string().min(1, "Display name is required"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const createOpportunitySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  tasks: z.string().optional(),
  requirements: z.string().optional(),
  eventDate: z.coerce.date().refine((date) => date > new Date(), {
    message: "Event date must be in the future",
  }),
  startTime: z.string().optional(),
  durationHours: z.number().positive("Duration must be positive").nullable().optional(),
  opportunityType: z.enum(["on-site", "remote"]).optional(),
  cause: z.string().optional(),
  location: z.string().optional(),
  maxVolunteers: z.number().int().positive().nullable().optional(),
});

const updateOpportunitySchema = createOpportunitySchema.partial();

const signupForOpportunitySchema = z.object({
  opportunityId: z.string().min(1, "Opportunity ID is required"),
});

module.exports = {
  registerSchema,
  loginSchema,
  createOpportunitySchema,
  updateOpportunitySchema,
  signupForOpportunitySchema,
};
