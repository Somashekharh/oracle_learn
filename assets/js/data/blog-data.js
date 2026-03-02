/** @type {import('./contracts.js').BlogPost[]} */
export const BLOG_POSTS = [
  {
    id: "post-01",
    title: "ORA-01555 Snapshot Too Old: End-to-End Triage",
    slug: "ora-01555-snapshot-too-old-triage",
    tags: ["Undo", "Performance", "Troubleshooting"],
    date: "2026-02-20",
    summary: "How to isolate undo pressure, long query behavior, and retention settings when ORA-01555 appears.",
    body: [
      "ORA-01555 usually appears when a long-running query needs older undo records that were already overwritten. Start by confirming query runtime and whether undo retention aligns with workload length.",
      "Inspect undo tablespace usage trends and active transaction patterns. Queries that scan large data ranges without selective predicates are frequent contributors.",
      "Stabilize by increasing undo retention and sizing where justified, then reduce query runtime with better access paths and up-to-date statistics.",
      "Prevention works best with monitoring: alert on undo pressure, track long SQL, and align batch windows with retention policy."
    ]
  },
  {
    id: "post-02",
    title: "Log File Sync Spikes During Peak Load",
    slug: "log-file-sync-spikes-peak-load",
    tags: ["Redo", "Performance", "LGWR"],
    date: "2026-02-24",
    summary: "A practical playbook for diagnosing commit latency rooted in redo I/O and commit behavior.",
    body: [
      "When log file sync dominates wait time, start with commit frequency patterns from application modules. Excessive micro-transactions can overwhelm LGWR even on healthy storage.",
      "Check redo log size and switch frequency. Very small redo logs force frequent checkpoints and increase write churn.",
      "Validate storage latency for redo destinations and ensure multiplexing does not create avoidable overhead.",
      "Combine SQL and app-level fixes: batch commits where valid, tune hot transaction paths, and monitor change after deployment."
    ]
  },
  {
    id: "post-03",
    title: "Resolving Blocking Sessions Without Guesswork",
    slug: "resolving-blocking-sessions-without-guesswork",
    tags: ["Locking", "Incident Response", "Operations"],
    date: "2026-02-26",
    summary: "How to identify blocker chains, validate business impact, and act safely in production.",
    body: [
      "Blocking incidents should begin with evidence collection, not immediate session kills. Build blocker-waiter mapping from v$session and v$lock and capture SQL text.",
      "Confirm whether blocker belongs to scheduled batch or critical transaction path. Context prevents damaging interventions.",
      "If session termination is required, document SID/SERIAL#, owner confirmation, and follow-up verification steps.",
      "After resolution, address root cause: transaction design, index strategy, and application retry logic."
    ]
  },
  {
    id: "post-04",
    title: "Data Pump Migration Checklist for Minimal Downtime",
    slug: "data-pump-migration-checklist-minimal-downtime",
    tags: ["Data Pump", "Migration", "Best Practices"],
    date: "2026-02-28",
    summary: "A repeatable expdp/impdp workflow with sizing, consistency controls, and validation stages.",
    body: [
      "Begin with ESTIMATE_ONLY and dependency mapping. Migration failures are often caused by overlooked storage and object dependencies rather than command syntax.",
      "Use FLASHBACK_TIME for consistent export snapshots when source is active. Capture grants, synonyms, and scheduler objects in validation scope.",
      "On import, remap schemas carefully and validate invalid objects, constraints, and row counts.",
      "Close with performance smoke tests and access verification to ensure the migrated schema is production-ready."
    ]
  },
  {
    id: "post-05",
    title: "Oracle Hardening Baseline for Security-Focused DBAs",
    slug: "oracle-hardening-baseline-security-dbas",
    tags: ["Security", "Hardening", "Auditing"],
    date: "2026-03-01",
    summary: "A practical hardening baseline that aligns DBA operations with cybersecurity outcomes.",
    body: [
      "Hardening starts with identity and privilege controls. Lock unused accounts, enforce profile policies, and review grants continuously.",
      "Enable auditing for sensitive operations like ALTER USER, GRANT, and object drops. Audit data should be monitored and retained based on policy.",
      "Secure data paths with encryption at rest and in transit, and reduce listener/network exposure through strict ACLs.",
      "Treat patch cadence and configuration drift checks as operational security controls, not optional tasks."
    ]
  },
  {
    id: "post-06",
    title: "Backup Success Is Not Recovery Success",
    slug: "backup-success-is-not-recovery-success",
    tags: ["RMAN", "Backup", "Disaster Recovery"],
    date: "2026-03-02",
    summary: "Why restore validation and recovery drills matter more than green backup job status.",
    body: [
      "A completed backup job does not guarantee recoverability. Missing pieces, catalog mismatch, and archive gaps are common hidden risks.",
      "Use RMAN CROSSCHECK and RESTORE VALIDATE to verify backup integrity and availability before incidents occur.",
      "Run periodic recovery drills aligned with RPO/RTO expectations. Measure execution time and capture blockers.",
      "Recovery readiness should be demonstrated with evidence, not assumed from scheduler logs."
    ]
  }
];
