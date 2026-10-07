import React, { useState, useEffect } from 'react';
import { SAMPLE_AGREEMENTS } from './data/sampleAgreements';
import { ForensicAuditReport, SampleAgreement } from './types/agreement';
import { Navbar } from './components/Navbar';
import { ScoreDial } from './components/ScoreDial';
import { DocumentViewer } from './components/DocumentViewer';
import { ThreatVectorsList } from './components/ThreatVectorsList';
import { ClauseAuditList } from './components/ClauseAuditList';
import { RedlineLetterGenerator } from './components/RedlineLetterGenerator';
import { MissingProtectionsList } from './components/MissingProtectionsList';
import { InvestigatorChat } from './components/InvestigatorChat';
import {
  ShieldAlert,
  FileSearch,
  Sparkles,
  Layers,
  Scale,
  FileText,
  Mail,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Download,
  Edit3,
  Eye,
  RefreshCw,
} from 'lucide-react';

export default function App() {
  const [selectedSample, setSelectedSample] = useState<SampleAgreement>(SAMPLE_AGREEMENTS[0]);
  const [agreementText, setAgreementText] = useState<string>(SAMPLE_AGREEMENTS[0].text);
  const [agreementTitle, setAgreementTitle] = useState<string>(SAMPLE_AGREEMENTS[0].title);
  const [agreementType, setAgreementType] = useState<string>(SAMPLE_AGREEMENTS[0].category);

  const [auditReport, setAuditReport] = useState<ForensicAuditReport | null>(null);
  const [selectedClauseId, setSelectedClauseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'threats' | 'clauses' | 'redlines' | 'missing' | 'chat'>('threats');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Run audit against the server
  const runAudit = async (textToAudit: string, typeHint: string) => {
    if (!textToAudit || textToAudit.trim().length < 30) {
      setError('Please provide at least 30 characters of agreement text to audit.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/audit-agreement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agreementText: textToAudit,
          agreementType: typeHint,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to complete forensic analysis.');
      }

      const report: ForensicAuditReport = await response.json();
      setAuditReport(report);

      // Default to first predatory clause if present
      if (report.clauseAudits && report.clauseAudits.length > 0) {
        const firstPredatory = report.clauseAudits.find(
          (c) => c.classification === 'PREDATORY'
        );
        setSelectedClauseId(firstPredatory ? firstPredatory.id : report.clauseAudits[0].id);
      } else {
        setSelectedClauseId(null);
      }
      setIsEditing(false);
    } catch (err: any) {
      console.error('Audit error:', err);
      setError(err.message || 'An error occurred during agreement analysis.');
    } finally {
      setLoading(false);
    }
  };

  // Run initial audit on load with sample
  useEffect(() => {
    runAudit(SAMPLE_AGREEMENTS[0].text, SAMPLE_AGREEMENTS[0].category);
  }, []);

  const handleSelectSample = (sample: SampleAgreement) => {
    setSelectedSample(sample);
    setAgreementText(sample.text);
    setAgreementTitle(sample.title);
    setAgreementType(sample.category);
    runAudit(sample.text, sample.category);
  };

  const handleFileUpload = (content: string, fileName: string) => {
    setAgreementText(content);
    setAgreementTitle(fileName || 'Uploaded Agreement');
    setAgreementType('Custom Agreement');
    runAudit(content, 'Custom Agreement');
  };

  const handleNewAudit = () => {
    setAgreementText('');
    setAgreementTitle('New Agreement Inspection');
    setAgreementType('Contract / Agreement');
    setAuditReport(null);
    setSelectedClauseId(null);
    setIsEditing(true);
  };

  const handleExportReport = () => {
    if (!auditReport) return;
    const exportData = {
      title: agreementTitle,
      type: agreementType,
      report: auditReport,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vericlause-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onSelectSample={handleSelectSample}
        onFileUpload={handleFileUpload}
        onNewAudit={handleNewAudit}
        currentTitle={agreementTitle}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Document Header & Operational Controls */}
        <div className="bg-stone-900/60 p-4 sm:p-5 rounded-2xl border border-stone-800/80 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-widest text-amber-400">
                AUDIT TARGET:
              </span>
              <span className="text-xs text-stone-400 font-medium">
                {agreementType}
              </span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-stone-100 tracking-tight">
              {agreementTitle}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Toggle Raw Edit / Highlights */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                isEditing
                  ? 'bg-amber-400 text-stone-950 border-amber-400 font-semibold'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:text-white'
              }`}
            >
              {isEditing ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Highlight View</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Raw Text</span>
                </>
              )}
            </button>

            {/* Run / Re-run Audit button */}
            <button
              onClick={() => runAudit(agreementText, agreementType)}
              disabled={loading || !agreementText.trim()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Forensic Audit in Progress...</span>
                </>
              ) : (
                <>
                  <FileSearch className="w-3.5 h-3.5" />
                  <span>Analyze for Traps & Scams</span>
                </>
              )}
            </button>

            {/* Export Report */}
            {auditReport && (
              <button
                onClick={handleExportReport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-800 border border-stone-700 rounded-lg transition-colors cursor-pointer"
                title="Export JSON Report"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export Audit</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Analysis Error: </span>
              {error}
            </div>
          </div>
        )}

        {/* Loading Skeleton Banner */}
        {loading && (
          <div className="p-6 bg-stone-900/60 border border-amber-500/30 rounded-2xl flex items-center justify-center gap-3 text-stone-300 text-sm animate-pulse">
            <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
            <span>
              Extracting clauses, evaluating unconscionability, and detecting predatory trapdoors...
            </span>
          </div>
        )}

        {/* Top Summary Banner (When Report Loaded) */}
        {auditReport && !loading && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Dial Score */}
              <div className="lg:col-span-1">
                <ScoreDial
                  score={auditReport.safetyScore}
                  verdict={auditReport.overallVerdict}
                />
              </div>

              {/* Executive Summary */}
              <div className="lg:col-span-2 p-5 bg-stone-900/80 rounded-2xl border border-stone-800 flex flex-col justify-between shadow-xl">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-amber-400 font-mono font-semibold">
                      Forensic Legal Assessment
                    </span>
                    <span className="text-[11px] text-stone-500 font-mono">
                      {new Date(auditReport.analyzedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                    {auditReport.executiveSummary}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-800/80 flex flex-wrap items-center gap-4 text-xs text-stone-400">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <span>
                      {auditReport.threatIndicators.length} threat vectors
                    </span>
                  </div>
                  <span className="text-stone-700">·</span>
                  <div className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-amber-400" />
                    <span>{auditReport.clauseAudits.length} clauses audited</span>
                  </div>
                  <span className="text-stone-700">·</span>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {auditReport.negotiationRedlines.length} counter-redlines ready
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Workspace Dual Pane: Document on Left, Forensic Hub on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[680px]">
          {/* Left Column: Document Verbatim Viewer (5 cols) */}
          <div className="lg:col-span-5 h-[680px]">
            <DocumentViewer
              text={agreementText}
              clauseAudits={auditReport?.clauseAudits || []}
              selectedClauseId={selectedClauseId}
              onSelectClause={(id) => {
                setSelectedClauseId(id);
                setActiveTab('clauses');
              }}
              onTextChange={(val) => setAgreementText(val)}
              isEditing={isEditing}
            />
          </div>

          {/* Right Column: Forensic Audit Hub (7 cols) */}
          <div className="lg:col-span-7 flex flex-col h-[680px] bg-stone-900/80 rounded-2xl border border-stone-800 overflow-hidden shadow-2xl backdrop-blur-md">
            {/* Tab Navigation Bar */}
            <div className="p-2 border-b border-stone-800 bg-stone-950/90 flex items-center gap-1 overflow-x-auto custom-scrollbar">
              <button
                onClick={() => setActiveTab('threats')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'threats'
                    ? 'bg-stone-800 text-stone-100 shadow-sm border border-stone-700'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span>Threat Vectors</span>
                {auditReport && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-900 text-stone-300">
                    {auditReport.threatIndicators.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('clauses')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'clauses'
                    ? 'bg-stone-800 text-stone-100 shadow-sm border border-stone-700'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Clause Audit</span>
                {auditReport && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-900 text-stone-300">
                    {auditReport.clauseAudits.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('redlines')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'redlines'
                    ? 'bg-stone-800 text-stone-100 shadow-sm border border-stone-700'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>Counter-Letter & Redlines</span>
                {auditReport && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-900 text-stone-300">
                    {auditReport.negotiationRedlines.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('missing')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'missing'
                    ? 'bg-stone-800 text-stone-100 shadow-sm border border-stone-700'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>Safeguards</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-stone-800 text-stone-100 shadow-sm border border-stone-700'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                <span>Ask Investigator</span>
              </button>
            </div>

            {/* Tab Body View */}
            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
              {!auditReport ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <FileSearch className="w-12 h-12 text-stone-600" />
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-stone-200">
                      Ready for Forensic Inspection
                    </h3>
                    <p className="text-xs text-stone-400 max-w-sm">
                      Select one of our preset sample contracts from the top bar or paste your own agreement, then click "Analyze for Traps & Scams".
                    </p>
                  </div>
                  <button
                    onClick={() => runAudit(agreementText, agreementType)}
                    className="px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow cursor-pointer"
                  >
                    Run Forensic Scan Now
                  </button>
                </div>
              ) : (
                <>
                  {activeTab === 'threats' && (
                    <ThreatVectorsList threats={auditReport.threatIndicators} />
                  )}

                  {activeTab === 'clauses' && (
                    <ClauseAuditList
                      clauses={auditReport.clauseAudits}
                      selectedClauseId={selectedClauseId}
                      onSelectClause={(id) => setSelectedClauseId(id)}
                    />
                  )}

                  {activeTab === 'redlines' && (
                    <RedlineLetterGenerator
                      redlines={auditReport.negotiationRedlines}
                      agreementType={auditReport.agreementType}
                    />
                  )}

                  {activeTab === 'missing' && (
                    <MissingProtectionsList
                      missingProtections={auditReport.missingStandardProtections}
                      protectiveClauses={auditReport.protectiveClausesPresent}
                    />
                  )}

                  {activeTab === 'chat' && (
                    <InvestigatorChat
                      agreementText={agreementText}
                      agreementType={auditReport.agreementType}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Preset Agreements Quick Showcase Bar */}
        <div className="pt-4 border-t border-stone-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-stone-400 font-semibold">
              Quick Test Agreements & Scam Scenarios:
            </span>
            <span className="text-xs text-stone-500">
              Click any scenario to immediately load and audit
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {SAMPLE_AGREEMENTS.map((sample) => {
              const isCurrent = sample.id === selectedSample?.id;
              return (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-stone-900 border-amber-500 ring-1 ring-amber-500/40 shadow-lg'
                      : 'bg-stone-900/40 border-stone-800 hover:border-stone-700 hover:bg-stone-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
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
                    <span className="text-[10px] text-stone-500 truncate">
                      {sample.category.split('/')[0]}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-stone-200 line-clamp-1">
                    {sample.title}
                  </h4>
                  <p className="text-[11px] text-stone-400 line-clamp-2 mt-1 leading-snug">
                    {sample.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="mt-12 py-6 border-t border-stone-800/80 bg-stone-950 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>VeriClause NLP Forensic Document Auditor</span>
          <span className="text-stone-600">
            For informational contract risk evaluation · Not a substitute for formal attorney advice
          </span>
        </div>
      </footer>
    </div>
  );
}
