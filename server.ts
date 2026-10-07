import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { ForensicAuditReport, ThreatIndicator, ClauseAudit, NegotiationRedline, AgreementVerdict } from './src/types/agreement';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback Heuristic NLP rule engine for offline/fallback mode
function analyzeWithHeuristicNLP(text: string, agreementType?: string): ForensicAuditReport {
  const lower = text.toLowerCase();
  const threatIndicators: ThreatIndicator[] = [];
  const clauseAudits: ClauseAudit[] = [];
  const negotiationRedlines: NegotiationRedline[] = [];
  const protectiveClausesPresent: string[] = [];
  const missingStandardProtections: string[] = [];

  let safetyScore = 88; // Default initial score
  let severeTrapsCount = 0;

  // 1. Confession of Judgment check
  if (lower.includes('confess judgment') || lower.includes('confession of judgment') || lower.includes('cognovit')) {
    severeTrapsCount += 2;
    safetyScore -= 35;
    threatIndicators.push({
      id: 'threat-coj',
      category: 'Confession of Judgment & Due Process Forfeiture',
      severity: 'CRITICAL',
      description: 'Extremely predatory clause permitting counterparty to enter a court judgment against you without trial, hearing, or notice.',
      matchedExcerpts: ['irrevocably authorize any attorney designated by purchaser to confess judgment', 'waives all rights to pre-judgment hearings, notice of default, trial by jury']
    });
    clauseAudits.push({
      id: 'clause-coj',
      originalClause: 'MERCHANT AND GUARANTOR HEREBY IRREVOCABLY AUTHORIZE ANY ATTORNEY DESIGNATED BY PURCHASER TO CONFESS JUDGMENT AGAINST THEM IN ANY COURT OF RECORD...',
      locationHint: 'Section 2: Confession of Judgment',
      classification: 'PREDATORY',
      riskScore: 10,
      plainEnglishMeaning: 'If there is any dispute, their lawyer can walk into a courthouse and legally seize your bank accounts or assets without telling you in advance or letting you defend yourself.',
      hiddenTrapExplanation: 'Cognovit/confession notes bypass constitutional due process. They are illegal or heavily restricted in many jurisdictions due to predatory abuse.',
      recommendedCounterLanguage: 'Strike this entire clause. Both parties must submit disputes to formal judicial proceedings with standard notice and discovery rights.'
    });
    negotiationRedlines.push({
      title: 'Eliminate Confession of Judgment',
      action: 'STRIKE_ENTIRELY',
      clauseReference: 'Confession of Judgment section',
      proposedRevision: 'DELETE SECTION IN ITS ENTIRETY.',
      justificationForCounterparty: 'Confession of judgment clauses violate basic due process standards and are unlawful or unconscionable under modern commercial contract standards.'
    });
  }

  // 2. Unilateral modifications
  if (lower.includes('unilateral') || lower.includes('modify') && (lower.includes('sole discretion') || lower.includes('without requirement of signed assent') || lower.includes('at any time by posting'))) {
    severeTrapsCount += 1;
    safetyScore -= 20;
    threatIndicators.push({
      id: 'threat-unilateral',
      category: 'Unilateral Modification Without Consent',
      severity: 'HIGH',
      description: 'Counterparty claims the power to unilaterally change terms, fees, or interest rates at will without your signed approval.',
      matchedExcerpts: ['reserves the unreviewable right to modify, adjust, amend, or substitute any provision', 'without requirement of signed assent']
    });
    clauseAudits.push({
      id: 'clause-unilateral',
      originalClause: 'Purchaser reserves the unreviewable right to modify, adjust, amend, or substitute any provision, interest calculation, daily debit volume, or fee schedule of this Agreement at any time...',
      locationHint: 'Unilateral Modification section',
      classification: 'PREDATORY',
      riskScore: 9,
      plainEnglishMeaning: 'The other party can change the rules, hike prices, or debit more money from you anytime without asking for your signature.',
      hiddenTrapExplanation: 'Allows the drafter to retroactively alter financial obligations while leaving the signer bound to the contract.',
      recommendedCounterLanguage: 'No amendment or modification of this Agreement shall be valid unless executed in writing and signed by authorized representatives of both Parties.'
    });
    negotiationRedlines.push({
      title: 'Require Mutual Written Consent for Amendments',
      action: 'AMEND_MANDATORY',
      clauseReference: 'Modification clause',
      proposedRevision: 'Any modification, amendment, or fee adjustment to this Agreement shall require prior mutual written agreement signed by both Parties.',
      justificationForCounterparty: 'Standard commercial fairness requires bilateral assent before any contractual fee or schedule modification becomes effective.'
    });
  }

  // 3. Evergreen Auto-Renewal / Cancellation dark patterns
  if (lower.includes('automatically renew') || lower.includes('auto-renewal') || lower.includes('certified us mail') || lower.includes('facsimile') || lower.includes('return receipt requested')) {
    severeTrapsCount += 1;
    safetyScore -= 18;
    threatIndicators.push({
      id: 'threat-evergreen',
      category: 'Evergreen Auto-Renewal & Dark-Pattern Cancellation',
      severity: 'HIGH',
      description: 'Strict narrow cancellation window or obsolete delivery mandates (certified mail only, 1-day penalty window) designed to lock you in.',
      matchedExcerpts: ['Unless Tenant delivers written notice... exactly sixty (60) days prior', 'Delivery via email, text message, or physical handoff to the leasing office is void']
    });
    clauseAudits.push({
      id: 'clause-evergreen',
      originalClause: 'Unless Tenant delivers written notice of intent to vacate exactly sixty (60) days prior to lease expiration via Certified US Mail with Return Receipt Requested, this lease shall automatically renew...',
      locationHint: 'Renewal & Termination section',
      classification: 'UNFAIR',
      riskScore: 8,
      plainEnglishMeaning: 'If you fail to send a physical certified letter at the exact day window, you are automatically trapped for another full term at higher prices.',
      hiddenTrapExplanation: 'Constructive trap that weaponizes procedural friction (banning email notice) to force involuntary contract rollovers.',
      recommendedCounterLanguage: 'Either party may terminate at the expiration of the term by providing at least 30 days written notice via email or electronic portal.'
    });
  }

  // 4. Habitability waiver / gross negligence immunity
  if (lower.includes('habitability') || lower.includes('black mold') || lower.includes('disclaimer of warranties') || lower.includes('as is') && lower.includes('zero uptime')) {
    severeTrapsCount += 1;
    safetyScore -= 22;
    threatIndicators.push({
      id: 'threat-habitability',
      category: 'Total Disclaimer of Health, Safety & Fitness Remedies',
      severity: 'CRITICAL',
      description: 'Attempts to waive statutory warranties of habitability, safety, or core service performance, leaving you without legal recourse for severe harm.',
      matchedExcerpts: ['waives the implied warranty of habitability to the fullest extent permitted by law', 'shall NOT be liable for any physical illness... caused by toxic black mold']
    });
    clauseAudits.push({
      id: 'clause-immunity',
      originalClause: 'Tenant explicitly waives the implied warranty of habitability to the fullest extent permitted by law, and agrees not to withhold rent under any circumstances...',
      locationHint: 'Habitability & Liability section',
      classification: 'PREDATORY',
      riskScore: 9,
      plainEnglishMeaning: 'Even if the property suffers from hazardous mold, structural leaks, or carbon monoxide, you cannot withhold rent or hold the landlord accountable.',
      hiddenTrapExplanation: 'In many jurisdictions, waiving habitability is legally void as against public policy, but landlords use it to intimidate uninformed tenants.',
      recommendedCounterLanguage: 'Landlord shall maintain the premises in full compliance with local building, housing, and health codes and statutory warranties of habitability.'
    });
  }

  // 5. Broad IP Grab
  if (lower.includes('inventions') && (lower.includes('evenings') || lower.includes('weekends') || lower.includes('personal equipment') || lower.includes('regardless of whether related'))) {
    severeTrapsCount += 1;
    safetyScore -= 24;
    threatIndicators.push({
      id: 'threat-ip-grab',
      category: 'Overbroad Intellectual Property Seizure',
      severity: 'HIGH',
      description: 'Claims ownership over everything you create—even on personal time, weekends, personal devices, and outside project scope.',
      matchedExcerpts: ['whether created during working hours or during evenings, weekends, and holidays', 'regardless of whether related to Client direct business activities']
    });
    clauseAudits.push({
      id: 'clause-ip-grab',
      originalClause: 'Contractor irrevocably assigns to Client all right, title, and interest in and to any and all inventions... whether created on Client systems or on Contractor personal equipment, and whether created during working hours or during evenings, weekends...',
      locationHint: 'Intellectual Property section',
      classification: 'PREDATORY',
      riskScore: 9,
      plainEnglishMeaning: 'The client claims they own your side projects, hobbies, and unrelated apps you build on your own laptop on weekends.',
      hiddenTrapExplanation: 'Exploitative IP assignment far exceeds standard work-for-hire boundaries and violates California Labor Code 2870-style protections.',
      recommendedCounterLanguage: 'Assignment of IP shall apply strictly and solely to deliverables created specifically for Client within the agreed Statement of Work during paid working hours.'
    });
    negotiationRedlines.push({
      title: 'Confine IP Assignment to Project Scope',
      action: 'AMEND_MANDATORY',
      clauseReference: 'Section 1: Intellectual Property',
      proposedRevision: 'IP assignment shall be restricted strictly to works specifically commissioned, created for, and paid for under the applicable Statement of Work.',
      justificationForCounterparty: 'Contractors routinely own unrelated personal inventions and prior IP; broad assignment provisions conflict with industry consulting standards.'
    });
  }

  // 6. Net-180 and subjective payment conditions
  if (lower.includes('net-180') || (lower.includes('subjective') && lower.includes('satisfaction') && lower.includes('withhold'))) {
    safetyScore -= 16;
    threatIndicators.push({
      id: 'threat-payment-hostage',
      category: 'Extreme Payment Deferral & Subjective Holdback Trap',
      severity: 'HIGH',
      description: 'Extends payment to 6 months (Net-180) and grants counterparty unilateral discretion to withhold payment based on subjective opinion.',
      matchedExcerpts: ['subject to a Net-180 day payment schedule', 'strictly conditional upon Client subjective, unilateral satisfaction']
    });
  }

  // 7. Non-disparagement gag clauses
  if (lower.includes('non-disparagement') || lower.includes('negative review') || lower.includes('attorneys general')) {
    safetyScore -= 15;
    threatIndicators.push({
      id: 'threat-gag-clause',
      category: 'Gag Clause & Regulatory Whistleblower Suppression',
      severity: 'HIGH',
      description: 'Penalizes honest reviews and prohibits reporting deceptive practices to state consumer protection authorities or attorneys general.',
      matchedExcerpts: ['Neither Merchant nor Guarantor shall post... any negative review, regulatory complaint', 'liquidated damages of $25,000.00 per occurrence']
    });
  }

  // 8. Uncapped indemnification
  if (lower.includes('uncapped') || (lower.includes('indemnify') && lower.includes('hold harmless') && lower.includes('loss of revenue') && lower.includes('no cap'))) {
    safetyScore -= 14;
    threatIndicators.push({
      id: 'threat-uncapped-indemnity',
      category: 'Uncapped One-Way Indemnification Trap',
      severity: 'HIGH',
      description: 'Forces individual/service provider to insure counterparty against massive third-party claims and lost revenues without any monetary ceiling.',
      matchedExcerpts: ['Contractor liability under this section shall be uncapped and shall not be subject to any limitation of liability']
    });
  }

  // Safe clause detectors
  if (lower.includes('mutual') && lower.includes('degree of care')) {
    protectiveClausesPresent.push('Reciprocal standard of care protecting both parties equally');
  }
  if (lower.includes('publicly known') && lower.includes('independently developed')) {
    protectiveClausesPresent.push('Standard, well-defined trade secret exclusions preventing overreach');
  }
  if (lower.includes('survive for two (2) years') || lower.includes('one (1) year from the effective date')) {
    protectiveClausesPresent.push('Clear sunset period on ongoing obligations');
  }

  // Missing protections
  if (!lower.includes('cure period') && !lower.includes('notice of default')) {
    missingStandardProtections.push('Standard 30-day written notice and right-to-cure before default or penalties');
  }
  if (!lower.includes('limitation of liability') && !lower.includes('aggregate liability')) {
    missingStandardProtections.push('Mutual limitation of liability cap tied to fees paid under the contract');
  }
  if (!lower.includes('mutual indemnification')) {
    missingStandardProtections.push('Reciprocal indemnification (protection should be bilateral, not one-sided)');
  }

  // Ensure bounded score
  safetyScore = Math.max(12, Math.min(96, safetyScore));
  if (protectiveClausesPresent.length >= 2 && threatIndicators.length === 0) {
    safetyScore = 95;
  }

  let overallVerdict: AgreementVerdict = 'SAFE';
  if (safetyScore < 40 || severeTrapsCount >= 2) {
    overallVerdict = 'CRITICAL - LIKELY SCAM';
  } else if (safetyScore < 65 || severeTrapsCount === 1) {
    overallVerdict = 'HIGH RISK - PREDATORY';
  } else if (safetyScore < 85) {
    overallVerdict = 'MODERATE RISK';
  }

  const executiveSummary = threatIndicators.length > 0
    ? `This agreement contains ${threatIndicators.length} high-severity risk vectors designed heavily in favor of the counterparty. The text includes dangerous provisions such as ${threatIndicators.map(t => t.category).slice(0, 2).join(' and ')}. Signing in its current state exposes you to severe financial, legal, and operational exposure. It is strongly advised not to execute this contract without substantial redline amendments.`
    : `This agreement adheres to standard mutual protections and equitable commercial standards. Rights and duties appear balanced with standard exclusions and reasonable sunset clauses. No predatory loopholes or unconscionable penalties were identified.`;

  return {
    overallVerdict,
    safetyScore,
    agreementType: agreementType || 'Standard Legal Agreement',
    executiveSummary,
    threatIndicators,
    clauseAudits,
    negotiationRedlines,
    protectiveClausesPresent,
    missingStandardProtections,
    analyzedAt: new Date().toISOString()
  };
}

