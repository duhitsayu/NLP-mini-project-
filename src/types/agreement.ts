export type RiskSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ClauseClassification = 
  | 'PREDATORY' 
  | 'UNFAIR' 
  | 'CAUTION' 
  | 'STANDARD_FAIR' 
  | 'PROTECTIVE';

export type AgreementVerdict = 
  | 'SAFE' 
  | 'MODERATE RISK' 
  | 'HIGH RISK - PREDATORY' 
  | 'CRITICAL - LIKELY SCAM';

export interface ThreatIndicator {
  id: string;
  category: string;
  severity: RiskSeverity;
  description: string;
  matchedExcerpts: string[];
}

export interface ClauseAudit {
  id: string;
  originalClause: string;
  locationHint?: string;
  classification: ClauseClassification;
  riskScore: number; // 1-10
  plainEnglishMeaning: string;
  hiddenTrapExplanation: string;
  recommendedCounterLanguage: string;
}

export interface NegotiationRedline {
  title: string;
  action: 'STRIKE_ENTIRELY' | 'AMEND_MANDATORY' | 'CAP_LIABILITY' | 'ADD_RECIPROCITY';
  clauseReference: string;
  proposedRevision: string;
  justificationForCounterparty: string;
}

export interface ForensicAuditReport {
  overallVerdict: AgreementVerdict;
  safetyScore: number; // 0 to 100
  agreementType: string;
  executiveSummary: string;
  threatIndicators: ThreatIndicator[];
  clauseAudits: ClauseAudit[];
  negotiationRedlines: NegotiationRedline[];
  protectiveClausesPresent: string[];
  missingStandardProtections: string[];
  analyzedAt: string;
}

export interface SampleAgreement {
  id: string;
  title: string;
  category: string;
  riskBadge: 'SAFE' | 'PREDATORY' | 'SCAM';
  description: string;
  text: string;
}
