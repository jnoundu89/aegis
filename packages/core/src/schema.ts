import { z } from 'zod';
import type { Step } from './index.js';

/**
 * Accepts either a plain non-empty string or a locale object with at least
 * an English variant and an optional French variant.
 */
const localizedStringSchema = z.union([
  z.string().min(1),
  z.object({ en: z.string().min(1), fr: z.string().optional() }),
]);

/**
 * Validates the economic state of a build-order step.
 * The sum of resource villagers (food + wood + gold + stone) must equal
 * the total population count (pop). Stone is optional (defaults to 0 in the
 * refine) to match the Step interface where stone is not always used.
 */
export const economyStateSchema = z
  .object({
    food: z.number().min(0),
    wood: z.number().min(0),
    gold: z.number().min(0),
    stone: z.number().min(0).optional(),
    pop: z.number().min(0),
  })
  .refine((d) => d.food + d.wood + d.gold + (d.stone ?? 0) === d.pop, {
    message: 'Resource sum must equal total population',
  });

/** Validates a sprite reference attached to a step. */
export const stepSpriteSchema = z.object({
  key: z.string().min(1),
  label: z.string().optional(),
});

/** Validates a single build-order step. */
export const stepSchema = z.object({
  id: z.number().int().positive(),
  label: localizedStringSchema.refine(
    (v) => (typeof v === 'string' ? v.length > 0 : v.en.length > 0),
    { message: 'Trigger is required' },
  ),
  description: localizedStringSchema.refine(
    (v) => (typeof v === 'string' ? v.length > 0 : v.en.length > 0),
    { message: 'Instruction is required' },
  ),
  notes: localizedStringSchema.optional(),
  phase: z.string().optional(),
  sprites: z.array(stepSpriteSchema).optional(),
  villagerCount: z.number().min(0),
  food: z.number().min(0),
  wood: z.number().min(0),
  gold: z.number().min(0),
  stone: z.number().min(0).optional(),
  favor: z.number().min(0).optional(),
});

/** Validates a milestone checkpoint. */
export const checkpointSchema = z.object({
  label: localizedStringSchema,
  clickTime: z.string().optional(),
  arrivalTime: z.string().optional(),
  villagerCount: z.number().min(0).optional(),
  food: z.number().min(0).optional(),
  wood: z.number().min(0).optional(),
  gold: z.number().min(0).optional(),
  stone: z.number().min(0).optional(),
  favor: z.number().min(0).optional(),
});

/** Validates an entire build order. */
export const buildOrderSchema = z.object({
  id: z.string().min(1),
  gameId: z.string().min(1),
  name: z.string().min(1, 'Name is required'),
  author: z.string().optional(),
  civilization: z.string().optional(),
  description: localizedStringSchema.optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  strategy_notes: z
    .array(
      z.object({
        phase: localizedStringSchema,
        notes: z.array(localizedStringSchema.refine(
          (v) => (typeof v === 'string' ? v.length > 0 : v.en.length > 0),
          { message: 'Note is required' },
        )).min(1),
      })
    )
    .optional(),
  checkpoints: z.array(checkpointSchema).optional(),
  steps: z.array(stepSchema).min(1, 'At least one step is required'),
});

/**
 * Validates a single Step against the economy constraint.
 * Maps `villagerCount` → `pop` and treats absent `stone` as 0.
 *
 * @returns An array of human-readable error messages, or an empty array if valid.
 */
export function validateStep(step: Step): string[] {
  const result = economyStateSchema.safeParse({
    food: step.food,
    wood: step.wood,
    gold: step.gold,
    stone: step.stone ?? 0,
    pop: step.villagerCount,
  });
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.message);
}
