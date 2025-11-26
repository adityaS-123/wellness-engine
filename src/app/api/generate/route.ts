import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  generatePrescription,
  validateGenerationInput,
  GenerationInput,
} from '@/lib/engine';

// Request validation schema
const GenerateRequestSchema = z.object({
  demographics: z.object({
    age: z.number().min(13).max(120),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    weight: z.number().positive(),
    height: z.number().positive(),
    menstruationStatus: z.enum(['REGULAR', 'IRREGULAR', 'NONE']).optional(),
    menopauseStatus: z
      .enum(['PREMENOPAUSAL', 'PERIMENOPAUSAL', 'POSTMENOPAUSAL'])
      .optional(),
    pregnancyIntention: z.enum(['YES', 'NO', 'UNSURE']).optional(),
    isPregnant: z.boolean().optional(),
    dietPreference: z
      .enum(['OMNIVORE', 'VEGETARIAN', 'VEGAN', 'PESCATARIAN'])
      .optional(),
    alcoholUse: z.enum(['NONE', 'OCCASIONAL', 'MODERATE', 'HEAVY']).optional(),
    trainingFrequency: z
      .enum(['NONE', 'LIGHT', 'MODERATE', 'INTENSE', 'VERY_INTENSE'])
      .optional(),
  }),
  goal: z.string(),
  clinicalFlags: z
    .object({
      currentMedications: z.string().array().optional(),
      medicalConditions: z.string().array().optional(),
      labAbnormalities: z.string().array().optional(),
      symptomClusters: z.string().array().optional(),
    })
    .optional(),
  budgetTier: z.enum(['ESSENTIAL', 'COMPREHENSIVE', 'PREMIUM']),
  symptomsRating: z.number().min(0).max(10).optional(),
  customNotes: z.string().optional(),
});

/**
 * POST /api/generate
 * Main prescription generation endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const parseResult = GenerateRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const input: GenerationInput = parseResult.data as any;

    // Validate engine input
    const validationResult = validateGenerationInput(input);
    if (!validationResult.valid) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          errors: validationResult.errors,
        },
        { status: 400 }
      );
    }

    // Fetch protocol and supplements from database
    let protocol = await prisma.protocol.findFirst({
      where: {
        goal: input.goal,
      },
      include: {
        supplements: true,
      },
    });

    if (!protocol) {
      // Fallback to energy recovery protocol
      protocol = await prisma.protocol.findFirst({
        where: {
          externalId: 'prot_001',
        },
        include: {
          supplements: true,
        },
      });
    }

    if (!protocol) {
      return NextResponse.json(
        { error: 'No protocol found for goal' },
        { status: 404 }
      );
    }

    // Get all supplements with dosage data
    const allSupplements = await prisma.supplement.findMany();

    const supplementDosageData = allSupplements.map((s: any) => ({
      id: s.id,
      name: s.name,
      doseRangeMin: s.doseRangeMin,
      doseRangeMax: s.doseRangeMax,
      doseRangeTypical: s.doseRangeTypical,
      doseUnit: s.doseUnit,
      genderModifiers: s.genderModifiers as Record<string, number>,
      ageModifiers: s.ageModifiers as Record<string, number>,
      useCasePriority: s.useCasePriority,
    }));

    // Get core and optional supplement IDs
    const protocolSupps = protocol.supplements;
    const coreSupplementIds = protocolSupps
      .filter((ps: any) => ps.isCore)
      .map((ps: any) => ps.supplementId);

    const optionalSupplementIds = protocolSupps
      .filter((ps: any) => !ps.isCore)
      .map((ps: any) => ps.supplementId);

    // Generate prescription
    const result = await generatePrescription({
      input,
      protocolData: {
        id: protocol.id,
        name: protocol.name,
        goal: protocol.goal,
        coreSupplementIds,
        optionalSupplementIds,
      },
      supplementData: supplementDosageData,
    });

    // If generation failed, return error
    if (!result.prescription) {
      return NextResponse.json(
        {
          error: 'Prescription generation failed',
          errors: result.errors,
          warnings: result.warnings,
        },
        { status: 422 }
      );
    }

    // Get or create demo user for development
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@wellnessengine.local' },
      update: {},
      create: {
        email: 'demo@wellnessengine.local',
        name: 'Demo User',
        role: 'USER',
      },
    });

    // Save prescription to database
    const prescription = await prisma.prescription.create({
      data: {
        userId: demoUser.id,
        goal: input.goal,
        demographicsJson: input.demographics as any,
        clinicalFlagsJson: input.clinicalFlags as any,
        budgetTier: input.budgetTier,
        morningStackJson: result.prescription.morningStack as any,
        afternoonStackJson: result.prescription.afternoonStack as any,
        eveningStackJson: result.prescription.eveningStack as any,
        lifestyleJson: result.prescription.lifestyle as any,
        redFlagsJson: result.prescription.redFlags as any,
        summaryJson: result.prescription.summary as any,
        warningsJson: result.warnings as any,
        status: 'GENERATED',
      },
    });

    return NextResponse.json(
      {
        success: true,
        prescriptionId: prescription.id,
        prescription: result.prescription,
        warnings: result.warnings,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Generation endpoint error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message:
          error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
