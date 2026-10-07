import React from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MissingProtectionsListProps {
  missingProtections: string[];
  protectiveClauses: string[];
}

export const MissingProtectionsList: React.FC<MissingProtectionsListProps> = ({
  missingProtections,
  protectiveClauses,
}) => {
  return (
    <div className="space-y-6">
      {/* Missing Protections (Red flags by omission) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-800">
          <AlertCircle className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-semibold text-stone-200 uppercase tracking-wider">
            Critical Protections Conspicuously Missing ({missingProtections.length})
          </h3>
        </div>
        <p className="text-xs text-stone-400">
          Predatory agreements frequently exploit silence by omitting customary consumer or contractor safeguards.
        </p>

        {missingProtections.length === 0 ? (
          <div className="p-4 rounded-xl bg-stone-900/40 border border-stone-800 text-xs text-stone-400">
            No customary baseline protections appear to be omitted.
          </div>
        ) : (
          <div className="space-y-2">
            {missingProtections.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-orange-950/20 border border-orange-900/30 text-xs text-stone-200 flex items-start gap-2.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <span className="font-medium text-orange-200">
                    Omitted Protective Covenant:
                  </span>
                  <p className="text-stone-300 leading-relaxed">{item}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Protective Clauses Present */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-stone-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-stone-200 uppercase tracking-wider">
            Protective Clauses Identified in Document ({protectiveClauses.length})
          </h3>
        </div>
        <p className="text-xs text-stone-400">
          Provisions that actively protect your interests or maintain fair bilateral obligations.
        </p>

        {protectiveClauses.length === 0 ? (
          <div className="p-4 rounded-xl bg-stone-900/40 border border-stone-800 text-xs text-stone-400">
            No explicit protective covenants detected in this draft.
          </div>
        ) : (
          <div className="space-y-2">
            {protectiveClauses.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-xs text-stone-200 flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-stone-300 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
