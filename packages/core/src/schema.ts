import { z } from 'zod';
import type { Step } from './index.js';

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

/** Validates a single build-order step. */
export const stepSchema = z.object({
  id: z.number().int().positive(),
  label: z.string().min(1, 'Le déclencheur est requis'),
  description: z.string().min(1, "L'instruction est requise"),
  notes: z.string().optional(),
  villagerCount: z.number().min(0),
  food: z.number().min(0),
  wood: z.number().min(0),
  gold: z.number().min(0),
  stone: z.number().min(0).optional(),
  favor: z.number().min(0).optional(),
});

/** Validates an entire build order. */
export const buildOrderSchema = z.object({
  id: z.string().min(1),
  gameId: z.string().min(1),
  name: z.string().min(1, 'Le nom est requis'),
  civilization: z.string().optional(),
  description: z.string().optional(),
  strategy_notes: z
    .array(
      z.object({
        phase: z.string().min(1),
        notes: z.array(z.string().min(1)).min(1),
      })
    )
    .optional(),
  steps: z.array(stepSchema).min(1, 'Au moins une étape est requise'),
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
