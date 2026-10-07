import React, { useState } from 'react';
import { NegotiationRedline } from '../types/agreement';
import { Mail, Copy, Check, FileCheck, CheckSquare, Square } from 'lucide-react';

interface RedlineLetterGeneratorProps {
  redlines: NegotiationRedline[];
  agreementType: string;
}

export const RedlineLetterGenerator: React.FC<RedlineLetterGeneratorProps> = ({
  redlines,
  agreementType,
}) => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>(
    redlines.map((_, i) => i)
  );
  const [copied, setCopied] = useState(false);
  const [senderName, setSenderName] = useState('Prospective Signer / Party');
  const [recipientName, setRecipientName] = useState('Legal / Contract Administrator');

  const toggleSelect = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIndices.length === redlines.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(redlines.map((_, i) => i));
    }
  };

  // Generate full formal counter-proposal letter
  const generateFormalLetter = () => {
    const chosenRedlines = redlines.filter((_, idx) => selectedIndices.includes(idx));

    return `Subject: Proposed Clarifications & Amendments - ${agreementType}

Dear ${recipientName},

Thank you for providing the draft of the ${agreementType}. We have completed a comprehensive review of the terms and are enthusiastic about moving forward.

To ensure the agreement reflects standard commercial practices and balanced risk allocation for both parties, we request the following key amendments prior to signature:

${chosenRedlines
  .map(
    (item, i) => `--- ITEM ${i + 1}: ${item.title.toUpperCase()} ---
Action Required: ${item.action.replace('_', ' ')}
Clause Reference: ${item.clauseReference}
Proposed Revision:
"${item.proposedRevision}"

Rationale:
${item.justificationForCounterparty}
`
  )
  .join('\n')}

Please review these redlines and let us know if you can provide an updated execution copy reflecting these standard modifications. We look forward to executing the agreement once finalized.

Sincerely,
${senderName}`;
  };

  const handleCopyLetter = () => {
    const letter = generateFormalLetter();
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (redlines.length === 0) {
    return (
      <div className="p-8 text-center bg-stone-900/40 rounded-2xl border border-stone-800/80 space-y-3">
        <FileCheck className="w-10 h-10 text-emerald-400 mx-auto" />
        <h3 className="text-base font-semibold text-stone-200">
          No Redlines Required
        </h3>
        <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
          This agreement does not require emergency redlines. It already conforms to standard balanced norms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-800">
        <div>
          <h3 className="text-sm font-semibold text-stone-200 uppercase tracking-wider">
            Formal Counter-Offer & Redline Generator
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Ready-to-send negotiation letter with professional justifications to counter predatory clauses
          </p>
        </div>

        <button
          onClick={handleCopyLetter}
          disabled={selectedIndices.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied Letter!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Full Counter-Letter</span>
            </>
          )}
        </button>
      </div>

      {/* Configuration Controls */}
      <div className="p-3.5 bg-stone-900/80 rounded-xl border border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1">
            Sender Name / Title
          </label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-stone-400 mb-1">
            Recipient / Counterparty Name
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Item Selection List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>Select redlines to include in counter-letter:</span>
          <button
            onClick={toggleSelectAll}
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            {selectedIndices.length === redlines.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="space-y-2">
          {redlines.map((redline, idx) => {
            const isSelected = selectedIndices.includes(idx);
            return (
              <div
                key={idx}
                onClick={() => toggleSelect(idx)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-stone-900/90 border-amber-500/60 text-stone-200'
                    : 'bg-stone-950/40 border-stone-800/80 text-stone-400 opacity-60'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Square className="w-4 h-4 text-stone-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-stone-200">
                        {redline.title}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-300">
                        {redline.action.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 font-mono">
                      Ref: {redline.clauseReference}
                    </p>
                    <p className="text-xs text-amber-200/90 italic bg-stone-950/80 p-2 rounded border border-stone-800">
                      "{redline.proposedRevision}"
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview Box */}
      <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-400 uppercase tracking-wider">
          <Mail className="w-3.5 h-3.5 text-amber-400" />
          <span>Letter Live Preview</span>
        </div>
        <pre className="font-mono-code text-xs text-stone-300 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto custom-scrollbar bg-stone-900/60 p-3 rounded-lg border border-stone-800/80">
          {generateFormalLetter()}
        </pre>
      </div>
    </div>
  );
};
