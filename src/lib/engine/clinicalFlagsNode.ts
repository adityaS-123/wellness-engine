import { ClinicalFlags } from './types';

/**
 * Process clinical flags and return triggered supplemental recommendations
 */
export function processClinicalFlags(clinicalFlags: ClinicalFlags | undefined): {
  autoAddSupplements: string[];
  blockedSupplements: string[];
  doseAdjustments: Record<string, number>;
  warnings: string[];
} {
  if (!clinicalFlags) {
    return {
      autoAddSupplements: [],
      blockedSupplements: [],
      doseAdjustments: {},
      warnings: [],
    };
  }

  const autoAddSupplements: string[] = [];
  const blockedSupplements: string[] = [];
  const doseAdjustments: Record<string, number> = {};
  const warnings: string[] = [];

  // Process medications
  const medications = (clinicalFlags.currentMedications || []).map((m) =>
    m.toLowerCase()
  );

  for (const medication of medications) {
    // Statin → auto-add CoQ10
    if (medication.includes('statin')) {
      autoAddSupplements.push('sup_007'); // CoQ10
      warnings.push(
        'CoQ10 is depleted by statins. Added to support muscle health and prevent statin-induced myopathy.'
      );
    }

    // SSRI → block Rhodiola
    if (medication.includes('ssri') || medication.includes('sertraline')) {
      blockedSupplements.push('sup_009'); // Rhodiola
      warnings.push(
        'Rhodiola is blocked due to serotonin interaction risk with SSRIs.'
      );
    }
  }

  // Process medical conditions
  const conditions = (clinicalFlags.medicalConditions || []).map((c) =>
    c.toLowerCase()
  );

  for (const condition of conditions) {
    // GERD → turmeric low-dose only
    if (condition.includes('gerd') || condition.includes('reflux')) {
      doseAdjustments['sup_010'] = 0.5; // Reduce turmeric
      warnings.push(
        'Turmeric dose reduced to 50% due to GERD. May cause irritation at higher doses.'
      );
    }

    // Kidney disease → avoid high-dose magnesium and creatine
    if (condition.includes('kidney')) {
      blockedSupplements.push('sup_002', 'sup_005'); // Magnesium, Creatine
      warnings.push(
        'Magnesium and creatine are contraindicated in kidney disease.'
      );
    }

    // Liver disease → block berberine, resveratrol
    if (condition.includes('liver')) {
      blockedSupplements.push('sup_011', 'sup_012'); // Berberine, Resveratrol
      warnings.push(
        'Berberine and resveratrol are metabolized by the liver and contraindicated in liver disease.'
      );
    }

    // Autoimmune → caution ashwagandha
    if (condition.includes('autoimmune')) {
      doseAdjustments['sup_006'] = 0.7; // Reduce ashwagandha
      warnings.push(
        'Ashwagandha dose reduced and should be monitored in autoimmune conditions.'
      );
    }

    // High blood pressure / Low BP → caution adaptogens
    if (condition.includes('hypotension') || condition.includes('low blood')) {
      doseAdjustments['sup_006'] = 0.5; // Reduce ashwagandha
      doseAdjustments['sup_009'] = 0.5; // Reduce Rhodiola
      warnings.push(
        'Adaptogen doses reduced due to low blood pressure. Monitor symptoms.'
      );
    }
  }

  // Process symptom clusters
  const symptoms = (clinicalFlags.symptomClusters || []).map((s) =>
    s.toLowerCase()
  );

  for (const symptom of symptoms) {
    // Insomnia → caution late-day stimulants
    if (symptom.includes('insomnia') || symptom.includes('sleep')) {
      warnings.push('Move stimulating supplements to morning time only.');
    }

    // Anxiety → reduce high-dose B12
    if (symptom.includes('anxiety')) {
      doseAdjustments['sup_013'] = 0.5; // Reduce B-Complex
      warnings.push('B-vitamin dose reduced due to anxiety symptoms.');
    }

    // High cortisol → ashwagandha allowed unless autoimmune
    if (symptom.includes('cortisol') || symptom.includes('stress')) {
      if (!conditions.some((c) => c.includes('autoimmune'))) {
        autoAddSupplements.push('sup_006'); // Ashwagandha
      }
    }
  }

  return {
    autoAddSupplements: [...new Set(autoAddSupplements)],
    blockedSupplements: [...new Set(blockedSupplements)],
    doseAdjustments,
    warnings,
  };
}

/**
 * Check for hard-stop clinical red flags
 */
export function checkHardStopFlags(
  clinicalFlags: ClinicalFlags | undefined
): { isHardStop: boolean; reason: string } {
  if (!clinicalFlags) {
    return { isHardStop: false, reason: '' };
  }

  const medications = (clinicalFlags.currentMedications || []).map((m) =>
    m.toLowerCase()
  );
  const conditions = (clinicalFlags.medicalConditions || []).map((c) =>
    c.toLowerCase()
  );

  // Pregnancy → block most herbs
  if (clinicalFlags.medicalConditions?.some((c) =>
    c.toLowerCase().includes('pregnant')
  )) {
    return {
      isHardStop: true,
      reason: 'Pregnancy requires specialized protocol. Consult OB/GYN.',
    };
  }

  // Anticoagulants → block resveratrol, high-dose turmeric
  if (
    medications.some(
      (m) =>
        m.includes('warfarin') ||
        m.includes('coumadin') ||
        m.includes('anticoagulant')
    )
  ) {
    return {
      isHardStop: true,
      reason: 'Anticoagulant use requires medical supervision for supplementation.',
    };
  }

  // Antiepileptics → block ashwagandha
  if (medications.some((m) => m.includes('epileptic') || m.includes('seizure'))) {
    return {
      isHardStop: true,
      reason: 'Antiepileptic medication requires medical supervision.',
    };
  }

  // Active liver disease → block berberine, resveratrol
  if (conditions.some((c) => c.includes('cirrhosis') || c.includes('hepatitis'))) {
    return {
      isHardStop: true,
      reason: 'Active liver disease requires specialized protocol.',
    };
  }

  // Severe kidney issues → restrict creatine, magnesium
  if (conditions.some((c) => c.includes('kidney failure'))) {
    return {
      isHardStop: true,
      reason: 'Severe kidney disease requires nephrologist consultation.',
    };
  }

  return { isHardStop: false, reason: '' };
}
