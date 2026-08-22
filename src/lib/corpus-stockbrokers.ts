// ─────────────────────────────────────────────────────────────
// NIYAMA — Real corpus: SEBI Master Circular for Stock Brokers
//
// Intermediary category: STOCK BROKER (single corpus, deep).
// Source (verbatim, fetched & parsed from the primary SEBI PDF):
//   Master Circular for Stock Brokers
//   Ref  SEBI/HO/MIRSD/MIRSD-PoD/P/CIR/2025/90 · 17 Jun 2025 · MIRSD
//   PDF  https://www.sebi.gov.in/sebi_data/attachdocs/jun-2025/1750158789381.pdf
//
// Every obligation below carries a verbatim source span that MUST appear in
// SECTION_TEXT (the anchor proof). This is not paraphrase — it is the register
// NIYAMA emits, clause-anchored to the actual circular.
// ─────────────────────────────────────────────────────────────

import type { ObligationRecord, GoldObligation, SourceCitation } from "./obligation";

export const SB_SOURCE: SourceCitation = {
  document: "SEBI Master Circular for Stock Brokers",
  ref: "SEBI/HO/MIRSD/MIRSD-PoD/P/CIR/2025/90",
  url: "https://www.sebi.gov.in/legal/master-circulars/jun-2025/master-circular-for-stock-brokers_94623.html",
  page: "p. 119–121 (clause 48)",
  publishedDate: "17 Jun 2025",
  retrievedAt: "15 Aug 2026",
};
export const SB_PDF_URL = "https://www.sebi.gov.in/sebi_data/attachdocs/jun-2025/1750158789381.pdf";

// Verbatim section text used for clause-anchor validation. Each obligation's
// sourceSpan is a substring of this block (quotes lifted from the SEBI PDF).
export const SECTION_TEXT = `
CLAUSE 48 — Settlement of Running Account of Client's Funds lying with Trading Member (TM)
48.1.1 The TM, after considering the End of the Day (EOD) obligation of funds across all the Exchanges, shall settle the running accounts at the choice of the clients on quarterly and monthly basis, on the dates stipulated by the Stock Exchanges.
48.1.2 Stock exchanges shall, jointly, issue the annual calendar for the settlement of running account (quarterly and monthly) at the beginning of the financial year.
48.1.3 TM shall ensure that funds, if any, received from clients, whose running account has been settled, remain in the 'Up Streaming Client Nodal Bank Account' and no such funds shall be used for settlement of running account of other clients.
48.2 TM may retain 225% of the total margin liability in all the segments across exchanges.
48.3 Client's running account shall be considered settled only by making actual payment into client's bank account and not by making any journal entries.
48.4 the entire credit balance of client shall be returned to the client by TM, on the upcoming settlement dates of monthly running account settlement cycle (irrespective of settlement cycle preferred by the client).
48.7 The Authorized person is not permitted to accept client's funds and securities.
48.8 Once the TM settles the running account of funds of a client, an intimation shall be sent to the client by SMS on mobile number and also by email. TM shall send the retention statement along with the statement of running accounts to the clients within 5 working days.
48.9 Client shall bring any dispute on the statement of running account, to the notice of TM within 30 working days from the date of the statement.
48.10 Stock exchanges shall develop online system for effective monitoring of timely settlement of running account for funds of client and to verify that excess clients' funds are not retained by the TM.
CLAUSE 40 — Collection and reporting of margins
40.1.2 the TMs/CMs in cash segment are also required to mandatorily collect upfront VaR margins and ELM from their clients.
40.1.8 the TMs/CMs shall report to the Stock Exchange on T+5 day the actual short-collection/ non-collection of all margins from clients.
CLAUSE 62 — Cyber Security and Cyber Resilience
62.44 Stock Brokers shall conduct VAPT at least once in a financial year, engage only CERT-In empaneled organizations, and the final report shall be submitted to the Stock Exchanges within 1 month of completion of VAPT activity.
62.54 All Cyber-attacks, threats, cyber-incidents and breaches experienced by Stock Brokers shall be reported to Stock Exchanges & SEBI within six hours of noticing / detecting.
CLAUSE 19 — Qualified Stock Brokers (QSB)
19.5.5.6 such CISO shall be designated as a Key Managerial Personnel (KMP) and shall directly report to the MD & CEO of the QSB.
CLAUSE 20 — Unique Client Code (UCC) and PAN
20.2.2 The details in the UCC database shall be uploaded within 7 working days of the following month.
20.2.3 records shall be maintained for a period of seven years.
CLAUSE 76 — Investor Grievance Redressal (SCORES)
76.3 investor complaints shall be resolved within fifteen working days.
CLAUSE 14 — Risk Based Supervision
14.2.1 Stock Brokers getting disabled on account of funds shortages on more than three times in a month shall be inspected.
CLAUSE 97 — Upstreaming of Client Funds to Clearing Corporations
97.1 SBs/CMs shall upstream all the clients' clear credit balances to CCs on End of Day (EOD) basis, only in the form of either cash, lien on Fixed Deposit Receipts (FDRs) or pledge of units of Mutual Fund Overnight Schemes (MFOS).
97.4 All payment requests of the client received on a day shall be processed on or before the next settlement day.
CLAUSE 62 — Cyber Security (VAPT remediation)
62.46 Remedial actions on the findings of VAPT shall be completed within three months of submission of the final VAPT report.
`.trim();

