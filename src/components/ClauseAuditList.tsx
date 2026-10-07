import React, { useState, useEffect, useRef } from 'react';
import { ClauseAudit, ClauseClassification } from '../types/agreement';
import { ShieldAlert, AlertTriangle, ShieldCheck, Copy, Check, Sparkles, Scale, RefreshCw } from 'lucide-react';

interface ClauseAuditListProps {
  clauses: ClauseAudit[];
  selectedClauseId: string | null;
  onSelectClause: (clauseId: string) => void;
}

export const ClauseAuditList: React.FC<ClauseAuditListProps> = ({
  clauses,
  selectedClauseId,
  onSelectClause,
}) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (selectedClauseId && cardRefs.current[selectedClauseId]) {
      cardRefs.current[selectedClauseId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedClauseId]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredClauses = clauses.filter((c) => {
    if (filter === 'ALL') return true;
    if (filter === 'PREDATORY') return c.classification === 'PREDATORY';
    if (filter === 'UNFAIR') return c.classification === 'UNFAIR' || c.classification === 'CAUTION';
    if (filter === 'PROTECTIVE') return c.classification === 'PROTECTIVE' || c.classification === 'STANDARD_FAIR';
    return true;
  });

  const getClassificationBadge = (classification: ClauseClassification) => {
    switch (classification) {
      case 'PREDATORY':
        return {
          icon: ShieldAlert,
          bg: 'bg-red-950/60 border-red-800 text-red-300',
          badgeText: 'PREDATORY TRAP',
          riskColor: 'text-red-400',
        };
      case 'UNFAIR':
        return {
          icon: AlertTriangle,
          bg: 'bg-orange-950/60 border-orange-800 text-orange-300',
          badgeText: 'UNFAIR / SKEWED',
          riskColor: 'text-orange-400',
        };
      case 'CAUTION':
        return {
          icon: AlertTriangle,
          bg: 'bg-amber-950/60 border-amber-800 text-amber-300',
          badgeText: 'CAUTION',
          riskColor: 'text-amber-400',
        };
      case 'PROTECTIVE':
      case 'STANDARD_FAIR':
        return {
          icon: ShieldCheck,
          bg: 'bg-emerald-950/60 border-emerald-800 text-emerald-300',
          badgeText: 'PROTECTIVE',
          riskColor: 'text-emerald-400',
        };
      default:
        return {
          icon: Scale,
          bg: 'bg-stone-800 border-stone-700 text-stone-300',
          badgeText: 'STANDARD',
          riskColor: 'text-stone-400',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-800">
        <div>
          <h3 className="text-sm font-semibold text-stone-200 uppercase tracking-wider">
            Clause-by-Clause Forensic Audit ({filteredClauses.length})
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Verbatim excerpts translated into plain English with counter-language recommendations
          </p>
        </div>

        {/* Filter Segmented Control (allowed per guidelines as functional buttons) */}
        <div className="flex items-center gap-1 p-1 bg-stone-900 border border-stone-800 rounded-lg text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filter === 'ALL'
                ? 'bg-stone-800 text-stone-100 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            All ({clauses.length})
          </button>
          <button
            onClick={() => setFilter('PREDATORY')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filter === 'PREDATORY'
                ? 'bg-red-950 text-red-200 border border-red-800/80 shadow-sm'
                : 'text-stone-400 hover:text-red-300'
            }`}
          >
            Predatory
          </button>
          <button
            onClick={() => setFilter('UNFAIR')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filter === 'UNFAIR'
                ? 'bg-amber-950 text-amber-200 border border-amber-800/80 shadow-sm'
                : 'text-stone-400 hover:text-amber-300'
            }`}
          >
            Unfair
          </button>
          <button
            onClick={() => setFilter('PROTECTIVE')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filter === 'PROTECTIVE'
                ? 'bg-emerald-950 text-emerald-200 border border-emerald-800/80 shadow-sm'
                : 'text-stone-400 hover:text-emerald-300'
            }`}
          >
            Protective
          </button>
        </div>
      </div>

      {/* Clauses Cards List */}
      <div className="space-y-4">
        {filteredClauses.map((clause) => {
          const isSelected = selectedClauseId === clause.id;
          const badge = getClassificationBadge(clause.classification);
          const BadgeIcon = badge.icon;

          return (
            <div
              key={clause.id}
              ref={(el) => {
                cardRefs.current[clause.id] = el;
              }}
              onClick={() => onSelectClause(clause.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-stone-900 border-amber-500/80 ring-2 ring-amber-500/30 shadow-xl'
                  : 'bg-stone-900/60 border-stone-800 hover:border-stone-700/80 hover:bg-stone-900/90'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-800/70">
                <div className="flex items-center gap-2">
                  <BadgeIcon className="w-4 h-4 text-stone-300" />
                  <span className="text-xs font-semibold text-stone-200">
                    {clause.locationHint || 'Contract Provision'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Risk Score */}
                  <span className="text-xs font-mono font-medium text-stone-400">
                    Risk: <strong className={badge.riskColor}>{clause.riskScore}</strong>/10
                  </span>
                  <span className={`text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full border ${badge.bg}`}>
                    {badge.badgeText}
                  </span>
                </div>
              </div>

              {/* Original Clause Snippet */}
              <div className="mt-3 p-3 rounded-lg bg-stone-950/80 border border-stone-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 font-mono">
                    Verbatim Document Excerpt:
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(`clause-${clause.id}`, clause.originalClause);
                    }}
                    className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-200 transition-colors"
                  >
                    {copiedId === `clause-${clause.id}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="font-mono-code text-xs text-stone-300 leading-relaxed italic">
                  "{clause.originalClause}"
                </p>
              </div>

              {/* Analysis Columns: Plain English vs Trap Mechanism */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Plain English Translation */}
                <div className="p-3 rounded-lg bg-stone-950/40 border border-stone-800/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Plain English Translation</span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {clause.plainEnglishMeaning}
                  </p>
                </div>

                {/* Hidden Trap / Scam Loophole */}
                <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>The Hidden Trapdoor / Loophole</span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {clause.hiddenTrapExplanation}
                  </p>
                </div>
              </div>

              {/* Recommended Counter-Language */}
              {clause.recommendedCounterLanguage && (
                <div className="mt-3 p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Recommended Counter-Clause (Redline)</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(`counter-${clause.id}`, clause.recommendedCounterLanguage);
                      }}
                      className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      {copiedId === `counter-${clause.id}` ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Counter-Language</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="font-mono-code text-xs text-emerald-200/90 leading-relaxed bg-stone-950/60 p-2.5 rounded border border-emerald-900/40">
                    {clause.recommendedCounterLanguage}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
