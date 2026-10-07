import React, { useRef } from 'react';
import { ShieldCheck, Upload, FileText, ChevronDown, Sparkles } from 'lucide-react';
import { SAMPLE_AGREEMENTS } from '../data/sampleAgreements';
import { SampleAgreement } from '../types/agreement';

interface NavbarProps {
  onSelectSample: (sample: SampleAgreement) => void;
  onFileUpload: (text: string, fileName: string) => void;
  onNewAudit: () => void;
  currentTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectSample,
  onFileUpload,
  onNewAudit,
  currentTitle,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onFileUpload(content, file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="sticky top-0 z-50 bg-stone-950/90 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-stone-100">
                VeriClause
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest text-amber-400/90 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                NLP FORENSICS
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Agreement Scam, Trap & Predatory Clause Verifier
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Preset Sample Selector Menu */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-stone-100 bg-stone-900 hover:bg-stone-800 border border-stone-700/80 rounded-lg transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Preset Agreements</span>
              <span className="md:hidden">Presets</span>
              <ChevronDown className="w-3 h-3 text-stone-500" />
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 mt-1 w-72 sm:w-80 bg-stone-950 border border-stone-800 rounded-xl shadow-2xl p-2 hidden group-hover:block hover:block z-50">
              <div className="text-[10px] uppercase tracking-wider text-stone-500 px-2 py-1 font-semibold">
                Select Test Agreement:
              </div>
              <div className="space-y-1">
                {SAMPLE_AGREEMENTS.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => onSelectSample(sample)}
                    className="w-full text-left p-2 rounded-lg hover:bg-stone-900 transition-colors flex items-start gap-2 cursor-pointer group/item"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-stone-200 group-hover/item:text-amber-300 truncate">
                          {sample.title}
                        </span>
                        <span
                          className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded border ${
                            sample.riskBadge === 'SAFE'
                              ? 'text-emerald-400 border-emerald-800 bg-emerald-950/40'
                              : sample.riskBadge === 'SCAM'
                              ? 'text-red-400 border-red-800 bg-red-950/40'
                              : 'text-orange-400 border-orange-800 bg-orange-950/40'
                          }`}
                        >
                          {sample.riskBadge}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 truncate mt-0.5">
                        {sample.category}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* File Upload Trigger */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt,.md,.doc"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-stone-100 bg-stone-900 hover:bg-stone-800 border border-stone-700/80 rounded-lg transition-colors cursor-pointer"
            title="Upload agreement (.txt, .md)"
          >
            <Upload className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden sm:inline">Upload Doc</span>
          </button>

          {/* New Audit Button */}
          <button
            onClick={onNewAudit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-stone-950" />
            <span>New Audit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
