// ─────────────────────────────────────────────────────────────
// NIYAMA — Synthetic regulatory corpus & compliance state
// Modelled on themes from SEBI's Master Circular for Stock Brokers.
// All circular text, dates and firm data below are synthetic demo data.
// ─────────────────────────────────────────────────────────────

export type AgentStep = {
  agent: string;
  icon: "radar" | "scan" | "scale" | "network";
  finding: string;
  confidence: number;
};

export type Obligation = {
  id: string;
  clause: string;
  actor: string;
  action: string;
  deadline: string;
  frequency: string;
  evidence: string[];
  category: string;
  severity: "critical" | "high" | "medium";
  // ── the artifact fields (beat 3) — a machine-readable obligation object ──
  intermediary?: string; // applicable intermediary category
  trigger?: string; // what starts the clock
  test?: string; // verification test (plain-language assertion)
  sourceSpan?: string; // verbatim source anchor
  sourceUrl?: string; // click-through to the actual SEBI document
};

// An amendment landing on an existing rulebook (beat 6) — the live diff.
export type Amendment = {
  headline: string;
  newCircularRef: string;
  newCircularUrl: string;
  effective: string;
  gapHours: number; // issuance → action, measured
  changed: {
    clause: string;
    was: string;
    now: string;
    breaksControl: string; // control/rule that no longer holds
    sopEdit: string; // SOP that must change
    owner: string;
    by: string;
  }[];
};

export type Rule = {
  id: string;
  obligationId: string;
  name: string;
  code: string;
  trigger: string;
};

export type EngineRow = {
  obligationId: string;
  status: "compliant" | "gap" | "pending";
  boundEvidence: string | null;
  note: string;
  task?: string;
};

export type Circular = {
  id: string;
  ref: string;
  title: string;
  date: string;
  category: string;
  impact: "High" | "Medium";
  summary: string;
  excerpt: string;
  intermediary?: string;
  fallback: {
    steps: AgentStep[];
    obligations: Obligation[];
    rules: Rule[];
  };
  engine: EngineRow[];
  amendment?: Amendment;
};

