'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GenerateForm } from '@/components/GenerateForm';
import { PrescriptionCard } from '@/components/PrescriptionCard';
import { PrescriptionOutput } from '@/lib/engine/types';
import { Loader } from 'lucide-react';

export default function GeneratePage() {
  const [prescription, setPrescription] = useState<PrescriptionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePrescription = async (input: any) => {
    setIsLoading(true);
    setError(null);
    setPrescription(null);

    try {
      // Transform form input to API schema
      const medications = input.medications
        ? input.medications.split(',').map((m: string) => m.trim()).filter(Boolean)
        : [];
      const conditions = input.conditions
        ? input.conditions.split(',').map((c: string) => c.trim()).filter(Boolean)
        : [];

      const payload = {
        demographics: {
          age: input.age,
          gender: input.gender,
          weight: input.weight,
          height: input.height,
          menopauseStatus: input.menopauseStatus || undefined,
          pregnancyIntention: input.pregnancyIntention || undefined,
          trainingFrequency: input.trainingFrequency || undefined,
        },
        goal: input.goal,
        budgetTier: input.budgetTier,
        clinicalFlags: {
          currentMedications: medications,
          medicalConditions: conditions,
        },
        symptomsRating: input.symptomsRating,
      };

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate prescription');
      }

      const data = await response.json();
      setPrescription(data.prescription);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <header className="w-full bg-slate-900 border-b border-slate-700 shadow-md sticky top-0 z-50">
        <div className="w-full px-12 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏥</span>
              <div>
                <h1 className="text-2xl font-bold text-white">Wellness Engine</h1>
                <p className="text-xs text-gray-400">Clinical Decision Support System</p>
              </div>
            </div>
            <nav className="flex gap-4">
              <Link
                href="/"
                className="px-8 py-2.5 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition text-sm"
              >
                Home
              </Link>
              <Link
                href="/chat"
                className="px-8 py-2.5 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition text-sm"
              >
                Chat Assistant
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Full-Screen Form Section */}
      <GenerateForm
        onSubmit={handleGeneratePrescription}
        isLoading={isLoading}
      />

      {/* Full-Screen Results Section */}
      {error && (
        <div className="w-full min-h-screen bg-linear-to-br from-slate-900 via-red-900 to-slate-900 py-16 px-6 flex items-center justify-center">
          <div className="max-w-2xl mx-auto bg-red-900/30 border border-red-500/30 rounded-2xl p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-red-300 mb-4">⚠️ Error</h3>
            <p className="text-red-100">{error}</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="w-full min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 py-16 px-6 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-16 h-16 text-blue-400 animate-spin mb-6 mx-auto" />
            <p className="text-gray-300 text-lg">
              Generating your personalized prescription...
            </p>
          </div>
        </div>
      )}

      {prescription && !isLoading && (
        <PrescriptionCard prescription={prescription} />
      )}
    </div>
  );
}
