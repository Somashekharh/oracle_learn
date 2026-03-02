/** @type {import('./contracts.js').BlogPost[]} */
export const BLOG_POSTS = [
  {
    id: "post-01",
    title: "ORA-01555 Snapshot Too Old: End-to-End Triage",
    slug: "ora-01555-snapshot-too-old-triage",
    tags: ["Undo", "Performance", "Troubleshooting"],
    date: "2026-02-20",
    level: "Intermediate",
    readMinutes: 9,
    summary: "How to isolate undo pressure, long query behavior, and retention settings when ORA-01555 appears.",
    impact: "Long-running read workloads fail, reporting jobs restart, and downstream SLAs miss due to repeated query aborts.",
    symptoms: [
      "Batch reports fail with ORA-01555 during full-range scans.",
      "High undo reuse and tuned retention drops during peak windows.",
      "Analysts report inconsistent query completion time."
    ],
    triageCommands: [
      "SELECT begin_time, undoblks, txncount, tuned_undoretention FROM v$undostat ORDER BY begin_time DESC FETCH FIRST 12 ROWS ONLY;",
      "SELECT s.sid, s.serial#, s.username, s.sql_id, s.event FROM v$session s WHERE s.type='USER' AND s.status='ACTIVE';",
      "SELECT tablespace_name, SUM(bytes)/1024/1024 AS size_mb FROM dba_data_files WHERE tablespace_name LIKE 'UNDO%' GROUP BY tablespace_name;"
    ],
    body: [
      "ORA-01555 usually appears when a long-running query needs older undo records that were already overwritten. Start by confirming query runtime and whether undo retention aligns with workload length.",
      "Inspect undo tablespace usage trends and active transaction patterns. Queries that scan large ranges without selective predicates are frequent contributors.",
      "Stabilize by increasing undo retention and sizing where justified, then reduce query runtime with better access paths and up-to-date statistics.",
      "Prevention works best with monitoring: alert on undo pressure, track long SQL, and align batch windows with retention policy."
    ],
    references: [
      {
        label: "Oracle UNDO_RETENTION Reference",
        url: "https://docs.oracle.com/en/database/oracle/oracle-database/19/refrn/UNDO_RETENTION.html"
      },
      {
        label: "Oracle Automatic Undo Management",
        url: "https://docs.oracle.com/en/database/oracle/oracle-database/19/admin/managing-undo.html"
      }
    ]
  },
  {
    id: "post-02",
    title: "Log File Sync Spikes During Peak Load",
    slug: "log-file-sync-spikes-peak-load",
    tags: ["Redo", "Performance", "LGWR"],
    date: "2026-02-24",
    level: "Advanced",
    readMinutes: 8,
    summary: "A practical playbook for diagnosing commit latency rooted in redo I/O and commit behavior.",
    impact: "Application commit latency increases, user transactions stall, and throughput drops during high-concurrency windows.",
    symptoms: [
      "AWR or active session data shows elevated log file sync waits.",
      "Redo log switches occur too frequently.",
      "Application traces reveal excessive commit frequency."
    ],
    triageCommands: [
      "SELECT event, total_waits, time_waited/100 AS time_waited_s FROM v$system_event WHERE event='log file sync';",
      "SELECT thread#, sequence#, first_time FROM v$log_history ORDER BY first_time DESC FETCH FIRST 20 ROWS ONLY;",
      "SELECT name, value FROM v$sysstat WHERE name IN ('redo size', 'user commits');"
    ],
    body: [
      "When log file sync dominates wait time, start with commit frequency patterns from application modules. Excessive micro-transactions can overwhelm LGWR even on healthy storage.",
      "Check redo log size and switch frequency. Very small redo logs force frequent checkpoints and increase write churn.",
      "Validate storage latency for redo destinations and ensure multiplexing strategy does not introduce avoidable overhead.",
      "Combine SQL and app-level fixes: batch commits where valid, tune hot transaction paths, and monitor before/after wait profiles."
    ],
    references: [
      {
        label: "Oracle Wait Events Reference",
        url: "https://docs.oracle.com/en/database/oracle/oracle-database/19/refrn/descriptions-of-wait-events.html"
      },
      {
        label: "Oracle Redo and Undo Concepts",
        url: "https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/logical-storage-structures.html"
      }
    ]
  },
  {
    id: "post-03",
    title: "Resolving Blocking Sessions Without Guesswork",
    slug: "resolving-blocking-sessions-without-guesswork",
    tags: ["Locking", "Incident Response", "Operations"],
    date: "2026-02-26",
    level: "Intermediate",
    readMinutes: 10,
    summary: "How to identify blocker chains, validate business impact, and act safely in production.",
    impact: "Critical DML paths freeze, business workflows queue up, and uncontrolled session kills can cause data inconsistency risks.",
    symptoms: [
      "Users report hanging updates or timeouts.",
      "Blocked session count increases in v$session.",
      "Same SQL_ID appears repeatedly in waiter sessions."
    ],
    triageCommands: [
      "SELECT sid, serial#, username, blocking_session, event, seconds_in_wait FROM v$session WHERE state='WAITING' AND blocking_session IS NOT NULL;",
      "SELECT sid, type, id1, id2, lmode, request, block FROM v$lock WHERE block=1 OR request>0;",
      "SELECT sql_id, sql_text FROM v$sql WHERE sql_id = :sql_id;"
    ],
    body: [
      "Blocking incidents should begin with evidence collection, not immediate session kills. Build blocker-waiter mapping from v$session and v$lock and capture SQL text.",
      "Confirm whether blocker belongs to scheduled batch or critical transaction path. Context prevents damaging interventions.",
      "If session termination is required, document SID/SERIAL#, owner confirmation, and follow-up verification steps.",
      "After resolution, address root cause: transaction design, index strategy, and application retry logic."
    ],
    references: [
      {
        label: "Oracle V$SESSION Reference",
        url: "https://docs.oracle.com/en/database/oracle/oracle-database/19/refrn/V-SESSION.html"
      },
      {
        label: "Oracle V$LOCK Reference",
        url: "https://docs.oracle.com/en/database/oracle/oracle-database/19/refrn/V-LOCK.html"
      }
    ]
  },
  {
    id: "post-04",
    title: "Data Pump Migration Checklist for Minimal Downtime",
    slug: "data-pump-migration-checklist-minimal-downtime",
    tags: ["Data Pump", "Migration", "Best Practices"],
    date: "2026-02-28",
    level: "Advanced",
    readMinutes: 9,
    summary: "A repeatable expdp/impdp workflow with sizing, consistency controls, and validation stages.",
    impact: "Poorly planned migration causes import failures, object invalidation, and extended maintenance windows.",
    symptoms: [
      "Import errors on grants, constraints, or invalid object dependencies.",
      "Unexpected data drift between source and target.",
      "Migration window exceeds planned downtime."
    ],
    triageCommands: [
      "expdp system/password DIRECTORY=dp_dir DUMPFILE=app_%U.dmp LOGFILE=exp_app.log SCHEMAS=APP ESTIMATE_ONLY=YES",
      "expdp system/password DIRECTORY=dp_dir DUMPFILE=app_%U.dmp LOGFILE=exp_app.log SCHEMAS=APP FLASHBACK_TIME=systimestamp PARALLEL=4",
      "impdp system/password DIRECTORY=dp_dir DUMPFILE=app_%U.dmp LOGFILE=imp_app.log REMAP_SCHEMA=APP:APP_NEW PARALLEL=4"
    ],
    body: [
      "Begin with ESTIMATE_ONLY and dependency mapping. Migration failures are often caused by overlooked storage and object dependencies rather than command syntax.",
      "Use FLASHBACK_TIME for consistent export snapshots when source is active. Capture grants, synonyms, and scheduler objects in validation scope.",
      "On import, remap schemas carefully and validate invalid objects, constraints, and row counts.",
      "Close with performance smoke tests and access verification to ensure the migrated schema is production-ready."
    ],
    references: [
      {
        label: "Oracle Data Pump Export Utility",
        url: "https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/oracle-data-pump-export-utility.html"
      },
      {
        label: "Oracle Data Pump Import Utility",
        url: "https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/datapump-import-utility.html"
      }
    ]
  },
  {
    id: "post-05",
    title: "Oracle Hardening Baseline for Security-Focused DBAs",
    slug: "oracle-hardening-baseline-security-dbas",
    tags: ["Security", "Hardening", "Auditing"],
    date: "2026-03-01",
    level: "Intermediate",
    readMinutes: 7,
    summary: "A practical hardening baseline that aligns DBA operations with cybersecurity outcomes.",
    impact: "Over-privileged users, missing audit trails, and weak crypto settings increase breach and compliance risk.",
    symptoms: [
      "Dormant accounts remain unlocked for months.",
      "No unified auditing policy for critical DDL/DCL actions.",
      "TDE and network encryption not consistently enabled."
    ],
    triageCommands: [
      "SELECT username, account_status, profile FROM dba_users ORDER BY username;",
      "SELECT * FROM audit_unified_enabled_policies;",
      "SELECT name, wallet_type, status FROM v$encryption_wallet;"
    ],
    body: [
      "Hardening starts with identity and privilege controls. Lock unused accounts, enforce profile policies, and review grants continuously.",
      "Enable auditing for sensitive operations like ALTER USER, GRANT, and object drops. Audit data should be monitored and retained based on policy.",
      "Secure data paths with encryption at rest and in transit, and reduce listener/network exposure through strict ACLs.",
      "Treat patch cadence and configuration drift checks as operational security controls, not optional tasks."
    ],
    references: [
      {
        label: "Oracle Database Security Guide",
        url: "https://docs.oracle.com/en/database/oracle/oracle-database/19/dbseg/"
      },
      {
        label: "Unified Auditing Administration",
        url: "https://docs.oracle.com/en/database/oracle/oracle-database/19/dbseg/administering-the-audit-trail.html"
      }
    ]
  },
  {
    id: "post-06",
    title: "Backup Success Is Not Recovery Success",
    slug: "backup-success-is-not-recovery-success",
    tags: ["RMAN", "Backup", "Disaster Recovery"],
    date: "2026-03-02",
    level: "Advanced",
    readMinutes: 8,
    summary: "Why restore validation and recovery drills matter more than green backup job status.",
    impact: "Teams overestimate resiliency and discover backup chain gaps only during real incidents, increasing downtime.",
    symptoms: [
      "Backup jobs report success but restore tests are never executed.",
      "Archived logs missing from recovery catalog.",
      "RTO/RPO targets are undocumented or untested."
    ],
    triageCommands: [
      "RMAN> CROSSCHECK BACKUP;",
      "RMAN> RESTORE DATABASE VALIDATE;",
      "RMAN> LIST BACKUP SUMMARY;"
    ],
    body: [
      "A completed backup job does not guarantee recoverability. Missing pieces, catalog mismatch, and archive gaps are common hidden risks.",
      "Use RMAN CROSSCHECK and RESTORE VALIDATE to verify backup integrity and availability before incidents occur.",
      "Run periodic recovery drills aligned with RPO/RTO expectations. Measure execution time and capture blockers.",
      "Recovery readiness should be demonstrated with evidence, not assumed from scheduler logs."
    ],
    references: [
      {
        label: "Oracle RMAN Backup and Recovery User's Guide",
        url: "https://docs.oracle.com/en/database/oracle/oracle-database/19/bradv/"
      },
      {
        label: "Oracle RMAN LIST command reference",
        url: "https://docs.oracle.com/en/database/oracle/oracle-database/19/rcmrf/LIST.html"
      }
    ]
  }
];
