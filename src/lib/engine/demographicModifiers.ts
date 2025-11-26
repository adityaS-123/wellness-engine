import { DemographicData, DosageModifier } from './types';

/**
 * Calculate demographic-based modifiers for supplemental dosing
 */
export function calculateDemographicModifiers(
  demographics: DemographicData
): DosageModifier {
  // Age multiplier
  const ageMultiplier = getAgeMultiplier(demographics.age);

  // Gender multiplier
  const genderMultiplier = getGenderMultiplier(
    demographics.gender,
    demographics.menopauseStatus,
    demographics.menstruationStatus
  );

  // Weight multiplier (based on BMI)
  const bmi = calculateBMI(demographics.weight, demographics.height);
  const weightMultiplier = getWeightMultiplier(bmi);

  // Training load multiplier
  const trainingLoadMultiplier =
    getTrainingLoadMultiplier(demographics.trainingFrequency);

  // Default modifiers for other factors
  const symptomMultiplier = 1.0; // Set later in symptom handler
  const goalMultiplier = 1.0; // Set later in goal handler
  const budgetMultiplier = 1.0; // Set later in budget handler

  return {
    ageMultiplier,
    genderMultiplier,
    weightMultiplier,
    trainingLoadMultiplier,
    symptomMultiplier,
    goalMultiplier,
    budgetMultiplier,
  };
}

/**
 * Age-based dosage modifier
 */
function getAgeMultiplier(age: number): number {
  if (age < 18) return 0.7; // Pediatric reduction
  if (age < 30) return 0.9; // Young adult
  if (age < 50) return 1.0; // Adult baseline
  if (age < 65) return 1.1; // Mature adult, increased needs
  return 1.2; // Senior, significant increase in most nutrients
}

/**
 * Gender and reproductive status modifier
 */
function getGenderMultiplier(
  gender: string,
  menopauseStatus?: string,
  menstruationStatus?: string
): number {
  if (gender === 'FEMALE') {
    // Pre-menopausal women with regular cycles
    if (
      menopauseStatus === 'PREMENOPAUSAL' &&
      menstruationStatus === 'REGULAR'
    ) {
      return 1.1; // Higher mineral needs (especially iron)
    }
    // Postmenopausal women
    if (menopauseStatus === 'POSTMENOPAUSAL') {
      return 0.95; // Slightly lower iron needs
    }
    return 1.0;
  }

  if (gender === 'MALE') {
    return 1.0; // Baseline
  }

  return 1.0; // Other
}

/**
 * BMI-based weight modifier
 */
function getWeightMultiplier(bmi: number): number {
  if (bmi < 18.5) return 0.95; // Underweight
  if (bmi < 25) return 1.0; // Normal weight
  if (bmi < 30) return 1.05; // Overweight
  if (bmi < 35) return 1.1; // Class 1 obesity
  return 1.15; // Class 2+ obesity
}

/**
 * Calculate BMI
 */
export function calculateBMI(weight: number, height: number): number {
  return weight / ((height / 100) ** 2);
}

/**
 * Training frequency modifier
 */
function getTrainingLoadMultiplier(trainingFrequency?: string): number {
  switch (trainingFrequency) {
    case 'NONE':
      return 0.9;
    case 'LIGHT': // 1-2x per week
      return 1.0;
    case 'MODERATE': // 3-4x per week
      return 1.15;
    case 'INTENSE': // 5-6x per week
      return 1.3;
    case 'VERY_INTENSE': // Daily or twice daily
      return 1.5;
    default:
      return 1.0;
  }
}

/**
 * Get iron dose modifier for females based on reproductive status
 */
export function getIronDoseModifier(
  gender: string,
  menopauseStatus?: string,
  menstruationStatus?: string
): number {
  // Men generally don't need iron supplementation
  if (gender === 'MALE') {
    return 0.1; // Only if proven deficiency
  }

  if (gender === 'FEMALE') {
    // Premenopausal with regular cycles need more
    if (
      menopauseStatus === 'PREMENOPAUSAL' &&
      menstruationStatus === 'REGULAR'
    ) {
      return 1.5;
    }
    // Postmenopausal need less
    if (menopauseStatus === 'POSTMENOPAUSAL') {
      return 0.5;
    }
    // Perimenopausal transitional
    if (menopauseStatus === 'PERIMENOPAUSAL') {
      return 1.2;
    }
  }

  return 1.0;
}

/**
 * Get Vitamin D dose modifier based on BMI and age
 */
export function getVitaminDDoseModifier(
  bmi: number,
  age: number
): number {
  let modifier = getAgeMultiplier(age); // Start with age
  modifier *= getWeightMultiplier(bmi); // Factor in BMI
  return Math.min(modifier, 1.3); // Cap at 1.3x
}

/**
 * Get zinc dose modifier based on diet
 */
export function getZincDoseModifier(
  dietPreference?: string,
  trainingFrequency?: string
): number {
  let modifier = 1.0;

  // Low bioavailability for plant-based diets
  if (dietPreference === 'VEGAN' || dietPreference === 'VEGETARIAN') {
    modifier *= 1.3; // Need higher doses
  }

  // Athletes need more
  if (trainingFrequency === 'INTENSE' || trainingFrequency === 'VERY_INTENSE') {
    modifier *= 1.2;
  }

  return modifier;
}

/**
 * Get creatine dose modifier - primarily for men >40 or athletes
 */
export function getCreatineDoseModifier(
  gender: string,
  age: number,
  trainingFrequency?: string
): number {
  let modifier = 0.5; // Default low for non-targets

  if (gender === 'MALE' && age > 40) {
    modifier = 1.3; // Significant boost for older men
  }

  if (trainingFrequency === 'INTENSE' || trainingFrequency === 'VERY_INTENSE') {
    modifier = Math.max(modifier, 1.5); // Max priority for athletes
  }

  return modifier;
}

/**
 * Get protein boost based on training
 */
export function getProteinBoostMultiplier(trainingFrequency?: string): number {
  switch (trainingFrequency) {
    case 'INTENSE':
      return 1.3;
    case 'VERY_INTENSE':
      return 1.5;
    default:
      return 1.0;
  }
}

/**
 * Determine if iron supplementation is recommended
 */
export function shouldSupplementIron(
  gender: string,
  menopauseStatus?: string,
  menstruationStatus?: string
): boolean {
  if (gender === 'MALE') return false; // Men don't need iron typically
  if (menopauseStatus === 'POSTMENOPAUSAL') return false; // Post-menopausal women don't need iron
  if (menopauseStatus === 'PREMENOPAUSAL' && menstruationStatus === 'REGULAR')
    return true;
  if (menopauseStatus === 'PERIMENOPAUSAL') return true;
  return false;
}
