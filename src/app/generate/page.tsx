'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GenerateForm } from '@/components/GenerateForm';
import { Loader, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [profileSaved, setProfileSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Check if user is logged in
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/signin');
      return;
    }
    
    try {
      const user = JSON.parse(userData);
      setUserId(user.id);
    } catch (err) {
      console.error('Error parsing user data:', err);
      router.push('/signin');
    }
    
    setIsCheckingAuth(false);
  }, [router]);

  // Helper for lbs to kg conversion
  const lbsToKg = (lbs: number): number => Math.round(lbs / 2.20462 * 10) / 10;

  const handleSaveProfile = async (input: any) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProfileSaved(false);

    try {
      console.log('Form input received:', input);
      
      // Transform form input to API schema
      const medications = input.medications
        ? input.medications.split(',').map((m: string) => m.trim()).filter(Boolean)
        : [];
      const conditions = input.conditions
        ? input.conditions.split(',').map((c: string) => c.trim()).filter(Boolean)
        : [];

      // Always store weight in kg in database
      // input.weight already comes in kg (form handles conversion)
      const weight = input.weight;

      const payload = {
        userId,
        demographics: {
          age: input.age,
          gender: input.gender,
          weight: weight,
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

      console.log('Payload to save:', payload);
      
      // Save profile to database
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }

      const savedProfile = await response.json();
      console.log('Profile saved to database:', savedProfile);
      
      setProfileSaved(true);
      
      // Trigger refetch of profile data in the form
      setRefetchTrigger(prev => prev + 1);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setProfileSaved(false);
      }, 2000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="bg-slate-950/50 backdrop-blur-md border-b border-emerald-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center text-slate-950 font-bold text-sm">W</div>
              <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Wellness Engine</span>
            </Link>
            <div className="flex gap-6">
              <Link href="/chat" className="text-gray-400 hover:text-emerald-400 transition font-medium">
                Chat
              </Link>
              <Link href="/generate" className="text-gray-400 hover:text-emerald-400 transition font-medium">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-12 px-6 relative z-10">
        <div className="w-full max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-3">
              Create Your Wellness Profile
            </h1>
            <p className="text-gray-400 text-lg">
              Tell us about yourself so we can provide personalized wellness recommendations
            </p>
          </div>

          {/* Success Message */}
          {profileSaved && (
            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center gap-3 backdrop-blur-sm">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-emerald-300">Profile saved successfully!</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-xl backdrop-blur-sm">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Form */}
          {userId && <GenerateForm onSubmit={handleSaveProfile} isLoading={isLoading} userId={userId} refetchTrigger={refetchTrigger} />}
        </div>
      </div>
    </div>
  );
}
