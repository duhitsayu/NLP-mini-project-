import React from 'react';
import { ThreatIndicator, RiskSeverity } from '../types/agreement';
import { AlertOctagon, AlertTriangle, Info, CheckCircle2, Quote } from 'lucide-react';

interface ThreatVectorsListProps {
  threats: ThreatIndicator[];
}

export const ThreatVectorsList: React.FC<ThreatVectorsListProps> = ({ threats }) => {
  if (threats.length === 0) {
    return (
      <div className="p-8 text-center bg-stone-900/40 rounded-2xl border border-stone-800/80 space-y-3">
        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
        <h3 className="text-base font-semibold text-stone-200">
          No Predatory Traps or Scam Vectors Flagged
        </h3>
        <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
          The agreement contains standard provisions without unilateral price hikes, confessions of judgment, dark-pattern auto-renewals, or unconscionable liability shifts.
        </p>
      </div>
    );
  }

  const getSeverityBadge = (severity: RiskSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          icon: AlertOctagon,
          bg: 'bg-red-950/60 border-red-800/80 text-red-300',
          dot: 'bg-red-500',
          label: 'CRITICAL TRAP',
        };
      case 'HIGH':
        return {
          icon: AlertTriangle,
          bg: 'bg-orange-950/60 border-orange-800/80 text-orange-300',
          dot: 'bg-orange-500',
          label: 'HIGH RISK',
        };
      case 'MEDIUM':
        return {
          icon: Info,
          bg: 'bg-amber-950/60 border-amber-800/80 text-amber-300',
          dot: 'bg-amber-500',
          label: 'CAUTION',
        };
      default:
        return {
          icon: Info,
          bg: 'bg-stone-800 border-stone-700 text-stone-300',
          dot: 'bg-stone-400',
          label: 'LOW',
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-stone-800">
        <div>
          <h3 className="text-sm font-semibold text-stone-200 uppercase tracking-wider">
            Detected Scam & Predatory Vectors ({threats.length})
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Key provisions engineered to disadvantage the signer or evade legal liability
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {threats.map((threat) => {
          const config = getSeverityBadge(threat.severity);
          const Icon = config.icon;

          return (
            <div
              key={threat.id}
              className={`p-4 rounded-xl border ${config.bg} backdrop-blur-sm space-y-2.5 transition-all`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 shrink-0" />
                  <h4 className="text-sm font-semibold text-stone-100">
                    {threat.category}
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-900/80 border border-stone-700/60">
                  <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                  <span>{config.label}</span>
                </div>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                {threat.description}
              </p>

              {threat.matchedExcerpts && threat.matchedExcerpts.length > 0 && (
                <div className="pt-2 border-t border-stone-800/60 space-y-1.5">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-stone-400 uppercase tracking-wider">
                    <Quote className="w-3 h-3 text-stone-500" />
                    <span>Evidence Quoted from Agreement:</span>
                  </div>
                  <div className="space-y-1">
                    {threat.matchedExcerpts.map((excerpt, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-stone-950/70 border border-stone-800/80 font-mono-code text-[11px] text-stone-300 leading-snug italic"
                      >
                        "{excerpt}"
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
