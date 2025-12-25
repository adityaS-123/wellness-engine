'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getAvailableGoals } from '@/lib/engine/goalNode';
import { Loader } from 'lucide-react';

const QuestionnaireSchema = z.object({
  age: z.coerce.number().min(13, 'Age must be at least 13').max(120, 'Age must be 120 or less'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { errorMap: () => ({ message: 'Please select a gender' }) }),
  weight: z.coerce.number().positive('Weight must be a positive number'),
  height: z.coerce.number().positive('Height must be a positive number'),
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
  symptomsRating: z.coerce.number().min(0).max(10).optional(),
});

type QuestionnaireFormData = z.infer<typeof QuestionnaireSchema>;

interface GenerateFormProps {
  onSubmit: (data: QuestionnaireFormData) => Promise<void>;
  isLoading?: boolean;
  userId: string;
  refetchTrigger?: number; // Trigger refetch when this changes
}

export function GenerateForm({ onSubmit, isLoading, userId, refetchTrigger }: GenerateFormProps) {
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);
  const [weightUnit, setWeightUnit] = React.useState<'kg' | 'lbs'>('lbs');
  const [heightUnit, setHeightUnit] = React.useState<'cm' | 'ft-in'>('cm');
  const [heightFeet, setHeightFeet] = React.useState<number>(0);
  const [heightInches, setHeightInches] = React.useState<number>(0);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<QuestionnaireFormData>({
    resolver: zodResolver(QuestionnaireSchema),
    defaultValues: {
      budgetTier: 'COMPREHENSIVE',
      symptomsRating: 5,
    },
  });

  // Load profile from database on mount or when refetchTrigger changes
  React.useEffect(() => {
    const loadProfile = async () => {
      setIsLoadingProfile(true);
      if (!userId) {
        console.log('No userId provided, skipping profile load');
        setIsLoadingProfile(false);
        return;
      }

      try {
        console.log('Loading profile for userId:', userId);
        const response = await fetch(`/api/profile?userId=${encodeURIComponent(userId)}`);
        
        console.log('Profile API response status:', response.status);
        
        if (!response.ok) {
          console.error('Failed to load profile, status:', response.status);
          setIsLoadingProfile(false);
          return;
        }

        const profile = await response.json();
        console.log('Loaded profile from database:', profile);
        
        // Profile is null if not found, which is fine (user hasn't saved yet)
        if (!profile) {
          console.log('No existing profile found, using defaults');
          setIsLoadingProfile(false);
          return;
        }
        
        // Set form values from saved profile - note: API returns properties directly, not under demographics
        console.log('Setting form values with profile data');
        setValue('age', profile.age);
        setValue('gender', profile.gender);
        // Store weight in kg internally, display in selected unit
        setValue('weight', profile.weight);
        setValue('height', profile.height);
        
        // Initialize height feet/inches for ft-in display
        const { feet, inches } = cmToFtIn(profile.height);
        setHeightFeet(feet);
        setHeightInches(inches);
        
        if (profile.menopauseStatus) {
          setValue('menopauseStatus', profile.menopauseStatus);
        }
        if (profile.pregnancyIntention) {
          setValue('pregnancyIntention', profile.pregnancyIntention);
        }
        if (profile.trainingFrequency) {
          setValue('trainingFrequency', profile.trainingFrequency);
        }
        
        if (profile.goal) {
          setValue('goal', profile.goal);
        }
        
        if (profile.budgetTier) {
          setValue('budgetTier', profile.budgetTier);
        }
        
        if (profile.currentMedications?.length > 0) {
          setValue('medications', profile.currentMedications.join(', '));
        }
        
        if (profile.medicalConditions?.length > 0) {
          setValue('conditions', profile.medicalConditions.join(', '));
        }
        
        if (profile.symptomsRating !== undefined && profile.symptomsRating !== null) {
          setValue('symptomsRating', profile.symptomsRating);
        }
        
        console.log('Profile loaded and form populated successfully');
      } catch (error) {
        console.error('Error loading profile from database:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [userId, setValue, refetchTrigger]);

  const gender = watch('gender');
  const weight = watch('weight');
  const height = watch('height');
  const goals = getAvailableGoals();
  const isSubmittingForm = isSubmitting || isLoading;

  // Helper functions for weight unit conversion
  const kgToLbs = (kg: number): number => Math.round(kg * 2.20462 * 10) / 10;
  const lbsToKg = (lbs: number): number => Math.round(lbs / 2.20462 * 10) / 10;

  // Helper functions for height unit conversion
  const cmToFtIn = (cm: number): { feet: number; inches: number } => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round((totalInches % 12) * 10) / 10;
    return { feet, inches };
  };
  const ftInToCm = (feet: number, inches: number): number => {
    const totalInches = feet * 12 + inches;
    return Math.round(totalInches * 2.54 * 10) / 10;
  };

  // Handle weight unit toggle
  const toggleWeightUnit = () => {
    if (weight && weight > 0) {
      const newWeight = weightUnit === 'kg' ? kgToLbs(weight) : lbsToKg(weight);
      setValue('weight', newWeight);
    }
    setWeightUnit(weightUnit === 'kg' ? 'lbs' : 'kg');
  };

  // Handle height unit toggle
  const toggleHeightUnit = () => {
    if (height && height > 0) {
      if (heightUnit === 'cm') {
        // Converting cm to ft-in
        const { feet, inches } = cmToFtIn(height);
        setHeightFeet(feet);
        setHeightInches(inches);
      } else {
        // Converting ft-in back to cm
        const cmValue = ftInToCm(heightFeet, heightInches);
        setValue('height', cmValue);
      }
    }
    setHeightUnit(heightUnit === 'cm' ? 'ft-in' : 'cm');
  };

  const handleFormSubmit = async (data: QuestionnaireFormData) => {
    console.log('Form submitted with data:', data);
    // Convert weight to kg if in lbs before submitting
    let heightInCm = data.height;
    if (heightUnit === 'ft-in') {
      heightInCm = ftInToCm(heightFeet, heightInches);
    }
    const dataToSubmit = {
      ...data,
      weight: weightUnit === 'lbs' ? lbsToKg(data.weight) : data.weight,
      height: heightInCm,
    };
    console.log('Converted weight to kg:', dataToSubmit.weight);
    try {
      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-slate-700 rounded"></div>
            <div className="h-10 bg-slate-700 rounded"></div>
            <div className="h-10 bg-slate-700 rounded"></div>
            <div className="h-10 bg-slate-700 rounded"></div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-slate-700 rounded"></div>
            <div className="h-10 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Demographics Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-emerald-500/30 p-6 shadow-lg shadow-emerald-500/5">
            <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-4 pb-3 border-b border-emerald-500/20">
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
                  className="w-full px-3 py-2 bg-slate-800/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-600 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition"
                />
                {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age.message}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wide">Gender</label>
                <select
                  {...register('gender')}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-emerald-500/30 rounded-lg text-white text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition"
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                    Weight ({weightUnit})
                  </label>
                  <button
                    type="button"
                    onClick={toggleWeightUnit}
                    className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg border border-emerald-500/30 transition"
                  >
                    {weightUnit === 'kg' ? 'Switch to lbs' : 'Switch to kg'}
                  </button>
                </div>
                <input
                  type="number"
                  {...register('weight', { valueAsNumber: true })}
                  placeholder={weightUnit}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-600 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition"
                />
                {errors.weight && <p className="text-red-400 text-xs mt-1">{errors.weight.message}</p>}
              </div>

              {/* Height */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                    Height {heightUnit === 'cm' ? '(cm)' : '(ft/in)'}
                  </label>
                  <button
                    type="button"
                    onClick={toggleHeightUnit}
                    className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg border border-emerald-500/30 transition"
                  >
                    {heightUnit === 'cm' ? "Switch to ft/in" : "Switch to cm"}
                  </button>
                </div>
                {heightUnit === 'cm' ? (
                  <input
                    type="number"
                    {...register('height', { valueAsNumber: true })}
                    placeholder="cm"
                    step="any"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-600 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition"
                  />
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Feet"
                        value={heightFeet || ''}
                        onChange={(e) => {
                          const feet = parseInt(e.target.value) || 0;
                          setHeightFeet(feet);
                        }}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-600 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Inches"
                        step="any"
                        value={heightInches || ''}
                        onChange={(e) => {
                          const inches = parseFloat(e.target.value);
                          if (!isNaN(inches)) {
                            setHeightInches(inches);
                          } else if (e.target.value === '') {
                            setHeightInches(0);
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-800/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-600 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition"
                      />
                    </div>
                  </div>
                )}
                {errors.height && <p className="text-red-400 text-xs mt-1">{errors.height.message}</p>}
              </div>
            </div>

            {/* Female-specific fields */}
            {gender === 'FEMALE' && (
              <div className="mt-4 pt-4 border-t border-emerald-500/20 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wide">Menopause Status</label>
                  <select
                    {...register('menopauseStatus')}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-emerald-500/30 rounded-lg text-white text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition"
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
                    className="w-full px-3 py-2 bg-slate-800/50 border border-emerald-500/30 rounded-lg text-white text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition"
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
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-emerald-500/30 p-6 shadow-lg shadow-emerald-500/5">
            <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-4 pb-3 border-b border-emerald-500/20">
              Clinical History
            </h2>

            <div className="space-y-4">
              {/* Training Frequency */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wide">Training Frequency</label>
                <select
                  {...register('trainingFrequency')}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-emerald-500/30 rounded-lg text-white text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition"
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
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950 px-2 py-1 rounded">{watch('symptomsRating') || 5}/10</span>
                </div>
                <input
                  type="range"
                  {...register('symptomsRating', { valueAsNumber: true })}
                  min="0"
                  max="10"
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Current Medications */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wide">Current Medications</label>
                <textarea
                  {...register('medications')}
                  placeholder="List medications separated by commas"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-600 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition"
                  rows={2}
                />
              </div>

              {/* Medical Conditions */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wide">Medical Conditions</label>
                <textarea
                  {...register('conditions')}
                  placeholder="List conditions separated by commas"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-emerald-500/30 rounded-lg text-white placeholder-gray-600 text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Health Goals */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-emerald-500/30 p-6 shadow-lg shadow-emerald-500/5">
            <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-4 pb-3 border-b border-emerald-500/20">
              Health Goals
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {goals.map((goal: any) => (
                <label key={String(goal.value)} className="flex items-center p-3 border border-emerald-500/20 rounded-lg cursor-pointer hover:bg-slate-800/50 hover:border-emerald-500/40 transition group">
                  <input
                    type="radio"
                    {...register('goal')}
                    value={String(goal.value)}
                    className="mr-2 accent-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-300 group-hover:text-emerald-300">{goal.label}</span>
                </label>
              ))}
            </div>
            {errors.goal && <p className="text-red-400 text-xs mt-2">{errors.goal.message}</p>}
          </div>

          {/* Recommendation Tier */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-emerald-500/30 p-6 shadow-lg shadow-emerald-500/5">
            <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-4 pb-3 border-b border-emerald-500/20">
              Recommendation Tier
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {['ESSENTIAL', 'COMPREHENSIVE', 'PREMIUM'].map((tier) => (
                <label
                  key={tier}
                  className={`p-3 border rounded-lg cursor-pointer transition ${
                    watch('budgetTier') === tier
                      ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                      : 'border-emerald-500/20 hover:border-emerald-500/40'
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

          {/* Debug: Show validation errors */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-950 border border-red-700 rounded-lg p-4">
              <h3 className="text-red-300 font-semibold mb-2">Validation Errors:</h3>
              <ul className="text-red-200 text-sm space-y-1">
                {Object.entries(errors).map(([field, error]: any) => (
                  <li key={field}>• {field}: {error?.message || 'Invalid'}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmittingForm}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 transform hover:scale-105"
          >
            {isSubmittingForm ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </button>
        </form>
  );
}
