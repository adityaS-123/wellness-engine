import Link from 'next/link';

export default function Home() {
  return (
    <div className="w-screen min-h-screen bg-slate-950 overflow-x-hidden">
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
                href="/chat"
                className="px-8 py-2.5 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition text-sm"
              >
                Chat Assistant
              </Link>
              <Link
                href="/generate"
                className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
              >
                Generate Prescription
              </Link>
              <Link
                href="/signin"
                className="px-8 py-2.5 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition text-sm"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-8 py-2.5 border-2 border-blue-500 text-blue-400 rounded-lg font-semibold hover:bg-blue-950 transition text-sm"
              >
                Sign Up
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Screen */}
      <main className="w-full">
        <section className="w-screen min-h-screen flex flex-col items-center justify-center px-12 bg-linear-to-br from-slate-950 via-slate-900 to-slate-900">
          <div className="text-center max-w-4xl">
            <h2 className="text-5xl font-bold text-white mb-6">
              Evidence-Based Clinical Decision Support
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed font-medium">
              Precision wellness recommendations based on comprehensive patient profiling, safety validation, and clinical protocols. Streamline supplement prescribing with deterministic algorithms.
            </p>
            <Link
              href="/generate"
              className="inline-block px-10 py-3 bg-blue-600 text-white rounded-lg font-semibold text-base hover:bg-blue-700 transition shadow-md hover:shadow-lg"
            >
              Start Assessment →
            </Link>
          </div>
        </section>

        {/* Features Grid - Full Screen */}
        <section className="w-screen py-20 px-12 bg-white border-t border-gray-200">
          <div className="flex flex-col items-center">
            <h3 className="text-4xl font-bold text-white mb-12">
              Clinical Capabilities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
              <FeatureCard
                emoji="✓"
                title="Safety Validation"
                description="Contraindication and drug-supplement interaction checking"
              />
              <FeatureCard
                emoji="⚖️"
                title="Personalized Dosing"
                description="Evidence-based dose calculations per individual metrics"
              />
              <FeatureCard
                emoji="📊"
                title="Protocol-Based"
                description="Standardized clinical protocols for consistent outcomes"
              />
              <FeatureCard
                emoji="🔍"
                title="Comprehensive Assessment"
                description="Multi-parameter clinical decision algorithm"
              />
            </div>
          </div>
        </section>

        {/* How It Works - Full Screen */}
        <section className="w-screen py-20 px-12 bg-slate-800 border-t border-slate-700">
          <div className="flex flex-col items-center w-full">
            <h3 className="text-4xl font-bold text-white mb-12 text-center">
              Assessment Workflow
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
              <Step
                number={1}
                title="Patient History"
                description="Demographic and clinical profile collection"
              />
              <Step
                number={2}
                title="Safety Analysis"
                description="Medication interaction and contraindication review"
              />
              <Step
                number={3}
                title="Protocol Selection"
                description="Evidence-based protocol matching"
              />
              <Step
                number={4}
                title="Personalization"
                description="Individualized recommendations with dosing"
              />
            </div>
          </div>
        </section>

        {/* Budget Tiers - Full Screen */}
        <section className="w-screen py-20 px-12 bg-white border-t border-gray-200">
          <div className="flex flex-col items-center w-full">
            <h3 className="text-4xl font-bold text-white mb-12 text-center">
              Recommendation Tiers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
              <BudgetTierCard
                tier="Essential"
                description="Core supplements only"
                supplements={5}
                highlights={[
                  '✓ Evidence-based essentials',
                  '✓ Standard dosing',
                  '✓ Safety validated',
                ]}
              />
              <BudgetTierCard
                tier="Comprehensive"
                description="Complete optimization"
                supplements={8}
                highlights={[
                  '✓ Core + targeted support',
                  '✓ Personalized dosing',
                  '✓ Synergistic formulation',
                ]}
                featured
              />
              <BudgetTierCard
                tier="Premium"
                description="Maximum support"
                supplements={12}
                highlights={[
                  '✓ Full clinical protocol',
                  '✓ Advanced formulations',
                  '✓ Comprehensive optimization',
                ]}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-900 text-gray-400 py-8 border-t border-slate-700">
        <div className="w-full px-12">
          <p className="text-center text-sm">
            Medical Disclaimer: This tool provides evidence-based recommendations and is not a substitute
            for professional medical advice. Always consult with a healthcare provider before starting new supplements.
          </p>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  emoji: string;
  title: string;
  description: string;
}

function FeatureCard({ emoji, title, description }: FeatureCardProps) {
  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow border border-slate-700 hover:shadow-md transition">
      <div className="text-2xl mb-3 font-bold text-blue-400">{emoji}</div>
      <h4 className="text-base font-bold text-white mb-2">{title}</h4>
      <p className="text-sm text-gray-400 font-medium">{description}</p>
    </div>
  );
}

interface StepProps {
  number: number;
  title: string;
  description: string;
}

function Step({ number, title, description }: StepProps) {
  return (
    <div className="text-center bg-slate-800 p-6 rounded-lg shadow border border-slate-700 hover:shadow-md transition">
      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3">
        {number}
      </div>
      <h4 className="text-base font-bold text-white mb-2">{title}</h4>
      <p className="text-sm text-gray-400 font-medium">{description}</p>
    </div>
  );
}

interface BudgetTierCardProps {
  tier: string;
  description: string;
  supplements: number;
  highlights: string[];
  featured?: boolean;
}

function BudgetTierCard({
  tier,
  description,
  supplements,
  highlights,
  featured,
}: BudgetTierCardProps) {
  return (
    <div
      className={`rounded-lg p-6 transition border ${
        featured
          ? 'bg-blue-950 border-blue-600 shadow-md'
          : 'bg-slate-800 border-slate-700 shadow hover:shadow-md'
      }`}
    >
      <h4 className="text-lg font-bold text-white mb-1">{tier}</h4>
      <p className="text-sm text-gray-400 mb-3">{description}</p>
      <p className="text-sm font-semibold text-blue-400 mb-4">
        Up to <span className="font-bold">{supplements}</span> supplements
      </p>
      <ul className="space-y-2">
        {highlights.map((highlight, idx) => (
          <li key={idx} className="text-sm text-gray-300 font-medium">
            {highlight}
          </li>
        ))}
      </ul>
    </div>
  );
}

