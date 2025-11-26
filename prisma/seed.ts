import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Read clinical metadata
  const metadataPath = path.join(__dirname, 'clinical_metadata.json');
  const supplementsData = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

  // ============================================
  // SEED SUPPLEMENTS
  // ============================================
  console.log('Seeding supplements...');
  
  let supplementCount = 0;
  const createdSupplements: { [key: string]: string } = {}; // Map supplement name to ID
  
  for (const supplement of supplementsData) {
    // Map the supplement data to the schema
    const externalId = `sup_${String(supplementCount + 1).padStart(3, '0')}`;
    
    const created = await prisma.supplement.upsert({
      where: { externalId },
      update: {},
      create: {
        externalId,
        name: supplement.name,
        category: supplement.categories ? supplement.categories[0] : 'other',
        primaryMechanism: supplement.primary_mechanism || supplement.primaryMechanism || '',
        benefits: supplement.key_benefits ? [supplement.key_benefits] : [],
        doseRangeMin: 1,
        doseRangeMax: 2,
        doseRangeTypical: 1.5,
        doseUnit: 'serving',
        contraindications: supplement.contraindications ? [supplement.contraindications] : [],
        medicationInteractions: supplement.medication_interactions ? [supplement.medication_interactions] : [],
        genderModifiers: { MALE: 1.0, FEMALE: 1.0 },
        ageModifiers: { '18-30': 1.0, '30-50': 1.0, '50+': 1.0 },
        budgetTier: (supplement.budget_tier === 'premium' ? 'PREMIUM' : supplement.budget_tier === 'recommended' ? 'COMPREHENSIVE' : 'ESSENTIAL') as any,
        evidenceLevel: (supplement.evidence_level === 'strong' ? 'STRONG' : supplement.evidence_level === 'moderate' ? 'MODERATE' : 'EMERGING') as any,
        useCasePriority: supplement.priority_score ? supplement.priority_score * 10 : 50,
      },
    });
    
    createdSupplements[supplement.name] = created.id;
    supplementCount++;
  }
  
  console.log(`✓ Seeded ${supplementCount} supplements`);

  // ============================================
  // SEED PROTOCOLS
  // ============================================
  console.log('Seeding protocols...');
  
  // Create basic protocols from supplement categories
  // Define goal-specific supplement assignments
  const protocolSupplementMap: Record<string, { core: string[]; optional: string[] }> = {
    ENERGY_RECOVERY: {
      core: ['Creatine Monohydrate', 'Magnesium Glycinate', 'B-Complex (High Potency)'],
      optional: ['Omega-3 Fish Oil', 'CoQ10 (Ubiquinol)', 'Vitamin D3', 'Iron (Ferrous Bisglycinate)'],
    },
    STRESS_SLEEP: {
      core: ['Ashwagandha (Withanolides 5%)', 'Magnesium Glycinate', 'L-Theanine'],
      optional: ['Rhodiola Rosea (3% Rosavins)', 'B-Complex (High Potency)'],
    },
    LONGEVITY: {
      core: ['Resveratrol', 'CoQ10 (Ubiquinol)', 'Turmeric (95% Curcuminoids)'],
      optional: ['Omega-3 Fish Oil', 'Vitamin D3', 'Probiotics (Multi-strain)', 'Berberine'],
    },
    ATHLETIC_PERFORMANCE: {
      core: ['Creatine Monohydrate', 'Zinc Picolinate', 'Magnesium Glycinate'],
      optional: ['Omega-3 Fish Oil', 'B-Complex (High Potency)', 'Iron (Ferrous Bisglycinate)'],
    },
    METABOLIC_HEALTH: {
      core: ['Berberine', 'Turmeric (95% Curcuminoids)', 'Zinc Picolinate'],
      optional: ['Magnesium Glycinate', 'Probiotics (Multi-strain)', 'Vitamin D3'],
    },
    BRAIN_HEALTH: {
      core: ['Omega-3 Fish Oil', 'B-Complex (High Potency)', 'Turmeric (95% Curcuminoids)'],
      optional: ['Magnesium Glycinate', 'L-Theanine', 'CoQ10 (Ubiquinol)'],
    },
    IMMUNE_SUPPORT: {
      core: ['Vitamin D3', 'Zinc Picolinate', 'Probiotics (Multi-strain)'],
      optional: ['Turmeric (95% Curcuminoids)', 'B-Complex (High Potency)'],
    },
    JOINT_HEALTH: {
      core: ['Turmeric (95% Curcuminoids)', 'Omega-3 Fish Oil'],
      optional: ['Magnesium Glycinate', 'Vitamin D3', 'Probiotics (Multi-strain)'],
    },
  };

  const protocols = [
    {
      externalId: 'prot_001',
      name: 'Energy & Recovery',
      goal: 'ENERGY_RECOVERY',
      description: 'Optimize energy production and recovery',
    },
    {
      externalId: 'prot_002',
      name: 'Stress & Sleep',
      goal: 'STRESS_SLEEP',
      description: 'Support stress resilience and sleep quality',
    },
    {
      externalId: 'prot_003',
      name: 'Longevity & Prevention',
      goal: 'LONGEVITY',
      description: 'Comprehensive support for healthy aging',
    },
    {
      externalId: 'prot_004',
      name: 'Athletic Performance',
      goal: 'ATHLETIC_PERFORMANCE',
      description: 'Optimize strength, endurance, and recovery',
    },
    {
      externalId: 'prot_005',
      name: 'Metabolic Health',
      goal: 'METABOLIC_HEALTH',
      description: 'Support blood sugar balance and metabolism',
    },
    {
      externalId: 'prot_006',
      name: 'Brain Health',
      goal: 'BRAIN_HEALTH',
      description: 'Support cognitive function and neuroprotection',
    },
  ];

  for (const protocol of protocols) {
    // Get supplement IDs for this protocol
    const supplementMap = protocolSupplementMap[protocol.goal] || { core: [], optional: [] };
    
    const coreSupplementIds = supplementMap.core
      .map((name) => createdSupplements[name])
      .filter(Boolean);
    
    const optionalSupplementIds = supplementMap.optional
      .map((name) => createdSupplements[name])
      .filter(Boolean);

    const created = await prisma.protocol.upsert({
      where: { externalId: protocol.externalId },
      update: {
        coreSupplementsJson: coreSupplementIds,
        optionalSupplementsJson: optionalSupplementIds,
      },
      create: {
        externalId: protocol.externalId,
        name: protocol.name,
        goal: protocol.goal,
        description: protocol.description,
        coreSupplementsJson: coreSupplementIds,
        optionalSupplementsJson: optionalSupplementIds,
      },
    });

    // Create ProtocolSupplement junction records
    for (const supplementId of coreSupplementIds) {
      await prisma.protocolSupplement.upsert({
        where: {
          protocolId_supplementId: {
            protocolId: created.id,
            supplementId,
          },
        },
        update: { isCore: true },
        create: {
          protocolId: created.id,
          supplementId,
          isCore: true,
        },
      });
    }

    for (const supplementId of optionalSupplementIds) {
      await prisma.protocolSupplement.upsert({
        where: {
          protocolId_supplementId: {
            protocolId: created.id,
            supplementId,
          },
        },
        update: { isCore: false },
        create: {
          protocolId: created.id,
          supplementId,
          isCore: false,
        },
      });
    }
  }

  console.log(`✓ Seeded ${protocols.length} protocols`);
  console.log('Seeding demo user...');
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@wellnessengine.local' },
    update: {},
    create: {
      email: 'demo@wellnessengine.local',
      name: 'Demo Practitioner',
      role: 'PRACTITIONER',
      image: null,
    },
  });

  console.log(`✓ Created demo user: ${demoUser.email}`);

  console.log('✓ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
