import { z } from 'zod';

/**
 * Template Input Definition
 */
export const TemplateInputSchema = z.object({
  name: z.string(),
  type: z.enum(['text', 'select', 'boolean']),
  required: z.boolean().optional().default(false),
  default: z.union([z.string(), z.boolean()]).optional(),
  options: z.array(z.string()).optional(),
});

export type TemplateInput = z.infer<typeof TemplateInputSchema>;

/**
 * Context Requirements Definition
 */
export const ContextRequirementsSchema = z.object({
  max_size_percentage: z.number().min(0).max(1),
  optimal_remaining: z.number().min(0).max(1),
});

export type ContextRequirements = z.infer<typeof ContextRequirementsSchema>;

/**
 * Execution Mode Definition
 */
export const ExecutionModeSchema = z.object({
  mode: z.enum(['single_chat', 'multi_chat']),
});

export type ExecutionMode = z.infer<typeof ExecutionModeSchema>;

/**
 * Template Definition
 */
export const TemplateSchema = z.object({
  template_id: z.string(),
  name: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  context_requirements: ContextRequirementsSchema,
  execution: ExecutionModeSchema,
  pattern: z.string(),
  inputs: z.array(TemplateInputSchema),
});

export type Template = z.infer<typeof TemplateSchema>;

/**
 * Template Summary (without pattern)
 */
export const TemplateSummarySchema = TemplateSchema.omit({ pattern: true });

export type TemplateSummary = z.infer<typeof TemplateSummarySchema>;

/**
 * Template List Response
 */
export const TemplateListResponseSchema = z.object({
  templates: z.array(TemplateSummarySchema),
  count: z.number(),
  tags: z.array(z.string()),
});

export type TemplateListResponse = z.infer<typeof TemplateListResponseSchema>;

/**
 * Template Query Parameters
 */
export const TemplateQuerySchema = z.object({
  tag: z.string().optional(),
  search: z.string().optional(),
});

export type TemplateQuery = z.infer<typeof TemplateQuerySchema>;

/**
 * Template Get Parameters
 */
export const TemplateGetSchema = z.object({
  template_id: z.string(),
});

export type TemplateGet = z.infer<typeof TemplateGetSchema>;

/**
 * Context Status Response
 */
export const ContextStatusResponseSchema = z.object({
  total_capacity: z.number(),
  used_capacity: z.number(),
  remaining_capacity: z.number(),
  used_percentage: z.number(),
  remaining_percentage: z.number(),
  recommended_action: z.enum(['continue', 'new_chat']),
});

export type ContextStatusResponse = z.infer<typeof ContextStatusResponseSchema>;

/**
 * Prompt Build Request
 */
export const PromptBuildRequestSchema = z.object({
  template_id: z.string(),
  inputs: z.record(z.union([z.string(), z.boolean()])),
});

export type PromptBuildRequest = z.infer<typeof PromptBuildRequestSchema>;

/**
 * Prompt Build Response
 */
export const PromptBuildResponseSchema = z.object({
  prompt: z.string(),
  template_id: z.string(),
  template_name: z.string(),
  context_usage: z.number().optional(),
  missing_inputs: z.array(z.string()).optional(),
});

export type PromptBuildResponse = z.infer<typeof PromptBuildResponseSchema>;
