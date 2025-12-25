'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className="w-full bg-slate-950/50 backdrop-blur-md border-b border-emerald-500/20 sticky top-0 z-50">
        <div className="w-full px-12 py-6">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center text-slate-950 font-bold text-lg">W</div>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Wellness Engine</span>
            </div>
            <nav className="flex gap-10 items-center">
              <Link href="#services" className="text-gray-300 font-medium hover:text-emerald-400 transition duration-300">
                Services
              </Link>
              <Link href="#" className="text-gray-300 font-medium hover:text-emerald-400 transition duration-300">
                About
              </Link>
              <Link href="#" className="text-gray-300 font-medium hover:text-emerald-400 transition duration-300">
                Contact
              </Link>
              <UserNav />
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full py-32 px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block mb-6 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                <p className="text-emerald-400 text-sm font-medium">Next Generation Wellness</p>
              </div>
              <h1 className="text-6xl font-bold mb-8 leading-tight">
                <span className="text-white">Transform Your</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500">Wellness Future</span>
              </h1>
              <p className="text-xl text-gray-400 mb-10 leading-relaxed font-light">
                AI-powered supplement recommendations powered by clinical expertise. Personalized health optimization at your fingertips.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/generate"
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition duration-300 transform hover:scale-105"
                >
                  Create Your Profile
                </Link>
                <Link
                  href="/chat"
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition duration-300 transform hover:scale-105"
                >
                  Chat 
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl blur-2xl"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-12 flex flex-col items-center justify-center h-96">
                <div className="text-7xl mb-4 animate-bounce">💊</div>
                <p className="text-gray-300 text-center font-light">Intelligent Supplement Optimization</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative w-full py-32 px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-4 text-white">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-400 font-light">
              Everything you need for optimal wellness
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-8">
            <ServiceCard
              title="Health Profiling"
              description="Comprehensive AI analysis of your health data, medical history, and wellness goals"
              href="/generate"
              icon="🧬"
            />
            <ServiceCard
              title="Safety Intelligence"
              description="Real-time contraindication checking and drug-supplement interaction validation"
              href="/chat"
              icon="🔐"
            />
            <ServiceCard
              title="Personalized Dosing"
              description="Evidence-based calculations tailored to your unique metrics and requirements"
              href="/chat"
              icon="⚡"
            />
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="relative w-full py-32 px-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-emerald-500/30 backdrop-blur-xl rounded-2xl p-16 text-center">
            <h2 className="text-5xl font-bold mb-6 text-white">
              Ready to Optimize?
            </h2>
            <p className="text-xl text-gray-300 mb-12 font-light">
              Join thousands achieving their wellness goals with AI-powered recommendations.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/generate"
                className="inline-block px-12 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition duration-300 transform hover:scale-105"
              >
                Begin Your Journey Now
              </Link>
              <Link
                href="/chat"
                className="inline-block px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition duration-300 transform hover:scale-105"
              >
                Chat with AI
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative w-full bg-slate-950/80 backdrop-blur-sm border-t border-emerald-500/10 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-12">
          <div className="grid grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="text-emerald-400 font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/" className="text-gray-400 hover:text-emerald-400 transition">Home</Link></li>
                <li><Link href="#services" className="text-gray-400 hover:text-emerald-400 transition">Features</Link></li>
                <li><Link href="/generate" className="text-gray-400 hover:text-emerald-400 transition">Assessment</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-emerald-400 font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="text-gray-400 hover:text-emerald-400 transition">About</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-emerald-400 transition">Blog</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-emerald-400 transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-emerald-400 font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="text-gray-400 hover:text-emerald-400 transition">Docs</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-emerald-400 transition">API</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-emerald-400 transition">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-emerald-400 font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#" className="text-gray-400 hover:text-emerald-400 transition">Privacy</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-emerald-400 transition">Terms</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-emerald-400 transition">Disclaimer</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-emerald-500/10 pt-8 text-center text-sm text-gray-500">
            <p className="mb-2">Always consult with a healthcare provider before starting supplements.</p>
            <p>© 2025 Wellness Engine. Built with innovation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface ServiceCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
}

function ServiceCard({ title, description, href, icon }: ServiceCardProps) {
  return (
    <div className="group bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 hover:border-emerald-500/50 rounded-xl p-8 transition duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
      <div className="text-5xl mb-4 group-hover:scale-110 transition duration-300">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 mb-6 leading-relaxed text-sm font-light">{description}</p>
      <Link href={href} className="inline-flex items-center gap-2 text-emerald-400 font-semibold hover:text-cyan-400 transition duration-300 group-hover:gap-3">
        Explore <span>→</span>
      </Link>
    </div>
  );
}

interface StatsCardProps {
  number: string;
  label: string;
}

function StatsCard({ number, label }: StatsCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-8 text-center hover:border-emerald-500/50 transition duration-300">
      <p className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">{number}</p>
      <p className="text-gray-400 font-light">{label}</p>
    </div>
  );
}

function UserNav() {
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (user) {
    return (
      <div className="flex gap-4 items-center">
        <span className="text-gray-300 text-sm font-medium">{user.name || user.email}</span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-medium hover:bg-red-500/30 transition duration-300 text-sm"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/signin"
        className="px-6 py-2 text-gray-300 font-medium hover:text-emerald-400 transition duration-300"
      >
        Sign In
      </Link>
      <Link
        href="/signup"
        className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition duration-300"
      >
        Sign Up
      </Link>
    </>
  );
}
