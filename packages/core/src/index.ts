/**
 * Represents the current economic state of the player during a build order step.
 */
export interface EconomyState {
  /** Total number of villagers currently alive */
  villagerCount: number;
  /** Food stockpile (approximate) */
  food: number;
  /** Wood stockpile (approximate) */
  wood: number;
  /** Gold stockpile (approximate) */
  gold: number;
  /** Stone stockpile (approximate) */
  stone: number;
}

/**
 * Represents a single step in a build order.
 */
export interface Step {
  /** Unique numeric identifier (1-based) */
  id: number;
  /** Short human-readable label, e.g. "6 Sheep" */
  label: string;
  /** Detailed instruction for this step */
  description: string;
  /** Notes or tips for this step */
  notes?: string;
  /** Expected economy state after completing this step */
  villagerCount: EconomyState['villagerCount'];
  food: EconomyState['food'];
  wood: EconomyState['wood'];
  gold: EconomyState['gold'];
  stone: EconomyState['stone'];
}

/**
 * A complete build order, consisting of an ordered list of steps.
 */
export interface BuildOrder {
  /** Unique identifier / slug for the build order */
  id: string;
  /** Display name */
  name: string;
  /** Civilisation the build order is optimised for (empty = any) */
  civilization?: string;
  /** Short description of the strategy */
  description?: string;
  /** Ordered list of steps */
  steps: Step[];
}

/**
 * A simple state machine for navigating forward and backward through
 * the steps of a {@link BuildOrder}.
 *
 * @example
 * ```ts
 * const sm = new StateMachine(buildOrder);
 * sm.next(); // advance to step 2
 * sm.prev(); // go back to step 1
 * sm.currentStep; // => Step { id: 1, … }
 * ```
 */
export class StateMachine {
  private readonly steps: Step[];
  private _index: number;

  constructor(buildOrder: BuildOrder | Step[]) {
    this.steps = Array.isArray(buildOrder) ? buildOrder : buildOrder.steps;
    if (this.steps.length === 0) {
      throw new Error('StateMachine requires at least one step.');
    }
    this._index = 0;
  }

  /** Zero-based index of the current step */
  get index(): number {
    return this._index;
  }

  /** The currently active step */
  get currentStep(): Step {
    return this.steps[this._index];
  }

  /** Total number of steps */
  get totalSteps(): number {
    return this.steps.length;
  }

  /** Whether there is a next step available */
  get hasNext(): boolean {
    return this._index < this.steps.length - 1;
  }

  /** Whether there is a previous step available */
  get hasPrev(): boolean {
    return this._index > 0;
  }

  /**
   * Move to the next step.
   * @returns The new current step, or `undefined` if already at the last step.
   */
  next(): Step | undefined {
    if (!this.hasNext) return undefined;
    this._index += 1;
    return this.currentStep;
  }

  /**
   * Move to the previous step.
   * @returns The new current step, or `undefined` if already at the first step.
   */
  prev(): Step | undefined {
    if (!this.hasPrev) return undefined;
    this._index -= 1;
    return this.currentStep;
  }

  /**
   * Jump directly to a step by its zero-based index.
   * @throws {RangeError} if the index is out of bounds.
   */
  goTo(index: number): Step {
    if (index < 0 || index >= this.steps.length) {
      throw new RangeError(
        `Index ${index} is out of bounds (0–${this.steps.length - 1}).`
      );
    }
    this._index = index;
    return this.currentStep;
  }

  /** Reset back to the first step */
  reset(): void {
    this._index = 0;
  }
}
