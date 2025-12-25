import { DemographicData } from './types';

/**
 * Goals that map directly to clinical metadata categories
 */
export enum GoalType {
  LONGEVITY = 'longevity',
  CARDIO = 'cardio',
  DETOX = 'detox',
  IMMUNE = 'immune',
  GUT = 'gut',
  FITNESS = 'fitness',
  WEIGHT = 'weight',
  RECOVERY = 'recovery',
  ENERGY = 'energy',
  MEN_HORMONE = 'men_hormone',
  WOMEN_HORMONE = 'women_hormone',
  SLEEP = 'sleep',
  STRESS = 'stress',
  SKIN = 'skin',
  NEURO = 'neuro',
  URINARY = 'urinary',
  METABOLIC = 'metabolic',
  BRAIN = 'brain',
  MOOD = 'mood',
  JOINTS = 'joints',
  HAIR = 'hair',
  NAILS = 'nails',
}

export const GOAL_TO_PROTOCOL: Record<GoalType, { protocolId: string; label: string }> = {
  [GoalType.LONGEVITY]: {
    protocolId: 'prot_001',
    label: 'Longevity',
  },
  [GoalType.CARDIO]: {
    protocolId: 'prot_002',
    label: 'Cardio',
  },
  [GoalType.DETOX]: {
    protocolId: 'prot_003',
    label: 'Detox',
  },
  [GoalType.IMMUNE]: {
    protocolId: 'prot_004',
    label: 'Immune',
  },
  [GoalType.GUT]: {
    protocolId: 'prot_005',
    label: 'Gut',
  },
  [GoalType.FITNESS]: {
    protocolId: 'prot_006',
    label: 'Fitness',
  },
  [GoalType.WEIGHT]: {
    protocolId: 'prot_007',
    label: 'Weight',
  },
  [GoalType.RECOVERY]: {
    protocolId: 'prot_008',
    label: 'Recovery',
  },
  [GoalType.ENERGY]: {
    protocolId: 'prot_009',
    label: 'Energy',
  },
  [GoalType.MEN_HORMONE]: {
    protocolId: 'prot_010',
    label: 'Men Hormone',
  },
  [GoalType.WOMEN_HORMONE]: {
    protocolId: 'prot_011',
    label: 'Women Hormone',
  },
  [GoalType.SLEEP]: {
    protocolId: 'prot_012',
    label: 'Sleep',
  },
  [GoalType.STRESS]: {
    protocolId: 'prot_013',
    label: 'Stress',
  },
  [GoalType.SKIN]: {
    protocolId: 'prot_014',
    label: 'Skin',
  },
  [GoalType.NEURO]: {
    protocolId: 'prot_015',
    label: 'Neuro',
  },
  [GoalType.URINARY]: {
    protocolId: 'prot_016',
    label: 'Urinary',
  },
  [GoalType.METABOLIC]: {
    protocolId: 'prot_017',
    label: 'Metabolic',
  },
  [GoalType.BRAIN]: {
    protocolId: 'prot_018',
    label: 'Brain',
  },
  [GoalType.MOOD]: {
    protocolId: 'prot_019',
    label: 'Mood',
  },
  [GoalType.JOINTS]: {
    protocolId: 'prot_020',
    label: 'Joints',
  },
  [GoalType.HAIR]: {
    protocolId: 'prot_021',
    label: 'Hair',
  },
  [GoalType.NAILS]: {
    protocolId: 'prot_022',
    label: 'Nails',
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
      value: GoalType.LONGEVITY,
      label: 'Longevity',
      description: 'Support healthy aging and cellular protection',
    },
    {
      value: GoalType.CARDIO,
      label: 'Cardio',
      description: 'Support cardiovascular health and blood pressure',
    },
    {
      value: GoalType.DETOX,
      label: 'Detox',
      description: 'Support detoxification and cellular cleansing',
    },
    {
      value: GoalType.IMMUNE,
      label: 'Immune',
      description: 'Strengthen immune function and resilience',
    },
    {
      value: GoalType.GUT,
      label: 'Gut',
      description: 'Support digestive health and microbiome balance',
    },
    {
      value: GoalType.FITNESS,
      label: 'Fitness',
      description: 'Support muscle development and athletic performance',
    },
    {
      value: GoalType.WEIGHT,
      label: 'Weight',
      description: 'Support weight management and metabolic health',
    },
    {
      value: GoalType.RECOVERY,
      label: 'Recovery',
      description: 'Optimize post-workout recovery and muscle repair',
    },
    {
      value: GoalType.ENERGY,
      label: 'Energy',
      description: 'Support sustained energy and ATP production',
    },
    {
      value: GoalType.MEN_HORMONE,
      label: 'Men Hormone',
      description: 'Support hormonal balance in men',
    },
    {
      value: GoalType.WOMEN_HORMONE,
      label: 'Women Hormone',
      description: 'Support hormonal balance in women',
    },
    {
      value: GoalType.SLEEP,
      label: 'Sleep',
      description: 'Support quality sleep and rest',
    },
    {
      value: GoalType.STRESS,
      label: 'Stress',
      description: 'Support stress resilience and adaptation',
    },
    {
      value: GoalType.SKIN,
      label: 'Skin',
      description: 'Support skin health and appearance',
    },
    {
      value: GoalType.NEURO,
      label: 'Neuro',
      description: 'Support neurological health and function',
    },
    {
      value: GoalType.URINARY,
      label: 'Urinary',
      description: 'Support urinary tract health',
    },
    {
      value: GoalType.METABOLIC,
      label: 'Metabolic',
      description: 'Support metabolic function and glucose balance',
    },
    {
      value: GoalType.BRAIN,
      label: 'Brain',
      description: 'Support cognitive function and brain health',
    },
    {
      value: GoalType.MOOD,
      label: 'Mood',
      description: 'Support mood and emotional balance',
    },
    {
      value: GoalType.JOINTS,
      label: 'Joints',
      description: 'Support joint health and mobility',
    },
    {
      value: GoalType.HAIR,
      label: 'Hair',
      description: 'Support hair health and growth',
    },
    {
      value: GoalType.NAILS,
      label: 'Nails',
      description: 'Support nail health and strength',
    },
  ];
}
