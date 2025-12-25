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
    
    // Get all categories for this supplement
    const categories = supplement.categories || [];
    const primaryCategory = categories.length > 0 ? categories[0] : 'other';
    
    const created = await prisma.supplement.upsert({
      where: { externalId },
      update: {},
      create: {
        externalId,
        name: supplement.name,
        category: primaryCategory,
        primaryMechanism: supplement.primary_mechanism || '',
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
  
  // Create protocols for all 22 categories
  const categoryProtocols = [
    { externalId: 'prot_001', category: 'longevity', name: 'Longevity', description: 'Support healthy aging and cellular protection' },
    { externalId: 'prot_002', category: 'cardio', name: 'Cardio', description: 'Support cardiovascular health and blood pressure' },
    { externalId: 'prot_003', category: 'detox', name: 'Detox', description: 'Support detoxification and cellular cleansing' },
    { externalId: 'prot_004', category: 'immune', name: 'Immune', description: 'Strengthen immune function and resilience' },
    { externalId: 'prot_005', category: 'gut', name: 'Gut', description: 'Support digestive health and microbiome balance' },
    { externalId: 'prot_006', category: 'fitness', name: 'Fitness', description: 'Support muscle development and athletic performance' },
    { externalId: 'prot_007', category: 'weight', name: 'Weight', description: 'Support weight management and metabolic health' },
    { externalId: 'prot_008', category: 'recovery', name: 'Recovery', description: 'Optimize post-workout recovery and muscle repair' },
    { externalId: 'prot_009', category: 'energy', name: 'Energy', description: 'Support sustained energy and ATP production' },
    { externalId: 'prot_010', category: 'men_hormone', name: 'Men Hormone', description: 'Support hormonal balance in men' },
    { externalId: 'prot_011', category: 'women_hormone', name: 'Women Hormone', description: 'Support hormonal balance in women' },
    { externalId: 'prot_012', category: 'sleep', name: 'Sleep', description: 'Support quality sleep and rest' },
    { externalId: 'prot_013', category: 'stress', name: 'Stress', description: 'Support stress resilience and adaptation' },
    { externalId: 'prot_014', category: 'skin', name: 'Skin', description: 'Support skin health and appearance' },
    { externalId: 'prot_015', category: 'neuro', name: 'Neuro', description: 'Support neurological health and function' },
    { externalId: 'prot_016', category: 'urinary', name: 'Urinary', description: 'Support urinary tract health' },
    { externalId: 'prot_017', category: 'metabolic', name: 'Metabolic', description: 'Support metabolic function and glucose balance' },
    { externalId: 'prot_018', category: 'brain', name: 'Brain', description: 'Support cognitive function and brain health' },
    { externalId: 'prot_019', category: 'mood', name: 'Mood', description: 'Support mood and emotional balance' },
    { externalId: 'prot_020', category: 'joints', name: 'Joints', description: 'Support joint health and mobility' },
    { externalId: 'prot_021', category: 'hair', name: 'Hair', description: 'Support hair health and growth' },
    { externalId: 'prot_022', category: 'nails', name: 'Nails', description: 'Support nail health and strength' },
  ];

  // Map each category to supplements that have that category
  const categorySupplementMap: Record<string, string[]> = {};
  
  for (const supplement of supplementsData) {
    if (supplement.categories && Array.isArray(supplement.categories)) {
      for (const category of supplement.categories) {
        if (!categorySupplementMap[category]) {
          categorySupplementMap[category] = [];
        }
        categorySupplementMap[category].push(supplement.name);
      }
    }
  }

  let protocolCount = 0;
  for (const categoryProtocol of categoryProtocols) {
    const supplementIds = (categorySupplementMap[categoryProtocol.category] || [])
      .map((name) => createdSupplements[name])
      .filter(Boolean);

    const coreSupplementIds = supplementIds.slice(0, Math.ceil(supplementIds.length / 2));
    const optionalSupplementIds = supplementIds.slice(Math.ceil(supplementIds.length / 2));

    const created = await prisma.protocol.upsert({
      where: { externalId: categoryProtocol.externalId },
      update: {
        coreSupplementsJson: coreSupplementIds,
        optionalSupplementsJson: optionalSupplementIds,
      },
      create: {
        externalId: categoryProtocol.externalId,
        name: categoryProtocol.name,
        goal: categoryProtocol.category.toUpperCase(),
        description: categoryProtocol.description,
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

    protocolCount++;
  }

  console.log(`✓ Seeded ${protocolCount} protocols (1 for each category)`);
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
