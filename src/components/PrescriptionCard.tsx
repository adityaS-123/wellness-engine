'use client';

import React from 'react';
import { PrescriptionOutput, SupplementStack } from '@/lib/engine/types';
import { CheckCircle, Download, Share2 } from 'lucide-react';

interface PrescriptionCardProps {
  prescription: PrescriptionOutput;
}

/**
 * Clinical prescription display component
 */
export function PrescriptionCard({ prescription }: PrescriptionCardProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const data = JSON.stringify(prescription, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wellness-prescription-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-slate-700">
          <h1 className="text-3xl font-bold text-white mb-2">
            Wellness Prescription
          </h1>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">
                Goal: <span className="font-semibold text-white">{prescription.summary.goal}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Generated: {new Date(prescription.summary.generatedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-950 rounded-lg border border-green-700">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs font-semibold text-green-400">Prescription Saved</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded font-semibold text-sm hover:bg-blue-700 transition"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded font-semibold text-sm hover:bg-slate-600 transition"
          >
            <Share2 className="w-4 h-4" />
            Print / PDF
          </button>
        </div>

        {/* Summary Section */}
        <div className="mb-8 bg-slate-900 rounded-lg border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-white mb-4 pb-3 border-b border-slate-700">Summary</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Primary Focus</p>
              <ul className="space-y-1">
                {prescription.summary.priority.map((item) => (
                  <li key={item} className="text-sm text-slate-900">• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Pathway Focus</p>
              <ul className="space-y-1">
                {prescription.summary.pathwayFocus.map((item) => (
                  <li key={item} className="text-sm text-slate-900">• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Supplement Stacks */}
        <div className="space-y-6 mb-8">
          <SupplementStackSection
            title="Morning Stack"
            supplements={prescription.morningStack}
          />
          {prescription.afternoonStack && prescription.afternoonStack.length > 0 && (
            <SupplementStackSection
              title="Afternoon Stack"
              supplements={prescription.afternoonStack}
            />
          )}
          <SupplementStackSection
            title="Evening Stack"
            supplements={prescription.eveningStack}
          />
        </div>

        {/* Lifestyle */}
        <div className="mb-8 bg-white rounded-lg border border-gray-300 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-gray-200">Lifestyle Recommendations</h2>
          <div className="grid grid-cols-2 gap-4">
            <LifestyleCategory title="Sleep" items={prescription.lifestyle.sleep} />
            <LifestyleCategory title="Diet" items={prescription.lifestyle.diet} />
            <LifestyleCategory title="Training" items={prescription.lifestyle.training} />
            <LifestyleCategory title="Stress" items={prescription.lifestyle.stressReduction || []} />
          </div>
        </div>

        {/* Warnings & Red Flags */}
        {prescription.redFlags && prescription.redFlags.length > 0 && (
          <div className="mb-8 bg-yellow-50 rounded-lg border border-yellow-200 p-6">
            <h3 className="font-bold text-yellow-900 mb-3 text-base">⚠️ Important Considerations</h3>
            <ul className="space-y-2">
              {prescription.redFlags.map((flag, idx) => (
                <li key={idx} className="text-sm text-yellow-800">• {flag.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* General Warnings */}
        {prescription.warnings && prescription.warnings.length > 0 && (
          <div className="mb-8 bg-amber-50 rounded-lg border border-amber-200 p-6">
            <h3 className="font-bold text-amber-900 mb-3 text-base">📋 Notes</h3>
            <ul className="space-y-2 text-sm text-amber-900">
              {prescription.warnings.map((warning, idx) => (
                <li key={idx}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Shopping List */}
        <div className="bg-white rounded-lg border border-gray-300 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-gray-200">Shopping List</h3>
          <div className="space-y-2">
            {prescription.shoppingList.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded border border-gray-200"
              >
                <span className="font-medium text-slate-900 text-sm">{item.supplementName}</span>
                <span className="text-xs text-slate-600 bg-white px-2 py-1 rounded border border-gray-200">
                  {item.quantity} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SupplementStackSectionProps {
  title: string;
  supplements: SupplementStack[];
}

function SupplementStackSection({
  title,
  supplements,
}: SupplementStackSectionProps) {
  if (!supplements || supplements.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-300 p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-gray-200">{title}</h2>
      <div className="space-y-3">
        {supplements.map((supp) => (
          <div
            key={supp.supplementId}
            className="p-4 border border-gray-300 rounded-lg bg-gray-50"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-slate-900 text-sm">{supp.supplementName}</h4>
              <span className="text-xs bg-blue-100 text-blue-900 px-2 py-1 rounded font-semibold">
                {supp.dose} {supp.unit}
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-1">Timing: {supp.timing}</p>
            <p className="text-xs text-slate-600 italic mb-2">{supp.reasoning}</p>
            {supp.warnings && supp.warnings.length > 0 && (
              <div className="text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                ⚠️ {supp.warnings.join('; ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface LifestyleCategoryProps {
  title: string;
  items: string[];
}

function LifestyleCategory({ title, items }: LifestyleCategoryProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
      <h4 className="font-bold text-slate-900 mb-2 text-sm">{title}</h4>
      <ul className="space-y-1">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-2 text-xs text-slate-700">
            <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