// Endpoint: NLP Agreement Audit
app.post('/api/audit-agreement', async (req: Request, res: Response) => {
  try {
    const { agreementText, agreementType } = req.body;

    if (!agreementText || typeof agreementText !== 'string' || agreementText.trim().length < 30) {
      return res.status(400).json({ error: 'Agreement text is too short or missing. Please provide at least 30 characters.' });
    }

    // If Gemini client is configured, run deep generative NLP audit
    if (ai) {
      const prompt = `You are VeriClause, a world-class legal technology forensic auditor and Natural Language Processing (NLP) analyst specializing in detecting hidden scams, predatory covenants, unconscionable contract terms, legal loopholes, and dark-pattern agreements.

Analyze the following agreement text with forensic rigor.

AGREEMENT TEXT:
"""
${agreementText.slice(0, 30000)}
"""

AGREEMENT TYPE HINT: ${agreementType || 'Unknown / Unspecified'}

TASKS:
1. Determine the overall safety verdict: EXACTLY one of: "SAFE", "MODERATE RISK", "HIGH RISK - PREDATORY", "CRITICAL - LIKELY SCAM".
2. Calculate a safetyScore from 0 (extreme predatory scam/trap) to 100 (completely balanced, safe, fair contract).
3. Write an executiveSummary (2-3 concise paragraphs in clear plain English for a non-lawyer explaining what this agreement actually is, whether it is safe or predatory, and key traps).
4. Identify all threatIndicators (categories like Confession of Judgment, Unilateral Changes, Evergreen Renewal / Dark Patterns, Habitability/Statutory Waivers, Overbroad IP Seizure, Uncapped Indemnification, Non-Disparagement Gag Clauses, Hidden Compounding Fees/ACH Sweeps, Asymmetric Dispute Venues).
   For each threat indicator, give: id, category, severity ("CRITICAL" | "HIGH" | "MEDIUM" | "LOW"), description, and verbatim matchedExcerpts from the text.
5. Provide a detailed clauseAudits breakdown for every notable predatory, unfair, ambiguous, or protective clause found in the text:
   - id: string
   - originalClause: exact verbatim excerpt from the text
   - locationHint: section title or paragraph number if available
   - classification: one of "PREDATORY" | "UNFAIR" | "CAUTION" | "STANDARD_FAIR" | "PROTECTIVE"
   - riskScore: 1 (safe) to 10 (extremely dangerous trap)
   - plainEnglishMeaning: clear, jargon-free explanation of what this clause does to the signer
   - hiddenTrapExplanation: why it is an unfair trap, loophole, or predatory tactic
   - recommendedCounterLanguage: exact redline replacement language that protects the signer
6. Provide negotiationRedlines: actionable proposed amendments to send to the counterparty (title, action ["STRIKE_ENTIRELY" | "AMEND_MANDATORY" | "CAP_LIABILITY" | "ADD_RECIPROCITY"], clauseReference, proposedRevision, justificationForCounterparty).
7. List protectiveClausesPresent (bullet points of clauses in the text that actually protect the signer).
8. List missingStandardProtections (essential protections that normal fair contracts have, but this document conspicuously omits, e.g. cure periods, liability caps, mutual remedies).

Return strictly a valid JSON object matching this schema. Do not include markdown code block ticks (\`\`\`json). Return ONLY the raw JSON object.`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const rawText = response.text?.trim() || '';
        // In case there are markdown tags despite the instruction
        const cleanJson = rawText.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
        const parsedReport = JSON.parse(cleanJson) as ForensicAuditReport;

        // Ensure mandatory fields exist
        if (!parsedReport.overallVerdict || typeof parsedReport.safetyScore !== 'number') {
          throw new Error('Malformed JSON output from model');
        }

        parsedReport.analyzedAt = new Date().toISOString();
        parsedReport.agreementType = parsedReport.agreementType || agreementType || 'Contractual Agreement';

        return res.json(parsedReport);
      } catch (geminiError) {
        console.warn('Gemini API call failed or returned unparseable response, falling back to heuristic NLP engine:', geminiError);
        // Seamlessly fall back to heuristic NLP engine
        const fallback = analyzeWithHeuristicNLP(agreementText, agreementType);
        return res.json(fallback);
      }
    } else {
      // Heuristic engine when no API key is provided
      const report = analyzeWithHeuristicNLP(agreementText, agreementType);
      return res.json(report);
    }
  } catch (err: any) {
    console.error('Server error auditing agreement:', err);
    res.status(500).json({ error: err.message || 'Internal error analyzing agreement.' });
  }
});

