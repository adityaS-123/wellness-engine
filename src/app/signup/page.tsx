'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Loader } from 'lucide-react';

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to create account');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/signin');
      }, 2000);
    } catch (err) {
      setError('Failed to create account. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="w-full bg-slate-900 border-b border-slate-700 px-12 py-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏥</span>
          <div>
            <h1 className="text-2xl font-bold text-white">Wellness Engine</h1>
            <p className="text-xs text-gray-400">Clinical Decision Support System</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Form Card */}
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 shadow-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-sm text-gray-400">
                Join Wellness Engine to save prescriptions and chat history
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-950 border border-red-700 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-3 bg-green-950 border border-green-700 rounded text-green-400 text-sm">
                Account created successfully! Redirecting to sign in...
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-5">
              {/* Name Field */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide block">
                  Full Name
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded text-sm text-white bg-slate-800 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded text-sm text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded text-sm text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded text-sm text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={isLoading || success}
                className="w-full py-2.5 px-4 bg-blue-600 text-white rounded font-semibold text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-sm text-gray-400 text-center">
                Already have an account?{' '}
                <Link href="/signin" className="text-blue-400 hover:text-blue-300 font-semibold">
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Demo Note */}
          <div className="mt-6 p-4 bg-blue-950 border border-blue-700 rounded text-center">
            <p className="text-xs text-blue-300">
              <span className="font-semibold">Demo Mode:</span> Sign up functionality to be implemented
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
