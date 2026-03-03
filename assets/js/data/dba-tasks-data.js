/** @type {import('./contracts.js').DbaTask[]} */
export const DBA_TASKS = [
  {
    id: "health-check",
    title: "Checking Database Health",
    cadence: "Daily",
    priority: "Critical",
    executionWindow: "06:00-08:00 local time",
    slaTarget: "No unresolved critical ORA alerts older than 15 minutes.",
    why: "Ensures the instance, listener, and core services are available before business hours.",
    riskIfSkipped: "Outages may remain undetected until applications fail, increasing recovery time and business impact.",
    steps: [
      "Validate instance status and uptime.",
      "Confirm alert log has no critical ORA- errors.",
      "Check listener/service registration health.",
      "Review CPU and wait event trends for anomalies.",
      "Escalate and document any unresolved red flags with timestamps."
    ],
    commands: [
      "SELECT instance_name, status, startup_time FROM v$instance;",
      "SELECT message_text FROM v$diag_alert_ext WHERE originating_timestamp > SYSTIMESTAMP - INTERVAL '30' MINUTE;",
      "SELECT event, time_waited_micro/1000000 sec_waited FROM v$system_event ORDER BY time_waited_micro DESC FETCH FIRST 10 ROWS ONLY;",
      "lsnrctl status",
      "tail -200 $ORACLE_BASE/diag/rdbms/*/*/trace/alert_*.log"
    ],
    references: [
      "https://docs.oracle.com/en/database/oracle/oracle-database/19/admin/getting-started-with-database-administration.html",
      "https://docs.oracle.com/en/database/oracle/oracle-database/19/refrn/V-INSTANCE.html"
    ]
  },
  {
    id: "tablespace-monitoring",
    title: "Monitoring Tablespaces",
    cadence: "Daily",
    priority: "High",
    executionWindow: "08:00-10:00 local time",
    slaTarget: "No production tablespace above 90% without approved mitigation.",
    why: "Prevents unplanned downtime caused by space exhaustion in permanent, temporary, or undo tablespaces.",
    riskIfSkipped: "Application inserts and schema changes can fail due to ORA-01653/ORA-1652 space errors.",
    steps: [
      "Review free versus used capacity for all tablespaces.",
      "Identify autoextend limits and growth trends.",
      "Alert on critical thresholds (80%/90%).",
      "Add datafile or resize proactively.",
      "Update weekly capacity forecast with observed growth."
    ],
    commands: [
      "SELECT tablespace_name, ROUND(used_percent,2) used_percent FROM dba_tablespace_usage_metrics ORDER BY used_percent DESC;",
      "SELECT file_name, autoextensible, maxbytes/1024/1024 max_mb FROM dba_data_files;",
      "SELECT tablespace_name, file_name, bytes/1024/1024 size_mb FROM dba_temp_files;",
      "SELECT begin_time, undoblks, maxquerylen FROM v$undostat ORDER BY begin_time DESC FETCH FIRST 8 ROWS ONLY;"
    ],
    references: [
      "https://docs.oracle.com/en/database/oracle/oracle-database/19/admin/managing-tablespaces.html"
    ]
  },
  {
    id: "user-management",
    title: "Managing Users and Access",
    cadence: "Daily",
    priority: "High",
    executionWindow: "10:00-12:00 local time",
    slaTarget: "All privileged grants reviewed within 24 hours.",
    why: "Keeps identity, privilege boundaries, and compliance controls aligned with least privilege.",
    riskIfSkipped: "Excessive privileges and stale accounts increase breach impact and audit failures.",
    steps: [
      "Review newly created users and granted roles.",
      "Verify password profile alignment.",
      "Lock inactive or temporary accounts.",
      "Audit high-privilege grants to non-DBA users.",
      "Capture access-change evidence for audit trail."
    ],
    commands: [
      "SELECT username, account_status, created FROM dba_users ORDER BY created DESC;",
      "SELECT grantee, granted_role FROM dba_role_privs WHERE grantee NOT IN ('SYS','SYSTEM') ORDER BY grantee;",
      "SELECT grantee, privilege FROM dba_sys_privs WHERE grantee NOT IN ('SYS','SYSTEM') ORDER BY grantee;",
      "ALTER USER temp_user ACCOUNT LOCK;",
      "SELECT policy_name, enabled_opt FROM audit_unified_enabled_policies ORDER BY policy_name;"
    ],
    references: [
      "https://docs.oracle.com/en/database/oracle/oracle-database/19/dbseg/configuring-privilege-and-role-authorization.html",
      "https://docs.oracle.com/en/database/oracle/oracle-database/19/dbseg/administering-the-audit-trail.html"
    ]
  },
  {
    id: "lock-handling",
    title: "Handling Locks and Blocking Sessions",
    cadence: "Incident",
    priority: "Critical",
    executionWindow: "As required during incidents",
    slaTarget: "Acknowledge blocking incidents within 10 minutes.",
    why: "Maintains transaction throughput by quickly resolving lock contention and session deadlocks.",
    riskIfSkipped: "Blocking chains can halt application operations and trigger customer-facing downtime.",
    steps: [
      "Identify blockers and waiters.",
      "Confirm SQL involved and owning session.",
      "Coordinate with application owner before kill action.",
      "Capture diagnostic evidence before termination action.",
      "Terminate blocker only when business-approved.",
      "Document root cause and prevention controls after recovery."
    ],
    commands: [
      "SELECT s1.sid blocker_sid, s2.sid waiter_sid, l1.id1, l1.id2 FROM v$lock l1 JOIN v$session s1 ON l1.sid=s1.sid JOIN v$lock l2 ON l1.id1=l2.id1 AND l1.id2=l2.id2 JOIN v$session s2 ON l2.sid=s2.sid WHERE l1.block = 1 AND l2.request > 0;",
      "SELECT sid, serial#, username, event, blocking_session FROM v$session WHERE blocking_session IS NOT NULL OR sid IN (SELECT sid FROM v$lock WHERE block = 1);",
      "SELECT originating_timestamp, message_text FROM v$diag_alert_ext WHERE message_text LIKE '%deadlock%' ORDER BY originating_timestamp DESC;",
      "ALTER SYSTEM KILL SESSION 'sid,serial#' IMMEDIATE;"
    ],
    references: [
      "https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/transactions.html"
    ]
  },
  {
    id: "performance-tuning",
    title: "Performance Tuning Review",
    cadence: "Weekly",
    priority: "High",
    executionWindow: "Weekly planned analysis window",
    slaTarget: "Top 10 expensive SQL reviewed and actioned weekly.",
    why: "Controls response time and resource usage by analyzing top SQL and wait events.",
    riskIfSkipped: "Slow queries accumulate, CPU spikes, and user experience degrades under load.",
    steps: [
      "Review AWR/ASH top waits and SQL by elapsed time.",
      "Inspect execution plans for regressions.",
      "Validate index health and stale statistics.",
      "Apply SQL tuning and monitor improvements.",
      "Re-baseline with before/after metrics for measurable gains."
    ],
    commands: [
      "SELECT sql_id, executions, elapsed_time/1000000 elapsed_sec FROM v$sqlstats ORDER BY elapsed_time DESC FETCH FIRST 10 ROWS ONLY;",
      "SELECT event, time_waited_micro/1000000 sec_waited FROM v$system_event ORDER BY time_waited_micro DESC FETCH FIRST 10 ROWS ONLY;",
      "SELECT session_id, sql_id, event, wait_class FROM v$active_session_history WHERE sample_time > SYSDATE - (10/1440) FETCH FIRST 30 ROWS ONLY;",
      "SELECT owner, table_name, stale_stats FROM dba_tab_statistics WHERE stale_stats='YES';"
    ],
    references: [
      "https://docs.oracle.com/en/database/oracle/oracle-database/19/tgsql/",
      "https://docs.oracle.com/en/database/oracle/oracle-database/19/refrn/"
    ]
  },
  {
    id: "backup-verification",
    title: "Backup Verification",
    cadence: "Daily",
    priority: "Critical",
    executionWindow: "After nightly backup completion",
    slaTarget: "100% of backup jobs validated for restore-readiness signal.",
    why: "Confirms recoverability by validating backups and archive log continuity.",
    riskIfSkipped: "Backups may exist but be unusable during incidents, causing data loss.",
    steps: [
      "Confirm last successful full and incremental backups.",
      "Run restore validation on latest backup pieces.",
      "Verify archive log backup frequency and retention.",
      "Review RMAN catalog/controlfile metadata consistency.",
      "Escalate immediately for missing backup chain elements."
    ],
    commands: [
      "RMAN> LIST BACKUP SUMMARY;",
      "RMAN> RESTORE DATABASE VALIDATE;",
      "RMAN> CROSSCHECK BACKUP;",
      "RMAN> REPORT NEED BACKUP DAYS 1 DATABASE;",
      "SELECT destination, status, error FROM v$archive_dest ORDER BY dest_id;"
    ],
    references: [
      "https://docs.oracle.com/en/database/oracle/oracle-database/19/bradv/",
      "https://docs.oracle.com/en/database/oracle/oracle-database/19/rcmrf/"
    ]
  },
  {
    id: "disaster-recovery",
    title: "Disaster Recovery Readiness",
    cadence: "Weekly",
    priority: "Critical",
    executionWindow: "Weekly DR health check + monthly drill",
    slaTarget: "Transport/apply lag within business RPO and drill evidence recorded.",
    why: "Ensures standby synchronization and failover readiness to meet business continuity targets.",
    riskIfSkipped: "RPO/RTO objectives can be missed in disaster events due to lag or configuration drift.",
    steps: [
      "Check Data Guard transport/apply lag.",
      "Validate standby redo and archive apply status.",
      "Run periodic switchover readiness checks.",
      "Review broker configuration health and protection mode.",
      "Document DR drill outcomes and remediation actions."
    ],
    commands: [
      "SELECT name, value, unit FROM v$dataguard_stats WHERE name IN ('transport lag','apply lag');",
      "SELECT process, status, thread#, sequence# FROM v$managed_standby;",
      "SELECT database_role, open_mode, switchover_status, protection_mode FROM v$database;",
      "DGMGRL> SHOW CONFIGURATION;"
    ],
    references: [
      "https://docs.oracle.com/en/database/oracle/oracle-database/19/sbydb/"
    ]
  }
];
