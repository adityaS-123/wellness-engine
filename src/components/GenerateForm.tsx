'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getAvailableGoals } from '@/lib/engine/goalNode';
import { Loader } from 'lucide-react';

const QuestionnaireSchema = z.object({
  age: z.number().min(13).max(120),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  weight: z.number().positive(),
  height: z.number().positive(),
  menopauseStatus: z
    .enum(['PREMENOPAUSAL', 'PERIMENOPAUSAL', 'POSTMENOPAUSAL'])
    .optional(),
  pregnancyIntention: z.enum(['YES', 'NO', 'UNSURE']).optional(),
  trainingFrequency: z
    .enum(['NONE', 'LIGHT', 'MODERATE', 'INTENSE', 'VERY_INTENSE'])
    .optional(),
  goal: z.string().min(1, 'Please select a health goal'),
  budgetTier: z.enum(['ESSENTIAL', 'COMPREHENSIVE', 'PREMIUM']),
  medications: z.string().optional(),
  conditions: z.string().optional(),
  symptomsRating: z.number().min(0).max(10).optional(),
});

type QuestionnaireFormData = z.infer<typeof QuestionnaireSchema>;

interface GenerateFormProps {
  onSubmit: (data: QuestionnaireFormData) => Promise<void>;
  isLoading?: boolean;
}

export function GenerateForm({ onSubmit, isLoading }: GenerateFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<QuestionnaireFormData>({
    resolver: zodResolver(QuestionnaireSchema),
    defaultValues: {
      budgetTier: 'COMPREHENSIVE',
      symptomsRating: 5,
    },
  });

  const gender = watch('gender');
  const goals = getAvailableGoals();
  const isSubmittingForm = isSubmitting || isLoading;

  return (
    <div className="w-full min-h-screen bg-slate-950 py-12 px-6">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">
            Patient Assessment Form
          </h1>
          <p className="text-gray-400 text-sm">
            Complete clinical profile for personalized wellness recommendations
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Demographics Section */}
          <div className="bg-slate-900 rounded-lg border border-slate-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4 pb-3 border-b border-slate-700">
              Demographics
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {/* Age */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wide">Age</label>
                <input
                  type="number"
                  {...register('age', { valueAsNumber: true })}
                  placeholder="Years"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-gray-600 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
                {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age.message}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wide">Gender</label>
                <select
                  {...register('gender')}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                >
                  <option value="">Select</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.gender && <p className="text-red-400 text-xs mt-1">{errors.gender.message}</p>}
              </div>

              {/* Weight */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wide">Weight (kg)</label>
                <input
                  type="number"
                  {...register('weight', { valueAsNumber: true })}
                  placeholder="kg"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-gray-600 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
                {errors.weight && <p className="text-red-400 text-xs mt-1">{errors.weight.message}</p>}
              </div>

              {/* Height */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wide">Height (cm)</label>
                <input
                  type="number"
                  {...register('height', { valueAsNumber: true })}
                  placeholder="cm"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-gray-600 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
                {errors.height && <p className="text-red-400 text-xs mt-1">{errors.height.message}</p>}
              </div>
            </div>

            {/* Female-specific fields */}
            {gender === 'FEMALE' && (
              <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wide">Menopause Status</label>
                  <select
                    {...register('menopauseStatus')}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  >
                    <option value="">Select</option>
                    <option value="PREMENOPAUSAL">Premenopausal</option>
                    <option value="PERIMENOPAUSAL">Perimenopausal</option>
                    <option value="POSTMENOPAUSAL">Postmenopausal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wide">Pregnancy Intention</label>
                  <select
                    {...register('pregnancyIntention')}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  >
                    <option value="">Select</option>
                    <option value="YES">Yes</option>
                    <option value="NO">No</option>
                    <option value="UNSURE">Unsure</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Clinical History */}
          <div className="bg-slate-900 rounded-lg border border-slate-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4 pb-3 border-b border-slate-700">
              Clinical History
            </h2>

            <div className="space-y-4">
              {/* Training Frequency */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wide">Training Frequency</label>
                <select
                  {...register('trainingFrequency')}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                >
                  <option value="">Select</option>
                  <option value="NONE">None</option>
                  <option value="LIGHT">Light (1-2x/week)</option>
                  <option value="MODERATE">Moderate (3-4x/week)</option>
                  <option value="INTENSE">Intense (5-6x/week)</option>
                  <option value="VERY_INTENSE">Very Intense (7x/week)</option>
                </select>
              </div>

              {/* Symptoms Rating */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Symptom Severity</label>
                  <span className="text-xs font-semibold text-blue-400 bg-blue-950 px-2 py-1 rounded">{watch('symptomsRating') || 5}/10</span>
                </div>
                <input
                  type="range"
                  {...register('symptomsRating', { valueAsNumber: true })}
                  min="0"
                  max="10"
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Current Medications */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wide">Current Medications</label>
                <textarea
                  {...register('medications')}
                  placeholder="List medications separated by commas"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-gray-600 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  rows={2}
                />
              </div>

              {/* Medical Conditions */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wide">Medical Conditions</label>
                <textarea
                  {...register('conditions')}
                  placeholder="List conditions separated by commas"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-gray-600 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Health Goals */}
          <div className="bg-slate-900 rounded-lg border border-slate-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4 pb-3 border-b border-slate-700">
              Health Goals
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {goals.map((goal: any) => (
                <label key={String(goal.value)} className="flex items-center p-3 border border-slate-700 rounded cursor-pointer hover:bg-slate-800 transition">
                  <input
                    type="radio"
                    {...register('goal')}
                    value={String(goal.value)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-300">{goal.label}</span>
                </label>
              ))}
            </div>
            {errors.goal && <p className="text-red-400 text-xs mt-2">{errors.goal.message}</p>}
          </div>

          {/* Recommendation Tier */}
          <div className="bg-slate-900 rounded-lg border border-slate-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4 pb-3 border-b border-slate-700">
              Recommendation Tier
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {['ESSENTIAL', 'COMPREHENSIVE', 'PREMIUM'].map((tier) => (
                <label
                  key={tier}
                  className={`p-3 border rounded cursor-pointer transition ${
                    watch('budgetTier') === tier
                      ? 'bg-blue-950 border-blue-600 shadow-sm'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    {...register('budgetTier')}
                    value={tier}
                    className="mr-2"
                  />
                  <span className="text-sm font-semibold text-white">{tier}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmittingForm}
            className="w-full py-2.5 px-4 bg-blue-600 text-white rounded font-semibold text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {isSubmittingForm ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Prescription'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