export const circulars: Circular[] = [
  {
    id: "running-account",
    ref: "SEBI/HO/MIRSD/MIRSD-PoD/P/CIR/2025/90",
    title: "Settlement of Running Account of Client's Funds (Clause 48)",
    date: "17 Jun 2025",
    category: "Client Assets",
    impact: "High",
    intermediary: "Stock Broker (Trading Member)",
    summary:
      "Clause 48 of the SEBI Master Circular for Stock Brokers: settle client running accounts on exchange-stipulated dates, cap retention at 225% of margin liability, sweep inactive credit balances, and dispatch the retention statement within 5 working days.",
    excerpt:
      "48.1.1 The TM, after considering the End of the Day (EOD) obligation of funds across all the Exchanges, shall settle the running accounts at the choice of the clients on quarterly and monthly basis, on the dates stipulated by the Stock Exchanges. 48.2 TM may retain 225% of the total margin liability in all the segments across exchanges. 48.4 the entire credit balance of client shall be returned to the client by TM, on the upcoming settlement dates of monthly running account settlement cycle (irrespective of settlement cycle preferred by the client). 48.8 TM shall send the retention statement along with the statement of running accounts to the clients within 5 working days.",
    fallback: {
      steps: [
        { agent: "Watcher Agent", icon: "radar", finding: "Clause 48 detected in the Master Circular for Stock Brokers (…/2025/90, 17 Jun 2025). Applies to all Trading Members holding client running accounts. Supersedes the 2018 'first Friday' rule (clause 47, May-2023 master circular) via amendment …/2023/197.", confidence: 0.97 },
        { agent: "Parser Agent", icon: "scan", finding: "Segmented clause 48 and extracted discrete obligations 48.1.1 / 48.2 / 48.4 / 48.8, each clause-anchored to a verbatim span. Non-obligation line 48.10 (exchange-scope) classified as context and NOT emitted.", confidence: 0.94 },
        { agent: "Interpretation Agent", icon: "scale", finding: "Resolved settlement date to the exchange-issued annual calendar (48.1.2). Encoded the 225% retention as a hard cap and the 30-day inactive sweep as a monthly-cycle guard. No clause anchor ⇒ no obligation.", confidence: 0.91 },
        { agent: "Mapping Agent", icon: "network", finding: "Mapped obligations to the back-office settlement module, risk/margin system, banking API and comms gateway. Owners: Ops, Risk, Client Service. Generated one control + one evidence request per obligation.", confidence: 0.93 },
      ],
      obligations: [
        { id: "OB-48.1.1", clause: "Clause 48.1.1", actor: "Trading Member — Operations", intermediary: "Stock Broker", action: "Settle the running account of client funds after considering EOD obligations across all exchanges, on the exchange-stipulated dates, per the client's chosen quarterly/monthly cycle.", trigger: "Exchange-stipulated settlement date for the client's cycle", deadline: "On the exchanges' annual settlement-calendar date", frequency: "Quarterly / Monthly (client choice)", evidence: ["Settlement register", "EOD funds-obligation report", "Bank UTR / payout records"], test: "For every client due on the exchange calendar date, a settlement exists that considered EOD obligations across all exchanges, with a matching bank UTR.", sourceSpan: "The TM, after considering the End of the Day (EOD) obligation of funds across all the Exchanges, shall settle the running accounts at the choice of the clients on quarterly and monthly basis, on the dates stipulated by the Stock Exchanges.", sourceUrl: "https://www.sebi.gov.in/legal/master-circulars/jun-2025/master-circular-for-stock-brokers_94623.html", category: "Client Assets", severity: "critical" },
        { id: "OB-48.2", clause: "Clause 48.2", actor: "Trading Member — Risk", intermediary: "Stock Broker", action: "Cap funds retained after settlement at 225% of the client's total margin liability across all segments/exchanges.", trigger: "On settlement completion", deadline: "At each settlement", frequency: "Per settlement", evidence: ["Margin liability report", "Retention computation sheet"], test: "Post-settlement retained funds for each client ≤ 225% of that client's total margin liability.", sourceSpan: "TM may retain 225% of the total margin liability in all the segments across exchanges.", sourceUrl: "https://www.sebi.gov.in/legal/master-circulars/jun-2025/master-circular-for-stock-brokers_94623.html", category: "Client Assets", severity: "critical" },
        { id: "OB-48.4", clause: "Clause 48.4", actor: "Trading Member — Operations", intermediary: "Stock Broker", action: "Return the entire credit balance of any client inactive for 30 days on the next MONTHLY settlement date, regardless of the client's chosen cycle.", trigger: "Client credit balance with no transaction for 30 calendar days", deadline: "Upcoming monthly settlement date", frequency: "Monthly sweep", evidence: ["Client inactivity report (30-day)", "Settlement register"], test: "Every client with a credit balance and ≥30 days no activity has full balance returned on the next monthly settlement.", sourceSpan: "the entire credit balance of client shall be returned to the client by TM, on the upcoming settlement dates of monthly running account settlement cycle", sourceUrl: "https://www.sebi.gov.in/legal/master-circulars/jun-2025/master-circular-for-stock-brokers_94623.html", category: "Client Assets", severity: "high" },
        { id: "OB-48.8", clause: "Clause 48.8", actor: "Trading Member — Client Service", intermediary: "Stock Broker", action: "On settlement, send SMS + email intimation and dispatch the retention statement with the running-account statement within 5 working days.", trigger: "On settlement completion", deadline: "Within 5 working days of settlement", frequency: "Per settlement", evidence: ["SMS + email dispatch log", "Retention statement dispatch record"], test: "Every settlement has SMS+email sent and the retention statement dispatched ≤5 working days later.", sourceSpan: "TM shall send the retention statement along with the statement of running accounts to the clients within 5 working days.", sourceUrl: "https://www.sebi.gov.in/legal/master-circulars/jun-2025/master-circular-for-stock-brokers_94623.html", category: "Records / Client Comms", severity: "medium" },
      ],
      rules: [
        { id: "R-48.1.1", obligationId: "OB-48.1.1", name: "running_account_settlement", trigger: "cron: exchange_settlement_calendar(client.cycle)", code: "WHEN calendar.settlement_date(client.cycle)\nASSERT settlement.executed(client) == true\n  AND settlement.considers(eod_obligation, scope=all_exchanges)\nEVIDENCE bind(settlement_register, eod_report, bank_utr)\nON FAIL raise(task, severity=CRITICAL, owner=OPS)" },
        { id: "R-48.2", obligationId: "OB-48.2", name: "retention_cap_225", trigger: "on: settlement.completed", code: "WHEN settlement.completed(client)\nASSERT client.retained_funds <= 2.25 * client.total_margin_liability\nEVIDENCE bind(margin_liability_report, retention_sheet)\nON FAIL raise(task, severity=CRITICAL, owner=RISK)" },
        { id: "R-48.4", obligationId: "OB-48.4", name: "inactive_30d_sweep", trigger: "cron: monthly_settlement_date", code: "WHEN client.credit_balance > 0 AND client.no_txn_days >= 30\nASSERT next_monthly_settlement.returns_full_balance(client) == true\nEVIDENCE bind(inactivity_report, settlement_register)\nON FAIL raise(task, severity=HIGH, owner=OPS)" },
        { id: "R-48.8", obligationId: "OB-48.8", name: "retention_statement_sla", trigger: "on: settlement.completed", code: "WHEN settlement.completed(client)\nASSERT sms.sent(client) AND email.sent(client)\n  AND retention_statement.dispatched_within(working_days=5)\nEVIDENCE bind(sms_log, email_log, dispatch_record)\nON FAIL raise(task, severity=MEDIUM, owner=CLIENT_SERVICE)" },
      ],
    },
    engine: [
      { obligationId: "OB-48.1.1", status: "compliant", boundEvidence: "Settlement register #SR-2026-Q2 · 12,408 accounts · 3 UTRs sampled & matched", note: "All running accounts settled on the exchange calendar date (04 Jul 2026); EOD obligations considered across NSE+BSE." },
      { obligationId: "OB-48.2", status: "compliant", boundEvidence: "Margin liability report bound · max retention 214% (≤225% cap)", note: "No client retained above the 225% margin-liability cap this cycle." },
      { obligationId: "OB-48.4", status: "gap", boundEvidence: null, note: "312 credit-balance clients inactive ≥30 days were NOT returned on the monthly cycle — clause 48.4 breach.", task: "Auto-raised: sweep 312 inactive balances on the next monthly settlement — owner Ops, due 02 Aug 2026. Audit pack generated." },
      { obligationId: "OB-48.8", status: "pending", boundEvidence: "SMS+email dispatch log streaming · 9,980 / 12,408 within SLA", note: "Retention statements dispatching; SLA clock 5 working days." },
    ],
    amendment: {
      headline: "Running-account settlement date rule amended",
      newCircularRef: "SEBI Master Circular for Stock Brokers 2025 — Clause 48.1.1 (in force; via amendment …/2023/197, 28 Dec 2023)",
      newCircularUrl: "https://www.sebi.gov.in/legal/master-circulars/jun-2025/master-circular-for-stock-brokers_94623.html",
      effective: "Quarterly settlement Jan–Mar 2024 & monthly settlement Jan 2024",
      gapHours: 6,
      changed: [
        {
          clause: "Clause 48.1.1 (was 47.1.1)",
          was: "Settle on the first Friday of the quarter/month (single fixed day, 2018 mandate).",
          now: "Settle on the dates stipulated by the exchanges (Friday and/or Saturday), per a jointly-issued annual settlement calendar.",
          breaksControl: "R-48.1.1 — trigger cron:first_friday no longer valid; must bind to the exchange annual calendar.",
          sopEdit: "SOP-OPS-Settlement-Calendar: replace fixed first-Friday schedule with the exchange calendar feed.",
          owner: "Trading Member — Operations",
          by: "Before Jan-2024 settlement cycle",
        },
      ],
    },
  },
  {
    id: "cyber-resilience",
    ref: "SEBI/HO/MIRSD/TPD/P/CIR/2026/07",
    title: "Cybersecurity & Cyber Resilience Framework for Stock Brokers",
    date: "03 Feb 2026",
    category: "Cyber & Tech",
    impact: "High",
    summary:
      "Comprehensive cyber framework: designated CISO, half-yearly VAPT, 6-hour incident reporting, quarterly standing-committee review of cyber posture.",
    excerpt:
      "4.1 Every stock broker shall designate a Chief Information Security Officer (CISO) and constitute a Technology Committee reporting quarterly to the Board. 4.2 Vulnerability Assessment and Penetration Testing (VAPT) shall be conducted at least once in every six months for critical systems, and reports submitted to stock exchanges within one month of completion. 4.3 All cyber incidents shall be reported to the exchange and SEBI within six hours of detection. 4.4 Remedial actions on VAPT findings shall be closed within three months, with compensating controls documented for any deferral.",
    fallback: {
      steps: [
        { agent: "Watcher Agent", icon: "radar", finding: "Circular detected; applicability: all brokers classified as Qualified/Mid-size per prior framework. Diffed against 2023 framework — 3 obligations tightened, 1 new (6-hour reporting).", confidence: 0.96 },
        { agent: "Parser Agent", icon: "scan", finding: "Extracted 4 obligations from paras 4.1–4.4 with clause anchors. Detected definitional dependency on 'critical systems' inventory — linked to Annexure C.", confidence: 0.93 },
        { agent: "Interpretation Agent", icon: "scale", finding: "'Within six hours of detection' interpreted as clock-time from SOC alert acknowledgment (not discovery-in-hindsight) — flagged for officer confirmation. Deferral path in 4.4 encoded as exception workflow requiring documented compensating controls.", confidence: 0.88 },
        { agent: "Mapping Agent", icon: "network", finding: "Mapped to SOC tooling, GRC tracker and Board-pack generator. VAPT cadence joins existing audit calendar; incident SLA wired to SIEM webhook. Owner: CISO office.", confidence: 0.92 },
      ],
      obligations: [
        { id: "OB-201", clause: "Para 4.1", actor: "Broker — Board / CISO", action: "Designate CISO and constitute Technology Committee with quarterly Board reporting", deadline: "Standing requirement", frequency: "Quarterly review", evidence: ["Board resolution", "Committee minutes"], category: "Governance", severity: "high" },
        { id: "OB-202", clause: "Para 4.2", actor: "Broker — CISO office", action: "Conduct VAPT on critical systems and submit report to exchanges", deadline: "Report within 1 month of completion", frequency: "Half-yearly", evidence: ["VAPT report", "Exchange submission receipt"], category: "Cyber & Tech", severity: "critical" },
        { id: "OB-203", clause: "Para 4.3", actor: "Broker — SOC", action: "Report all cyber incidents to exchange and SEBI", deadline: "Within 6 hours of detection", frequency: "Event-driven", evidence: ["SIEM alert log", "Incident report filing"], category: "Cyber & Tech", severity: "critical" },
        { id: "OB-204", clause: "Para 4.4", actor: "Broker — CISO office", action: "Close VAPT remedial actions; document compensating controls for deferrals", deadline: "Within 3 months of report", frequency: "Per VAPT cycle", evidence: ["Remediation tracker", "Compensating-control memo"], category: "Cyber & Tech", severity: "high" },
      ],
      rules: [
        { id: "R-201", obligationId: "OB-201", name: "governance_cadence", trigger: "cron: quarterly", code: "WHEN quarter.ends\nASSERT board_pack.contains(tech_committee_minutes)\n  AND ciso.designation.active\nEVIDENCE bind(board_resolution, minutes)\nON FAIL raise(task, severity=HIGH, owner=CISO)" },
        { id: "R-202", obligationId: "OB-202", name: "vapt_halfyearly", trigger: "cron: 6-monthly + 1M submission window", code: "WHEN months_since(last_vapt) >= 6\nASSERT vapt.completed(critical_systems)\n  AND exchange.submission_within(days=30)\nEVIDENCE bind(vapt_report, submission_receipt)\nON FAIL raise(task, severity=CRITICAL, owner=CISO)" },
        { id: "R-203", obligationId: "OB-203", name: "incident_6h_sla", trigger: "event: siem.incident_ack", code: "WHEN siem.incident_acknowledged\nASSERT report.filed_within(hours=6, to=[exchange, sebi])\nEVIDENCE bind(siem_log, filing_receipt)\nON FAIL raise(task, severity=CRITICAL, owner=SOC, escalate=CISO)" },
        { id: "R-204", obligationId: "OB-204", name: "remediation_90d", trigger: "on: vapt.report_filed + 3M", code: "WHEN days_since(vapt_report) >= 90\nASSERT findings.open == 0\n  OR deferral.compensating_controls.documented\nEVIDENCE bind(remediation_tracker, control_memo)\nON FAIL raise(task, severity=HIGH, owner=CISO)" },
      ],
    },
    engine: [
      { obligationId: "OB-201", status: "compliant", boundEvidence: "Board resolution BR-2026-114 · Q2 minutes filed", note: "Next committee review: 28 Sep 2026" },
      { obligationId: "OB-202", status: "gap", boundEvidence: null, note: "Last VAPT completed 214 days ago — exceeds 6-month cadence by 34 days", task: "Commission VAPT vendor immediately; submission window at risk — assigned to CISO office" },
      { obligationId: "OB-203", status: "compliant", boundEvidence: "SIEM webhook live · 0 open incidents", note: "Median filing time last 4 incidents: 2h 41m" },
      { obligationId: "OB-204", status: "pending", boundEvidence: "Remediation tracker synced", note: "3 of 17 findings open, 41 days remaining" },
    ],
  },
  {
    id: "technical-glitch",
    ref: "SEBI/HO/MIRSD/TPD-1/P/CIR/2026/19",
    title: "Framework to Address Technical Glitches in Trading Systems",
    date: "21 Mar 2026",
    category: "Market Integrity",
    impact: "High",
    summary:
      "Capacity planning at 2× peak load, mandatory disaster-recovery drills, T+1 glitch reporting, and root-cause analysis within 14 days for all technical glitches.",
    excerpt:
      "5.1 Stock brokers shall ensure that the installed capacity of their trading infrastructure is at least twice the peak load observed in the preceding six months. 5.2 Brokers identified as specified brokers shall conduct disaster recovery drills at least once every six months. 5.3 Any technical glitch shall be intimated to the stock exchange by T+1 day of the incident. 5.4 A preliminary root cause analysis (RCA) report shall be submitted within 14 days of the incident, including corrective and preventive measures.",
    fallback: {
      steps: [
        { agent: "Watcher Agent", icon: "radar", finding: "Circular detected; firm classified as 'specified broker' (client base 3.2L > 1L threshold) — all four paras apply, including DR-drill mandate.", confidence: 0.97 },
        { agent: "Parser Agent", icon: "scan", finding: "Extracted 4 obligations from paras 5.1–5.4. Quantitative thresholds parsed: 2× peak capacity, 6-month drill cadence, T+1 and 14-day SLAs.", confidence: 0.95 },
        { agent: "Interpretation Agent", icon: "scale", finding: "'Peak load' interpreted per Annexure definition: orders/sec at 99th percentile over trailing 6 months. Capacity assertion bound to monthly telemetry snapshot, not self-declaration.", confidence: 0.9 },
        { agent: "Mapping Agent", icon: "network", finding: "Mapped to infra telemetry (Grafana export), BCP-DR runbook system and exchange filing gateway. RCA workflow linked to incident-management tool with 14-day timer.", confidence: 0.94 },
      ],
      obligations: [
        { id: "OB-301", clause: "Para 5.1", actor: "Broker — Infrastructure", action: "Maintain installed trading capacity ≥ 2× observed 6-month peak load", deadline: "Continuous", frequency: "Monitored monthly", evidence: ["Capacity telemetry snapshot", "Peak-load report"], category: "Market Integrity", severity: "critical" },
        { id: "OB-302", clause: "Para 5.2", actor: "Specified Broker — BCP team", action: "Conduct disaster recovery drills", deadline: "Every 6 months", frequency: "Half-yearly", evidence: ["DR drill report", "Exchange intimation"], category: "Market Integrity", severity: "high" },
        { id: "OB-303", clause: "Para 5.3", actor: "Broker — Ops", action: "Intimate technical glitches to stock exchange", deadline: "T+1 day of incident", frequency: "Event-driven", evidence: ["Incident ticket", "Exchange filing receipt"], category: "Market Integrity", severity: "critical" },
        { id: "OB-304", clause: "Para 5.4", actor: "Broker — Technology", action: "Submit preliminary RCA with corrective & preventive measures", deadline: "Within 14 days of incident", frequency: "Per incident", evidence: ["RCA report", "CAPA tracker"], category: "Market Integrity", severity: "high" },
      ],
      rules: [
        { id: "R-301", obligationId: "OB-301", name: "capacity_2x_peak", trigger: "cron: monthly telemetry snapshot", code: "WHEN telemetry.monthly_snapshot\nASSERT capacity.installed >= 2 * peak_load(trailing_months=6)\nEVIDENCE bind(telemetry_snapshot, peak_report)\nON FAIL raise(task, severity=CRITICAL, owner=INFRA)" },
        { id: "R-302", obligationId: "OB-302", name: "dr_drill_cadence", trigger: "cron: 6-monthly", code: "WHEN months_since(last_dr_drill) >= 6\nASSERT drill.completed AND exchange.intimated\nEVIDENCE bind(drill_report, intimation)\nON FAIL raise(task, severity=HIGH, owner=BCP)" },
        { id: "R-303", obligationId: "OB-303", name: "glitch_t1_filing", trigger: "event: incident.classified_glitch", code: "WHEN incident.classified == TECHNICAL_GLITCH\nASSERT exchange.filed_by(T_plus=1)\nEVIDENCE bind(incident_ticket, filing_receipt)\nON FAIL raise(task, severity=CRITICAL, owner=OPS)" },
        { id: "R-304", obligationId: "OB-304", name: "rca_14d_sla", trigger: "on: incident.classified_glitch + 14d", code: "WHEN days_since(incident) >= 14\nASSERT rca.submitted AND rca.includes(capa)\nEVIDENCE bind(rca_report, capa_tracker)\nON FAIL raise(task, severity=HIGH, owner=TECH)" },
      ],
    },
    engine: [
      { obligationId: "OB-301", status: "compliant", boundEvidence: "Telemetry snapshot 30 Jun · capacity 2.7× peak", note: "Peak 42k orders/sec · installed 114k" },
      { obligationId: "OB-302", status: "compliant", boundEvidence: "DR drill DR-2026-01 · exchange intimated", note: "Next drill due 14 Nov 2026" },
      { obligationId: "OB-303", status: "gap", boundEvidence: null, note: "Incident INC-7731 (04 Jul, 11 min order-entry degradation) not yet filed — T+1 window closes 17:30 today", task: "File glitch intimation with NSE/BSE before 17:30 IST — assigned to Ops (auto-drafted)" },
      { obligationId: "OB-304", status: "pending", boundEvidence: "RCA timer started 04 Jul", note: "Preliminary RCA due 18 Jul — 12 days remaining" },
    ],
  },
  {
    id: "collateral-reporting",
    ref: "SEBI/HO/MRD/MRD-PoD-2/P/CIR/2026/33",
    title: "Client-level Segregation & Reporting of Collateral",
    date: "05 May 2026",
    category: "Risk & Margin",
    impact: "Medium",
    summary:
      "Daily disaggregated reporting of client collateral to clearing corporations, web-portal disclosure to clients, and prohibition on collateral commingling.",
    excerpt:
      "7.1 Trading Members shall report disaggregated (client-level) collateral information to the Clearing Corporation on a daily basis, by end of day. 7.2 Every TM shall provide clients access to a web portal displaying their collateral placed, utilised and available, updated at least at end of each day. 7.3 Client collateral shall not be commingled with proprietary collateral, nor utilised towards obligations of any other client or of the TM itself.",
    fallback: {
      steps: [
        { agent: "Watcher Agent", icon: "radar", finding: "Circular detected; applies to all TMs clearing derivatives. Interacts with running-account circular — evidence sources overlap; graph edges created to avoid duplicate controls.", confidence: 0.95 },
        { agent: "Parser Agent", icon: "scan", finding: "Extracted 3 obligations from paras 7.1–7.3. Para 7.3 parsed as continuous prohibition (negative obligation) — different rule shape from periodic duties.", confidence: 0.94 },
        { agent: "Interpretation Agent", icon: "scale", finding: "'End of day' anchored to CC cut-off (19:00 IST) per market practice — flagged for officer confirmation. Commingling prohibition compiled as real-time ledger invariant, not batch check.", confidence: 0.89 },
        { agent: "Mapping Agent", icon: "network", finding: "Mapped to collateral ledger, CC reporting API and client portal service. Invariant R-403 wired to ledger transaction hooks — violations block at source.", confidence: 0.92 },
      ],
      obligations: [
        { id: "OB-401", clause: "Para 7.1", actor: "TM — Risk", action: "Report client-level disaggregated collateral to Clearing Corporation", deadline: "EOD daily (19:00 IST cut-off)", frequency: "Daily", evidence: ["CC submission ack", "Collateral ledger extract"], category: "Risk & Margin", severity: "critical" },
        { id: "OB-402", clause: "Para 7.2", actor: "TM — Client Service", action: "Maintain client web portal showing collateral placed / utilised / available, updated EOD", deadline: "EOD daily", frequency: "Daily", evidence: ["Portal update log", "Sample client view"], category: "Disclosure", severity: "high" },
        { id: "OB-403", clause: "Para 7.3", actor: "TM — Risk", action: "Never commingle client collateral with proprietary, nor cross-utilise between clients", deadline: "Continuous invariant", frequency: "Real-time", evidence: ["Ledger invariant attestations", "Exception log (must be empty)"], category: "Client Assets", severity: "critical" },
      ],
      rules: [
        { id: "R-401", obligationId: "OB-401", name: "cc_daily_reporting", trigger: "cron: daily 19:00 IST", code: "WHEN clock == 19:00 IST\nASSERT cc.submission.acknowledged(today)\n  AND submission.granularity == CLIENT_LEVEL\nEVIDENCE bind(cc_ack, ledger_extract)\nON FAIL raise(task, severity=CRITICAL, owner=RISK)" },
        { id: "R-402", obligationId: "OB-402", name: "portal_eod_refresh", trigger: "cron: daily EOD", code: "WHEN day.ends\nASSERT portal.last_refresh >= market_close(today)\n  AND portal.fields ⊇ {placed, utilised, available}\nEVIDENCE bind(update_log, sample_view)\nON FAIL raise(task, severity=HIGH, owner=SERVICE)" },
        { id: "R-403", obligationId: "OB-403", name: "commingling_invariant", trigger: "realtime: ledger transaction hook", code: "INVARIANT on ledger.every_txn\nASSERT txn.client_collateral.segregated == true\n  AND txn.cross_client_utilisation == false\nEVIDENCE bind(invariant_attestation, exception_log)\nON VIOLATION block(txn) AND raise(task, severity=CRITICAL, owner=RISK, escalate=CO)" },
      ],
    },
    engine: [
      { obligationId: "OB-401", status: "compliant", boundEvidence: "CC ack #CC-20260706-1893 · 100% client-level rows", note: "Streak: 118 consecutive on-time submissions" },
      { obligationId: "OB-402", status: "pending", boundEvidence: "Portal refresh running", note: "Tonight's EOD refresh in progress — 68% complete" },
      { obligationId: "OB-403", status: "compliant", boundEvidence: "Invariant attestation · exception log empty (42 days)", note: "0 blocked transactions this quarter" },
    ],
  },
  {
    id: "unpaid-securities",
    ref: "HO/38/11/(9)2026-MIRSD-POD/I/15382/2026",
    title: "Handling of Client's Unpaid Securities by Trading Members",
    date: "03 Jul 2026",
    category: "Client Securities",
    impact: "High",
    intermediary: "Stock Broker (Trading Member)",
    summary:
      "Amends Paragraph 46 of the Master Circular for Stock Brokers (17 Jun 2025). Pay-out of unpaid securities goes directly to the client's demat with an auto-pledge to CUSPA; TM must have a policy, cap the client's payment window at 5 trading days, release excess pledge next day, invoke with notice, and rely on auto-release at end of the 6th trading day.",
    excerpt:
      "46.1 For trades not covered under MTF, the pay-out of unpaid securities shall be directly made to the client's demat account followed by creation of an auto-pledge with the reason \"unpaid\", in favour of a separate \"client unpaid securities pledgee account (CUSPA)\" opened by the TM. 46.2 After creation of pledge, a communication (email/SMS) shall be sent informing the client of the funds obligation and the TM's right to sell such securities on failure. 46.4 The policy must indicate the maximum period (not exceeding five trading days from pay-out) within which the client must meet the payment obligation. 46.7 If pledged value exceeds the maximum pledge value, the TM shall release the pledge on the excess quantity on or before the next trading day. 46.8 On client failure within the timeline, the TM shall invoke the pledge and liquidate, after reasonable notice. 46.10 If neither invoked nor released within five trading days, the pledge is auto-released by depositories at the end of the sixth trading day. 46.11 CUSPA-pledged securities shall not be pledged/transferred to Banks/NBFCs for raising funds.",
    fallback: {
      steps: [
        { agent: "Watcher Agent", icon: "radar", finding: "New circular ref HO/38/11/(9)2026-MIRSD-POD/I/15382/2026, 03 Jul 2026. Amends Paragraph 46 of the Master Circular (17 Jun 2025) — supersedes the 2019 & 2022 handling-of-unpaid-securities provisions. Applies to all Trading Members.", confidence: 0.96 },
        { agent: "Parser Agent", icon: "scan", finding: "Segmented paras 46.1–46.14; extracted 5 broker-binding obligations, each clause-anchored: direct-demat pay-out + CUSPA auto-pledge, client communication, 5-day payment window in policy, next-day excess release, no re-pledge to Banks/NBFCs.", confidence: 0.93 },
        { agent: "Interpretation Agent", icon: "scale", finding: "Resolved 'maximum period ≤ 5 trading days from pay-out'; auto-release at end of 6th trading day (46.10) is a depository action → treated as context, not a broker control. Phased effective dates flagged: 46.1–46.11 = 3 months after exchange operational guidelines; 46.12–46.14 = 6 months from issuance.", confidence: 0.9 },
        { agent: "Mapping Agent", icon: "network", finding: "Mapped to demat pay-out (Ops), CUSPA pledge module (Ops), client-comms (Client Service), RMS policy doc (Risk), and collateral funding controls (Treasury). Owners assigned.", confidence: 0.92 },
      ],
      obligations: [
        { id: "OB-46-1", clause: "Para 46.1", actor: "Trading Member — Operations", intermediary: "Stock Broker", action: "Pay out unpaid securities (non-MTF) directly to the client's demat, then auto-pledge them with reason \"unpaid\" to the TM's CUSPA.", trigger: "Unpaid securities pay-out", deadline: "On pay-out", frequency: "Per pay-out", evidence: ["Demat credit confirmation", "CUSPA auto-pledge record"], test: "Every unpaid non-MTF pay-out lands in the client demat and carries a matching CUSPA \"unpaid\" pledge.", category: "Client Securities", severity: "critical" },
        { id: "OB-46-2", clause: "Para 46.2", actor: "Trading Member — Client Service", intermediary: "Stock Broker", action: "After pledge creation, send email/SMS informing the client of the funds obligation and the TM's right to sell on failure.", trigger: "Pledge created", deadline: "After pledge creation", frequency: "Per pledge", evidence: ["Email/SMS dispatch log"], test: "Each CUSPA pledge has a client communication logged after creation.", category: "Disclosure", severity: "high" },
        { id: "OB-46-4", clause: "Para 46.4", actor: "Trading Member — Risk", intermediary: "Stock Broker", action: "Maintain a policy setting the maximum client payment period, not exceeding five trading days from pay-out.", trigger: "Standing (policy)", deadline: "≤ 5 trading days from pay-out", frequency: "Continuous", evidence: ["Unpaid-securities / RMS policy doc", "Client communication of policy"], test: "Policy exists, states a payment window ≤ 5 trading days, and was communicated to clients before implementation.", category: "Risk Policy", severity: "high" },
        { id: "OB-46-7", clause: "Para 46.7", actor: "Trading Member — Operations", intermediary: "Stock Broker", action: "Where pledged value exceeds the daily maximum pledge value, release the pledge on the excess quantity on or before the next trading day.", trigger: "Pledged value > max pledge value", deadline: "On/before next trading day", frequency: "Daily", evidence: ["Daily max-pledge-value computation", "Excess-release instruction"], test: "Any excess over the daily max pledge value is released by the next trading day.", category: "Client Securities", severity: "high" },
        { id: "OB-46-11", clause: "Para 46.11", actor: "Trading Member — Treasury", intermediary: "Stock Broker", action: "Do not pledge/transfer CUSPA securities to Banks/NBFCs for raising funds.", trigger: "Standing", deadline: "Continuous", frequency: "Continuous", evidence: ["Collateral funding register", "CUSPA transfer block"], test: "No CUSPA-pledged security appears in any bank/NBFC funding pledge.", category: "Misuse Prevention", severity: "critical" },
      ],
      rules: [
        { id: "R-46-1", obligationId: "OB-46-1", name: "unpaid_direct_demat_cuspa", trigger: "on: payout.unpaid(non_mtf)", code: "WHEN payout.unpaid(non_mtf)\nASSERT securities.credited_to(client_demat)\n  AND cuspa.pledge(reason=\"unpaid\").exists\nEVIDENCE bind(demat_credit, cuspa_pledge_record)\nON FAIL raise(task, severity=CRITICAL, owner=OPS)" },
        { id: "R-46-2", obligationId: "OB-46-2", name: "client_comm_on_pledge", trigger: "on: cuspa.pledge.created", code: "WHEN cuspa.pledge.created\nASSERT comm.sent(channel IN {email, sms})\n  AND comm.states(funds_obligation, right_to_sell)\nEVIDENCE bind(comm_dispatch_log)\nON FAIL raise(task, severity=HIGH, owner=CLIENT_SERVICE)" },
        { id: "R-46-4", obligationId: "OB-46-4", name: "payment_window_max_5td", trigger: "cron: policy check", code: "WHEN policy.check\nASSERT policy.payment_window_trading_days <= 5\n  AND policy.communicated_to_clients\nEVIDENCE bind(rms_policy_doc, client_comm)\nON FAIL raise(task, severity=HIGH, owner=RISK)" },
        { id: "R-46-7", obligationId: "OB-46-7", name: "excess_pledge_release_next_td", trigger: "cron: daily EOD", code: "WHEN day.ends\nFOR pledge WHERE pledge.value > max_pledge_value(client)\nASSERT release(excess_qty).by <= next_trading_day\nEVIDENCE bind(max_pledge_calc, release_instruction)\nON FAIL raise(task, severity=HIGH, owner=OPS)" },
        { id: "R-46-11", obligationId: "OB-46-11", name: "no_cuspa_bank_nbfc_pledge", trigger: "on: funding.pledge.attempt", code: "WHEN funding.pledge.attempt(counterparty IN {BANK, NBFC})\nASSERT security NOT IN cuspa.pledged\nEVIDENCE bind(collateral_register)\nON FAIL block(txn) AND raise(task, severity=CRITICAL, owner=TREASURY)" },
      ],
    },
    engine: [
      { obligationId: "OB-46-1", status: "compliant", boundEvidence: "Demat credit + CUSPA pledge matched · 1,204 unpaid pay-outs this quarter", note: "Every unpaid non-MTF pay-out reached client demat with a matching CUSPA pledge." },
      { obligationId: "OB-46-2", status: "gap", boundEvidence: null, note: "18 CUSPA pledges have no client email/SMS logged (para 46.2 breach).", task: "Auto-raised: dispatch pending client communications for 18 pledges — owner Client Service, due today." },
      { obligationId: "OB-46-4", status: "compliant", boundEvidence: "RMS policy v3.1 · payment window = 5 trading days · client-notified 12 Aug", note: "Policy within the 5-trading-day cap and communicated." },
      { obligationId: "OB-46-7", status: "pending", boundEvidence: "EOD max-pledge-value recompute running", note: "Excess-release sweep 63% complete for today's cycle." },
      { obligationId: "OB-46-11", status: "compliant", boundEvidence: "Collateral funding register · 0 CUSPA securities in bank/NBFC pledges", note: "No misuse of unpaid-securities collateral detected." },
    ],
  },
  {
    id: "investor-charter",
    ref: "SEBI/HO/MIRSD/MIRSD-PoD/P/CIR/2026/22",
    title: "Investor Charter & Monthly Complaints Disclosure — Stock Brokers",
    date: "2026",
    category: "Investor Grievance",
    impact: "Medium",
    intermediary: "Stock Broker (Trading Member)",
    summary:
      "Brokers must display the Investor Charter, publish monthly complaints data (received/resolved/pending), and link SCORES/ODR on their website and app.",
    excerpt:
      "2.1 Every Stock Broker shall prominently display the Investor Charter on its website and trading app. 2.2 The broker shall disclose, by the 7th of every month, data on investor complaints — received, resolved and pending — for the previous month. 2.3 The broker shall provide direct links to SEBI SCORES and the ODR platform for grievance redressal.",
    fallback: {
      steps: [
        { agent: "Watcher Agent", icon: "radar", finding: "Circular detected; applies to all Stock Brokers. Disclosure/transparency obligations, website & app surfaces.", confidence: 0.94 },
        { agent: "Parser Agent", icon: "scan", finding: "Extracted 3 obligations from paras 2.1–2.3: charter display, monthly complaints disclosure, SCORES/ODR links.", confidence: 0.93 },
        { agent: "Interpretation Agent", icon: "scale", finding: "Interpreted '7th of every month' as a recurring monthly deadline for prior-month data; disclosure must be on a public surface.", confidence: 0.92 },
        { agent: "Mapping Agent", icon: "network", finding: "Mapped to website CMS, app content, and the complaints/SCORES data source. Owner: Investor Grievance / Compliance.", confidence: 0.9 },
      ],
      obligations: [
        { id: "OB-IC-1", clause: "Para 2.1", actor: "Stock Broker — Compliance", intermediary: "Stock Broker", action: "Prominently display the Investor Charter on the website and trading app.", trigger: "Standing", deadline: "Continuous", frequency: "Continuous", evidence: ["Website screenshot/URL", "App screen reference"], test: "Investor Charter is present and reachable on both website and app.", category: "Disclosure", severity: "medium" },
        { id: "OB-IC-2", clause: "Para 2.2", actor: "Stock Broker — Investor Grievance", intermediary: "Stock Broker", action: "Publish previous month's complaints data (received/resolved/pending) by the 7th.", trigger: "Month end", deadline: "By 7th of each month", frequency: "Monthly", evidence: ["Monthly complaints disclosure page", "SCORES data extract"], test: "Each month's complaints table is published on or before the 7th.", category: "Investor Grievance", severity: "medium" },
        { id: "OB-IC-3", clause: "Para 2.3", actor: "Stock Broker — Compliance", intermediary: "Stock Broker", action: "Provide direct links to SEBI SCORES and the ODR platform.", trigger: "Standing", deadline: "Continuous", frequency: "Continuous", evidence: ["Live SCORES link", "Live ODR link"], test: "Working SCORES and ODR links are present on the grievance surface.", category: "Investor Grievance", severity: "medium" },
      ],
      rules: [
        { id: "R-IC-1", obligationId: "OB-IC-1", name: "charter_display", trigger: "cron: weekly surface check", code: "WHEN surface.check\nASSERT website.has(investor_charter) AND app.has(investor_charter)\nEVIDENCE bind(url_snapshot, app_ref)\nON FAIL raise(task, severity=MEDIUM, owner=COMPLIANCE)" },
        { id: "R-IC-2", obligationId: "OB-IC-2", name: "monthly_complaints_by_7th", trigger: "cron: monthly, 7th", code: "WHEN month.day == 7\nASSERT complaints_disclosure.published(prev_month)\nEVIDENCE bind(disclosure_page, scores_extract)\nON FAIL raise(task, severity=MEDIUM, owner=GRIEVANCE)" },
        { id: "R-IC-3", obligationId: "OB-IC-3", name: "scores_odr_links", trigger: "cron: weekly surface check", code: "WHEN surface.check\nASSERT links.valid(SCORES) AND links.valid(ODR)\nEVIDENCE bind(scores_link, odr_link)\nON FAIL raise(task, severity=MEDIUM, owner=COMPLIANCE)" },
      ],
    },
    engine: [
      { obligationId: "OB-IC-1", status: "compliant", boundEvidence: "Charter live on web + app · last checked today", note: "Present on both surfaces." },
      { obligationId: "OB-IC-2", status: "compliant", boundEvidence: "July complaints table published 05 Aug", note: "Filed 2 days before the 7th deadline." },
      { obligationId: "OB-IC-3", status: "gap", boundEvidence: null, note: "ODR platform link returns 404 on the app grievance page.", task: "Auto-raised: fix ODR link on app — owner Compliance, due today." },
    ],
  },
];

export const agentRoster = [
  { key: "watcher", name: "Watcher Agent", icon: "radar", desc: "Monitors SEBI feeds 24×7 — detects, classifies and diffs every new circular against the rulebook" },
  { key: "parser", name: "Parser Agent", icon: "scan", desc: "Extracts every obligation into the graph — who, what, when, evidence — each linked to its exact clause" },
  { key: "interpretation", name: "Interpretation Agent", icon: "scale", desc: "Resolves ambiguity, deadlines and conditions; flags judgement calls for the compliance officer" },
  { key: "mapping", name: "Mapping Agent", icon: "network", desc: "Maps obligations to systems, owners and existing controls — reuse before rebuild" },
  { key: "evidence", name: "Evidence Agent", icon: "paperclip", desc: "Auto-binds proof to every obligation from connected systems — no more screenshot folders" },
  { key: "audit", name: "Gap & Audit Agent", icon: "shield", desc: "Detects gaps, generates remediation tasks, writes every action to the hash-chained trail" },
];

export function getCircular(id: string) {
  return circulars.find((c) => c.id === id);
}
