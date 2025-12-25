import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get userId from query params or headers
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, demographics, goal, budgetTier, clinicalFlags, symptomsRating } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        age: demographics.age,
        gender: demographics.gender,
        weight: demographics.weight,
        height: demographics.height,
        menopauseStatus: demographics.menopauseStatus || null,
        pregnancyIntention: demographics.pregnancyIntention || null,
        trainingFrequency: demographics.trainingFrequency || null,
        goal,
        budgetTier,
        symptomsRating: symptomsRating || null,
        currentMedications: clinicalFlags.currentMedications || [],
        medicalConditions: clinicalFlags.medicalConditions || [],
      },
      create: {
        userId,
        age: demographics.age,
        gender: demographics.gender,
        weight: demographics.weight,
        height: demographics.height,
        menopauseStatus: demographics.menopauseStatus || null,
        pregnancyIntention: demographics.pregnancyIntention || null,
        trainingFrequency: demographics.trainingFrequency || null,
        goal,
        budgetTier,
        symptomsRating: symptomsRating || null,
        currentMedications: clinicalFlags.currentMedications || [],
        medicalConditions: clinicalFlags.medicalConditions || [],
      },
    });

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    );
  }
}
