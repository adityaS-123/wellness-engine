import { DemographicData, PriorityScore } from './types';

export interface SupplementScoringInput {
  id: string;
  name: string;
  useCasePriority: number;
  evidenceLevel: string;
  category: string;
  genderModifiers: Record<string, number>;
  ageModifiers: Record<string, number>;
}

export interface ScoringWeights {
  goalAlignment: number; // 0-1
  demographic: number; // 0-1
  evidence: number; // 0-1
  priority: number; // 0-1
  training: number; // 0-1
  age: number; // 0-1
}

/**
 * Default scoring weights for deterministic personalization
 * These weights determine how much each factor influences the final score
 * 
 * 🔧 AI ENGINEER TODO: CUSTOMIZE WEIGHTS HERE
 * Adjust these percentages to change how supplements are prioritized:
 * 
 * Example: For athletes, increase 'training' weight:
 *   goalAlignment: 0.25,
 *   training: 0.35,        // ← Now most important
 *   demographic: 0.2,
 *   evidence: 0.15,
 *   priority: 0.05,
 *   age: 0.0,
 * 
 * Example: For seniors (age >70), increase 'age' weight:
 *   age: 0.25,              // ← Now very important
 *   demographic: 0.3,
 *   goalAlignment: 0.25,
 *   evidence: 0.15,
 *   training: 0.05,
 *   priority: 0.0,
 * 
 * TOTAL MUST EQUAL 1.0
 */
export const DEFAULT_WEIGHTS: ScoringWeights = {
  goalAlignment: 0.3, // Goal match is most important
  demographic: 0.25, // Demographics are very relevant
  evidence: 0.2, // Evidence level matters
  priority: 0.1, // Base priority is less important
  training: 0.1, // Training match
  age: 0.05, // Age considerations
};

/**
 * Main priority scoring function
 * Completely deterministic - no AI/ML
 * Returns normalized score 0-100
 */
export function scoreSupplement(
  supplement: SupplementScoringInput,
  demographics: DemographicData,
  goal: string,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): PriorityScore {
  let totalScore = 0;

  // 1. Goal alignment score (0-1)
  const goalScore = calculateGoalAlignment(supplement, goal);
  totalScore += goalScore * weights.goalAlignment;

  // 2. Demographic fit score (0-1)
  const demographicScore = calculateDemographicFit(
    supplement,
    demographics
  );
  totalScore += demographicScore * weights.demographic;

  // 3. Evidence level score (0-1)
  const evidenceScore = calculateEvidenceScore(supplement.evidenceLevel);
  totalScore += evidenceScore * weights.evidence;

  // 4. Base priority score (0-1, normalized from 1-100)
  const priorityScore = supplement.useCasePriority / 100;
  totalScore += priorityScore * weights.priority;

  // 5. Training frequency match (0-1)
  const trainingScore = calculateTrainingAlignment(
    supplement,
    demographics.trainingFrequency
  );
  totalScore += trainingScore * weights.training;

  // 6. Age appropriateness (0-1)
  const ageScore = calculateAgeAppropiateness(
    supplement,
    demographics.age
  );
  totalScore += ageScore * weights.age;

  // Normalize to 0-100
  const normalizedScore = totalScore * 100;

  return {
    supplementId: supplement.id,
    supplementName: supplement.name,
    score: Math.round(normalizedScore),
    rationale: buildScoringRationale(
      supplement,
      demographics,
      goal,
      {
        goalScore,
        demographicScore,
        evidenceScore,
        priorityScore,
        trainingScore,
        ageScore,
      }
    ),
  };
}

/**
 * Calculate goal alignment (0-1 scale)
 */
