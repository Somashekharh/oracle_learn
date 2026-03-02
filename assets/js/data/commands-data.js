const createCommand = (
  id,
  category,
  level,
  syntax,
  explanation,
  scenario,
  commonMistakes,
  outputExample
) => ({
  id,
  category,
  level,
  syntax,
  explanation,
  scenario,
  commonMistakes,
  outputExample
});

const USER_MANAGEMENT = [
  createCommand(
    "usr-01",
    "User Management",
    "Beginner",
    "CREATE USER app_user IDENTIFIED BY \"StrongPwd#2026\";",
    "Creates a database user account with local password authentication.",
    "Provision a new reporting user during onboarding.",
    ["Weak passwords violate profile policy.", "Creating user without default tablespace causes quota confusion."],
    "User created."
  ),
  createCommand(
    "usr-02",
    "User Management",
    "Beginner",
    "ALTER USER app_user ACCOUNT LOCK;",
    "Locks account immediately and blocks authentication.",
    "Disable access for departed team member.",
    ["Forgetting to lock stale users increases attack surface.", "Locking shared service account without app coordination causes outages."],
    "User altered."
  ),
  createCommand(
    "usr-03",
    "User Management",
    "Beginner",
    "GRANT CREATE SESSION TO app_user;",
    "Grants login privilege to connect to database.",
    "Allow new application account to authenticate.",
    ["Granting broad roles instead of minimal privileges.", "Assuming CREATE SESSION includes object privileges."],
    "Grant succeeded."
  ),
  createCommand(
    "usr-04",
    "User Management",
    "Intermediate",
    "REVOKE UNLIMITED TABLESPACE FROM app_user;",
    "Removes unrestricted tablespace consumption privilege.",
    "Tighten storage governance for non-admin users.",
    ["Revoking during active batch without quota setup can fail inserts.", "Not documenting privilege changes for audits."],
    "Revoke succeeded."
  ),
  createCommand(
    "usr-05",
    "User Management",
    "Intermediate",
    "CREATE PROFILE secure_profile LIMIT FAILED_LOGIN_ATTEMPTS 5 PASSWORD_LIFE_TIME 60;",
    "Defines account security controls and password lifetime.",
    "Enforce baseline password policy for enterprise users.",
    ["Setting PASSWORD_LIFE_TIME too short increases operational load.", "Profile created but not assigned to users."],
    "Profile created."
  ),
  createCommand(
    "usr-06",
    "User Management",
    "Intermediate",
    "ALTER USER app_user PROFILE secure_profile;",
    "Assigns profile rules to existing user account.",
    "Apply hardened password and lockout policy.",
    ["Applying strict profile to service accounts without exemption.", "Not communicating expiry dates to users."],
    "User altered."
  ),
  createCommand(
    "usr-07",
    "User Management",
    "Advanced",
    "SELECT username, account_status, profile, expiry_date FROM dba_users ORDER BY username;",
    "Audits account states and profile alignment.",
    "Weekly user governance review for compliance.",
    ["Running from non-privileged account returns ORA-00942.", "Ignoring EXPIRED(GRACE) users before outage window."],
    "USERNAME  ACCOUNT_STATUS  PROFILE\nAPP_USER  OPEN           SECURE_PROFILE"
  ),
  createCommand(
    "usr-08",
    "User Management",
    "Advanced",
    "SELECT grantee, privilege FROM dba_sys_privs WHERE grantee='APP_USER';",
    "Lists system privileges assigned to a user or role.",
    "Investigate excessive privilege during security review.",
    ["Only checking roles and missing direct grants.", "Not reviewing inherited role privileges."],
    "GRANTEE   PRIVILEGE\nAPP_USER  CREATE SESSION"
  )
];

const TABLESPACE_MANAGEMENT = [
  createCommand(
    "tbs-01",
    "Tablespace Management",
    "Beginner",
    "CREATE TABLESPACE app_data DATAFILE '/u01/oradata/ORCL/app_data01.dbf' SIZE 2G AUTOEXTEND ON NEXT 256M MAXSIZE 20G;",
    "Creates a dedicated permanent tablespace with controlled growth.",
    "Provision storage for new application schema.",
    ["Using SYSTEM tablespace for user objects.", "Missing MAXSIZE can consume entire disk."],
    "Tablespace created."
  ),
  createCommand(
    "tbs-02",
    "Tablespace Management",
    "Beginner",
    "ALTER TABLESPACE app_data ADD DATAFILE '/u01/oradata/ORCL/app_data02.dbf' SIZE 4G;",
    "Extends tablespace capacity with additional datafile.",
    "Prevent ORA-01653 during data growth spike.",
    ["Adding file to wrong mount point with low free space.", "Forgetting backup updates after file addition."],
    "Tablespace altered."
  ),
  createCommand(
    "tbs-03",
    "Tablespace Management",
    "Beginner",
    "SELECT tablespace_name, ROUND(used_percent,2) used_percent FROM dba_tablespace_usage_metrics ORDER BY used_percent DESC;",
    "Shows utilization percentage for proactive monitoring.",
    "Daily capacity health check.",
    ["Confusing used_percent with absolute free MB.", "Ignoring temp and undo growth patterns."],
    "TABLESPACE_NAME  USED_PERCENT\nAPP_DATA         74.32"
  ),
  createCommand(
    "tbs-04",
    "Tablespace Management",
    "Intermediate",
    "SELECT tablespace_name, file_name, bytes/1024/1024 size_mb FROM dba_temp_files;",
    "Validates temporary tablespace file sizing.",
    "Troubleshoot sort spills and ORA-01652.",
    ["Monitoring only permanent tablespaces.", "No temp file autoextend in ETL-heavy systems."],
    "TABLESPACE_NAME FILE_NAME                        SIZE_MB\nTEMP            /u01/oradata/ORCL/temp01.dbf     8192"
  ),
  createCommand(
    "tbs-05",
    "Tablespace Management",
    "Intermediate",
    "ALTER DATABASE DATAFILE '/u01/oradata/ORCL/app_data01.dbf' RESIZE 6G;",
    "Resizes datafile when capacity planning confirms requirement.",
    "Increase file size before month-end load.",
    ["Resizing below high-water mark fails.", "Manual resize without storage alert thresholds."],
    "Database altered."
  ),
  createCommand(
    "tbs-06",
    "Tablespace Management",
    "Intermediate",
    "ALTER DATABASE DATAFILE '/u01/oradata/ORCL/app_data01.dbf' AUTOEXTEND ON NEXT 128M MAXSIZE 12G;",
    "Controls auto growth increment and ceiling.",
    "Balance availability and disk governance.",
    ["Large NEXT value causes sudden disk exhaustion.", "Unlimited maxsize on shared storage."],
    "Database altered."
  ),
  createCommand(
    "tbs-07",
    "Tablespace Management",
    "Advanced",
    "ALTER TABLESPACE temp ADD TEMPFILE '/u01/oradata/ORCL/temp02.dbf' SIZE 6G AUTOEXTEND ON;",
    "Adds temporary storage for sort/hash workloads.",
    "Resolve frequent temp contention in analytics workload.",
    ["Not tracking TEMP usage by SQL.", "Adding tempfile without ASM/disk group balance."],
    "Tablespace altered."
  ),
  createCommand(
    "tbs-08",
    "Tablespace Management",
    "Advanced",
    "DROP TABLESPACE old_stage INCLUDING CONTENTS AND DATAFILES;",
    "Drops unused tablespace and removes files from disk.",
    "Cleanup retired staging environment.",
    ["Dropping active tablespace by mistake.", "No RMAN backup before destructive operation."],
    "Tablespace dropped."
  )
];

