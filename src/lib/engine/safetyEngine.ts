import { ClinicalFlags, SafetyIssue, SupplementStack } from './types';

export interface SafetyCheckInput {
  supplements: SupplementStack[];
  demographics: {
    age: number;
    gender: string;
    pregnancyIntention?: string;
  };
  clinicalFlags?: ClinicalFlags;
}

export interface SafetyCheckOutput {
  safeSupplements: SupplementStack[];
  blockedSupplements: SafetyIssue[];
  adjustedSupplements: Array<SafetyIssue & { newDose: number }>;
  warnings: SafetyIssue[];
  isSafeToGenerate: boolean;
}

/**
 * Comprehensive safety validation engine
 */
export function performSafetyCheck(input: SafetyCheckInput): SafetyCheckOutput {
  const blocked: SafetyIssue[] = [];
  const adjusted: Array<SafetyIssue & { newDose: number }> = [];
  const warnings: SafetyIssue[] = [];
  const safe: SupplementStack[] = [];

  // Check each supplement
  for (const supplement of input.supplements) {
    // 1. Check contraindications
    const contradictionIssue = checkContraindications(
      supplement.supplementName,
      input.demographics,
      input.clinicalFlags
    );

    if (contradictionIssue) {
      if (contradictionIssue.type === 'HARD_BLOCK') {
        blocked.push(contradictionIssue);
        continue;
      } else if (contradictionIssue.type === 'SOFT_WARN') {
        warnings.push(contradictionIssue);
      } else if (contradictionIssue.type === 'ADJUST_DOSE') {
        const adjustedIssue: SafetyIssue & { newDose: number } = {
          ...contradictionIssue,
          newDose: supplement.dose * 0.5,
        };
        adjusted.push(adjustedIssue);
        continue;
      }
    }

    // 2. Check medication interactions
    const medInteraction = checkMedicationInteractions(
      supplement.supplementName,
      input.clinicalFlags?.currentMedications
    );

    if (medInteraction) {
      if (medInteraction.type === 'HARD_BLOCK') {
        blocked.push(medInteraction);
        continue;
      } else {
        warnings.push(medInteraction);
      }
    }

    // All checks passed
    safe.push(supplement);
  }

  // Check for herb-herb interactions
  const herbInteractions = checkHerbHerbInteractions(
    input.supplements.map((s) => s.supplementName)
  );
  warnings.push(...herbInteractions);

  // Check for stimulant stacking and other compound issues
  const compoundIssues = checkCompoundInteractions(
    input.supplements.map((s) => s.supplementName)
  );
  warnings.push(...compoundIssues);

  return {
    safeSupplements: safe,
    blockedSupplements: blocked,
    adjustedSupplements: adjusted,
    warnings,
    isSafeToGenerate: blocked.length === 0, // Abort if any hard blocks
  };
}

/**
 * Check contraindications based on demographics and conditions
 */