const now = Date.UTC(2026, 7, 15) / 1;
const prov = (page: string) => ({ model: "azure-ai-foundry/gpt", extractedAt: now, source: { ...SB_SOURCE, page } });

// ── The Obligation Register (real, clause-anchored) ──────────────────────────
export const REGISTER_SB: ObligationRecord[] = [
  // ===== CLAUSE 48 — the end-to-end obligation family =====
  {
    id: "OB-90-48.1.1",
    circularRef: SB_SOURCE.ref,
    clauseAnchor: "Clause 48.1.1",
    sourceSpan: "The TM, after considering the End of the Day (EOD) obligation of funds across all the Exchanges, shall settle the running accounts at the choice of the clients on quarterly and monthly basis, on the dates stipulated by the Stock Exchanges.",
    intermediaryCategory: "Stock Broker",
    ownerRole: "Trading Member — Operations",
    action: "Settle the running account of client funds after considering EOD obligations across all exchanges, on the exchange-stipulated dates, per the client's chosen quarterly/monthly cycle.",
    trigger: "Exchange-stipulated settlement date for the client's cycle",
    frequency: "Quarterly / Monthly (client choice)",
    deadline: "On the date stipulated in the exchanges' annual settlement calendar",
    conditions: ["Consider EOD funds obligation across ALL exchanges before settling"],
    evidenceContract: [
      { artifact: "Settlement register", sourceSystem: "Back-office settlement module", format: "Signed PDF + CSV", retention: "See cl. 20.2.3 (7 yrs, adjacent)" },
      { artifact: "EOD funds-obligation report", sourceSystem: "Risk / margin system", format: "CSV", retention: "7 yrs" },
      { artifact: "Bank UTR / payout records", sourceSystem: "Banking API", format: "UTR log", retention: "7 yrs" },
    ],
    rule: {
      id: "R-48.1.1",
      trigger: "cron: exchange_settlement_calendar(client.cycle)",
      code: "WHEN calendar.settlement_date(client.cycle)\nASSERT settlement.executed(client) == true\n  AND settlement.considers(eod_obligation, scope=all_exchanges)\nEVIDENCE bind(settlement_register, eod_report, bank_utr)\nON FAIL raise(task, severity=CRITICAL, owner=OPS)",
      test: "For every client due on the exchange calendar date, a settlement exists that considered EOD obligations across all exchanges, with a matching bank UTR.",
    },
    category: "Client Assets",
    severity: "critical",
    status: "extracted",
    confidence: 0.97,
    provenance: prov("p. 119 (cl. 48.1.1)"),
    supersedes: ["Clause 47.1.1 (Master Circular 17 May 2023) — 'first Friday' rule"],
    supersededBy: null,
  },
  {
    id: "OB-90-48.2",
    circularRef: SB_SOURCE.ref,
    clauseAnchor: "Clause 48.2",
    sourceSpan: "TM may retain 225% of the total margin liability in all the segments across exchanges.",
    intermediaryCategory: "Stock Broker",
    ownerRole: "Trading Member — Risk",
    action: "Cap funds retained after settlement at 225% of the client's total margin liability across all segments/exchanges.",
    trigger: "On settlement completion",
    frequency: "Per settlement",
    deadline: "At each settlement",
    conditions: ["Retention = EOD pay-in (T & T-1) + margin liability + up to 125% additional margin", "Aggregate cap 225% of total margin liability"],
    evidenceContract: [
      { artifact: "Margin liability report", sourceSystem: "Risk system", format: "CSV", retention: "7 yrs" },
      { artifact: "Retention computation sheet", sourceSystem: "Back-office", format: "PDF", retention: "7 yrs" },
    ],
    rule: {
      id: "R-48.2",
      trigger: "on: settlement.completed",
      code: "WHEN settlement.completed(client)\nASSERT client.retained_funds <= 2.25 * client.total_margin_liability\nEVIDENCE bind(margin_liability_report, retention_sheet)\nON FAIL raise(task, severity=CRITICAL, owner=RISK)",
      test: "Post-settlement retained funds for each client ≤ 225% of that client's total margin liability across segments.",
    },
    category: "Client Assets",
    severity: "critical",
    status: "extracted",
    confidence: 0.95,
    provenance: prov("p. 120 (cl. 48.2)"),
    supersededBy: null,
  },
  {
    id: "OB-90-48.3",
    circularRef: SB_SOURCE.ref,
    clauseAnchor: "Clause 48.3",
    sourceSpan: "Client's running account shall be considered settled only by making actual payment into client's bank account and not by making any journal entries.",
    intermediaryCategory: "Stock Broker",
    ownerRole: "Trading Member — Finance",
    action: "Settle only by actual payment into the client's bank account — never by journal entry.",
    trigger: "On settlement",
    frequency: "Per settlement",
    deadline: "At settlement",
    conditions: ["Journal-entry settlement is non-compliant"],
    evidenceContract: [{ artifact: "Bank payout confirmation (UTR)", sourceSystem: "Banking API", format: "UTR log", retention: "7 yrs" }],
    rule: {
      id: "R-48.3",
      trigger: "on: settlement.recorded",
      code: "WHEN settlement.recorded(client)\nASSERT settlement.method == ACTUAL_BANK_PAYMENT\n  AND settlement.method != JOURNAL_ENTRY\nEVIDENCE bind(bank_utr)\nON FAIL raise(task, severity=HIGH, owner=FINANCE)",
      test: "Every recorded settlement maps to a real bank UTR, not a journal entry.",
    },
    category: "Client Assets",
    severity: "high",
    status: "extracted",
    confidence: 0.96,
    provenance: prov("p. 120 (cl. 48.3)"),
    supersededBy: null,
  },
  {
    id: "OB-90-48.4",
    circularRef: SB_SOURCE.ref,
    clauseAnchor: "Clause 48.4",
    sourceSpan: "the entire credit balance of client shall be returned to the client by TM, on the upcoming settlement dates of monthly running account settlement cycle (irrespective of settlement cycle preferred by the client).",
    intermediaryCategory: "Stock Broker",
    ownerRole: "Trading Member — Operations",
    action: "Return the entire credit balance of any client inactive for 30 days on the next MONTHLY settlement date, regardless of the client's chosen cycle.",
    trigger: "Client credit balance with no transaction for 30 calendar days",
    frequency: "Monthly sweep (event-driven per client)",
    deadline: "Upcoming monthly settlement date",
    conditions: ["Applies even to clients on a quarterly cycle", "Trigger = 30 calendar days of no transaction with a credit balance"],
    evidenceContract: [
      { artifact: "Client inactivity report (30-day)", sourceSystem: "Back-office", format: "CSV", retention: "7 yrs" },
      { artifact: "Settlement register", sourceSystem: "Settlement module", format: "CSV", retention: "7 yrs" },
    ],
    rule: {
      id: "R-48.4",
      trigger: "cron: monthly_settlement_date",
      code: "WHEN client.credit_balance > 0 AND client.no_txn_days >= 30\nASSERT next_monthly_settlement.returns_full_balance(client) == true\nEVIDENCE bind(inactivity_report, settlement_register)\nON FAIL raise(task, severity=HIGH, owner=OPS)",
      test: "Every client with a credit balance and ≥30 days no activity has full balance returned on the next monthly settlement.",
    },
    category: "Client Assets",
    severity: "high",
    status: "extracted",
    confidence: 0.93,
    provenance: prov("p. 120 (cl. 48.4)"),
    supersededBy: null,
  },
  {
    id: "OB-90-48.7",
    circularRef: SB_SOURCE.ref,
    clauseAnchor: "Clause 48.7",
    sourceSpan: "The Authorized person is not permitted to accept client's funds and securities.",
    intermediaryCategory: "Stock Broker",
    ownerRole: "Trading Member — Compliance",
    action: "Ensure Authorized Persons never accept client funds or securities.",
    trigger: "Standing control",
    frequency: "Continuous",
    deadline: "Standing",
    conditions: ["Client funds/securities must flow only to the TM's regulated accounts"],
    evidenceContract: [{ artifact: "AP agreement + fund-flow audit", sourceSystem: "Compliance / bank reconciliation", format: "PDF", retention: "7 yrs" }],
    rule: {
      id: "R-48.7",
      trigger: "on: fund_receipt",
      code: "WHEN fund_or_security.received\nASSERT receiver.role != AUTHORIZED_PERSON\nEVIDENCE bind(bank_reconciliation, ap_agreement)\nON FAIL raise(task, severity=CRITICAL, owner=COMPLIANCE)",
      test: "No client fund/security receipt is attributable to an Authorized Person account.",
    },
    category: "Client Assets",
    severity: "critical",
    status: "extracted",
    confidence: 0.94,
    provenance: prov("p. 120 (cl. 48.7)"),
    supersededBy: null,
  },
  {
    id: "OB-90-48.8",
    circularRef: SB_SOURCE.ref,
    clauseAnchor: "Clause 48.8",
    sourceSpan: "TM shall send the retention statement along with the statement of running accounts to the clients within 5 working days.",
    intermediaryCategory: "Stock Broker",
    ownerRole: "Trading Member — Client Service",
    action: "On settlement, send SMS + email intimation and dispatch the retention statement with the running-account statement within 5 working days.",
    trigger: "On settlement completion",
    frequency: "Per settlement",
    deadline: "Within 5 working days of settlement",
    conditions: ["SMS to registered mobile AND email both required"],
    evidenceContract: [
      { artifact: "SMS + email dispatch log", sourceSystem: "Comms gateway", format: "Log", retention: "7 yrs" },
      { artifact: "Retention statement dispatch record", sourceSystem: "Client-comms system", format: "PDF index", retention: "7 yrs" },
    ],
    rule: {
      id: "R-48.8",
      trigger: "on: settlement.completed",
      code: "WHEN settlement.completed(client)\nASSERT sms.sent(client) AND email.sent(client)\n  AND retention_statement.dispatched_within(working_days=5)\nEVIDENCE bind(sms_log, email_log, dispatch_record)\nON FAIL raise(task, severity=MEDIUM, owner=CLIENT_SERVICE)",
      test: "Every settlement has SMS+email sent and the retention statement dispatched ≤5 working days later.",
    },
    category: "Records / Client Comms",
    severity: "medium",
    status: "extracted",
    confidence: 0.95,
    provenance: prov("p. 121 (cl. 48.8)"),
    supersededBy: null,
  },
  {
    id: "OB-90-48.9",
    circularRef: SB_SOURCE.ref,
    clauseAnchor: "Clause 48.9",
    sourceSpan: "Client shall bring any dispute on the statement of running account, to the notice of TM within 30 working days from the date of the statement.",
    intermediaryCategory: "Stock Broker",
    ownerRole: "Trading Member — Client Service",
    action: "Provide and log a 30-working-day client dispute window on each running-account statement.",
    trigger: "Statement issued",
    frequency: "Per statement",
    deadline: "30 working days from statement date",
    conditions: [],
    evidenceContract: [{ artifact: "Dispute register + statement date log", sourceSystem: "CRM / client-service", format: "CSV", retention: "7 yrs" }],
    rule: {
      id: "R-48.9",
      trigger: "on: statement.issued",
      code: "WHEN statement.issued(client)\nASSERT dispute_window.open_for(working_days=30)\nEVIDENCE bind(dispute_register, statement_log)\nON FAIL raise(task, severity=MEDIUM, owner=CLIENT_SERVICE)",
      test: "Each statement records a dispute window open for 30 working days from its date.",
    },
    category: "Records / Client Comms",
    severity: "medium",
    status: "extracted",
    confidence: 0.9,
    provenance: prov("p. 121 (cl. 48.9)"),
    supersededBy: null,
  },
  {
    id: "OB-90-48.1.3",
    circularRef: SB_SOURCE.ref,
    clauseAnchor: "Clause 48.1.3",
    sourceSpan: "TM shall ensure that funds, if any, received from clients, whose running account has been settled, remain in the 'Up Streaming Client Nodal Bank Account' and no such funds shall be used for settlement of running account of other clients.",
    intermediaryCategory: "Stock Broker",
    ownerRole: "Trading Member — Finance",
    action: "Keep post-settlement client funds in the Up Streaming Client Nodal Bank Account and never use them to settle other clients (anti-commingling).",
    trigger: "Funds received from a settled-account client",
    frequency: "Continuous",
    deadline: "Standing",
    conditions: ["No cross-client use of settled funds"],
    evidenceContract: [{ artifact: "Nodal account ledger + reconciliation", sourceSystem: "Banking / treasury", format: "Statement", retention: "7 yrs" }],
    rule: {
      id: "R-48.1.3",
      trigger: "on: funds.received(settled_client)",
      code: "WHEN funds.received(client.settled == true)\nASSERT funds.location == UP_STREAMING_CLIENT_NODAL_ACCOUNT\n  AND funds.used_for(other_client_settlement) == false\nEVIDENCE bind(nodal_ledger, bank_reconciliation)\nON FAIL raise(task, severity=CRITICAL, owner=FINANCE)",
      test: "Settled-client funds sit in the Up Streaming Client Nodal Bank Account and are never applied to another client's settlement.",
    },
    category: "Client Assets",
    severity: "critical",
    status: "extracted",
    confidence: 0.92,
    provenance: prov("p. 119 (cl. 48.1.3)"),
    supersededBy: null,
  },
  // ===== SPREAD: 8 more real obligations across the circular =====
  {
    id: "OB-90-40.1.8",
    circularRef: SB_SOURCE.ref,
    clauseAnchor: "Clause 40.1.8",
    sourceSpan: "the TMs/CMs shall report to the Stock Exchange on T+5 day the actual short-collection/ non-collection of all margins from clients.",
    intermediaryCategory: "Stock Broker",
    ownerRole: "Trading Member — Risk",
    action: "Report actual short-collection / non-collection of all client margins to the exchange on T+5.",
    trigger: "Trade date T",
    frequency: "Daily (per trade day)",
    deadline: "T+5 day",
    conditions: [],
    evidenceContract: [{ artifact: "Margin short-collection report", sourceSystem: "Risk / margin system", format: "Exchange upload file", retention: "7 yrs" }],
    rule: {
      id: "R-40.1.8",
      trigger: "cron: T+5",
      code: "WHEN day == trade_date + 5\nASSERT margin_shortfall_report.filed(exchange)\nEVIDENCE bind(margin_reporting_file, exchange_ack)\nON FAIL raise(task, severity=HIGH, owner=RISK)",
      test: "For every trade date T, a margin short-collection report is filed with the exchange by T+5.",
    },
    category: "Margins",
    severity: "high",
    status: "extracted",
    confidence: 0.94,
    provenance: prov("cl. 40.1.8"),
    supersededBy: null,
  },
  {
    id: "OB-90-40.1.2",
    circularRef: SB_SOURCE.ref,
    clauseAnchor: "Clause 40.1.2",
    sourceSpan: "the TMs/CMs in cash segment are also required to mandatorily collect upfront VaR margins and ELM from their clients.",
    intermediaryCategory: "Stock Broker",
    ownerRole: "Trading Member — Risk",
    action: "Mandatorily collect upfront VaR margin and ELM from clients in the cash segment.",
    trigger: "Before/at order placement",
    frequency: "Per trade (upfront)",
    deadline: "Upfront",
    conditions: ["Cash segment"],
    evidenceContract: [{ artifact: "Upfront margin collection ledger", sourceSystem: "Risk system", format: "CSV", retention: "7 yrs" }],
    rule: {
      id: "R-40.1.2",
      trigger: "on: order.placed(cash_segment)",
      code: "WHEN order.placed(segment=CASH)\nASSERT client.upfront_margin >= var_margin + elm\nEVIDENCE bind(margin_ledger)\nON FAIL raise(task, severity=HIGH, owner=RISK)",
      test: "Every cash-segment client shows upfront VaR+ELM collected before/at trade.",
    },
    category: "Margins",
    severity: "high",
    status: "extracted",
    confidence: 0.92,
    provenance: prov("cl. 40.1.2"),
    supersededBy: null,
  },
  {
    id: "OB-90-62.54",
    circularRef: SB_SOURCE.ref,
    clauseAnchor: "Clause 62.54",
    sourceSpan: "All Cyber-attacks, threats, cyber-incidents and breaches experienced by Stock Brokers shall be reported to Stock Exchanges & SEBI within six hours of noticing / detecting.",
    intermediaryCategory: "Stock Broker",
    ownerRole: "Stock Broker — CISO / SOC",
    action: "Report all cyber-attacks, incidents and breaches to the exchanges and SEBI within six hours of detection.",
    trigger: "Cyber incident detected",
    frequency: "Event-driven",
    deadline: "Within 6 hours of detection",
    conditions: ["Report to sbdp-cyberincidents@sebi.gov.in and exchanges"],
    evidenceContract: [
      { artifact: "Incident report (Annexure-25)", sourceSystem: "SOC / SIEM", format: "PDF", retention: "5 yrs" },
      { artifact: "CERT-In acknowledgement", sourceSystem: "CERT-In portal", format: "Receipt", retention: "5 yrs" },
    ],
    rule: {
      id: "R-62.54",
      trigger: "event: cyber_incident.detected",
      code: "WHEN cyber_incident.detected(t0)\nASSERT reported_to(exchanges, SEBI) within hours(t0, 6)\nEVIDENCE bind(incident_report, cert_in_ack, siem_alert)\nON FAIL raise(task, severity=CRITICAL, owner=CISO)",
      test: "Every detected cyber incident has an exchange+SEBI report filed within 6 hours of the SOC detection timestamp.",
    },
    category: "Cyber & Tech",
    severity: "critical",
    status: "extracted",
    confidence: 0.95,
    provenance: prov("cl. 62.54"),
    supersededBy: null,
  },
  {
    id: "OB-90-62.44",
    circularRef: SB_SOURCE.ref,
    clauseAnchor: "Clause 62.44",
    sourceSpan: "Stock Brokers shall conduct VAPT at least once in a financial year, engage only CERT-In empaneled organizations, and the final report shall be submitted to the Stock Exchanges within 1 month of completion of VAPT activity.",
    intermediaryCategory: "Stock Broker",
    ownerRole: "Stock Broker — CISO office",
    action: "Conduct VAPT at least once per financial year using a CERT-In empanelled vendor and submit the final report to exchanges within 1 month of completion.",
    trigger: "Financial-year VAPT cycle",
    frequency: "At least annually",
    deadline: "Report within 1 month of VAPT completion",
    conditions: ["Vendor MUST be CERT-In empanelled", "Findings closed within 3 months (cl. 62.46)"],
    evidenceContract: [
      { artifact: "VAPT report", sourceSystem: "CERT-In empanelled vendor", format: "PDF", retention: "5 yrs" },
      { artifact: "Technology Committee approval", sourceSystem: "GRC", format: "Minutes", retention: "5 yrs" },
      { artifact: "Exchange submission receipt", sourceSystem: "Exchange portal", format: "Receipt", retention: "5 yrs" },
    ],
    rule: {
      id: "R-62.44",
      trigger: "cron: financial_year",
      code: "WHEN fy.vapt_cycle\nASSERT vapt.conducted(vendor.cert_in_empanelled == true)\n  AND vapt.report.submitted(exchanges) within days(completion, 30)\nEVIDENCE bind(vapt_report, tech_committee_minutes, exchange_receipt)\nON FAIL raise(task, severity=HIGH, owner=CISO)",
      test: "At least one VAPT per FY by a CERT-In empanelled vendor, report filed with exchanges within 30 days of completion.",
    },
    category: "Cyber & Tech",
    severity: "high",
    status: "extracted",
    confidence: 0.93,
    provenance: prov("cl. 62.44"),
    supersededBy: null,
  },
  {
    id: "OB-90-19.5.5.6",
    circularRef: SB_SOURCE.ref,
    clauseAnchor: "Clause 19.5.5.6",
    sourceSpan: "such CISO shall be designated as a Key Managerial Personnel (KMP) and shall directly report to the MD & CEO of the QSB.",
    intermediaryCategory: "Stock Broker",
    ownerRole: "Qualified Stock Broker — Board",
    action: "Designate the CISO as a KMP reporting directly to the MD & CEO (Qualified Stock Brokers).",
    trigger: "QSB designation",
    frequency: "Standing (quarterly BoD review)",
    deadline: "Standing requirement",
    conditions: ["Applies to Qualified Stock Brokers (QSBs)"],
    evidenceContract: [{ artifact: "Board resolution designating CISO as KMP", sourceSystem: "Board records", format: "PDF", retention: "Permanent" }],
    rule: {
      id: "R-19.5.5.6",
      trigger: "on: qsb.governance_review",
      code: "WHEN entity.is_qsb\nASSERT ciso.designated_as_kmp == true AND ciso.reports_to == MD_CEO\nEVIDENCE bind(board_resolution, org_chart)\nON FAIL raise(task, severity=HIGH, owner=BOARD)",
      test: "For a QSB, a board resolution designates the CISO as KMP reporting to the MD & CEO.",
    },
    category: "Governance",
    severity: "high",
    status: "extracted",
    confidence: 0.9,
    provenance: prov("cl. 19.5.5.6"),
    supersededBy: null,
  },
  {
    id: "OB-90-20.2.2",
    circularRef: SB_SOURCE.ref,
    clauseAnchor: "Clause 20.2.2",
    sourceSpan: "The details in the UCC database shall be uploaded within 7 working days of the following month.",
    intermediaryCategory: "Stock Broker",
    ownerRole: "Stock Broker — KYC / Records",
    action: "Upload the UCC database details within 7 working days of the following month.",
    trigger: "Month end",
    frequency: "Monthly",
    deadline: "Within 7 working days of the following month",
    conditions: ["UCC records retained 7 years (cl. 20.2.3)"],
    evidenceContract: [{ artifact: "UCC upload acknowledgement", sourceSystem: "Exchange UCC portal", format: "Receipt", retention: "7 yrs" }],
    rule: {
      id: "R-20.2.2",
      trigger: "cron: month_end + 7wd",
      code: "WHEN month.ended\nASSERT ucc.uploaded_within(working_days=7)\nEVIDENCE bind(ucc_upload_ack)\nON FAIL raise(task, severity=MEDIUM, owner=KYC)",
      test: "Each month's UCC upload acknowledgement is dated ≤7 working days into the next month.",
    },
    category: "KYC / Records",
    severity: "medium",
    status: "extracted",
    confidence: 0.9,
    provenance: prov("cl. 20.2.2"),
    supersededBy: null,
  },
  {
    id: "OB-90-76.3",
    circularRef: SB_SOURCE.ref,
    clauseAnchor: "Clause 76.3",
    sourceSpan: "investor complaints shall be resolved within fifteen working days.",
    intermediaryCategory: "Stock Broker",
    ownerRole: "Stock Broker — Investor Grievance",
    action: "Resolve investor complaints (SCORES) within fifteen working days.",
    trigger: "Complaint received on SCORES",
    frequency: "Per complaint",
    deadline: "15 working days",
    conditions: ["Additional info requests within 7 working days"],
    evidenceContract: [{ artifact: "SCORES Action Taken Report (ATR)", sourceSystem: "SCORES", format: "ATR", retention: "5 yrs" }],
    rule: {
      id: "R-76.3",
      trigger: "on: complaint.received",
      code: "WHEN complaint.received(t0)\nASSERT complaint.resolved within working_days(t0, 15)\nEVIDENCE bind(scores_atr, complaint_register)\nON FAIL raise(task, severity=HIGH, owner=GRIEVANCE)",
      test: "Every SCORES complaint has an ATR filed within 15 working days of receipt.",
    },
    category: "Investor Grievance",
    severity: "high",
    status: "extracted",
    confidence: 0.92,
    provenance: prov("cl. 76.3"),
    supersededBy: null,
  },
  {
    id: "OB-90-97.1",
    circularRef: SB_SOURCE.ref,
    clauseAnchor: "Clause 97.1",
    sourceSpan: "SBs/CMs shall upstream all the clients' clear credit balances to CCs on End of Day (EOD) basis, only in the form of either cash, lien on Fixed Deposit Receipts (FDRs) or pledge of units of Mutual Fund Overnight Schemes (MFOS).",
    intermediaryCategory: "Stock Broker",
    ownerRole: "Stock Broker — Treasury",
    action: "Upstream all clients' clear credit balances to Clearing Corporations on an EOD basis, only as cash, lien on FDRs, or pledge of MF Overnight Scheme units.",
    trigger: "End of day",
    frequency: "Daily (EOD)",
    deadline: "End of day",
    conditions: ["Permitted instruments only: cash / FDR lien / MFOS pledge"],
    evidenceContract: [{ artifact: "Upstreaming EOD report", sourceSystem: "Treasury / CC interface", format: "CSV", retention: "7 yrs" }],
    rule: {
      id: "R-97.1",
      trigger: "cron: end_of_day",
      code: "WHEN eod\nASSERT client.clear_credit.upstreamed_to(CC) == true\n  AND instrument IN {CASH, FDR_LIEN, MFOS_PLEDGE}\nEVIDENCE bind(upstreaming_report, cc_ack)\nON FAIL raise(task, severity=CRITICAL, owner=TREASURY)",
      test: "Every EOD, all clear client credit balances are upstreamed to the CC in a permitted instrument.",
    },
    category: "Client Assets",
    severity: "critical",
    status: "extracted",
    confidence: 0.93,
    provenance: prov("cl. 97.1"),
    supersededBy: null,
  },
  {
    id: "OB-90-97.4",
    circularRef: SB_SOURCE.ref,
    clauseAnchor: "Clause 97.4",
    sourceSpan: "All payment requests of the client received on a day shall be processed on or before the next settlement day.",
    intermediaryCategory: "Stock Broker",
    ownerRole: "Trading Member — Operations",
    action: "Process every client payment request on or before the next settlement day.",
    trigger: "Client payment request received",
    frequency: "Per request",
    deadline: "On or before the next settlement day",
    conditions: [],
    evidenceContract: [{ artifact: "Payment request register + payout log", sourceSystem: "Back-office / banking", format: "CSV", retention: "7 yrs" }],
    rule: {
      id: "R-97.4",
      trigger: "on: payment_request.received",
      code: "WHEN payment_request.received(day)\nASSERT payout.processed_on_or_before(next_settlement_day(day))\nEVIDENCE bind(request_register, payout_log)\nON FAIL raise(task, severity=HIGH, owner=OPS)",
      test: "Each client payment request is paid out by the next settlement day.",
    },
    category: "Client Assets",
    severity: "high",
    status: "extracted",
    confidence: 0.9,
    provenance: prov("cl. 97.4"),
    supersededBy: null,
  },
  {
    id: "OB-90-62.46",
    circularRef: SB_SOURCE.ref,
    clauseAnchor: "Clause 62.46",
    sourceSpan: "Remedial actions on the findings of VAPT shall be completed within three months of submission of the final VAPT report.",
    intermediaryCategory: "Stock Broker",
    ownerRole: "Stock Broker — CISO office",
    action: "Close all VAPT findings within three months of submitting the final VAPT report.",
    trigger: "Final VAPT report submitted",
    frequency: "Per VAPT cycle",
    deadline: "Within 3 months of report submission",
    conditions: ["Document compensating controls for any deferral"],
    evidenceContract: [{ artifact: "VAPT remediation tracker", sourceSystem: "GRC", format: "CSV", retention: "5 yrs" }],
    rule: {
      id: "R-62.46",
      trigger: "on: vapt_report.submitted",
      code: "WHEN vapt_report.submitted(t0)\nASSERT all(findings).closed_within(months(t0, 3))\nEVIDENCE bind(remediation_tracker, compensating_control_memo)\nON FAIL raise(task, severity=HIGH, owner=CISO)",
      test: "All VAPT findings are closed (or have documented compensating controls) within 3 months of the report.",
    },
    category: "Cyber & Tech",
    severity: "high",
    status: "extracted",
    confidence: 0.9,
    provenance: prov("cl. 62.46"),
    supersededBy: null,
  },
  {
    id: "OB-90-14.2.1",
    circularRef: SB_SOURCE.ref,
    clauseAnchor: "Clause 14.2.1",
    sourceSpan: "Stock Brokers getting disabled on account of funds shortages on more than three times in a month shall be inspected.",
    intermediaryCategory: "Stock Broker",
    ownerRole: "Stock Broker — Compliance (inspection-ready)",
    action: "Avoid funds-shortage disablement >3 times/month; maintain inspection-ready records (risk-based supervision trigger).",
    trigger: "Funds-shortage disablement events",
    frequency: "Monitored monthly",
    deadline: "Ongoing",
    conditions: [">3 disablements/month triggers inspection"],
    evidenceContract: [{ artifact: "Disablement log + funds-adequacy report", sourceSystem: "Risk / treasury", format: "CSV", retention: "7 yrs" }],
    rule: {
      id: "R-14.2.1",
      trigger: "cron: monthly",
      code: "WHEN month.window\nASSERT count(funds_shortage_disablement) <= 3\nEVIDENCE bind(disablement_log, funds_adequacy_report)\nON FAIL raise(task, severity=HIGH, owner=RISK)",
      test: "Monthly funds-shortage disablements ≤3; else flagged for inspection with evidence pack ready.",
    },
    category: "Risk-Based Supervision",
    severity: "high",
    status: "extracted",
    confidence: 0.88,
    provenance: prov("cl. 14.2.1"),
    supersededBy: null,
  },
];