function calculateGoalAlignment(
  supplement: SupplementScoringInput,
  goal: string
): number {
  const goalAlignments: Record<string, Record<string, number>> = {
    ENERGY_RECOVERY: {
      'Creatine Monohydrate': 1.0,
      'Magnesium Glycinate': 0.9,
      'Omega-3 Fish Oil': 0.8,
      'B-Complex (High Potency)': 0.9,
      'CoQ10 (Ubiquinol)': 0.85,
      'Vitamin D3': 0.7,
      'Iron (Ferrous Bisglycinate)': 0.85,
    },
    STRESS_SLEEP: {
      'Ashwagandha (Withanolides 5%)': 1.0,
      'Magnesium Glycinate': 0.95,
      'L-Theanine': 0.9,
      'Rhodiola Rosea (3% Rosavins)': 0.7,
      'B-Complex (High Potency)': 0.6,
    },
    LONGEVITY: {
      'Resveratrol': 1.0,
      'CoQ10 (Ubiquinol)': 0.95,
      'Turmeric (95% Curcuminoids)': 0.9,
      'Omega-3 Fish Oil': 0.9,
      'Vitamin D3': 0.85,
      'Probiotics (Multi-strain)': 0.75,
      'Berberine': 0.8,
    },
    ATHLETIC_PERFORMANCE: {
      'Creatine Monohydrate': 1.0,
      'Zinc Picolinate': 0.85,
      'Omega-3 Fish Oil': 0.8,
      'Magnesium Glycinate': 0.85,
      'B-Complex (High Potency)': 0.8,
      'Iron (Ferrous Bisglycinate)': 0.75,
    },
    METABOLIC_HEALTH: {
      'Berberine': 1.0,
      'Turmeric (95% Curcuminoids)': 0.85,
      'Zinc Picolinate': 0.8,
      'Magnesium Glycinate': 0.75,
      'Probiotics (Multi-strain)': 0.8,
      'Vitamin D3': 0.7,
    },
    IMMUNE_SUPPORT: {
      'Vitamin D3': 1.0,
      'Zinc Picolinate': 0.95,
      'Probiotics (Multi-strain)': 0.9,
      'Turmeric (95% Curcuminoids)': 0.8,
      'B-Complex (High Potency)': 0.75,
    },
    BRAIN_HEALTH: {
      'Omega-3 Fish Oil': 1.0,
      'B-Complex (High Potency)': 0.9,
      'Magnesium Glycinate': 0.8,
      'Turmeric (95% Curcuminoids)': 0.85,
      'L-Theanine': 0.75,
      'CoQ10 (Ubiquinol)': 0.7,
    },
    JOINT_HEALTH: {
      'Turmeric (95% Curcuminoids)': 1.0,
      'Omega-3 Fish Oil': 0.9,
      'Magnesium Glycinate': 0.7,
      'Vitamin D3': 0.75,
      'Probiotics (Multi-strain)': 0.6,
    },
  };

  return goalAlignments[goal]?.[supplement.name] ?? 0.5; // 0.5 if no specific alignment
}

/**
 * Calculate demographic fit (0-1 scale)
 */
function calculateDemographicFit(
  supplement: SupplementScoringInput,
  demographics: DemographicData
): number {
  let score = 0.5; // Baseline

  // Check gender modifiers
  const genderKey = demographics.gender.toLowerCase();
  const genderMod = supplement.genderModifiers[genderKey];
  if (genderMod) {
    // Higher modifier = better fit
    score = genderMod > 1.0 ? Math.min(genderMod, 1.0) : genderMod;
  }

  // Check age modifiers
  let ageKey = '30-50'; // Default
  if (demographics.age < 30) ageKey = '18-30';
  else if (demographics.age >= 50) ageKey = '50+';

  const ageMod = supplement.ageModifiers[ageKey];
  if (ageMod) {
    // Blend gender and age modifiers
    score = (score + Math.min(ageMod, 1.0)) / 2;
  }

  return Math.min(score, 1.0);
}

/**
 * Calculate evidence score (0-1 scale)
 */
function calculateEvidenceScore(evidenceLevel: string): number {
  switch (evidenceLevel) {
    case 'STRONG':
      return 1.0;
    case 'MODERATE':
      return 0.75;
    case 'EMERGING':
      return 0.5;
    default:
      return 0.5;
  }
}

/**
 * Calculate training alignment (0-1 scale)
 */
