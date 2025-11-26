import { DemographicData, DosageModifier, SupplementStack } from './types';
import { calculateDemographicModifiers } from './demographicModifiers';
import { getBudgetDoseModifier, BudgetTier } from './budgetLogic';

export interface SupplementDosageData {
  id: string;
  name: string;
  doseRangeMin: number;
  doseRangeMax: number;
  doseRangeTypical: number;
  doseUnit: string;
  genderModifiers: Record<string, number>;
  ageModifiers: Record<string, number>;
  useCasePriority: number;
}

/**
 * Calculate personalized supplement dosage
 */
export function calculatePersonalizedDose(
  supplement: SupplementDosageData,
  demographics: DemographicData,
  symptomsRating: number = 5, // 0-10 scale
  budgetTier: BudgetTier = 'GOOD'
): {
  optimalDose: number;
  minimumEffectiveDose: number;
  safeUpperLimit: number;
  timing: string;
  cycling?: string;
  reasoning: string;
} {
  // Get demographic modifiers
  const modifiers = calculateDemographicModifiers(demographics);

  // Get supplement-specific modifiers
  const genderMod = getGenderModifier(supplement.genderModifiers, demographics);
  const ageMod = getAgeModifier(supplement.ageModifiers, demographics.age);

  // Build composite modifier
  let compositeModifier =
    genderMod *
    ageMod *
    modifiers.weightMultiplier *
    modifiers.trainingLoadMultiplier;

  // Symptom-based adjustment (higher symptoms = higher dose)
  const symptomModifier = 0.9 + (symptomsRating / 10) * 0.3; // Range: 0.9 - 1.2
  compositeModifier *= symptomModifier;

  // Budget tier adjustment
  const budgetMod = getBudgetDoseModifier(budgetTier);
  compositeModifier *= budgetMod;

  // Cap the modifier to prevent extreme values
  compositeModifier = Math.min(Math.max(compositeModifier, 0.7), 1.5);

  // Calculate doses
  const optimalDose = supplement.doseRangeTypical * compositeModifier;
  const minimumEffectiveDose = supplement.doseRangeMin * compositeModifier;
  const safeUpperLimit = supplement.doseRangeMax * compositeModifier;

  // Validate bounds
  const finalOptimal = Math.max(
    minimumEffectiveDose,
    Math.min(optimalDose, safeUpperLimit)
  );

  return {
    optimalDose: Math.round(finalOptimal * 10) / 10,
    minimumEffectiveDose: Math.round(minimumEffectiveDose * 10) / 10,
    safeUpperLimit: Math.round(safeUpperLimit * 10) / 10,
    timing: getSupplementTiming(supplement.name),
    cycling: getSupplementCyclingRecommendation(supplement.name),
    reasoning: buildDoseReasoning(
      supplement.name,
      demographics,
      symptomsRating,
      compositeModifier
    ),
  };
}

/**
 * Get gender-specific modifier from supplement metadata
 */
function getGenderModifier(
  genderModifiers: Record<string, number>,
  demographics: DemographicData
): number {
  // Check for specific reproductive status modifiers
  if (demographics.gender === 'FEMALE') {
    const status = demographics.menopauseStatus;
    if (status === 'POSTMENOPAUSAL' && genderModifiers['female_postmenopausal']) {
      return genderModifiers['female_postmenopausal'];
    }
    if (
      status === 'PREMENOPAUSAL' &&
      genderModifiers['female_premenopausal']
    ) {
      return genderModifiers['female_premenopausal'];
    }
  }

  // Fall back to general gender modifier
  const key = demographics.gender.toLowerCase();
  return genderModifiers[key] || 1.0;
}

/**
 * Get age-specific modifier from supplement metadata
 */
function getAgeModifier(
  ageModifiers: Record<string, number>,
  age: number
): number {
  if (age < 30 && ageModifiers['18-30']) return ageModifiers['18-30'];
  if (age < 50 && ageModifiers['30-50']) return ageModifiers['30-50'];
  if (ageModifiers['50+']) return ageModifiers['50+'];
  return 1.0;
}

/**
 * Get optimal timing for supplement administration
 */
function getSupplementTiming(supplementName: string): string {
  const timingRules: Record<string, string> = {
    'Vitamin D3': 'Morning with breakfast',
    'Magnesium Glycinate': 'Evening 30-60 min before bed',
    'Omega-3 Fish Oil': 'With largest meal',
    'Iron (Ferrous Bisglycinate)':
      'Morning on empty stomach or with orange juice',
    'Creatine Monohydrate': 'Anytime with meals',
    'Ashwagandha (Withanolides 5%)': 'Twice daily with meals',
    'CoQ10 (Ubiquinol)': 'With a fat-containing meal',
    'Zinc Picolinate': 'Morning on empty stomach',
    'Rhodiola Rosea (3% Rosavins)': 'Morning with breakfast',
    'Turmeric (95% Curcuminoids)': 'With black pepper and fat',
    'Berberine': 'With meals (2-3x daily)',
    'Resveratrol': 'With a meal containing fat',
    'B-Complex (High Potency)': 'Morning with breakfast',
    'Probiotics (Multi-strain)': 'Morning on empty stomach or with meal',
    'L-Theanine': 'Morning or with afternoon coffee',
  };

  return timingRules[supplementName] || 'With meals';
}