function checkContraindications(
  supplementName: string,
  demographics: { age: number; gender: string; pregnancyIntention?: string },
  clinicalFlags?: ClinicalFlags
): SafetyIssue | null {
  const conditions = (clinicalFlags?.medicalConditions || []).map((c) =>
    c.toLowerCase()
  );
  const medications = (clinicalFlags?.currentMedications || []).map((m) =>
    m.toLowerCase()
  );

  // Pregnancy checks
  if (
    demographics.pregnancyIntention === 'YES' ||
    demographics.pregnancyIntention === 'UNSURE'
  ) {
    const unsafeInPregnancy = [
      'Ashwagandha (Withanolides 5%)',
      'Turmeric (95% Curcuminoids)',
      'Berberine',
      'Resveratrol',
      'Rhodiola Rosea (3% Rosavins)',
    ];

    if (unsafeInPregnancy.includes(supplementName)) {
      return {
        type: 'HARD_BLOCK',
        supplementName,
        reason: 'Contraindicated in pregnancy or pregnancy planning',
        severity: 'CRITICAL',
        recommendation: 'Do not use during pregnancy. Consult OB/GYN.',
      };
    }
  }

  // Anticoagulant checks
  if (medications.some((m) => m.includes('warfarin') || m.includes('coumadin'))) {
    const anticoagulantInteracting = [
      'Omega-3 Fish Oil',
      'Turmeric (95% Curcuminoids)',
      'Resveratrol',
    ];

    if (anticoagulantInteracting.includes(supplementName)) {
      return {
        type: 'HARD_BLOCK',
        supplementName,
        reason: 'May increase bleeding risk with anticoagulants',
        severity: 'CRITICAL',
        recommendation: 'Avoid or require INR monitoring by physician',
      };
    }
  }

  // Kidney disease checks
  if (
    conditions.some((c) => c.includes('kidney') && c.includes('disease'))
  ) {
    const kidneyContraindicated = [
      'Magnesium Glycinate',
      'Creatine Monohydrate',
    ];

    if (kidneyContraindicated.includes(supplementName)) {
      return {
        type: 'HARD_BLOCK',
        supplementName,
        reason: 'Contraindicated in kidney disease',
        severity: 'CRITICAL',
        recommendation: 'Requires nephrologist consultation',
      };
    }
  }

  // Liver disease checks
  if (conditions.some((c) => c.includes('liver'))) {
    const liverContraindicated = ['Berberine', 'Resveratrol'];

    if (liverContraindicated.includes(supplementName)) {
      return {
        type: 'HARD_BLOCK',
        supplementName,
        reason: 'Hepatically metabolized - contraindicated in liver disease',
        severity: 'CRITICAL',
        recommendation: 'Avoid entirely',
      };
    }
  }

  // Autoimmune disease + Ashwagandha
  if (
    conditions.some((c) => c.includes('autoimmune')) &&
    supplementName === 'Ashwagandha (Withanolides 5%)'
  ) {
    return {
      type: 'SOFT_WARN',
      supplementName,
      reason: 'May stimulate immune system in autoimmune conditions',
      severity: 'HIGH',
      recommendation: 'Monitor carefully under medical supervision',
    };
  }

  // Low blood pressure + adaptogens
  if (
    conditions.some((c) =>
      c.includes('hypotension') || c.includes('low blood pressure')
    )
  ) {
    const adaptogenics = [
      'Ashwagandha (Withanolides 5%)',
      'Rhodiola Rosea (3% Rosavins)',
    ];

    if (adaptogenics.includes(supplementName)) {
      return {
        type: 'ADJUST_DOSE',
        supplementName,
        reason: 'May lower blood pressure further',
        severity: 'MEDIUM',
        recommendation: 'Reduce dose and monitor BP regularly',
      };
    }
  }

  // Insomnia + stimulants late in day
  if (
    clinicalFlags?.symptomClusters?.some((s) =>
      s.toLowerCase().includes('insomnia')
    )
  ) {
    const stimulants = ['Rhodiola Rosea (3% Rosavins)', 'B-Complex (High Potency)'];

    if (stimulants.includes(supplementName)) {
      return {
        type: 'SOFT_WARN',
        supplementName,
        reason: 'May exacerbate insomnia if taken late in day',
        severity: 'MEDIUM',
        recommendation: 'Take only in morning',
      };
    }
  }

  return null;
}

/**
 * Check supplement-medication interactions
 */