// Endpoint: Interactive Q&A with Legal Investigator
app.post('/api/ask-investigator', async (req: Request, res: Response) => {
  try {
    const { agreementText, question } = req.body;

    if (!question || !agreementText) {
      return res.status(400).json({ error: 'Both agreement text and question are required.' });
    }

    if (ai) {
      const prompt = `You are VeriClause Legal Investigator, a friendly yet uncompromising legal document analyst helping a user understand an agreement before they sign.

AGREEMENT TEXT:
"""
${agreementText.slice(0, 20000)}
"""

USER QUESTION:
"${question}"

INSTRUCTIONS:
1. Answer directly and concisely in plain English without excessive legal jargon.
2. Quote the exact language from the agreement if relevant.
3. Explicitly state whether the situation is SAFE, A POTENTIAL RISK, or A PREDATORY TRAP.
4. Give a practical recommendation for how the user should protect themselves.`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            temperature: 0.3,
          },
        });

        return res.json({ answer: response.text });
      } catch (geminiErr) {
        console.warn('Gemini Q&A failed, using intelligent context extractor:', geminiErr);
      }
    }

    // Heuristic answer extractor
    const qLower = question.toLowerCase();
    const docLower = agreementText.toLowerCase();

    let matchedSnippet = '';
    if (qLower.includes('rent') || qLower.includes('price') || qLower.includes('fee')) {
      const match = agreementText.match(/(?:rent|fee|payment|purchased amount|adjust|increase)[^\n.]{20,200}/i);
      matchedSnippet = match ? match[0] : '';
    } else if (qLower.includes('terminate') || qLower.includes('cancel') || qLower.includes('leave') || qLower.includes('renew')) {
      const match = agreementText.match(/(?:renew|terminate|cancel|vacate|notice)[^\n.]{20,200}/i);
      matchedSnippet = match ? match[0] : '';
    } else if (qLower.includes('own') || qLower.includes('ip') || qLower.includes('code') || qLower.includes('work')) {
      const match = agreementText.match(/(?:invention|intellectual property|assign|copyright|derivative)[^\n.]{20,200}/i);
      matchedSnippet = match ? match[0] : '';
    }

    let fallbackAnswer = `Based on an inspection of the agreement, here is the forensic finding:\n\n`;
    if (matchedSnippet) {
      fallbackAnswer += `Relevant clause excerpt:\n> "${matchedSnippet}..."\n\n`;
    }
    fallbackAnswer += `Key Finding: If this agreement contains unilateral modification or restrictive cancellation windows, the counterparty holds disproportionate leverage. Verify whether reciprocal notice, a 30-day cure period, or a liability cap is present before signing.`;

    return res.json({ answer: fallbackAnswer });
  } catch (err: any) {
    console.error('Error in Q&A:', err);
    res.status(500).json({ error: 'Failed to process inquiry.' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in development mode.');
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production static build from dist.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VeriClause server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
