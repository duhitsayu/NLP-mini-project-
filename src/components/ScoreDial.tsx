import React from 'react';
import { AgreementVerdict } from '../types/agreement';
import { ShieldAlert, ShieldCheck, ShieldX, AlertTriangle } from 'lucide-react';

interface ScoreDialProps {
  score: number; // 0 to 100
  verdict: AgreementVerdict;
}

export const ScoreDial: React.FC<ScoreDialProps> = ({ score, verdict }) => {
  // SVG circular gauge math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColorConfig = () => {
    if (score >= 80) {
      return {
        stroke: '#10b981', // emerald-500
        text: 'text-emerald-400',
        bg: 'bg-emerald-950/40 border-emerald-800/40',
        label: 'VERIFIED FAIR & SAFE',
        subtext: 'Equitable terms without predatory traps',
        icon: ShieldCheck,
      };
    } else if (score >= 60) {
      return {
        stroke: '#f59e0b', // amber-500
        text: 'text-amber-400',
        bg: 'bg-amber-950/40 border-amber-800/40',
        label: 'MODERATE RISK',
        subtext: 'Contains one-sided clauses requiring negotiation',
        icon: AlertTriangle,
      };
    } else if (score >= 35) {
      return {
        stroke: '#f97316', // orange-500
        text: 'text-orange-400',
        bg: 'bg-orange-950/40 border-orange-800/40',
        label: 'HIGH PREDATORY RISK',
        subtext: 'Severe unconscionable clauses detected',
        icon: ShieldAlert,
      };
    } else {
      return {
        stroke: '#ef4444', // red-500
        text: 'text-red-400',
        bg: 'bg-red-950/40 border-red-800/40',
        label: 'CRITICAL: LIKELY SCAM / TRAP',
        subtext: 'Extreme financial or legal peril if executed',
        icon: ShieldX,
      };
    }
  };

  const config = getColorConfig();
  const Icon = config.icon;

  return (
    <div className={`p-5 rounded-2xl border ${config.bg} flex flex-col sm:flex-row items-center gap-6 shadow-xl backdrop-blur-sm transition-all`}>
      {/* Gauge Meter */}
      <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            className="text-stone-800"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={config.stroke}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-mono tracking-tight text-stone-100">
            {score}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-stone-400 font-mono">
            / 100
          </span>
        </div>
      </div>

      {/* Verdict & Context */}
      <div className="flex-1 text-center sm:text-left space-y-1">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <Icon className={`w-5 h-5 ${config.text}`} />
          <h2 className={`text-base font-semibold tracking-wide ${config.text}`}>
            {verdict}
          </h2>
        </div>
        <p className="text-sm font-medium text-stone-200">
          Safety Index: {config.label}
        </p>
        <p className="text-xs text-stone-400 leading-relaxed max-w-md">
          {config.subtext}
        </p>
      </div>
    </div>
  );
};
