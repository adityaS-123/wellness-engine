/**
 * Core type definitions for the wellness engine
 */

export interface DemographicData {
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  weight: number; // kg
  height: number; // cm
  menstruationStatus?: 'REGULAR' | 'IRREGULAR' | 'NONE';
  menopauseStatus?: 'PREMENOPAUSAL' | 'PERIMENOPAUSAL' | 'POSTMENOPAUSAL';
  pregnancyIntention?: 'YES' | 'NO' | 'UNSURE';
  isPregnant?: boolean;
  dietPreference?: 'OMNIVORE' | 'VEGETARIAN' | 'VEGAN' | 'PESCATARIAN';
  alcoholUse?: 'NONE' | 'OCCASIONAL' | 'MODERATE' | 'HEAVY';
  trainingFrequency?: 'NONE' | 'LIGHT' | 'MODERATE' | 'INTENSE' | 'VERY_INTENSE';
}

export interface ClinicalFlags {
  currentMedications: string[];
  medicalConditions: string[];
  labAbnormalities?: string[];
  symptomClusters?: string[];
}

export interface GenerationInput {
  demographics: DemographicData;
  goal: string;
  clinicalFlags?: ClinicalFlags;
  budgetTier: 'ESSENTIAL' | 'GOOD' | 'PREMIUM';
  symptomsRating?: number; // 0-10
  customNotes?: string;
}

export interface SupplementStack {
  supplementId: string;
  supplementName: string;
  dose: number;
  unit: string;
  timing: string;
  doseType: 'MINIMAL' | 'OPTIMAL' | 'MAXIMUM';
  reasoning: string;
  warnings?: string[];
}

export interface PrescriptionOutput {
  summary: {
    goal: string;
    priority: string[];
    pathwayFocus: string[];
    generatedAt: string;
  };
  morningStack: SupplementStack[];
  afternoonStack?: SupplementStack[];
  eveningStack: SupplementStack[];
  weeklyCyclicals?: Array<{
    supplementName: string;
    daysOn: number;
    daysOff: number;
    reasoning: string;
  }>;
  lifestyle: {
    sleep: string[];
    diet: string[];
    training: string[];
    stressReduction: string[];
  };
  redFlags: Array<{
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    message: string;
  }>;
  shoppingList: Array<{
    supplementName: string;
    quantity: number;
    unit: string;
    estimatedCost: number;
  }>;
  warnings: string[];
  pdfHtml?: string;
}

export interface DosageModifier {
  ageMultiplier: number;
  genderMultiplier: number;
  weightMultiplier: number;
  trainingLoadMultiplier: number;
  symptomMultiplier: number;
  goalMultiplier: number;
  budgetMultiplier: number;
}

export interface SafetyIssue {
  type: 'HARD_BLOCK' | 'SOFT_WARN' | 'ADJUST_DOSE';
  supplementName: string;
  reason: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
}

export interface PriorityScore {
  supplementId: string;
  supplementName: string;
  score: number;
  rationale: string;
}
