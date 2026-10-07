import React, { useState, useMemo } from 'react';
import { ClauseAudit } from '../types/agreement';
import { Search, Copy, Check, FileText, Sparkles, AlertCircle } from 'lucide-react';

interface DocumentViewerProps {
  text: string;
  clauseAudits: ClauseAudit[];
  selectedClauseId: string | null;
  onSelectClause: (clauseId: string) => void;
  onTextChange?: (newText: string) => void;
  isEditing?: boolean;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  text,
  clauseAudits,
  selectedClauseId,
  onSelectClause,
  onTextChange,
  isEditing = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const wordCount = useMemo(() => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [text]);

  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build rendered document text with highlighted segments
  const renderedContent = useMemo(() => {
    if (!text) return null;
    if (clauseAudits.length === 0) {
      return (
        <pre className="whitespace-pre-wrap font-mono-code text-xs sm:text-sm text-stone-300 leading-relaxed font-normal selection:bg-amber-500/30">
          {text}
        </pre>
      );
    }

    // Find occurrences of audited clauses in the text
    interface HighlightRange {
      start: number;
      end: number;
      clause: ClauseAudit;
    }

    const ranges: HighlightRange[] = [];
    const textLower = text.toLowerCase();

    for (const audit of clauseAudits) {
      // Find longest sensible match phrase (at least 20 chars or full snippet)
      const cleanSnippet = audit.originalClause.replace(/\.\.\.$/, '').trim();
      const searchTarget = cleanSnippet.slice(0, 80).toLowerCase();

      if (searchTarget.length > 10) {
        let pos = textLower.indexOf(searchTarget);
        if (pos !== -1) {
          const matchLen = Math.min(cleanSnippet.length, text.length - pos);
          ranges.push({
            start: pos,
            end: pos + matchLen,
            clause: audit,
          });
        }
      }
    }

    // Sort ranges by start position and eliminate overlaps
    ranges.sort((a, b) => a.start - b.start);
    const nonOverlappingRanges: HighlightRange[] = [];
    let lastEnd = -1;
    for (const r of ranges) {
      if (r.start >= lastEnd) {
        nonOverlappingRanges.push(r);
        lastEnd = r.end;
      }
    }

    if (nonOverlappingRanges.length === 0) {
      return (
        <pre className="whitespace-pre-wrap font-mono-code text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
          {text}
        </pre>
      );
    }

    // Build chunks
    const elements: React.ReactNode[] = [];
    let currentIndex = 0;

    nonOverlappingRanges.forEach((range, idx) => {
      if (range.start > currentIndex) {
        elements.push(
          <span key={`text-${idx}`} className="text-stone-300">
            {text.slice(currentIndex, range.start)}
          </span>
        );
      }

      const isSelected = selectedClauseId === range.clause.id;
      const isPredatory = range.clause.classification === 'PREDATORY';
      const isUnfair = range.clause.classification === 'UNFAIR' || range.clause.classification === 'CAUTION';
      const isProtective = range.clause.classification === 'PROTECTIVE';

      let bgClass = 'bg-stone-800 text-stone-200 border-stone-700';
      if (isPredatory) {
        bgClass = isSelected
          ? 'bg-red-500/30 text-red-100 border-red-500 ring-2 ring-red-500/50'
          : 'bg-red-950/40 text-red-200 border-red-800/60 hover:bg-red-900/40';
      } else if (isUnfair) {
        bgClass = isSelected
          ? 'bg-amber-500/30 text-amber-100 border-amber-500 ring-2 ring-amber-500/50'
          : 'bg-amber-950/40 text-amber-200 border-amber-800/60 hover:bg-amber-900/40';
      } else if (isProtective) {
        bgClass = isSelected
          ? 'bg-emerald-500/30 text-emerald-100 border-emerald-500 ring-2 ring-emerald-500/50'
          : 'bg-emerald-950/40 text-emerald-200 border-emerald-800/60 hover:bg-emerald-900/40';
      }

      elements.push(
        <button
          key={`highlight-${idx}`}
          type="button"
          onClick={() => onSelectClause(range.clause.id)}
          className={`inline text-left font-mono-code text-xs sm:text-sm px-1 py-0.5 rounded border transition-all cursor-pointer ${bgClass}`}
          title={`Click to view analysis: ${range.clause.classification}`}
        >
          {text.slice(range.start, range.end)}
        </button>
      );

      currentIndex = range.end;
    });

    if (currentIndex < text.length) {
      elements.push(
        <span key="text-end" className="text-stone-300">
          {text.slice(currentIndex)}
        </span>
      );
    }

    return (
      <div className="whitespace-pre-wrap font-mono-code text-xs sm:text-sm leading-relaxed">
        {elements}
      </div>
    );
  }, [text, clauseAudits, selectedClauseId, onSelectClause]);

  return (
    <div className="flex flex-col h-full bg-stone-900/90 rounded-2xl border border-stone-800 overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Header Bar */}
      <div className="px-4 py-3 border-b border-stone-800 bg-stone-950/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
            Document Verbatim Inspector
          </span>
          <span className="text-stone-600 text-xs">·</span>
          <span className="text-xs text-stone-400 font-mono">
            {wordCount} words
          </span>
          <span className="text-stone-600 text-xs">·</span>
          <span className="text-xs text-stone-400">
            ~{readingTimeMinutes} min read
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Quick search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Find clause..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-28 sm:w-36 pl-8 pr-2 py-1 text-xs bg-stone-900 border border-stone-700/80 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700/60 rounded-lg transition-colors"
            title="Copy entire agreement"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Highlight Legend Bar */}
      {clauseAudits.length > 0 && (
        <div className="px-4 py-2 border-b border-stone-800/80 bg-stone-950/40 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">
              Highlighted Scans:
            </span>
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Predatory Trap
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Unfair / Caution
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Protective
            </span>
          </div>
          <span className="hidden sm:inline text-[11px] text-stone-500 italic">
            Click any highlighted clause to jump to audit
          </span>
        </div>
      )}

      {/* Document Body Area */}
      <div className="flex-1 p-5 overflow-y-auto custom-scrollbar bg-stone-900/50">
        {isEditing ? (
          <textarea
            value={text}
            onChange={(e) => onTextChange && onTextChange(e.target.value)}
            className="w-full h-full min-h-[450px] bg-transparent text-stone-200 font-mono-code text-xs sm:text-sm leading-relaxed p-0 border-0 focus:outline-none focus:ring-0 resize-none"
            placeholder="Paste agreement text here..."
          />
        ) : (
          renderedContent
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2.5 border-t border-stone-800/80 bg-stone-950/90 text-xs text-stone-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>NLP Forensic Parser Active</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{clauseAudits.length} clauses flagged</span>
        </div>
      </div>
    </div>
  );
};
