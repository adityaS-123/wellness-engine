import { GenerationInput, PrescriptionOutput, SupplementStack } from './types';
import { selectGoal } from './goalNode';
import { processClinicalFlags, checkHardStopFlags } from './clinicalFlagsNode';
import { adjustProtocolByBudget, BudgetTier } from './budgetLogic';
import {
  calculatePersonalizedDose,
  createSupplementStack,
  SupplementDosageData,
} from './dosingEngine';
import {
  performSafetyCheck,
  getSafetyAssessmentSummary,
} from './safetyEngine';
import { scoreSupplement, rankSupplementsByScore } from './priorityScoring';

export interface PrescriptionGenerationRequest {
  input: GenerationInput;
  protocolData: {
    id: string;
    name: string;
    goal: string;
    coreSupplementIds: string[];
    optionalSupplementIds: string[];
  };
  supplementData: SupplementDosageData[];
}

/**
 * Main prescription generation orchestrator
 * Coordinates all decision engines deterministically
 */
export async function generatePrescription(
  request: PrescriptionGenerationRequest
): Promise<{
  prescription: PrescriptionOutput | null;
  errors: string[];
  warnings: string[];
  safety: { isSafe: boolean; issues: string[] };
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ============================================
  // PHASE 1: GOAL SELECTION
  // ============================================
  let selectedGoal;
  try {
    selectedGoal = selectGoal(request.input.goal as any);
  } catch (e) {
    errors.push(`Goal selection failed: ${e}`);
    return { prescription: null, errors, warnings, safety: { isSafe: false, issues: errors } };
  }

  // ============================================
  // PHASE 2: RED FLAG CHECK (Hard Stops)
  // ============================================
  const hardStopCheck = checkHardStopFlags(request.input.clinicalFlags);
  if (hardStopCheck.isHardStop) {
    errors.push(`HARD STOP: ${hardStopCheck.reason}`);
    return { prescription: null, errors, warnings, safety: { isSafe: false, issues: errors } };
  }

  // ============================================
  // PHASE 3: CLINICAL FLAGS PROCESSING
  // ============================================
  const clinicalProcessing = processClinicalFlags(
    request.input.clinicalFlags
  );
  warnings.push(...clinicalProcessing.warnings);

  // ============================================
  // PHASE 4: BUDGET TIER APPLICATION
  // ============================================
  const budgetAdjustment = adjustProtocolByBudget(
    request.protocolData.coreSupplementIds,
    request.protocolData.optionalSupplementIds,
    request.input.budgetTier as BudgetTier
  );

  if (budgetAdjustment.removedSupplements.length > 0) {
    warnings.push(
      `Budget tier ${request.input.budgetTier} limits stack to ${budgetAdjustment.coreSupplements.length + budgetAdjustment.selectedOptional.length} supplements.`
    );
  }

  // ============================================
  // PHASE 5: SUPPLEMENT SCORING & SELECTION
  // ============================================
  const selectedSupplementIds = [
    ...budgetAdjustment.coreSupplements,
    ...budgetAdjustment.selectedOptional,
  ];

  // Add auto-recommended from clinical flags
  const allSupplementIds = Array.from(
    new Set([...selectedSupplementIds, ...clinicalProcessing.autoAddSupplements])
  );

  // Remove blocked supplements
  const filteredSupplementIds = allSupplementIds.filter(
    (id) => !clinicalProcessing.blockedSupplements.includes(id)
  );

  // Score remaining supplements
  const supplementScores = filteredSupplementIds
    .map((supId) => {
      const supplement = request.supplementData.find((s) => s.id === supId);
      if (!supplement) return null;

      return scoreSupplement(
        {
          id: supplement.id,
          name: supplement.name,
          useCasePriority: supplement.useCasePriority,
          evidenceLevel: 'MODERATE', // Placeholder
          category: 'general',
          genderModifiers: supplement.genderModifiers as Record<string, number>,
          ageModifiers: supplement.ageModifiers as Record<string, number>,
        },
        request.input.demographics,
        request.input.goal
      );
    })
    .filter((score) => score !== null);

  const rankedSupplements = rankSupplementsByScore(
    supplementScores as any
  );

  // ============================================
  // PHASE 6: DOSING CALCULATION
  // ============================================
  const dosedSupplements: SupplementStack[] = [];

  for (const score of rankedSupplements) {
    const supplement = request.supplementData.find(
      (s) => s.name === score.supplementName
    );
    if (!supplement) continue;

    const dosage = calculatePersonalizedDose(
      supplement,
      request.input.demographics,
      request.input.symptomsRating || 5,
      request.input.budgetTier as BudgetTier
    );

    dosedSupplements.push({
      supplementId: supplement.id,
      supplementName: supplement.name,
      dose: dosage.optimalDose,
      unit: supplement.doseUnit,
      timing: dosage.timing,
      doseType: 'OPTIMAL',
      reasoning: dosage.reasoning,
    });
  }

  // ============================================
  // PHASE 7: TIME-OF-DAY STACKING
  // ============================================
  const morningSupps = dosedSupplements.filter((s) =>
    ['Morning', 'morning', 'AM'].some((t) => s.timing.includes(t))
  );

  const afternoonSupps = dosedSupplements.filter((s) =>
    ['Afternoon', 'afternoon', 'PM'].some((t) => s.timing.includes(t))
  );

  const eveningSupps = dosedSupplements.filter((s) =>
    ['Evening', 'evening', 'bed'].some((t) => s.timing.includes(t))
  );

  // Distribute remaining as needed
  const unscheduled = dosedSupplements.filter(
    (s) => !morningSupps.includes(s) && !afternoonSupps.includes(s) && !eveningSupps.includes(s)
  );

  // Add to morning if room
  while (unscheduled.length > 0 && morningSupps.length < 5) {
    const supp = unscheduled.shift();
    if (supp) morningSupps.push(supp);
  }

  while (unscheduled.length > 0) {
    const supp = unscheduled.shift();
    if (supp) afternoonSupps.push(supp);
  }

  // ============================================
  // PHASE 8: SAFETY CHECK
  // ============================================
  const safetyCheck = performSafetyCheck({
    supplements: dosedSupplements,
    demographics: {
      age: request.input.demographics.age,
      gender: request.input.demographics.gender,
      pregnancyIntention:
        request.input.demographics.pregnancyIntention,
    },
    clinicalFlags: request.input.clinicalFlags,
  });

  if (!safetyCheck.isSafeToGenerate) {
    const safetyErrors = safetyCheck.blockedSupplements.map(
      (b) => `${b.supplementName}: ${b.reason}`
    );
    errors.push(`Safety violations: ${safetyErrors.join('; ')}`);
    return { prescription: null, errors, warnings, safety: { isSafe: false, issues: safetyErrors } };
  }

  warnings.push(...safetyCheck.warnings.map((w) => `${w.supplementName}: ${w.reason}`));

  // ============================================
  // PHASE 9: OUTPUT CONSTRUCTION
  // ============================================
  const prescription: PrescriptionOutput = {
    summary: {
      goal: selectedGoal.label,
      priority: rankedSupplements.slice(0, 3).map((s) => s.supplementName),
      pathwayFocus: ['Metabolic optimization', 'Nutrient sufficiency', 'Safety first'],
      generatedAt: new Date().toISOString(),
    },
    morningStack: morningSupps,
    afternoonStack: afternoonSupps.length > 0 ? afternoonSupps : undefined,
    eveningStack: eveningSupps,
    lifestyle: {
      sleep: buildLifestyleRecommendations('sleep', request.input),
      diet: buildLifestyleRecommendations('diet', request.input),
      training: buildLifestyleRecommendations('training', request.input),
      stressReduction: buildLifestyleRecommendations('stress', request.input),
    },
    redFlags: clinicalProcessing.warnings.map((w) => ({
      severity: 'MEDIUM' as const,
      message: w,
    })),
    shoppingList: dosedSupplements.map((s) => ({
      supplementName: s.supplementName,
      quantity: Math.ceil((s.dose / 10) * 30), // Rough 30-day estimate
      unit: s.unit,
      estimatedCost: 25, // Placeholder
    })),
    warnings,
  };

  return {
    prescription,
    errors: [],
    warnings,
    safety: {
      isSafe: safetyCheck.isSafeToGenerate,
      issues: safetyCheck.blockedSupplements.map((b) => `${b.supplementName}: ${b.reason}`),
    },
  };
}