const PERFORMANCE_MONITORING = [
  createCommand(
    "perf-01",
    "Performance Monitoring",
    "Beginner",
    "SELECT sql_id, executions, elapsed_time/1000000 elapsed_sec FROM v$sqlstats ORDER BY elapsed_time DESC FETCH FIRST 10 ROWS ONLY;",
    "Finds high elapsed-time SQL statements.",
    "Identify top workload after user complaint.",
    ["Analyzing without execution count context.", "Ignoring plan changes across snapshots."],
    "SQL_ID      EXECUTIONS ELAPSED_SEC\n7d2a...     1200       934.5"
  ),
  createCommand(
    "perf-02",
    "Performance Monitoring",
    "Beginner",
    "SELECT event, total_waits, time_waited_micro/1000000 sec_waited FROM v$system_event ORDER BY time_waited_micro DESC FETCH FIRST 10 ROWS ONLY;",
    "Highlights major wait classes affecting response time.",
    "Baseline instance wait profile during peak period.",
    ["Treating idle waits as bottlenecks.", "Comparing waits without time window normalization."],
    "EVENT                SEC_WAITED\nlog file sync        1223.7"
  ),
  createCommand(
    "perf-03",
    "Performance Monitoring",
    "Beginner",
    "SELECT sid, serial#, username, status, event FROM v$session WHERE type='USER';",
    "Shows active user sessions and current waits.",
    "Triage long-running or blocked sessions.",
    ["Killing sessions without checking SQL and business owner.", "Ignoring machine/program context."],
    "SID SERIAL# USERNAME STATUS EVENT\n128 44211   APPUSR   ACTIVE db file sequential read"
  ),
  createCommand(
    "perf-04",
    "Performance Monitoring",
    "Intermediate",
    "EXEC DBMS_WORKLOAD_REPOSITORY.CREATE_SNAPSHOT;",
    "Creates manual AWR snapshot for targeted before/after analysis.",
    "Capture metrics before deployment and after deployment.",
    ["Not licensing/entitlement aware in non-EE setups.", "Snapshots without workload context notes."],
    "PL/SQL procedure successfully completed."
  ),
  createCommand(
    "perf-05",
    "Performance Monitoring",
    "Intermediate",
    "EXPLAIN PLAN FOR SELECT * FROM hr.employees WHERE department_id = 60;",
    "Generates optimizer plan for SQL statement.",
    "Validate index usage during tuning.",
    ["Relying only on explain plan instead of actual runtime stats.", "Ignoring bind variable peeking effects."],
    "Explained."
  ),
  createCommand(
    "perf-06",
    "Performance Monitoring",
    "Intermediate",
    "SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);",
    "Displays plan generated by EXPLAIN PLAN command.",
    "Review operation tree and access methods.",
    ["Not validating object statistics freshness.", "Missing predicates section details."],
    "Plan hash value: 1034921\n| Id | Operation | Name |"
  ),
  createCommand(
    "perf-07",
    "Performance Monitoring",
    "Advanced",
    "SELECT owner, table_name, stale_stats, last_analyzed FROM dba_tab_statistics WHERE stale_stats='YES';",
    "Finds objects requiring optimizer statistics refresh.",
    "Investigate sudden plan regressions.",
    ["Collecting stats at peak workload times.", "Using blanket gather stats without scope control."],
    "OWNER TABLE_NAME STALE_STATS LAST_ANALYZED\nHR    EMPLOYEES YES        01-MAR-26"
  ),
  createCommand(
    "perf-08",
    "Performance Monitoring",
    "Advanced",
    "SELECT name, phyrds, phywrts, readtim, writetim FROM v$filestat ORDER BY (phyrds + phywrts) DESC FETCH FIRST 10 ROWS ONLY;",
    "Shows file-level I/O hotspots for storage analysis.",
    "Pinpoint high-latency files affecting critical SQL.",
    ["Ignoring ASM striping and storage abstraction.", "Comparing absolute I/O without workload normalization."],
    "NAME                              PHYRDS PHYWRTS\n/u01/oradata/ORCL/users01.dbf      235842 98421"
  )
];

const BACKUP_RECOVERY = [
  createCommand(
    "bkp-01",
    "Backup & Recovery",
    "Beginner",
    "ARCHIVE LOG LIST;",
    "Displays archive mode and current log archival status.",
    "Confirm ARCHIVELOG mode before backup strategy review.",
    ["Assuming archive mode enabled without checking.", "Not validating archive destination space."],
    "Database log mode              Archive Mode\nAutomatic archival             Enabled"
  ),
  createCommand(
    "bkp-02",
    "Backup & Recovery",
    "Beginner",
    "RMAN> BACKUP DATABASE PLUS ARCHIVELOG;",
    "Performs full backup including required archive logs.",
    "Nightly production backup job.",
    ["Running without retention policy.", "No post-backup validation."],
    "Finished backup at 02-MAR-26"
  ),
  createCommand(
    "bkp-03",
    "Backup & Recovery",
    "Intermediate",
    "RMAN> LIST BACKUP SUMMARY;",
    "Summarizes available backup sets and completion times.",
    "Verify recency before planned maintenance.",
    ["Only checking job scheduler success message.", "Ignoring missing archive log backups."],
    "Key TY LV S Device Type Completion Time\n412 B A 0 DISK        02-MAR-26"
  ),
  createCommand(
    "bkp-04",
    "Backup & Recovery",
    "Intermediate",
    "RMAN> CROSSCHECK BACKUP;",
    "Synchronizes RMAN repository with physical backup availability.",
    "Identify expired or missing backup pieces.",
    ["Skipping crosscheck leads to false restore confidence.", "Deleting files outside RMAN workflow."],
    "crosschecked backup piece: found to be AVAILABLE"
  ),
  createCommand(
    "bkp-05",
    "Backup & Recovery",
    "Intermediate",
    "RMAN> DELETE NOPROMPT OBSOLETE;",
    "Removes backups no longer needed under retention policy.",
    "Free backup storage while preserving recovery window.",
    ["Deleting without configured retention policy.", "Manual OS deletion causing catalog drift."],
    "deleted backup piece"
  ),
  createCommand(
    "bkp-06",
    "Backup & Recovery",
    "Advanced",
    "RMAN> RESTORE DATABASE VALIDATE;",
    "Validates restorability without writing restored files.",
    "Monthly backup recoverability audit.",
    ["Assuming backup valid because creation succeeded.", "Not validating archive dependencies."],
    "Finished restore at 02-MAR-26"
  ),
  createCommand(
    "bkp-07",
    "Backup & Recovery",
    "Advanced",
    "RMAN> RESTORE DATAFILE 7;",
    "Restores specific damaged datafile from backup.",
    "Recover one corrupted tablespace file after storage fault.",
    ["Restoring wrong file number.", "Skipping subsequent RECOVER DATAFILE step."],
    "channel ORA_DISK_1: restored datafile 00007"
  ),
  createCommand(
    "bkp-08",
    "Backup & Recovery",
    "Advanced",
    "RMAN> RECOVER DATABASE;",
    "Applies archived/online redo to bring database to consistent state.",
    "Execute after restore during disaster recovery.",
    ["Missing archive logs breaks recovery chain.", "Opening database before recovery completion."],
    "media recovery complete"
  )
];