function checkMedicationInteractions(
  supplementName: string,
  medications: string[] = []
): SafetyIssue | null {
  if (medications.length === 0) return null;

  const medLower = medications.map((m) => m.toLowerCase());

  // SSRI interactions
  if (medLower.some((m) => m.includes('ssri') || m.includes('sertraline'))) {
    const serotonergic = [
      'Rhodiola Rosea (3% Rosavins)',
      'B-Complex (High Potency)', // High B6 can increase serotonin
    ];

    if (serotonergic.includes(supplementName)) {
      return {
        type: 'HARD_BLOCK',
        supplementName,
        reason: 'Serotonin syndrome risk with SSRIs',
        severity: 'CRITICAL',
        recommendation: 'Avoid combination',
      };
    }
  }

  // Statin interactions
  if (medLower.some((m) => m.includes('statin'))) {
    // Note: CoQ10 should actually be RECOMMENDED, not blocked
    // This is handled in the clinical flags processor instead
  }

  // Antibiotic interactions
  if (medLower.some((m) => m.includes('antibiotic'))) {
    const antibioticInteracting = ['Iron (Ferrous Bisglycinate)', 'Probiotics (Multi-strain)'];

    if (antibioticInteracting.includes(supplementName)) {
      return {
        type: 'SOFT_WARN',
        supplementName,
        reason: 'May reduce antibiotic absorption or effectiveness',
        severity: 'HIGH',
        recommendation: 'Separate administration by 2+ hours',
      };
    }
  }

  return null;
}

/**
 * Check for herb-herb interactions
 */
function checkHerbHerbInteractions(
  supplementNames: string[]
): SafetyIssue[] {
  const issues: SafetyIssue[] = [];
  const herbs = new Set(supplementNames);

  // Check known problematic combinations
  if (
    herbs.has('Ashwagandha (Withanolides 5%)') &&
    herbs.has('Rhodiola Rosea (3% Rosavins)')
  ) {
    issues.push({
      type: 'SOFT_WARN',
      supplementName: 'Ashwagandha + Rhodiola combination',
      reason: 'Combined adaptogenic effect may cause drowsiness + alertness conflict',
      severity: 'LOW',
      recommendation: 'Space doses - rhodiola AM, ashwagandha PM',
    });
  }

  if (
    herbs.has('Turmeric (95% Curcuminoids)') &&
    herbs.has('Omega-3 Fish Oil')
  ) {
    issues.push({
      type: 'SOFT_WARN',
      supplementName: 'Turmeric + Omega-3 combination',
      reason: 'Both have blood-thinning properties',
      severity: 'MEDIUM',
      recommendation: 'Monitor for easy bruising; may require dose reduction',
    });
  }

  return issues;
}

/**
 * Check for compound interactions (stimulant stacking, etc.)
 */
function checkCompoundInteractions(supplementNames: string[]): SafetyIssue[] {
  const issues: SafetyIssue[] = [];
  const supplements = new Set(supplementNames);

  // Excessive magnesium
  const magnesiumSupps = [
    'Magnesium Glycinate',
    // Others if added
  ];
  if (
    magnesiumSupps.filter((s) => supplements.has(s)).length > 1
  ) {
    issues.push({
      type: 'SOFT_WARN',
      supplementName: 'Excessive magnesium',
      reason: 'Multiple magnesium sources may cause diarrhea',
      severity: 'MEDIUM',
      recommendation: 'Use single magnesium source or reduce doses',
    });
  }

  // Multiple antioxidants - generally safe but excessive
  const antioxidants = [
    'Turmeric (95% Curcuminoids)',
    'Resveratrol',
    'CoQ10 (Ubiquinol)',
  ];
  if (
    antioxidants.filter((s) => supplements.has(s)).length >= 3
  ) {
    issues.push({
      type: 'SOFT_WARN',
      supplementName: 'Excessive antioxidants',
      reason: 'Very high antioxidant load may interfere with exercise adaptation',
      severity: 'LOW',
      recommendation: 'Consider cycling antioxidants',
    });
  }

  return issues;
}

/**
 * Get safety assessment summary
 */
export function getSafetyAssessmentSummary(output: SafetyCheckOutput): string {
  if (output.blockedSupplements.length > 0) {
    return `SAFETY HOLD: ${output.blockedSupplements.length} supplement(s) blocked due to safety concerns.`;
  }

  if (output.warnings.length > 0) {
    return `⚠️ CAUTION: ${output.warnings.length} warning(s) require attention. Review carefully.`;
  }

  return '✓ All safety checks passed. Safe to generate prescription.';
}