/**
 * Get cycling recommendations for specific supplements
 */
function getSupplementCyclingRecommendation(supplementName: string): string {
  const cyclingRules: Record<string, string> = {
    'Rhodiola Rosea (3% Rosavins)':
      '5 days on, 2 days off to maintain sensitivity',
    'Creatine Monohydrate': 'Continuous - no cycling needed',
    'Berberine': '10 weeks on, 2 weeks off',
    'Ashwagandha (Withanolides 5%)':
      '8 weeks on, 1 week off to prevent tolerance',
  };

  return cyclingRules[supplementName] || 'No cycling recommended';
}

/**
 * Build human-readable dose reasoning
 */
function buildDoseReasoning(
  supplementName: string,
  demographics: DemographicData,
  symptomsRating: number,
  compositeModifier: number
): string {
  const parts: string[] = [];

  parts.push(`Based on age (${demographics.age})`);

  if (demographics.trainingFrequency && demographics.trainingFrequency !== 'NONE') {
    parts.push(`training frequency (${demographics.trainingFrequency})`);
  }

  if (demographics.gender === 'FEMALE' && demographics.menopauseStatus) {
    parts.push(`reproductive status (${demographics.menopauseStatus})`);
  }

  if (symptomsRating > 7) {
    parts.push('elevated symptom rating');
  }

  return `Dose calculated ${parts.join(', ')}. Multiplier: ${(compositeModifier * 100).toFixed(0)}% of baseline.`;
}

/**
 * Create supplement stack for time of day
 */
export function createSupplementStack(
  supplements: SupplementDosageData[],
  demographics: DemographicData,
  timeOfDay: 'MORNING' | 'AFTERNOON' | 'EVENING',
  budgetTier: BudgetTier = 'GOOD'
): SupplementStack[] {
  const stack: SupplementStack[] = [];

  for (const supplement of supplements) {
    const dosage = calculatePersonalizedDose(
      supplement,
      demographics,
      5,
      budgetTier
    );

    // Filter by time of day suitability
    if (isAppropriateTimeOfDay(supplement.name, timeOfDay)) {
      stack.push({
        supplementId: supplement.id,
        supplementName: supplement.name,
        dose: dosage.optimalDose,
        unit: supplement.doseUnit,
        timing: dosage.timing,
        doseType: 'OPTIMAL',
        reasoning: dosage.reasoning,
      });
    }
  }

  return stack;
}

/**
 * Check if supplement is appropriate for time of day
 */
function isAppropriateTimeOfDay(
  supplementName: string,
  timeOfDay: 'MORNING' | 'AFTERNOON' | 'EVENING'
): boolean {
  const eveningOnly = [
    'Magnesium Glycinate',
    'L-Theanine', // Optional evening dose
  ];

  const morningPreferred = [
    'Vitamin D3',
    'Iron (Ferrous Bisglycinate)',
    'B-Complex (High Potency)',
    'Rhodiola Rosea (3% Rosavins)',
    'Zinc Picolinate',
  ];

  const anytime = [
    'Omega-3 Fish Oil',
    'Creatine Monohydrate',
    'CoQ10 (Ubiquinol)',
    'Turmeric (95% Curcuminoids)',
    'Probiotics (Multi-strain)',
  ];

  if (timeOfDay === 'EVENING' && eveningOnly.includes(supplementName)) {
    return true;
  }

  if (timeOfDay === 'MORNING' && morningPreferred.includes(supplementName)) {
    return true;
  }

  if (anytime.includes(supplementName)) {
    return timeOfDay === 'MORNING' || timeOfDay === 'AFTERNOON'; // Distribute anytime supplements
  }

  return false;
}

/**
 * Validate dose against safety limits
 */
export function validateDoseRange(
  dose: number,
  minSafe: number,
  maxSafe: number
): { isValid: boolean; message: string } {
  if (dose < minSafe) {
    return {
      isValid: false,
      message: `Dose ${dose} is below minimum effective dose of ${minSafe}`,
    };
  }

  if (dose > maxSafe) {
    return {
      isValid: false,
      message: `Dose ${dose} exceeds safe upper limit of ${maxSafe}`,
    };
  }

  return { isValid: true, message: 'Dose within safe range' };
}
