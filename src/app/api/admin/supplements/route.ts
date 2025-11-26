import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/supplements
 * List all supplements
 */
export async function GET(request: NextRequest) {
  try {
    const supplements = await prisma.supplement.findMany({
      orderBy: { useCasePriority: 'desc' },
    });

    return NextResponse.json({
      success: true,
      count: supplements.length,
      supplements,
    });
  } catch (error) {
    console.error('Supplements fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/supplements
 * Create a new supplement
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const supplement = await prisma.supplement.create({
      data: {
        externalId: body.externalId,
        name: body.name,
        category: body.category,
        primaryMechanism: body.primaryMechanism,
        benefits: body.benefits,
        doseRangeMin: body.doseRangeMin,
        doseRangeMax: body.doseRangeMax,
        doseRangeTypical: body.doseRangeTypical,
        doseUnit: body.doseUnit,
        contraindications: body.contraindications || [],
        medicationInteractions: body.medicationInteractions || [],
        genderModifiers: body.genderModifiers || {},
        ageModifiers: body.ageModifiers || {},
        budgetTier: body.budgetTier,
        evidenceLevel: body.evidenceLevel,
        useCasePriority: body.useCasePriority,
      },
    });

    return NextResponse.json(
      { success: true, supplement },
      { status: 201 }
    );
  } catch (error) {
    console.error('Supplement creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