const LOCK_MONITORING = [
  createCommand(
    "lck-01",
    "Lock Monitoring",
    "Beginner",
    "SELECT sid, serial#, blocking_session, event FROM v$session WHERE blocking_session IS NOT NULL;",
    "Quickly identifies sessions waiting on blockers.",
    "Application complaints about frozen transactions.",
    ["Ignoring RAC instance id in multi-instance setup.", "Killing waiters instead of blockers."],
    "SID SERIAL# BLOCKING_SESSION EVENT\n442 9912    128              enq: TX - row lock contention"
  ),
  createCommand(
    "lck-02",
    "Lock Monitoring",
    "Beginner",
    "SELECT * FROM dba_waiters;",
    "Shows lock waiters and blockers with mode details.",
    "Daily lock contention review.",
    ["Running without DBA privilege.", "Not correlating with business transaction."],
    "WAITING_SESSION HOLDING_SESSION LOCK_TYPE\n442             128             Transaction"
  ),
  createCommand(
    "lck-03",
    "Lock Monitoring",
    "Intermediate",
    "SELECT lo.session_id, lo.object_id, o.object_name FROM v$locked_object lo JOIN dba_objects o ON lo.object_id=o.object_id;",
    "Maps locked objects to affected sessions.",
    "Find exact table causing blocking chain.",
    ["Confusing row-level lock with table lock semantics.", "Ignoring uncommitted batch jobs."],
    "SESSION_ID OBJECT_NAME\n128        ORDERS"
  ),
  createCommand(
    "lck-04",
    "Lock Monitoring",
    "Intermediate",
    "SELECT l1.sid blocker_sid, l2.sid waiter_sid, l1.id1, l1.id2 FROM v$lock l1 JOIN v$lock l2 ON l1.id1=l2.id1 AND l1.id2=l2.id2 WHERE l1.block=1 AND l2.request>0;",
    "Builds explicit blocker-waiter relation from lock structures.",
    "Deep troubleshooting during lock storm incident.",
    ["Using only v$session can hide complex chains.", "Not capturing evidence before killing session."],
    "BLOCKER_SID WAITER_SID ID1   ID2\n128         442        98341 0"
  ),
  createCommand(
    "lck-05",
    "Lock Monitoring",
    "Intermediate",
    "ALTER SYSTEM KILL SESSION '128,9912' IMMEDIATE;",
    "Terminates a problematic session and rolls back its active transaction.",
    "Resolve production deadlock after app-owner approval.",
    ["Wrong SID,SERIAL# kills unrelated session.", "Killing session without incident ticket record."],
    "System altered."
  ),
  createCommand(
    "lck-06",
    "Lock Monitoring",
    "Advanced",
    "SELECT sid, serial#, username, used_ublk, used_urec FROM v$transaction t JOIN v$session s ON t.ses_addr=s.saddr;",
    "Shows open transactions and undo usage footprint.",
    "Identify heavy uncommitted transaction source.",
    ["Assuming all open transactions are problematic.", "Ignoring long business transactions with valid purpose."],
    "SID SERIAL# USED_UBLK USED_UREC\n128 9912    803       9124"
  ),
  createCommand(
    "lck-07",
    "Lock Monitoring",
    "Advanced",
    "ALTER SYSTEM SET dml_lock_timeout = 30 SCOPE=BOTH;",
    "Sets wait duration before DML lock timeout errors.",
    "Reduce immediate failures for short-lived lock conflicts.",
    ["High timeout hides underlying transaction design issue.", "Not evaluating application retry behavior."],
    "System altered."
  ),
  createCommand(
    "lck-08",
    "Lock Monitoring",
    "Advanced",
    "SELECT originating_timestamp, message_text FROM v$diag_alert_ext WHERE message_text LIKE '%deadlock detected%' ORDER BY originating_timestamp DESC;",
    "Extracts deadlock entries from alert diagnostics view.",
    "Post-incident root cause timeline reconstruction.",
    ["Only checking app logs and missing DB-level evidence.", "Not preserving trace files for engineering."],
    "ORIGINATING_TIMESTAMP           MESSAGE_TEXT\n2026-03-02 11:22:54.000000 +00:00 Deadlock detected."
  )
];

const DATA_PUMP = [
  createCommand(
    "dp-01",
    "Data Pump",
    "Beginner",
    "expdp system DIRECTORY=dp_dir DUMPFILE=full_%U.dmp LOGFILE=full_export.log FULL=Y PARALLEL=4",
    "Exports entire database using Data Pump with parallel workers.",
    "Pre-upgrade logical backup in non-RMAN workflow.",
    ["No directory object permissions.", "Undersized filesystem for dump growth."],
    "Job \"SYSTEM\".SYS_EXPORT_FULL_01 successfully completed"
  ),
  createCommand(
    "dp-02",
    "Data Pump",
    "Beginner",
    "expdp system DIRECTORY=dp_dir DUMPFILE=hr_schema.dmp LOGFILE=hr_schema.log SCHEMAS=HR",
    "Exports one or more schemas for migration or refresh.",
    "Refresh dev with sanitized HR schema.",
    ["Forgetting dependent grants and synonyms.", "No FLASHBACK_TIME for consistency."],
    "Master table \"SYSTEM\".\"SYS_EXPORT_SCHEMA_01\" successfully loaded"
  ),
  createCommand(
    "dp-03",
    "Data Pump",
    "Intermediate",
    "impdp system DIRECTORY=dp_dir DUMPFILE=hr_schema.dmp LOGFILE=imp_hr.log REMAP_SCHEMA=HR:HR_DEV",
    "Imports schema while remapping owner to target environment user.",
    "Clone production schema into QA with renamed owner.",
    ["Target user missing default tablespace/quota.", "Constraints imported before parent objects due to filters."],
    "Job \"SYSTEM\".SYS_IMPORT_SCHEMA_01 successfully completed"
  ),
  createCommand(
    "dp-04",
    "Data Pump",
    "Intermediate",
    "impdp system DIRECTORY=dp_dir DUMPFILE=hr_schema.dmp LOGFILE=imp_replace.log TABLE_EXISTS_ACTION=REPLACE",
    "Recreates existing target tables during import.",
    "Reload staging schema nightly from clean dump.",
    ["Running REPLACE on production objects accidentally.", "No backup before destructive import."],
    "Processing object type SCHEMA_EXPORT/TABLE/TABLE"
  ),
  createCommand(
    "dp-05",
    "Data Pump",
    "Intermediate",
    "expdp system DIRECTORY=dp_dir DUMPFILE=estimate.dmp LOGFILE=estimate.log SCHEMAS=HR ESTIMATE_ONLY=Y",
    "Estimates export size before actual dump creation.",
    "Capacity planning for migration window.",
    ["Skipping estimation and filling backup mount.", "Misreading block estimate as compressed dump size."],
    "Estimate in progress using BLOCKS method..."
  ),
  createCommand(
    "dp-06",
    "Data Pump",
    "Advanced",
    "expdp system DIRECTORY=dp_dir NETWORK_LINK=prod_link SCHEMAS=HR DUMPFILE=hr_netexp.dmp LOGFILE=hr_netexp.log",
    "Exports directly over database link without local dump generation on source host.",
    "Cross-environment schema transfer where OS access is restricted.",
    ["DB link latency can elongate export time.", "Privileges on remote objects insufficient."],
    "Starting \"SYSTEM\".\"SYS_EXPORT_SCHEMA_01\": system/********"
  ),
  createCommand(
    "dp-07",
    "Data Pump",
    "Advanced",
    "expdp system DIRECTORY=dp_dir DUMPFILE=meta_only.dmp LOGFILE=meta_only.log SCHEMAS=HR CONTENT=METADATA_ONLY",
    "Exports only metadata for structure migration.",
    "Deploy schema structures before controlled data load.",
    ["Assuming metadata-only includes table rows.", "Not preserving sequence state separately."],
    "Processing object type SCHEMA_EXPORT/TABLE/INDEX"
  ),
  createCommand(
    "dp-08",
    "Data Pump",
    "Advanced",
    "SELECT owner_name, job_name, operation, job_mode, state, degree FROM dba_datapump_jobs;",
    "Monitors active and stopped Data Pump jobs.",
    "Track long-running import during cutover.",
    ["Not attaching to failed job for restart.", "Ignoring worker count and parallel settings."],
    "OWNER_NAME JOB_NAME            STATE    DEGREE\nSYSTEM    SYS_IMPORT_FULL_02 EXECUTING 4"
  )
];

