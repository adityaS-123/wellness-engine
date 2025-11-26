import { DemographicData } from './types';

export type BudgetTier = 'ESSENTIAL' | 'GOOD' | 'PREMIUM';

/**
 * Budget tier rules and supplement selection logic
 */
export const BUDGET_TIER_DEFINITIONS: Record<
  BudgetTier,
  {
    name: string;
    description: string;
    maxSupplements: number;
    allowedTiers: BudgetTier[];
    doseMultiplier: number;
    maxMonthlyCost: number;
  }
> = {
  ESSENTIAL: {
    name: 'Essential Baseline',
    description: 'Core supplements for foundational health',
    maxSupplements: 5,
    allowedTiers: ['ESSENTIAL'],
    doseMultiplier: 0.8,
    maxMonthlyCost: 50,
  },
  GOOD: {
    name: 'Balanced Approach',
    description: 'Core + complementary supplements',
    maxSupplements: 8,
    allowedTiers: ['ESSENTIAL', 'GOOD'],
    doseMultiplier: 1.0,
    maxMonthlyCost: 100,
  },
  PREMIUM: {
    name: 'Comprehensive Stack',
    description: 'Full protocol with premium additions',
    maxSupplements: 12,
    allowedTiers: ['ESSENTIAL', 'GOOD', 'PREMIUM'],
    doseMultiplier: 1.1,
    maxMonthlyCost: 200,
  },
};

/**
 * Categorize supplements by budget tier
 */
export const SUPPLEMENT_BUDGET_CATEGORIES: Record<string, BudgetTier> = {
  'Vitamin D3': 'ESSENTIAL',
  'Magnesium Glycinate': 'ESSENTIAL',
  'Zinc Picolinate': 'ESSENTIAL',
  'B-Complex (High Potency)': 'ESSENTIAL',
  'Iron (Ferrous Bisglycinate)': 'GOOD',
  'Probiotics (Multi-strain)': 'GOOD',
  'Omega-3 Fish Oil': 'GOOD',
  'Turmeric (95% Curcuminoids)': 'GOOD',
  'Ashwagandha (Withanolides 5%)': 'GOOD',
  'Creatine Monohydrate': 'GOOD',
  'Rhodiola Rosea (3% Rosavins)': 'GOOD',
  'L-Theanine': 'GOOD',
  'CoQ10 (Ubiquinol)': 'PREMIUM',
  'Resveratrol': 'PREMIUM',
  'Berberine': 'PREMIUM',
};

/**
 * Filter supplements by budget tier
 */
export function filterSupplementsByBudget(
  supplements: Array<{
    id: string;
    name: string;
    budgetTier: string;
    priority: number;
  }>,
  budgetTier: BudgetTier,
  maxResults?: number
): typeof supplements {
  const allowedTiers = BUDGET_TIER_DEFINITIONS[budgetTier].allowedTiers;
  const maxCount = maxResults || BUDGET_TIER_DEFINITIONS[budgetTier].maxSupplements;

  return supplements
    .filter((s) => allowedTiers.includes(s.budgetTier as BudgetTier))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxCount);
}

/**
 * Get budget-based dose modifier
 * Premium tier can receive higher doses of certain supplements
 */
export function getBudgetDoseModifier(budgetTier: BudgetTier): number {
  return BUDGET_TIER_DEFINITIONS[budgetTier].doseMultiplier;
}

/**
 * Adjust protocol supplements based on budget
 */
export function adjustProtocolByBudget(
  coreSupplements: string[],
  optionalSupplements: string[],
  budgetTier: BudgetTier
): {
  coreSupplements: string[];
  selectedOptional: string[];
  removedSupplements: string[];
} {
  const config = BUDGET_TIER_DEFINITIONS[budgetTier];

  // Always include core supplements if they fit budget
  let selectedCore = coreSupplements.slice(0, config.maxSupplements);
  let removed: string[] = [];

  // Add optional supplements if room remains
  const remainingSlots = config.maxSupplements - selectedCore.length;
  let selectedOptional = optionalSupplements.slice(0, remainingSlots);

  // Track removed supplements
  if (coreSupplements.length > selectedCore.length) {
    removed = coreSupplements.slice(selectedCore.length);
  }

  return {
    coreSupplements: selectedCore,
    selectedOptional,
    removedSupplements: removed,
  };
}

/**
 * Check if supplement should be included in a tier
 */
export function isSupplementInTier(
  supplementName: string,
  tier: BudgetTier
): boolean {
  const category = SUPPLEMENT_BUDGET_CATEGORIES[supplementName];
  if (!category) return false;

  // Tier includes all lower tiers
  if (tier === 'PREMIUM') return true;
  if (tier === 'GOOD')
    return category === 'ESSENTIAL' || category === 'GOOD';
  if (tier === 'ESSENTIAL') return category === 'ESSENTIAL';

  return false;
}

/**
 * Estimate monthly budget and cost implications
 */
export function estimateMonthlyBudget(
  tier: BudgetTier,
  supplementCount: number
): {
  minEstimate: number;
  maxEstimate: number;
  averagePerSupp: number;
} {
  // Rough estimates per supplement per month (USD)
  const costPerSupp = {
    ESSENTIAL: { min: 8, max: 15 },
    GOOD: { min: 12, max: 25 },
    PREMIUM: { min: 20, max: 50 },
  };

  const costs = costPerSupp[tier];
  const minEstimate = costs.min * supplementCount;
  const maxEstimate = costs.max * supplementCount;

  return {
    minEstimate,
    maxEstimate,
    averagePerSupp: (minEstimate + maxEstimate) / 2 / supplementCount,
  };
}

/**
 * Get cost category label for display
 */
export function getBudgetLabel(tier: BudgetTier): string {
  return BUDGET_TIER_DEFINITIONS[tier].name;
}

/**
 * Suggest tier based on demographics and goals
 */
export function suggestBudgetTier(
  trainingFrequency?: string,
  age?: number
): BudgetTier {
  // High training load benefits from premium
  if (trainingFrequency === 'INTENSE' || trainingFrequency === 'VERY_INTENSE') {
    return 'PREMIUM';
  }

  // Older adults benefit from premium
  if (age && age > 60) {
    return 'PREMIUM';
  }

  // Most people do well with GOOD
  return 'GOOD';
}