// ── Gold set: hand-labelled independently from the same section text ──────────
// Labelled by us from clause 48 + the spread clauses; the scorer (obligation.ts)
// matches predictions to these on clause anchor + salient action keywords.
export const GOLD_SB: GoldObligation[] = [
  { clauseAnchor: "Clause 48.1.1", ownerRole: "Trading Member — Operations", frequency: "Quarterly / Monthly", severity: "critical", actionKeywords: ["settle", "running account", "eod", "exchange"] },
  { clauseAnchor: "Clause 48.2", ownerRole: "Trading Member — Risk", frequency: "Per settlement", severity: "critical", actionKeywords: ["retain", "225%", "margin"] },
  { clauseAnchor: "Clause 48.3", ownerRole: "Trading Member — Finance", frequency: "Per settlement", severity: "high", actionKeywords: ["actual payment", "bank", "journal"] },
  { clauseAnchor: "Clause 48.4", ownerRole: "Trading Member — Operations", frequency: "Monthly", severity: "high", actionKeywords: ["credit balance", "return", "monthly"] },
  { clauseAnchor: "Clause 48.7", ownerRole: "Trading Member — Compliance", frequency: "Continuous", severity: "critical", actionKeywords: ["authorized person", "not", "funds"] },
  { clauseAnchor: "Clause 48.1.3", ownerRole: "Trading Member — Finance", frequency: "Continuous", severity: "critical", actionKeywords: ["up streaming client nodal", "not use", "other clients"] },
  { clauseAnchor: "Clause 48.8", ownerRole: "Trading Member — Client Service", frequency: "Per settlement", severity: "medium", actionKeywords: ["retention statement", "5 working days", "sms", "email"] },
  { clauseAnchor: "Clause 48.9", ownerRole: "Trading Member — Client Service", frequency: "Per statement", severity: "medium", actionKeywords: ["dispute", "30 working days"] },
  { clauseAnchor: "Clause 40.1.8", ownerRole: "Trading Member — Risk", frequency: "Daily", severity: "high", actionKeywords: ["report", "t+5", "short-collection", "margin"] },
  { clauseAnchor: "Clause 40.1.2", ownerRole: "Trading Member — Risk", frequency: "Per trade", severity: "high", actionKeywords: ["upfront", "var", "elm", "collect"] },
  { clauseAnchor: "Clause 62.54", ownerRole: "Stock Broker — CISO / SOC", frequency: "Event-driven", severity: "critical", actionKeywords: ["cyber", "report", "six hours"] },
  { clauseAnchor: "Clause 62.44", ownerRole: "Stock Broker — CISO office", frequency: "Annually", severity: "high", actionKeywords: ["vapt", "cert-in", "1 month"] },
  { clauseAnchor: "Clause 19.5.5.6", ownerRole: "Qualified Stock Broker — Board", frequency: "Standing", severity: "high", actionKeywords: ["ciso", "kmp", "md"] },
  { clauseAnchor: "Clause 20.2.2", ownerRole: "Stock Broker — KYC / Records", frequency: "Monthly", severity: "medium", actionKeywords: ["ucc", "upload", "7 working days"] },
  { clauseAnchor: "Clause 76.3", ownerRole: "Stock Broker — Investor Grievance", frequency: "Per complaint", severity: "high", actionKeywords: ["complaint", "fifteen working days", "resolve"] },
  { clauseAnchor: "Clause 14.2.1", ownerRole: "Stock Broker — Compliance", frequency: "Monthly", severity: "high", actionKeywords: ["disablement", "funds-shortage", "inspection"] },
  { clauseAnchor: "Clause 97.1", ownerRole: "Stock Broker — Treasury", frequency: "Daily", severity: "critical", actionKeywords: ["upstream", "credit balances", "end of day"] },
  { clauseAnchor: "Clause 97.4", ownerRole: "Trading Member — Operations", frequency: "Per request", severity: "high", actionKeywords: ["payment request", "next settlement day", "process"] },
  { clauseAnchor: "Clause 62.46", ownerRole: "Stock Broker — CISO office", frequency: "Per VAPT cycle", severity: "high", actionKeywords: ["vapt", "three months", "remedial"] },
  // Honest recall probe: a REAL obligation from the same circular that lives
  // OUTSIDE the section text loaded into this demo (clause 44 — maintenance of
  // current accounts in multiple banks). The extractor scoped to SECTION_TEXT
  // legitimately cannot see it → a disclosed recall miss. Precision stays clean;
  // we never fabricate coverage.
  { clauseAnchor: "Clause 44.1", ownerRole: "Stock Broker — Finance", frequency: "Continuous", severity: "medium", actionKeywords: ["current account", "multiple banks", "maintain"] },
];

