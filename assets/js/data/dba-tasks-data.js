/** @type {import('./contracts.js').DbaTask[]} */
export const DBA_TASKS = [
  {
    id: "health-check",
    title: "Checking Database Health",
    why: "Ensures the instance, listener, and core services are available before business hours.",
    riskIfSkipped: "Outages may remain undetected until applications fail, increasing recovery time and business impact.",
    steps: [
      "Validate instance status and uptime.",
      "Confirm alert log has no critical ORA- errors.",
      "Check listener/service registration health.",
      "Review CPU and wait event trends for anomalies."
    ],
    commands: [
      "SELECT instance_name, status, startup_time FROM v$instance;",
      "SELECT message_text FROM v$diag_alert_ext WHERE originating_timestamp > SYSTIMESTAMP - INTERVAL '30' MINUTE;",
      "lsnrctl status"
    ]
  },
  {
    id: "tablespace-monitoring",
    title: "Monitoring Tablespaces",
    why: "Prevents unplanned downtime caused by space exhaustion in permanent, temporary, or undo tablespaces.",
    riskIfSkipped: "Application inserts and schema changes can fail due to ORA-01653/ORA-1652 space errors.",
    steps: [
      "Review free versus used capacity for all tablespaces.",
      "Identify autoextend limits and growth trends.",
      "Alert on critical thresholds (80%/90%).",
      "Add datafile or resize proactively."
    ],
    commands: [
      "SELECT tablespace_name, ROUND(used_percent,2) used_percent FROM dba_tablespace_usage_metrics ORDER BY used_percent DESC;",
      "SELECT file_name, autoextensible, maxbytes/1024/1024 max_mb FROM dba_data_files;"
    ]
  },
  {
    id: "user-management",
    title: "Managing Users and Access",
    why: "Keeps identity, privilege boundaries, and compliance controls aligned with least privilege.",
    riskIfSkipped: "Excessive privileges and stale accounts increase breach impact and audit failures.",
    steps: [
      "Review newly created users and granted roles.",
      "Verify password profile alignment.",
      "Lock inactive or temporary accounts.",
      "Audit high-privilege grants to non-DBA users."
    ],
    commands: [
      "SELECT username, account_status, created FROM dba_users ORDER BY created DESC;",
      "SELECT grantee, granted_role FROM dba_role_privs WHERE grantee NOT IN ('SYS','SYSTEM') ORDER BY grantee;",
      "ALTER USER temp_user ACCOUNT LOCK;"
    ]
  },
  {
    id: "lock-handling",
    title: "Handling Locks and Blocking Sessions",
    why: "Maintains transaction throughput by quickly resolving lock contention and session deadlocks.",
    riskIfSkipped: "Blocking chains can halt application operations and trigger customer-facing downtime.",
    steps: [
      "Identify blockers and waiters.",
      "Confirm SQL involved and owning session.",
      "Coordinate with application owner before kill action.",
      "Terminate blocker only when business-approved."
    ],
    commands: [
      "SELECT s1.sid blocker_sid, s2.sid waiter_sid, l1.id1, l1.id2 FROM v$lock l1 JOIN v$session s1 ON l1.sid=s1.sid JOIN v$lock l2 ON l1.id1=l2.id1 AND l1.id2=l2.id2 JOIN v$session s2 ON l2.sid=s2.sid WHERE l1.block = 1 AND l2.request > 0;",
      "ALTER SYSTEM KILL SESSION 'sid,serial#' IMMEDIATE;"
    ]
  },
  {
    id: "performance-tuning",
    title: "Performance Tuning Review",
    why: "Controls response time and resource usage by analyzing top SQL and wait events.",
    riskIfSkipped: "Slow queries accumulate, CPU spikes, and user experience degrades under load.",
    steps: [
      "Review AWR/ASH top waits and SQL by elapsed time.",
      "Inspect execution plans for regressions.",
      "Validate index health and stale statistics.",
      "Apply SQL tuning and monitor improvements."
    ],
    commands: [
      "SELECT sql_id, executions, elapsed_time/1000000 elapsed_sec FROM v$sqlstats ORDER BY elapsed_time DESC FETCH FIRST 10 ROWS ONLY;",
      "SELECT event, time_waited_micro/1000000 sec_waited FROM v$system_event ORDER BY time_waited_micro DESC FETCH FIRST 10 ROWS ONLY;"
    ]
  },
  {
    id: "backup-verification",
    title: "Backup Verification",
    why: "Confirms recoverability by validating backups and archive log continuity.",
    riskIfSkipped: "Backups may exist but be unusable during incidents, causing data loss.",
    steps: [
      "Confirm last successful full and incremental backups.",
      "Run restore validation on latest backup pieces.",
      "Verify archive log backup frequency and retention.",
      "Review RMAN catalog/controlfile metadata consistency."
    ],
    commands: [
      "RMAN> LIST BACKUP SUMMARY;",
      "RMAN> RESTORE DATABASE VALIDATE;",
      "RMAN> CROSSCHECK BACKUP;"
    ]
  },
  {
    id: "disaster-recovery",
    title: "Disaster Recovery Readiness",
    why: "Ensures standby synchronization and failover readiness to meet business continuity targets.",
    riskIfSkipped: "RPO/RTO objectives can be missed in disaster events due to lag or configuration drift.",
    steps: [
      "Check Data Guard transport/apply lag.",
      "Validate standby redo and archive apply status.",
      "Run periodic switchover readiness checks.",
      "Document DR drill outcomes and remediation actions."
    ],
    commands: [
      "SELECT name, value, unit FROM v$dataguard_stats WHERE name IN ('transport lag','apply lag');",
      "SELECT process, status, thread#, sequence# FROM v$managed_standby;"
    ]
  }
];