const RMAN = [
  createCommand(
    "rman-01",
    "RMAN",
    "Beginner",
    "RMAN> CONFIGURE RETENTION POLICY TO RECOVERY WINDOW OF 14 DAYS;",
    "Defines backup retention objective in days.",
    "Align backup lifecycle with compliance policy.",
    ["No retention policy leads to storage sprawl.", "Window too short for audit requirements."],
    "new RMAN configuration parameters are successfully stored"
  ),
  createCommand(
    "rman-02",
    "RMAN",
    "Beginner",
    "RMAN> BACKUP INCREMENTAL LEVEL 0 DATABASE TAG 'WEEKLY_L0';",
    "Creates baseline incremental backup.",
    "Weekly full-equivalent backup for incremental chain.",
    ["Running level 1 without valid level 0 baseline.", "No channel parallelism planning."],
    "Finished backup at 02-MAR-26"
  ),
  createCommand(
    "rman-03",
    "RMAN",
    "Intermediate",
    "RMAN> BACKUP ARCHIVELOG ALL DELETE INPUT;",
    "Backs up archive logs and deletes originals after successful backup.",
    "Manage FRA pressure while preserving recoverability.",
    ["Using DELETE INPUT without verifying backup completion.", "Archive log deletion conflicts with standby shipping."],
    "archived log file name=... handle=..."
  ),
  createCommand(
    "rman-04",
    "RMAN",
    "Intermediate",
    "RMAN> RESTORE DATABASE PREVIEW;",
    "Shows which backups and logs would be required for full restore.",
    "Pre-flight check before DR drill.",
    ["Skipping preview and discovering missing pieces during outage.", "Ignoring warning messages in preview output."],
    "List of Backup Sets"
  ),
  createCommand(
    "rman-05",
    "RMAN",
    "Intermediate",
    "RMAN> VALIDATE DATABASE CHECK LOGICAL;",
    "Performs physical and logical block validation.",
    "Detect latent corruption before failover event.",
    ["Validate runs can be I/O heavy in peak window.", "Not archiving validation reports."],
    "Finished validate at 02-MAR-26"
  ),
  createCommand(
    "rman-06",
    "RMAN",
    "Advanced",
    "RMAN> DUPLICATE TARGET DATABASE FOR STANDBY FROM ACTIVE DATABASE DORECOVER;",
    "Creates standby database directly from active primary.",
    "Build Data Guard standby quickly without manual backup transfer.",
    ["Network throughput bottleneck not assessed.", "Password file and SPFILE mismatch issues."],
    "Finished Duplicate Db at 02-MAR-26"
  ),
  createCommand(
    "rman-07",
    "RMAN",
    "Advanced",
    "RMAN> RECOVER TABLE hr.employees OF PLUGGABLE DATABASE pdb1 UNTIL TIME \"SYSDATE-1/24\" AUXILIARY DESTINATION '/u02/aux';",
    "Performs table-level point-in-time recovery without full database restore.",
    "Recover accidentally deleted rows from critical table.",
    ["No auxiliary destination space allocated.", "Incorrect PIT time creates data drift."],
    "Recover table complete"
  ),
  createCommand(
    "rman-08",
    "RMAN",
    "Advanced",
    "RMAN> REPORT NEED BACKUP DAYS 7 DATABASE;",
    "Reports files requiring backup to satisfy policy.",
    "Audit backup freshness during governance review.",
    ["Assuming scheduled job success equals policy compliance.", "Ignoring read-only/offline file treatment."],
    "File # Name                     Days Since Last Backup"
  )
];

const LINUX_FOR_DBA = [
  createCommand(
    "lin-01",
    "Linux for DBA",
    "Beginner",
    "ps -ef | grep pmon",
    "Verifies Oracle instance PMON process at OS level.",
    "Quick check after database startup or suspected process crash.",
    ["Forgetting to filter grep process properly.", "Checking only one instance on multi-DB host."],
    "oracle  28410  1  0 10:22 ?  00:00:00 ora_pmon_ORCL"
  ),
  createCommand(
    "lin-02",
    "Linux for DBA",
    "Beginner",
    "lsnrctl status",
    "Displays Oracle listener status, endpoints, and registered services.",
    "Client connection failures despite database being open.",
    ["Ignoring service registration section.", "Checking wrong ORACLE_HOME listener binary."],
    "Service \"ORCL\" has 1 instance(s). Instance \"orcl\", status READY..."
  ),
  createCommand(
    "lin-03",
    "Linux for DBA",
    "Beginner",
    "df -h",
    "Shows filesystem capacity usage in human-readable format.",
    "Monitor mount points used for datafiles, FRA, and diagnostics.",
    ["Watching only / and forgetting dedicated data mounts.", "No alerting threshold before disks fill up."],
    "Filesystem      Size Used Avail Use% Mounted on\n/u01             500G 310G 190G  63% /u01"
  ),
  createCommand(
    "lin-04",
    "Linux for DBA",
    "Intermediate",
    "free -g",
    "Summarizes host memory and swap usage in gigabytes.",
    "Investigate host memory pressure affecting Oracle instance.",
    ["Reading available memory as strictly free memory.", "Ignoring swap growth trend over time."],
    "total used free shared buff/cache available\n125   98   2   1     24        22"
  ),
  createCommand(
    "lin-05",
    "Linux for DBA",
    "Intermediate",
    "vmstat 1 5",
    "Captures CPU, memory, run queue, and I/O wait snapshots over intervals.",
    "Correlate Oracle wait events with host-level CPU ready and IO wait.",
    ["Taking only one sample and missing burst behavior.", "Ignoring 'wa' and run queue trends."],
    "procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----"
  ),
  createCommand(
    "lin-06",
    "Linux for DBA",
    "Intermediate",
    "iostat -xm 1 5",
    "Reports detailed block-device throughput and latency metrics.",
    "Analyze redo/datafile storage latency during performance incident.",
    ["Looking only at %util and ignoring await/svctm.", "Averaged single snapshot hides spikes."],
    "Device r/s w/s rkB/s wkB/s await %util\nnvme0n1 ... 2.10 38.4"
  ),
  createCommand(
    "lin-07",
    "Linux for DBA",
    "Intermediate",
    "top -H -p <oracle_pid>",
    "Shows per-thread CPU usage for a specific Oracle process.",
    "Identify CPU-hot Oracle thread mapped from v$process spid.",
    ["Not mapping SID -> SPID before OS thread check.", "Interpreting short spikes without baseline."],
    "PID USER PR NI VIRT RES SHR S %CPU %MEM TIME+ COMMAND"
  ),
  createCommand(
    "lin-08",
    "Linux for DBA",
    "Advanced",
    "tail -200f $ORACLE_BASE/diag/rdbms/orcl/ORCL/trace/alert_ORCL.log",
    "Streams recent alert log entries for live incident diagnosis.",
    "Observe ORA errors, checkpoints, and archive issues in real time.",
    ["Watching wrong instance path on multi-db servers.", "No log retention/rotation strategy."],
    "Thread 1 advanced to log sequence 14512 ... ORA-19809: limit exceeded for recovery files"
  ),
  createCommand(
    "lin-09",
    "Linux for DBA",
    "Advanced",
    "du -sh $ORACLE_BASE/diag/rdbms/*/*/trace",
    "Measures diagnostic trace directory growth.",
    "FRA/diag disk pressure event investigation.",
    ["Forgetting ADR purge policy.", "Deleting trace files blindly during active incident."],
    "2.8G /u01/app/oracle/diag/rdbms/orcl/ORCL/trace"
  ),
  createCommand(
    "lin-10",
    "Linux for DBA",
    "Advanced",
    "sar -u 1 5",
    "Collects CPU utilization trend samples using sysstat.",
    "Correlate database slowdown with host CPU saturation over short window.",
    ["sysstat not enabled leads to missing historical visibility.", "Ignoring %steal in virtualized environments."],
    "12:30:01 AM CPU %user %system %iowait %idle\n12:30:02 AM all 41.2 8.3 12.1 37.7"
  ),
  createCommand(
    "lin-11",
    "Linux for DBA",
    "Advanced",
    "crontab -l",
    "Lists scheduled OS tasks for Oracle user context.",
    "Verify backup, log purge, and monitoring jobs are scheduled correctly.",
    ["Relying on memory instead of checking actual crontab.", "No output logging for scheduled jobs."],
    "0 2 * * * /u01/scripts/rman_full_backup.sh > /u01/logs/rman_full.log 2>&1"
  ),
  createCommand(
    "lin-12",
    "Linux for DBA",
    "Advanced",
    "ss -ltnp | grep 1521",
    "Verifies listener TCP port binding and process ownership.",
    "Troubleshoot connection refused errors from application layer.",
    ["Assuming firewall is open without socket verification.", "Checking wrong port when non-default listener used."],
    "LISTEN 0 128 0.0.0.0:1521 0.0.0.0:* users:((\"tnslsnr\",pid=22614,fd=12))"
  )
];

