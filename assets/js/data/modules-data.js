/** @type {import('./contracts.js').ModuleLesson[]} */
export const MODULE_LESSONS = [
  {
    id: "mod1-db-purpose",
    moduleId: "Module 1: Database Fundamentals",
    level: "Beginner",
    title: "Why Databases Exist",
    summary: "Understand persistence, concurrency, consistency, and why enterprise systems depend on transactional databases.",
    keyPoints: [
      "Databases solve multi-user read/write consistency problems that plain files cannot.",
      "Transactional engines preserve data correctness across failures.",
      "Oracle uses redo and undo mechanisms to maintain reliability and recoverability."
    ],
    commands: ["SELECT name, open_mode, log_mode FROM v$database;"]
  },
  {
    id: "mod1-rdbms-core",
    moduleId: "Module 1: Database Fundamentals",
    level: "Beginner",
    title: "DBMS vs RDBMS vs Oracle",
    summary: "Learn relational design concepts, constraints, and Oracle-specific enterprise capabilities.",
    keyPoints: [
      "RDBMS introduces tables, keys, constraints, normalization, and SQL relations.",
      "Oracle supports OLTP, high availability, and advanced backup/recovery workflows.",
      "Data dictionary views provide operational metadata for DBAs."
    ],
    commands: ["SELECT owner, table_name FROM dba_tables FETCH FIRST 10 ROWS ONLY;"]
  },
  {
    id: "mod1-sql-querying",
    moduleId: "Module 1: Database Fundamentals",
    level: "Beginner",
    title: "SQL Query Foundation",
    summary: "Build confidence with SELECT, WHERE, JOIN, GROUP BY, and sorting techniques used in reporting.",
    keyPoints: [
      "Predicate quality and indexes influence SQL performance directly.",
      "Join type choice changes both result and execution cost.",
      "Aggregation patterns are essential for interview and production reporting tasks."
    ],
    commands: [
      "SELECT department_id, COUNT(*) headcount FROM hr.employees GROUP BY department_id ORDER BY headcount DESC;",
      "SELECT e.employee_id, e.first_name, d.department_name FROM hr.employees e JOIN hr.departments d ON e.department_id = d.department_id;"
    ]
  },
  {
    id: "mod1-sql-dml-tcl",
    moduleId: "Module 1: Database Fundamentals",
    level: "Beginner",
    title: "DML + Transaction Control",
    summary: "Understand INSERT/UPDATE/DELETE behavior, commit durability, and rollback consistency.",
    keyPoints: [
      "DML changes first happen in memory and are protected by redo/undo.",
      "COMMIT ensures durability after LGWR flushes relevant redo.",
      "ROLLBACK reverts uncommitted work using undo segments."
    ],
    commands: [
      "UPDATE hr.employees SET salary = salary * 1.05 WHERE department_id = 60;",
      "COMMIT;",
      "ROLLBACK;"
    ]
  },
  {
    id: "mod2-instance-overview",
    moduleId: "Module 2: Oracle Architecture Deep Dive",
    level: "Intermediate",
    title: "Instance vs Database",
    summary: "Distinguish Oracle instance (memory + processes) from database files on disk.",
    keyPoints: [
      "Instance contains SGA and background processes.",
      "Database contains datafiles, control files, and online redo logs.",
      "Both are required for normal OPEN state and query processing."
    ],
    commands: ["SELECT instance_name, status, database_status FROM v$instance;"]
  },
  {
    id: "mod2-memory-areas",
    moduleId: "Module 2: Oracle Architecture Deep Dive",
    level: "Intermediate",
    title: "Memory Architecture: SGA and PGA",
    summary: "Map shared and private memory responsibilities with practical performance implications.",
    keyPoints: [
      "SGA includes shared pool, database buffer cache, and redo log buffer.",
      "PGA is private process memory for sort/hash operations and session state.",
      "Mis-sizing can cause parse pressure, disk reads, and TEMP spills."
    ],
    commands: [
      "SELECT pool, name, bytes/1024/1024 mb FROM v$sgastat ORDER BY mb DESC FETCH FIRST 12 ROWS ONLY;",
      "SELECT name, value FROM v$pgastat;"
    ]
  },
  {
    id: "mod2-process-architecture",
    moduleId: "Module 2: Oracle Architecture Deep Dive",
    level: "Intermediate",
    title: "Background Process Architecture",
    summary: "Understand DBWn, LGWR, CKPT, SMON, PMON, and ARCn process roles.",
    keyPoints: [
      "DBWn writes dirty buffers to datafiles.",
      "LGWR flushes redo for transaction durability at commit boundaries.",
      "SMON/PMON/CKPT/ARCn support recovery, cleanup, checkpoints, and archiving."
    ],
    commands: ["SELECT name, description FROM v$bgprocess WHERE paddr <> '00' ORDER BY name;"]
  },
  {
    id: "mod2-storage-structures",
    moduleId: "Module 2: Oracle Architecture Deep Dive",
    level: "Advanced",
    title: "Physical Storage Structures",
    summary: "Learn how datafiles, control files, online redo logs, and archived logs work together.",
    keyPoints: [
      "Datafiles persist user/system data blocks.",
      "Control files track structure metadata and checkpoint history.",
      "Redo + archived logs provide crash and media recovery capability."
    ],
    commands: [
      "SELECT file#, name, status FROM v$datafile ORDER BY file#;",
      "SELECT group#, status, bytes/1024/1024 mb FROM v$log ORDER BY group#;",
      "SELECT name, status FROM v$controlfile;"
    ]
  },
  {
    id: "mod3-install-prereq",
    moduleId: "Module 3: Installation and Configuration",
    level: "Beginner",
    title: "Installation Prerequisites",
    summary: "Prepare OS packages, kernel parameters, storage layout, and environment variables for Oracle installation.",
    keyPoints: [
      "Correct OS prerequisites prevent unstable deployments.",
      "Plan ORACLE_BASE, ORACLE_HOME, and data mount layout before install.",
      "Apply least privilege and separation-of-duties for host users/groups."
    ],
    commands: [
      "echo $ORACLE_HOME",
      "df -h",
      "ulimit -a"
    ]
  },
  {
    id: "mod3-startup-states",
    moduleId: "Module 3: Installation and Configuration",
    level: "Intermediate",
    title: "Startup and Shutdown States",
    summary: "Master NOMOUNT, MOUNT, OPEN stages and their administrative use cases.",
    keyPoints: [
      "NOMOUNT: instance starts, no control file access yet.",
      "MOUNT: control files opened; suitable for certain recovery tasks.",
      "OPEN: normal user activity and SQL execution available."
    ],
    commands: [
      "STARTUP NOMOUNT;",
      "ALTER DATABASE MOUNT;",
      "ALTER DATABASE OPEN;"
    ]
  },
  {
    id: "mod3-network-config",
    moduleId: "Module 3: Installation and Configuration",
    level: "Intermediate",
    title: "Listener and Service Registration",
    summary: "Configure listener and verify service visibility for client connectivity.",
    keyPoints: [
      "Listener routes incoming client requests to database services.",
      "Dynamic registration must be validated after startup.",
      "Service naming standards improve operations and troubleshooting."
    ],
    commands: [
      "lsnrctl status",
      "SELECT name, network_name FROM v$services ORDER BY name;"
    ]
  },
  {
    id: "mod3-parameter-control",
    moduleId: "Module 3: Installation and Configuration",
    level: "Advanced",
    title: "Initialization Parameter Management",
    summary: "Tune and persist instance parameters using SPFILE/PFILE practices.",
    keyPoints: [
      "SCOPE controls whether change applies memory, spfile, or both.",
      "Parameter baselines prevent drift and support recovery plans.",
      "Document every change with rationale and rollback method."
    ],
    commands: [
      "SHOW PARAMETER sga_target",
      "ALTER SYSTEM SET pga_aggregate_target = 2G SCOPE=BOTH;",
      "CREATE PFILE='/tmp/init_orcl.ora' FROM SPFILE;"
    ]
  },
  {
    id: "mod4-user-lifecycle",
    moduleId: "Module 4: User and Tablespace Administration",
    level: "Beginner",
    title: "User Lifecycle Administration",
    summary: "Create, alter, lock, and review user accounts with secure defaults.",
    keyPoints: [
      "Users require session privilege and controlled object access.",
      "Expired/locked accounts should follow incident and governance process.",
      "Periodic entitlement reviews reduce security risk."
    ],
    commands: [
      "CREATE USER app_user IDENTIFIED BY \"StrongPwd#2026\";",
      "GRANT CREATE SESSION TO app_user;",
      "ALTER USER app_user ACCOUNT LOCK;"
    ]
  },
  {
    id: "mod4-role-profile",
    moduleId: "Module 4: User and Tablespace Administration",
    level: "Intermediate",
    title: "Roles and Profiles",
    summary: "Implement role-based access and password policy enforcement.",
    keyPoints: [
      "Roles centralize privilege administration.",
      "Profiles enforce lockout and password lifecycle controls.",
      "Least privilege should be validated continuously."
    ],
    commands: [
      "CREATE ROLE app_readonly;",
      "CREATE PROFILE secure_profile LIMIT FAILED_LOGIN_ATTEMPTS 5 PASSWORD_LIFE_TIME 60;",
      "ALTER USER app_user PROFILE secure_profile;"
    ]
  },
  {
    id: "mod4-tablespace-capacity",
    moduleId: "Module 4: User and Tablespace Administration",
    level: "Intermediate",
    title: "Tablespace Capacity Management",
    summary: "Prevent space incidents through proactive growth and autoextend governance.",
    keyPoints: [
      "Monitor used_percent trends, not just current free space.",
      "Autoextend needs explicit maxsize to prevent disk exhaustion.",
      "Temporary and undo spaces require separate monitoring patterns."
    ],
    commands: [
      "SELECT tablespace_name, ROUND(used_percent,2) used_percent FROM dba_tablespace_usage_metrics ORDER BY used_percent DESC;",
      "ALTER TABLESPACE app_data ADD DATAFILE '/u01/oradata/ORCL/app_data02.dbf' SIZE 4G;"
    ]
  },
  {
    id: "mod4-lock-analysis",
    moduleId: "Module 4: User and Tablespace Administration",
    level: "Advanced",
    title: "Session and Lock Diagnostics",
    summary: "Analyze blocking chains and resolve lock contention safely in production.",
    keyPoints: [
      "Identify blocker and waiter sessions before intervention.",
      "Capture SQL and business owner context for audit trail.",
      "Session kill is last resort after impact confirmation."
    ],
    commands: [
      "SELECT sid, serial#, blocking_session, event FROM v$session WHERE blocking_session IS NOT NULL;",
      "SELECT * FROM dba_waiters;"
    ]
  },
  {
    id: "mod5-sql-performance",
    moduleId: "Module 5: Performance and Backup",
    level: "Intermediate",
    title: "SQL Performance Diagnostics",
    summary: "Use wait events and SQL statistics to detect and tune costly workloads.",
    keyPoints: [
      "Top SQL by elapsed time is a practical starting point.",
      "Wait-class analysis reveals whether bottleneck is CPU, I/O, or contention.",
      "Execution plan validation must accompany every tuning action."
    ],
    commands: [
      "SELECT sql_id, executions, elapsed_time/1000000 elapsed_sec FROM v$sqlstats ORDER BY elapsed_time DESC FETCH FIRST 10 ROWS ONLY;",
      "SELECT event, time_waited_micro/1000000 sec_waited FROM v$system_event ORDER BY time_waited_micro DESC FETCH FIRST 10 ROWS ONLY;"
    ]
  },
  {
    id: "mod5-awr-ash-usage",
    moduleId: "Module 5: Performance and Backup",
    level: "Advanced",
    title: "AWR/ASH Investigation Workflow",
    summary: "Build repeatable workflow for before/after performance analysis and incident diagnosis in licensed environments.",
    keyPoints: [
      "Manual snapshots help benchmark tuning changes.",
      "ASH provides activity-level visibility into hot sessions.",
      "AWR/ASH require Diagnostics Pack licensing; use Statspack plus dynamic performance views where packs are not licensed.",
      "Always pair diagnostic output with actionable remediation."
    ],
    commands: [
      "EXEC DBMS_WORKLOAD_REPOSITORY.CREATE_SNAPSHOT;",
      "SELECT sample_time, session_id, event FROM v$active_session_history FETCH FIRST 20 ROWS ONLY;",
      "SELECT event, total_waits, time_waited_micro/1000000 sec_waited FROM v$system_event ORDER BY time_waited_micro DESC FETCH FIRST 10 ROWS ONLY;"
    ]
  },
  {
    id: "mod5-rman-basics",
    moduleId: "Module 5: Performance and Backup",
    level: "Intermediate",
    title: "RMAN Backup Operations",
    summary: "Run full and incremental RMAN backup strategy with archive log coverage.",
    keyPoints: [
      "Backup jobs should include archived redo for full recoverability.",
      "Retention policy must align with business recovery window.",
      "Backup success is insufficient without restore validation."
    ],
    commands: [
      "RMAN> BACKUP DATABASE PLUS ARCHIVELOG;",
      "RMAN> LIST BACKUP SUMMARY;",
      "RMAN> CONFIGURE RETENTION POLICY TO RECOVERY WINDOW OF 14 DAYS;"
    ]
  },
  {
    id: "mod5-recovery-drill",
    moduleId: "Module 5: Performance and Backup",
    level: "Advanced",
    title: "Recovery Validation and DR Drill",
    summary: "Validate recovery readiness with restore tests and Data Guard lag checks.",
    keyPoints: [
      "RESTORE VALIDATE confirms backup usability before incidents.",
      "Data Guard lag must stay within agreed RPO thresholds.",
      "DR drills should produce documented evidence and improvement tasks."
    ],
    commands: [
      "RMAN> RESTORE DATABASE VALIDATE;",
      "SELECT name, value, unit FROM v$dataguard_stats WHERE name IN ('transport lag','apply lag');"
    ]
  },
  {
    id: "mod6-advanced-concurrency",
    moduleId: "Module 6: Advanced Tuning and Security",
    level: "Advanced",
    title: "Concurrency and Contention Tuning",
    summary: "Handle parse contention, lock storms, and high-commit workloads systematically.",
    keyPoints: [
      "Library cache and row lock contention require different mitigation strategies.",
      "Commit frequency and redo subsystem health must be tuned together.",
      "Capture incident timeline from database and OS metrics."
    ],
    commands: [
      "SELECT event, total_waits FROM v$system_event WHERE event IN ('log file sync','enq: TX - row lock contention');",
      "SELECT sql_id, parse_calls, executions FROM v$sqlarea ORDER BY parse_calls DESC FETCH FIRST 15 ROWS ONLY;"
    ]
  },
  {
    id: "mod6-security-hardening",
    moduleId: "Module 6: Advanced Tuning and Security",
    level: "Intermediate",
    title: "Oracle Hardening Controls",
    summary: "Apply security-first DBA practices for roles, auditing, patching, and encryption.",
    keyPoints: [
      "Protect privileged pathways with role governance and auditing.",
      "Review PUBLIC grants and default accounts regularly.",
      "Align patching and baseline drift checks with security policy."
    ],
    commands: [
      "CREATE AUDIT POLICY dba_changes ACTIONS ALTER USER, DROP USER, GRANT;",
      "AUDIT POLICY dba_changes;",
      "SELECT * FROM dba_audit_mgmt_config_params;"
    ]
  },
  {
    id: "mod6-sql-injection-defense",
    moduleId: "Module 6: Advanced Tuning and Security",
    level: "Intermediate",
    title: "SQL Injection and Safe SQL Patterns",
    summary: "Use bind-aware SQL and controlled execution boundaries to reduce injection risk.",
    keyPoints: [
      "Dynamic SQL with untrusted input is a critical security risk.",
      "Bind variables improve both security posture and cursor reuse.",
      "Privilege boundaries limit blast radius of compromised code paths."
    ],
    commands: [
      "SELECT * FROM accounts WHERE user_id = :id;",
      "SELECT sql_id, sql_text FROM v$sql WHERE sql_text LIKE '%||%';"
    ]
  },
  {
    id: "mod6-linux-observability",
    moduleId: "Module 6: Advanced Tuning and Security",
    level: "Advanced",
    title: "Linux Observability for Oracle DBAs",
    summary: "Correlate host-level CPU, memory, I/O, and filesystem behavior with Oracle wait events.",
    keyPoints: [
      "Host telemetry is essential when database waits indicate external bottlenecks.",
      "Disk and memory pressure directly affect LGWR/DBWn and query latency.",
      "Alert log and OS process inspection should be part of incident triage."
    ],
    commands: [
      "iostat -xm 1 5",
      "vmstat 1 5",
      "ps -ef | grep pmon"
    ]
  }
];