/**
 * Build lifestyle recommendations
 */
function buildLifestyleRecommendations(
  category: string,
  input: GenerationInput
): string[] {
  const recommendations: Record<string, string[]> = {
    sleep: [
      'Target 7-9 hours per night',
      'Maintain consistent sleep schedule',
      'Avoid screens 1 hour before bed',
      'Keep bedroom cool and dark',
      'Consider magnesium glycinate 1-2 hours before bed',
    ],
    diet: [
      'Prioritize whole, unprocessed foods',
      'Include protein at each meal',
      'Eat colorful vegetables daily',
      'Stay hydrated (8-10 cups water daily)',
      'Limit processed foods and added sugars',
    ],
    training: [
      'Engage in regular physical activity',
      'Mix cardio and resistance training',
      'Allow adequate recovery between sessions',
      'Progressive overload for strength gains',
      'Stretch and foam roll regularly',
    ],
    stress: [
      'Practice 10-15 minutes daily meditation',
      'Take regular breaks from screens',
      'Engage in activities you enjoy',
      'Maintain social connections',
      'Consider yoga or tai chi',
    ],
  };

  return recommendations[category] || [];
}

/**
 * Validate input before generation
 */
export function validateGenerationInput(input: GenerationInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input.demographics) {
    errors.push('Demographics required');
  }

  if (
    !input.demographics.age ||
    input.demographics.age < 13 ||
    input.demographics.age > 120
  ) {
    errors.push('Age must be between 13 and 120');
  }

  if (!input.goal) {
    errors.push('Goal required');
  }

  if (!['ESSENTIAL', 'COMPREHENSIVE', 'PREMIUM'].includes(input.budgetTier)) {
    errors.push('Invalid budget tier');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