const STARTUP_MAINTENANCE = [
  createCommand(
    "stp-01",
    "Startup & Maintenance",
    "Beginner",
    "STARTUP;",
    "Starts Oracle instance and opens database in default mode.",
    "Bring database online after planned maintenance.",
    ["Running startup without ORACLE_SID context on host.", "Ignoring alert log after startup warnings."],
    "ORACLE instance started. Database mounted. Database opened."
  ),
  createCommand(
    "stp-02",
    "Startup & Maintenance",
    "Beginner",
    "SHUTDOWN IMMEDIATE;",
    "Performs clean shutdown by disconnecting sessions and rolling back active transactions.",
    "Routine maintenance window shutdown.",
    ["Using SHUTDOWN ABORT unnecessarily.", "Not notifying application teams before immediate shutdown."],
    "Database closed. Database dismounted. ORACLE instance shut down."
  ),
  createCommand(
    "stp-03",
    "Startup & Maintenance",
    "Intermediate",
    "STARTUP MOUNT;",
    "Starts instance and mounts control files without opening database.",
    "Prepare environment for media recovery tasks.",
    ["Trying user workload in MOUNT mode.", "Forgetting to open database after maintenance."],
    "ORACLE instance started. Database mounted."
  ),
  createCommand(
    "stp-04",
    "Startup & Maintenance",
    "Intermediate",
    "ALTER DATABASE OPEN;",
    "Opens mounted database for normal user access.",
    "Final step after recovery or mount-only operation.",
    ["Opening before required recovery complete.", "Ignoring ORA warnings during open."],
    "Database altered."
  ),
  createCommand(
    "stp-05",
    "Startup & Maintenance",
    "Intermediate",
    "SHOW PARAMETER spfile;",
    "Displays current SPFILE usage path for parameter persistence checks.",
    "Confirm parameter source before tuning changes.",
    ["Editing wrong init file.", "Assuming memory-only changes are persistent."],
    "NAME   TYPE   VALUE\nspfile string /u01/app/oracle/product/19/dbs/spfileORCL.ora"
  ),
  createCommand(
    "stp-06",
    "Startup & Maintenance",
    "Advanced",
    "ALTER SYSTEM CHECKPOINT;",
    "Forces checkpoint to synchronize dirty buffers and file headers.",
    "Controlled pre-maintenance state synchronization.",
    ["Overusing manual checkpoints in busy OLTP.", "Confusing checkpoint with backup operation."],
    "System altered."
  ),
  createCommand(
    "stp-07",
    "Startup & Maintenance",
    "Advanced",
    "ALTER SYSTEM SWITCH LOGFILE;",
    "Forces log switch to next redo log group.",
    "Trigger archive generation before backup checkpoint.",
    ["Forcing too many switches causing churn.", "Using repeatedly during log I/O incidents."],
    "System altered."
  ),
  createCommand(
    "stp-08",
    "Startup & Maintenance",
    "Advanced",
    "SELECT instance_name, status, startup_time FROM v$instance;",
    "Validates instance uptime and current state post maintenance.",
    "Post-change verification checklist step.",
    ["Skipping verification after restart.", "Not recording startup timestamp in change log."],
    "INSTANCE_NAME STATUS STARTUP_TIME\nORCL OPEN 02-MAR-26 22:47:10"
  )
];

const SECURITY_AUDITING = [
  createCommand(
    "sec-01",
    "Security & Auditing",
    "Beginner",
    "CREATE ROLE app_readonly;",
    "Creates dedicated role for least-privilege access model.",
    "Set up role-based security for reporting users.",
    ["Granting to PUBLIC accidentally.", "Creating role but never assigning object privileges."],
    "Role created."
  ),
  createCommand(
    "sec-02",
    "Security & Auditing",
    "Beginner",
    "GRANT CREATE SESSION TO app_readonly;",
    "Allows role members to establish database sessions.",
    "Enable login while keeping object access minimal.",
    ["Assuming CREATE SESSION includes table access.", "Granting directly to user when role model required."],
    "Grant succeeded."
  ),
  createCommand(
    "sec-03",
    "Security & Auditing",
    "Intermediate",
    "SELECT grantee, owner, table_name, privilege FROM dba_tab_privs WHERE grantee='PUBLIC';",
    "Audits object privileges exposed broadly via PUBLIC.",
    "Hardening review of shared exposure.",
    ["Ignoring PUBLIC grants during security assessment.", "Revoking blindly without impact analysis."],
    "GRANTEE OWNER TABLE_NAME PRIVILEGE\nPUBLIC  SYS   USER$      SELECT"
  ),
  createCommand(
    "sec-04",
    "Security & Auditing",
    "Intermediate",
    "CREATE AUDIT POLICY dba_changes ACTIONS ALTER USER, DROP USER, GRANT;",
    "Defines unified audit policy for privileged account changes.",
    "Track high-risk administrative operations.",
    ["Creating policy but forgetting to enable it.", "Over-auditing without retention strategy."],
    "Audit policy created."
  ),
  createCommand(
    "sec-05",
    "Security & Auditing",
    "Intermediate",
    "AUDIT POLICY dba_changes;",
    "Enables previously created audit policy.",
    "Activate governance controls after policy approval.",
    ["Assuming creation automatically enables policy.", "No periodic review of audit trail volume."],
    "Audit succeeded."
  ),
  createCommand(
    "sec-06",
    "Security & Auditing",
    "Advanced",
    "SELECT event_timestamp, dbusername, action_name, return_code FROM unified_audit_trail ORDER BY event_timestamp DESC FETCH FIRST 25 ROWS ONLY;",
    "Reviews recent unified audit records for investigative analysis.",
    "Security incident triage for suspicious grants or user changes.",
    ["Not filtering by timeframe/user during incidents.", "Ignoring return_code for failed attempts."],
    "EVENT_TIMESTAMP DBUSERNAME ACTION_NAME RETURN_CODE\n...            SYS       GRANT       0"
  ),
  createCommand(
    "sec-07",
    "Security & Auditing",
    "Advanced",
    "ALTER PROFILE secure_profile LIMIT PASSWORD_VERIFY_FUNCTION ora12c_strong_verify_function;",
    "Enforces strong password complexity through profile controls.",
    "Raise baseline authentication policy strength.",
    ["Applying to service accounts without policy exceptions.", "Not communicating password rule changes."],
    "Profile altered."
  ),
  createCommand(
    "sec-08",
    "Security & Auditing",
    "Advanced",
    "SELECT username, account_status, lock_date, expiry_date FROM dba_users ORDER BY username;",
    "Produces account-status audit report for governance.",
    "Periodic entitlement and stale-account review.",
    ["Reviewing only active app accounts.", "Missing EXPIRED(GRACE) accounts near outage risk."],
    "USERNAME ACCOUNT_STATUS LOCK_DATE EXPIRY_DATE\nAPP_USER OPEN        <null>   01-APR-26"
  )
];

const DATA_GUARD_COMMANDS = [
  createCommand(
    "dg-01",
    "Data Guard",
    "Intermediate",
    "SELECT database_role, open_mode, switchover_status FROM v$database;",
    "Checks primary or standby role and switchover readiness.",
    "Pre-check before DR drill or planned switchover.",
    ["Attempting switchover without readiness check.", "Ignoring open_mode mismatch."],
    "DATABASE_ROLE OPEN_MODE            SWITCHOVER_STATUS\nPRIMARY       READ WRITE           TO STANDBY"
  ),
  createCommand(
    "dg-02",
    "Data Guard",
    "Intermediate",
    "SELECT name, value, unit FROM v$dataguard_stats WHERE name IN ('transport lag','apply lag');",
    "Shows transport/apply lag metrics for standby currency.",
    "Daily RPO monitoring for DR compliance.",
    ["Monitoring only one lag metric.", "Ignoring transient spikes during peak redo generation."],
    "NAME          VALUE UNIT\napply lag     +00 00:00:05 day(2) to second(0)"
  ),
  createCommand(
    "dg-03",
    "Data Guard",
    "Intermediate",
    "SELECT process, status, thread#, sequence# FROM v$managed_standby;",
    "Displays standby managed recovery process status.",
    "Investigate apply stop/stall on standby.",
    ["Assuming MRP running without verifying status.", "Ignoring RFS process health."],
    "PROCESS STATUS THREAD# SEQUENCE#\nMRP0 APPLYING_LOG 1 14513"
  ),
  createCommand(
    "dg-04",
    "Data Guard",
    "Advanced",
    "ALTER DATABASE RECOVER MANAGED STANDBY DATABASE USING CURRENT LOGFILE DISCONNECT FROM SESSION;",
    "Starts real-time apply on standby.",
    "Resume managed recovery after standby restart.",
    ["Starting apply on wrong role database.", "Not checking for existing recovery session first."],
    "Database altered."
  ),
  createCommand(
    "dg-05",
    "Data Guard",
    "Advanced",
    "ALTER DATABASE RECOVER MANAGED STANDBY DATABASE CANCEL;",
    "Stops managed recovery process on standby.",
    "Controlled maintenance requiring apply pause.",
    ["Canceling apply without documenting redo gap.", "Forgetting to restart after maintenance."],
    "Database altered."
  ),
  createCommand(
    "dg-06",
    "Data Guard",
    "Advanced",
    "ALTER DATABASE COMMIT TO SWITCHOVER TO PHYSICAL STANDBY WITH SESSION SHUTDOWN;",
    "Converts primary to standby role during switchover.",
    "Planned role transition test.",
    ["Running on wrong system in sequence.", "No application cutover coordination."],
    "Database altered."
  ),
  createCommand(
    "dg-07",
    "Data Guard",
    "Advanced",
    "ALTER DATABASE COMMIT TO SWITCHOVER TO PRIMARY;",
    "Promotes standby to primary during planned switchover.",
    "Complete role reversal after verifying former primary standby readiness.",
    ["Promoting without confirming transport/apply alignment.", "Skipping post-switchover service checks."],
    "Database altered."
  ),
  createCommand(
    "dg-08",
    "Data Guard",
    "Advanced",
    "SELECT dest_id, status, error, destination FROM v$archive_dest_status WHERE status <> 'INACTIVE';",
    "Monitors archive destination state and transport errors.",
    "Troubleshoot redo transport failures.",
    ["Checking only alert log without destination status.", "Ignoring intermittent errors."],
    "DEST_ID STATUS ERROR DESTINATION\n2       VALID  <null> service=orcl_stby"
  )
];