function calculateTrainingAlignment(
  supplement: SupplementScoringInput,
  trainingFrequency?: string
): number {
  const trainingFocusedSupps = [
    'Creatine Monohydrate',
    'Zinc Picolinate',
    'Magnesium Glycinate',
  ];

  if (!trainingFrequency || trainingFrequency === 'NONE') {
    // Lower score for training-specific supplements if no training
    if (trainingFocusedSupps.includes(supplement.name)) {
      return 0.4;
    }
    return 0.7;
  }

  if (trainingFrequency === 'INTENSE' || trainingFrequency === 'VERY_INTENSE') {
    // High score for training-focused supplements in active athletes
    if (trainingFocusedSupps.includes(supplement.name)) {
      return 1.0;
    }
    return 0.8;
  }

  return 0.7; // Default moderate score
}

/**
 * Calculate age appropriateness (0-1 scale)
 */
function calculateAgeAppropiateness(
  supplement: SupplementScoringInput,
  age: number
): number {
  // Certain supplements are more appropriate for certain ages
  const ageSpecific: Record<string, (age: number) => number> = {
    'Creatine Monohydrate': (age) => (age > 40 ? 1.0 : 0.7),
    'CoQ10 (Ubiquinol)': (age) => (age > 50 ? 1.0 : 0.6),
    'Resveratrol': (age) => (age > 45 ? 1.0 : 0.5),
    'Vitamin D3': (age) => (age > 50 ? 1.0 : 0.8),
    'Rhodiola Rosea (3% Rosavins)': (age) =>
      age > 60 ? 0.7 : age > 40 ? 0.9 : 1.0, // Less beneficial in elderly
  };

  if (ageSpecific[supplement.name]) {
    return ageSpecific[supplement.name](age);
  }

  return 0.8; // Default good appropriateness
}

/**
 * Build human-readable rationale for score
 */
function buildScoringRationale(
  supplement: SupplementScoringInput,
  demographics: DemographicData,
  goal: string,
  componentScores: Record<string, number>
): string {
  const parts: string[] = [];

  if (componentScores.goalScore > 0.8) {
    parts.push(`Strong alignment with ${goal.replace(/_/g, ' ')} goal`);
  } else if (componentScores.goalScore > 0.5) {
    parts.push(`Moderate alignment with goal`);
  }

  if (componentScores.demographicScore > 0.8) {
    parts.push(`Excellent fit for ${demographics.gender.toLowerCase()}, age ${demographics.age}`);
  }

  if (componentScores.evidenceScore === 1.0) {
    parts.push('Strong clinical evidence');
  } else if (componentScores.evidenceScore < 0.6) {
    parts.push('Emerging evidence - monitor effectiveness');
  }

  if (componentScores.trainingScore > 0.8 && demographics.trainingFrequency) {
    parts.push(`Ideal for ${demographics.trainingFrequency.toLowerCase()} training`);
  }

  return parts.join('. ') || 'Reasonable fit based on profile.';
}

/**
 * Rank supplements by priority score
 */
export function rankSupplementsByScore(
  scores: PriorityScore[]
): PriorityScore[] {
  return [...scores].sort((a, b) => b.score - a.score);
}

/**
 * Select top supplements by score with budget constraints
 */
export function selectTopSupplements(
  scores: PriorityScore[],
  maxCount: number
): PriorityScore[] {
  return rankSupplementsByScore(scores).slice(0, maxCount);
}

/**
 * Get scoring breakdown for explanation
 */
export function explainScore(
  supplement: SupplementScoringInput,
  demographics: DemographicData,
  goal: string
): {
  goalScore: number;
  demographicScore: number;
  evidenceScore: number;
  priorityScore: number;
  trainingScore: number;
  ageScore: number;
  finalScore: number;
} {
  return {
    goalScore: Math.round(calculateGoalAlignment(supplement, goal) * 100),
    demographicScore: Math.round(calculateDemographicFit(supplement, demographics) * 100),
    evidenceScore: Math.round(calculateEvidenceScore(supplement.evidenceLevel) * 100),
    priorityScore: Math.round((supplement.useCasePriority / 100) * 100),
    trainingScore: Math.round(calculateTrainingAlignment(supplement, demographics.trainingFrequency) * 100),
    ageScore: Math.round(calculateAgeAppropiateness(supplement, demographics.age) * 100),
    finalScore: 0, // Calculated by scoreSupplement
  };
}