// ── Amendment / supersession (fully verifiable, real diff) ───────────────────
// Running-account settlement DATE rule: "first Friday" → exchange annual calendar.
export const AMENDMENT = {
  title: "Running-account settlement date rule",
  oldCircular: { ref: "Master Circular for Stock Brokers, 17 May 2023 — clause 47.1.1 (originating 2018 mandate)", url: "https://www.sebi.gov.in/legal/master-circulars/may-2023/master-circular-for-stock-brokers_71219.html" },
  newCircular: { ref: "SEBI/HO/MIRSD/MIRSD-PoD1/P/CIR/2023/197, 28 Dec 2023 (now clause 48.1.1 in the 2025 master circular)", url: "https://www.sebi.gov.in/legal/circulars/dec-2023/settlement-of-running-account-of-client-s-funds-lying-with-the-stock-broker_80371.html" },
  effective: "Quarterly settlement Jan–Mar 2024 & monthly settlement Jan 2024",
  before: {
    clauseAnchor: "Clause 47.1.1 (2023)",
    rule: "Settlement on the first Friday of the quarter/month (single fixed day).",
    quote: "SEBI in 2018 had mandated settlement of running account of client's funds on first Friday of the quarter/month.",
  },
  after: {
    clauseAnchor: "Clause 48.1.1 (2025)",
    rule: "Settle on the dates stipulated by the exchanges (Friday and/or Saturday), per a jointly-issued annual settlement calendar.",
    quote: "shall settle the running accounts at the choice of the clients on quarterly and monthly basis, on the dates stipulated by the Stock Exchanges.",
    added: "New 48.1.2 — exchanges jointly issue an annual settlement calendar; new 48.1.3 anti-commingling safeguard.",
  },
};

// ── Deliberate abstain fixtures — lines that must NOT become broker obligations.
// Demonstrates "what happens when there is no anchor / not in scope".
export const ABSTAIN_FIXTURES = [
  {
    input: "48.10 Stock exchanges shall develop online system for effective monitoring of timely settlement of running account.",
    reason: "Obligation is on the STOCK EXCHANGE, not the stock broker — out of the chosen intermediary scope. NIYAMA abstains rather than mis-assign an owner.",
  },
  {
    input: "Brokers should endeavour to serve clients well and act in good faith at all times.",
    reason: "Aspirational language with no testable trigger/deadline/evidence — not a machine-checkable obligation. No clause anchor in the section. Routed to human review.",
  },
];