const MULTITENANT_COMMANDS = [
  createCommand(
    "pdb-01",
    "Multitenant CDB/PDB",
    "Beginner",
    "SHOW CON_NAME;",
    "Displays current container context in multitenant environment.",
    "Prevent running PDB-specific command in wrong container.",
    ["Executing schema changes in CDB$ROOT by mistake.", "Not validating container context in scripts."],
    "CON_NAME\n----------------\nCDB$ROOT"
  ),
  createCommand(
    "pdb-02",
    "Multitenant CDB/PDB",
    "Beginner",
    "SELECT con_id, name, open_mode FROM v$pdbs ORDER BY con_id;",
    "Lists pluggable databases and their open mode states.",
    "Daily health check for all PDB services.",
    ["Monitoring only default application PDB.", "Ignoring MOUNTED PDBs after restart."],
    "CON_ID NAME   OPEN_MODE\n3      PDB1   READ WRITE"
  ),
  createCommand(
    "pdb-03",
    "Multitenant CDB/PDB",
    "Intermediate",
    "ALTER SESSION SET CONTAINER = PDB1;",
    "Switches session to target pluggable database.",
    "Run user/tablespace operations in specific PDB.",
    ["Missing privileges to switch container.", "Forgetting to switch back for CDB commands."],
    "Session altered."
  ),
  createCommand(
    "pdb-04",
    "Multitenant CDB/PDB",
    "Intermediate",
    "ALTER PLUGGABLE DATABASE PDB1 OPEN;",
    "Opens specified PDB for normal user access.",
    "Bring application PDB online post maintenance.",
    ["Opening wrong PDB in shared environment.", "Not saving open state for reboot persistence."],
    "Pluggable database altered."
  ),
  createCommand(
    "pdb-05",
    "Multitenant CDB/PDB",
    "Intermediate",
    "ALTER PLUGGABLE DATABASE ALL OPEN;",
    "Opens all pluggable databases in one operation.",
    "Cluster-wide startup standardization step.",
    ["Assuming ALL OPEN succeeded without per-PDB verification.", "Opening dormant PDBs unexpectedly."],
    "Pluggable database altered."
  ),
  createCommand(
    "pdb-06",
    "Multitenant CDB/PDB",
    "Advanced",
    "ALTER PLUGGABLE DATABASE PDB1 SAVE STATE;",
    "Persists open state so PDB auto-opens after CDB restart.",
    "Reduce manual post-restart operational steps.",
    ["Forgetting SAVE STATE after maintenance.", "Saving wrong runtime state unintentionally."],
    "Pluggable database altered."
  ),
  createCommand(
    "pdb-07",
    "Multitenant CDB/PDB",
    "Advanced",
    "SELECT owner, object_name, object_type, status FROM cdb_objects WHERE status='INVALID' ORDER BY con_id;",
    "Finds invalid objects across all containers.",
    "Post-patch health validation across CDB/PDBs.",
    ["Checking only local USER_OBJECTS view.", "Ignoring cross-PDB invalid object count."],
    "OWNER OBJECT_NAME OBJECT_TYPE STATUS\nHR    EMP_PKG     PACKAGE     INVALID"
  ),
  createCommand(
    "pdb-08",
    "Multitenant CDB/PDB",
    "Advanced",
    "ALTER PLUGGABLE DATABASE PDB1 CLOSE IMMEDIATE;",
    "Closes a pluggable database immediately for maintenance.",
    "Perform isolated patching or migration in one PDB.",
    ["Closing production PDB without traffic drain.", "Forgetting dependency checks on shared services."],
    "Pluggable database altered."
  )
];

