import { DemographicData } from './types';

/**
 * Goals that map to clinical protocols
 */
export enum GoalType {
  ENERGY_RECOVERY = 'ENERGY_RECOVERY',
  STRESS_SLEEP = 'STRESS_SLEEP',
  LONGEVITY = 'LONGEVITY',
  ATHLETIC_PERFORMANCE = 'ATHLETIC_PERFORMANCE',
  METABOLIC_HEALTH = 'METABOLIC_HEALTH',
  IMMUNE_SUPPORT = 'IMMUNE_SUPPORT',
  BRAIN_HEALTH = 'BRAIN_HEALTH',
  JOINT_HEALTH = 'JOINT_HEALTH',
}

export const GOAL_TO_PROTOCOL: Record<GoalType, { protocolId: string; label: string }> = {
  [GoalType.ENERGY_RECOVERY]: {
    protocolId: 'prot_001',
    label: 'Energy & Recovery',
  },
  [GoalType.STRESS_SLEEP]: {
    protocolId: 'prot_002',
    label: 'Stress & Sleep',
  },
  [GoalType.LONGEVITY]: {
    protocolId: 'prot_003',
    label: 'Longevity & Prevention',
  },
  [GoalType.ATHLETIC_PERFORMANCE]: {
    protocolId: 'prot_004',
    label: 'Athletic Performance',
  },
  [GoalType.METABOLIC_HEALTH]: {
    protocolId: 'prot_005',
    label: 'Metabolic Health',
  },
  [GoalType.IMMUNE_SUPPORT]: {
    protocolId: 'prot_001', // Default fallback
    label: 'Immune Support',
  },
  [GoalType.BRAIN_HEALTH]: {
    protocolId: 'prot_003',
    label: 'Brain Health',
  },
  [GoalType.JOINT_HEALTH]: {
    protocolId: 'prot_001',
    label: 'Joint Health',
  },
};

/**
 * Goal selection node
 * Validates goal and returns associated protocol
 */
export function selectGoal(goal: GoalType): {
  goal: GoalType;
  protocolExternalId: string;
  label: string;
} {
  if (!Object.values(GoalType).includes(goal)) {
    throw new Error(`Invalid goal: ${goal}`);
  }

  const mapping = GOAL_TO_PROTOCOL[goal];

  return {
    goal,
    protocolExternalId: mapping.protocolId,
    label: mapping.label,
  };
}

/**
 * Get all available goals with descriptions
 */
export function getAvailableGoals(): Array<{
  value: GoalType;
  label: string;
  description: string;
}> {
  return [
    {
      value: GoalType.ENERGY_RECOVERY,
      label: 'Energy & Recovery',
      description: 'Support sustained energy, ATP production, and post-exercise recovery',
    },
    {
      value: GoalType.STRESS_SLEEP,
      label: 'Stress & Sleep',
      description: 'Support cortisol balance, relaxation, and quality sleep',
    },
    {
      value: GoalType.LONGEVITY,
      label: 'Longevity & Prevention',
      description: 'Comprehensive support for healthy aging and cellular protection',
    },
    {
      value: GoalType.ATHLETIC_PERFORMANCE,
      label: 'Athletic Performance',
      description: 'Optimize strength, endurance, and recovery for athletes',
    },
    {
      value: GoalType.METABOLIC_HEALTH,
      label: 'Metabolic Health',
      description: 'Support blood sugar balance and metabolic function',
    },
    {
      value: GoalType.IMMUNE_SUPPORT,
      label: 'Immune Support',
      description: 'Strengthen immune function and resilience',
    },
    {
      value: GoalType.BRAIN_HEALTH,
      label: 'Brain Health',
      description: 'Support cognitive function, focus, and neuroplasticity',
    },
    {
      value: GoalType.JOINT_HEALTH,
      label: 'Joint Health',
      description: 'Support joint mobility, cartilage health, and flexibility',
    },
  ];
}
