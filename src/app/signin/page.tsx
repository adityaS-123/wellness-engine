'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader } from 'lucide-react';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to sign in');
        setIsLoading(false);
        return;
      }

      const user = await response.json();
      // Store user in localStorage or cookie for demo
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/chat');
    } catch (err) {
      setError('Failed to sign in. Please try again.');
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
              <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
              <p className="text-sm text-gray-400">
                Access your wellness prescriptions and chat history
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-950 border border-red-700 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded text-sm text-white bg-slate-800 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded text-sm text-white bg-slate-800 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-blue-600 text-white rounded font-semibold text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Forgot Password Link */}
            <div className="mt-4 text-center">
              <a href="#" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
                Forgot password?
              </a>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-sm text-gray-400 text-center">
                Don't have an account?{' '}
                <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>

          {/* Demo Note */}
          <div className="mt-6 p-4 bg-blue-950 border border-blue-700 rounded text-center">
            <p className="text-xs text-blue-300">
              <span className="font-semibold">Demo Mode:</span> Sign in functionality to be implemented
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