const COMMAND_EXPANSION = [
  createCommand(
    "usr-09",
    "User Management",
    "Beginner",
    "ALTER USER app_user PASSWORD EXPIRE;",
    "Forces password reset at next successful login.",
    "Enforce immediate credential rotation after temporary password issue.",
    ["Expiring service-account passwords without app owner coordination.", "No communication window for interactive users."],
    "User altered."
  ),
  createCommand(
    "usr-10",
    "User Management",
    "Intermediate",
    "ALTER USER app_user DEFAULT TABLESPACE app_data TEMPORARY TABLESPACE temp;",
    "Sets permanent and temporary tablespaces for controlled object placement.",
    "Correct user provisioning drift where objects were created in USERS tablespace.",
    ["Default tablespace missing quota.", "Assigning temporary tablespace that is offline."],
    "User altered."
  ),
  createCommand(
    "usr-11",
    "User Management",
    "Advanced",
    "SELECT grantee, granted_role, admin_option FROM dba_role_privs WHERE grantee='APP_USER';",
    "Audits role-based entitlements for a user.",
    "Privilege review before production go-live signoff.",
    ["Checking only system privileges and missing role grants.", "Ignoring ADMIN_OPTION privilege escalation risk."],
    "GRANTEE  GRANTED_ROLE   ADMIN_OPTION\nAPP_USER APP_READONLY   NO"
  ),
  createCommand(
    "tbs-09",
    "Tablespace Management",
    "Beginner",
    "SELECT df.tablespace_name, ROUND((df.bytes - fs.bytes_free)/1024/1024,2) used_mb, ROUND(fs.bytes_free/1024/1024,2) free_mb FROM (SELECT tablespace_name, SUM(bytes) bytes FROM dba_data_files GROUP BY tablespace_name) df JOIN (SELECT tablespace_name, SUM(bytes) bytes_free FROM dba_free_space GROUP BY tablespace_name) fs ON df.tablespace_name = fs.tablespace_name ORDER BY free_mb;",
    "Calculates free and used capacity using datafile and free-space views.",
    "Validate exact free MB before adding datafiles.",
    ["Ignoring locally managed autoextend behavior.", "Assuming percent usage alone is enough for capacity planning."],
    "TABLESPACE_NAME USED_MB FREE_MB\nAPP_DATA       15234   3120"
  ),
  createCommand(
    "tbs-10",
    "Tablespace Management",
    "Intermediate",
    "ALTER USER app_user QUOTA 2G ON app_data;",
    "Limits schema growth in a target tablespace.",
    "Prevent one schema from exhausting shared storage.",
    ["Setting low quota and causing unexpected insert failures.", "Forgetting to grant quota on required tablespaces."],
    "User altered."
  ),
  createCommand(
    "tbs-11",
    "Tablespace Management",
    "Advanced",
    "SELECT tablespace_name, status, contents, extent_management, segment_space_management FROM dba_tablespaces ORDER BY tablespace_name;",
    "Provides structural metadata for each tablespace.",
    "Post-migration validation of LMT/ASSM settings.",
    ["Overlooking undo/temp tablespace attributes.", "Running with insufficient privileges in non-DBA account."],
    "TABLESPACE_NAME STATUS  CONTENTS   EXTENT_MANAGEMENT SEGMENT_SPACE_MANAGEMENT\nAPP_DATA        ONLINE  PERMANENT LOCAL             AUTO"
  ),
  createCommand(
    "perf-09",
    "Performance Monitoring",
    "Intermediate",
    "SELECT begin_time, end_time, value FROM v$sysmetric WHERE metric_name='Host CPU Utilization (%)' ORDER BY begin_time DESC FETCH FIRST 5 ROWS ONLY;",
    "Shows recent host CPU utilization trend from Oracle metrics.",
    "Confirm whether DB slowdown aligns with host CPU saturation.",
    ["Checking only one snapshot and missing trend context.", "Ignoring caging or VM limits when interpreting CPU usage."],
    "BEGIN_TIME           END_TIME             VALUE\n02-MAR-26 10:10:00   02-MAR-26 10:11:00  82.4"
  ),
  createCommand(
    "perf-10",
    "Performance Monitoring",
    "Advanced",
    "SELECT session_id, session_serial#, sql_id, event, wait_class FROM v$active_session_history WHERE sample_time > SYSDATE - (5/1440) ORDER BY sample_time DESC FETCH FIRST 30 ROWS ONLY;",
    "Samples recent active-session history to identify dominant waits and SQL IDs.",
    "Rapid incident triage without waiting for full AWR report.",
    ["Using ASH in unsupported editions.", "Reading samples as exact totals instead of representative activity."],
    "SESSION_ID SQL_ID   EVENT                    WAIT_CLASS\n128       7d2a... db file sequential read   User I/O"
  ),
  createCommand(
    "perf-11",
    "Performance Monitoring",
    "Advanced",
    "SELECT sql_id, plan_hash_value, executions, buffer_gets, rows_processed FROM v$sql ORDER BY buffer_gets DESC FETCH FIRST 10 ROWS ONLY;",
    "Highlights buffer-heavy SQL that may cause logical I/O pressure.",
    "Find statements polluting buffer cache during peak usage.",
    ["Comparing statements with very different execution counts without normalization.", "Ignoring bind-aware plan variants."],
    "SQL_ID   PLAN_HASH_VALUE EXECUTIONS BUFFER_GETS\n1f2k... 23282911        9200       42911233"
  ),
  createCommand(
    "bkp-09",
    "Backup & Recovery",
    "Beginner",
    "SELECT destination, status, error FROM v$archive_dest WHERE target='PRIMARY' ORDER BY dest_id;",
    "Checks archive destination health and transport errors.",
    "Daily backup readiness check before nightly jobs.",
    ["Ignoring ERROR column when status appears VALID.", "Not monitoring secondary archive destinations."],
    "DESTINATION                        STATUS ERROR\n/u02/arch                            VALID  <null>"
  ),
  createCommand(
    "bkp-10",
    "Backup & Recovery",
    "Intermediate",
    "RMAN> BACKUP CURRENT CONTROLFILE;",
    "Creates immediate controlfile backup outside regular window.",
    "Take safety backup before risky structural changes.",
    ["Assuming autobackup already exists and skipping manual backup.", "Not storing backup location details in ticket."],
    "channel ORA_DISK_1: piece handle=... tag=TAG..."
  ),
  createCommand(
    "bkp-11",
    "Backup & Recovery",
    "Advanced",
    "RMAN> RECOVER DATAFILE 7;",
    "Applies redo to a restored datafile until consistency is reached.",
    "Finalize single-datafile recovery after storage corruption.",
    ["Running recover before restore completes.", "Recovering wrong file ID from incorrect incident mapping."],
    "media recovery complete"
  ),
  createCommand(
    "lck-09",
    "Lock Monitoring",
    "Beginner",
    "SELECT sid, type, id1, id2, lmode, request, block FROM v$lock WHERE block = 1 OR request > 0;",
    "Displays lock structures for blockers and waiters at low level.",
    "Cross-check lock chain during severe contention incident.",
    ["Interpreting lock mode codes without mapping documentation.", "Taking action without joining to session/user context."],
    "SID TYPE ID1    ID2 LMODE REQUEST BLOCK\n128 TX   98341  0   6     0       1"
  ),
  createCommand(
    "lck-10",
    "Lock Monitoring",
    "Intermediate",
    "ALTER SYSTEM DISCONNECT SESSION '128,9912' POST_TRANSACTION;",
    "Disconnects session after it completes current transaction.",
    "Gracefully drain problematic client session without immediate rollback.",
    ["Using POST_TRANSACTION when blocker is holding long uncommitted TX.", "Wrong SID,SERIAL# in busy systems."],
    "System altered."
  ),
  createCommand(
    "lck-11",
    "Lock Monitoring",
    "Advanced",
    "SELECT sid, serial#, username, osuser, machine, module, program FROM v$session WHERE sid = 128;",
    "Captures ownership metadata before killing or disconnecting sessions.",
    "Incident evidence collection and safe owner validation.",
    ["Skipping owner validation and terminating critical batch session.", "Not recording module/program for RCA."],
    "SID SERIAL# USERNAME OSUSER MACHINE MODULE PROGRAM\n128 9912 APPUSR appsvc app01 JDBC Thin Client"
  ),
  createCommand(
    "dp-09",
    "Data Pump",
    "Beginner",
    "CREATE DIRECTORY dp_dir AS '/u02/dpump';",
    "Creates database directory object mapped to OS path for Data Pump.",
    "Initial setup for controlled export/import location.",
    ["OS directory missing write permission for Oracle user.", "Using shared path without capacity checks."],
    "Directory created."
  ),
  createCommand(
    "dp-10",
    "Data Pump",
    "Beginner",
    "GRANT READ, WRITE ON DIRECTORY dp_dir TO app_user;",
    "Grants directory object permissions needed for Data Pump access.",
    "Delegate schema-level exports to non-SYS account.",
    ["Granting to PUBLIC or broad roles unnecessarily.", "Granting directory privileges without audit controls."],
    "Grant succeeded."
  ),
  createCommand(
    "dp-11",
    "Data Pump",
    "Advanced",
    "impdp system DIRECTORY=dp_dir DUMPFILE=hr_schema.dmp SQLFILE=hr_preview.sql CONTENT=METADATA_ONLY",
    "Generates import DDL preview script without changing database.",
    "Review object DDL and dependencies before migration cutover.",
    ["Assuming SQLFILE validates runtime data load behavior.", "Not reviewing generated grants and storage clauses."],
    "Master table \"SYSTEM\".\"SYS_SQL_FILE_FULL_01\" successfully loaded"
  ),
  createCommand(
    "rman-09",
    "RMAN",
    "Beginner",
    "RMAN> CONFIGURE CONTROLFILE AUTOBACKUP ON;",
    "Enables automatic controlfile/SPFILE backup after backup jobs.",
    "Improve recoverability when repository metadata is damaged.",
    ["Assuming autobackup is enabled by default.", "Not validating autobackup restore path."],
    "new RMAN configuration parameters are successfully stored"
  ),
  createCommand(
    "rman-10",
    "RMAN",
    "Intermediate",
    "RMAN> LIST ARCHIVELOG ALL;",
    "Lists archived redo logs known to RMAN repository.",
    "Validate log availability before point-in-time recovery.",
    ["Checking only filesystem and not RMAN metadata.", "Ignoring gaps in sequence continuity."],
    "List of Archived Log Copies"
  ),
  createCommand(
    "rman-11",
    "RMAN",
    "Advanced",
    "RMAN> DELETE EXPIRED BACKUP;",
    "Removes repository records for backups missing on disk/tape after crosscheck.",
    "Clean stale metadata to avoid restore confusion.",
    ["Running DELETE EXPIRED before CROSSCHECK BACKUP.", "Confusing EXPIRED with OBSOLETE retention cleanup."],
    "deleted backup piece\nbackup piece handle=..."
  ),
  createCommand(
    "lin-13",
    "Linux for DBA",
    "Intermediate",
    "tnsping ORCL",
    "Tests Oracle Net connectivity and basic name resolution to target service.",
    "First-pass validation when application reports intermittent login failures.",
    ["Assuming tnsping validates database authentication.", "Testing from wrong ORACLE_HOME/network admin context."],
    "OK (20 msec)"
  ),
  createCommand(
    "lin-14",
    "Linux for DBA",
    "Intermediate",
    "pidstat -p <oracle_spid> 1 5",
    "Samples CPU usage of a specific Oracle OS process over time.",
    "Correlate a hot session SPID to sustained host CPU burn.",
    ["Using one-time ps output and missing burst behavior.", "Not mapping DB SID to SPID first."],
    "Linux ...\nAverage:      UID       PID    %usr %system  %CPU   Command\nAverage:      54321     30111   71.2   12.4   83.6 ora_dbw0_ORCL"
  ),
  createCommand(
    "lin-15",
    "Linux for DBA",
    "Advanced",
    "find $ORACLE_BASE/diag/rdbms -type f -name '*.trc' -mtime +14 -print",
    "Finds old trace files suitable for controlled cleanup review.",
    "Reduce diagnostic mount growth after major incident period.",
    ["Deleting traces before RCA closure.", "Removing active trace files without ADRCI policy."],
    "/u01/app/oracle/diag/rdbms/orcl/ORCL/trace/ORCL_ora_19312.trc"
  ),
  createCommand(
    "lin-16",
    "Linux for DBA",
    "Advanced",
    "lsof | grep -E 'alert_ORCL\\.log|\\.dbf|\\.arc' | head -20",
    "Shows open file handles for Oracle-related logs/datafiles/archive files.",
    "Confirm which process still holds files before storage maintenance.",
    ["Running lsof without root where required and assuming empty output means no handles.", "Using broad grep patterns causing noisy false matches."],
    "oracle 30111 oracle  24w REG 253,1 ... /u01/oradata/ORCL/users01.dbf"
  ),
  createCommand(
    "stp-09",
    "Startup & Maintenance",
    "Beginner",
    "SHUTDOWN TRANSACTIONAL;",
    "Blocks new transactions and waits for active ones to complete before shutdown.",
    "Controlled maintenance when immediate rollback risk is high.",
    ["Using transactional shutdown during outage where speed is critical.", "Forgetting long transactions can delay shutdown significantly."],
    "Database closed. Database dismounted. ORACLE instance shut down."
  ),
  createCommand(
    "stp-10",
    "Startup & Maintenance",
    "Intermediate",
    "ALTER DATABASE OPEN READ ONLY;",
    "Opens database in read-only mode for reporting or diagnostics.",
    "Validation checks on restored clone before enabling writes.",
    ["Attempting DML in read-only mode.", "Confusing read-only with guaranteed no redo generation scenarios."],
    "Database altered."
  ),
  createCommand(
    "stp-11",
    "Startup & Maintenance",
    "Advanced",
    "SELECT name, value FROM v$parameter WHERE name IN ('db_name','db_unique_name','open_cursors','processes');",
    "Pulls key runtime parameter values for baseline verification.",
    "Post-startup sanity check after parameter change deployment.",
    ["Comparing with outdated baseline docs.", "Ignoring SPFILE vs memory differences after dynamic changes."],
    "NAME            VALUE\nprocesses       1200\nopen_cursors    600"
  ),
  createCommand(
    "sec-09",
    "Security & Auditing",
    "Beginner",
    "REVOKE CREATE SESSION FROM app_readonly;",
    "Removes login capability from role or user during access rollback.",
    "Emergency containment for compromised account path.",
    ["Revoking from shared role without impact analysis.", "No change ticket evidence for emergency action."],
    "Revoke succeeded."
  ),
  createCommand(
    "sec-10",
    "Security & Auditing",
    "Intermediate",
    "SELECT policy_name, enabled_opt, user_name, entity_name FROM audit_unified_enabled_policies ORDER BY policy_name;",
    "Lists unified audit policies currently enabled.",
    "Validate that mandated audit policies are active after patching.",
    ["Assuming policy exists implies enabled.", "Ignoring user-scoped policy enablement."],
    "POLICY_NAME ENABLED_OPT USER_NAME ENTITY_NAME\nDBA_CHANGES BY USER   SYS       <null>"
  ),
  createCommand(
    "sec-11",
    "Security & Auditing",
    "Advanced",
    "SELECT username, authentication_type, profile, account_status FROM dba_users ORDER BY username;",
    "Combines auth model and profile state for security posture review.",
    "Quarterly identity-control audit for compliance reporting.",
    ["Reviewing only OPEN accounts and missing expired/locked risk indicators.", "Not reconciling external/global auth accounts."],
    "USERNAME AUTHENTICATION_TYPE PROFILE        ACCOUNT_STATUS\nAPP_USER PASSWORD            SECURE_PROFILE OPEN"
  ),
  createCommand(
    "dg-09",
    "Data Guard",
    "Intermediate",
    "SELECT thread#, sequence#, applied FROM v$archived_log ORDER BY sequence# DESC FETCH FIRST 20 ROWS ONLY;",
    "Checks archival sequence progression and apply state on standby.",
    "Validate no apply gap after network disturbance.",
    ["Reading primary output as standby apply status.", "Ignoring thread differences in RAC."],
    "THREAD# SEQUENCE# APPLIED\n1       14514     YES"
  ),
  createCommand(
    "dg-10",
    "Data Guard",
    "Advanced",
    "DGMGRL> SHOW CONFIGURATION;",
    "Displays broker configuration health and role assignments.",
    "Fast DR health check before planned role transition.",
    ["Running broker commands when broker is disabled.", "Ignoring warning state details before switchover."],
    "Configuration - ORCL_DG\nProtection Mode: MaxPerformance\nMembers: ORCL - Primary database"
  ),
  createCommand(
    "dg-11",
    "Data Guard",
    "Advanced",
    "SELECT protection_mode, protection_level, guard_status FROM v$database;",
    "Verifies protection guarantees currently enforced in Data Guard.",
    "Confirm DR policy alignment after maintenance changes.",
    ["Confusing protection_mode with actual protection_level during transport issues.", "Skipping validation after destination failures."],
    "PROTECTION_MODE   PROTECTION_LEVEL  GUARD_STATUS\nMAXIMUM PERFORMANCE MAXIMUM PERFORMANCE NONE"
  ),
  createCommand(
    "pdb-09",
    "Multitenant CDB/PDB",
    "Beginner",
    "SHOW PDBS;",
    "Shows pluggable database list and open mode in SQL*Plus style output.",
    "Quick visual check after CDB restart.",
    ["Assuming SHOW PDBS is valid in all SQL clients.", "Not checking restricted mode flags."],
    "CON_ID CON_NAME OPEN MODE RESTRICTED\n3      PDB1     READ WRITE NO"
  ),
  createCommand(
    "pdb-10",
    "Multitenant CDB/PDB",
    "Intermediate",
    "ALTER PLUGGABLE DATABASE ALL SAVE STATE;",
    "Persists open state for every PDB to auto-open on future restarts.",
    "Standardize startup behavior across environments.",
    ["Saving state while PDBs are intentionally closed for maintenance.", "Not validating state after restart."],
    "Pluggable database altered."
  ),
  createCommand(
    "pdb-11",
    "Multitenant CDB/PDB",
    "Advanced",
    "SELECT con_id, username, account_status FROM cdb_users WHERE username='APP_USER' ORDER BY con_id;",
    "Checks user presence and status across all containers.",
    "Verify tenant-wide account provisioning consistency.",
    ["Running from PDB and expecting CDB-wide visibility.", "Not filtering common vs local users correctly."],
    "CON_ID USERNAME ACCOUNT_STATUS\n3      APP_USER OPEN"
  )
];

/** @type {import('./contracts.js').CommandEntry[]} */
export const COMMAND_ENTRIES = [
  ...USER_MANAGEMENT,
  ...TABLESPACE_MANAGEMENT,
  ...PERFORMANCE_MONITORING,
  ...BACKUP_RECOVERY,
  ...LOCK_MONITORING,
  ...DATA_PUMP,
  ...RMAN,
  ...LINUX_FOR_DBA,
  ...STARTUP_MAINTENANCE,
  ...SECURITY_AUDITING,
  ...DATA_GUARD_COMMANDS,
  ...MULTITENANT_COMMANDS,
  ...COMMAND_EXPANSION
];

export const COMMAND_CATEGORIES = [
  "User Management",
  "Tablespace Management",
  "Performance Monitoring",
  "Backup & Recovery",
  "Lock Monitoring",
  "Data Pump",
  "RMAN",
  "Linux for DBA",
  "Startup & Maintenance",
  "Security & Auditing",
  "Data Guard",
  "Multitenant CDB/PDB"
];
