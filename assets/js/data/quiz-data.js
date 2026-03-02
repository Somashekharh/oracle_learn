/** @type {import('./contracts.js').QuizQuestion[]} */
export const QUIZ_QUESTIONS = [
  {
    id: "q-01",
    level: "Beginner",
    question: "Which component writes dirty buffers from cache to datafiles?",
    options: ["DBWR", "LGWR", "PMON", "ARCn"],
    answerIndex: 0,
    explanation: "DBWR is responsible for writing modified buffers from cache to datafiles."
  },
  {
    id: "q-02",
    level: "Beginner",
    question: "Which SQL statement permanently saves a transaction?",
    options: ["ROLLBACK", "COMMIT", "SAVEPOINT", "MERGE"],
    answerIndex: 1,
    explanation: "COMMIT confirms changes and makes them durable."
  },
  {
    id: "q-03",
    level: "Beginner",
    question: "What does SGA stand for?",
    options: ["System Global Area", "Session Group Allocation", "Server Grid Array", "Storage Global Access"],
    answerIndex: 0,
    explanation: "SGA means System Global Area."
  },
  {
    id: "q-04",
    level: "Beginner",
    question: "Which Oracle utility is used for logical schema export?",
    options: ["RMAN", "expdp", "SQL Loader", "lsnrctl"],
    answerIndex: 1,
    explanation: "expdp is Oracle Data Pump export utility."
  },
  {
    id: "q-05",
    level: "Beginner",
    question: "What view helps check current instance status?",
    options: ["v$instance", "dba_users", "v$logfile", "v$process"],
    answerIndex: 0,
    explanation: "v$instance shows startup status and database state details."
  },
  {
    id: "q-06",
    level: "Intermediate",
    question: "Why is LGWR critical at commit time?",
    options: ["It writes control files", "It flushes redo for durability", "It rebuilds indexes", "It frees temp segments"],
    answerIndex: 1,
    explanation: "Commit waits for LGWR redo flush to guarantee durability."
  },
  {
    id: "q-07",
    level: "Intermediate",
    question: "Which process performs instance recovery after crash?",
    options: ["CKPT", "SMON", "DBWR", "PMON"],
    answerIndex: 1,
    explanation: "SMON handles crash/instance recovery."
  },
  {
    id: "q-08",
    level: "Intermediate",
    question: "Which setting helps enforce account lockout policy?",
    options: ["TABLESPACE quota", "PROFILE FAILED_LOGIN_ATTEMPTS", "NLS parameters", "DB_BLOCK_SIZE"],
    answerIndex: 1,
    explanation: "Profile limit FAILED_LOGIN_ATTEMPTS controls lockout threshold."
  },
  {
    id: "q-09",
    level: "Intermediate",
    question: "What does ARCHIVELOG mode primarily enable?",
    options: ["Faster parsing", "Point-in-time recovery", "Less disk usage", "Automatic indexing"],
    answerIndex: 1,
    explanation: "Archive logs preserve redo history needed for PITR."
  },
  {
    id: "q-10",
    level: "Intermediate",
    question: "Which view is useful for tablespace usage percentage?",
    options: ["dba_tablespace_usage_metrics", "v$parameter", "dba_roles", "v$diag_alert_ext"],
    answerIndex: 0,
    explanation: "dba_tablespace_usage_metrics provides used_percent values."
  },
  {
    id: "q-11",
    level: "Intermediate",
    question: "What is common cause of high TEMP usage?",
    options: ["Frequent commits", "Large sorts/hash joins spilling to disk", "Control file multiplexing", "Password expiry"],
    answerIndex: 1,
    explanation: "Insufficient PGA/workarea causes sort/hash spill to TEMP."
  },
  {
    id: "q-12",
    level: "Intermediate",
    question: "Which command lists Data Pump jobs?",
    options: ["SELECT * FROM dba_datapump_jobs", "SHOW JOBS", "RMAN LIST JOB", "LIST DATAPUMP"],
    answerIndex: 0,
    explanation: "dba_datapump_jobs tracks import/export state and mode."
  },
  {
    id: "q-13",
    level: "Intermediate",
    question: "ROLLBACK uses which data structure to undo changes?",
    options: ["Redo log", "Undo segments", "Control file", "Shared pool"],
    answerIndex: 1,
    explanation: "Rollback applies undo records to reverse uncommitted work."
  },
  {
    id: "q-14",
    level: "Intermediate",
    question: "What does CKPT update during checkpoints?",
    options: ["Password file", "Datafile headers and control file metadata", "AWR snapshots", "Listener config"],
    answerIndex: 1,
    explanation: "CKPT updates file headers/control file checkpoint information."
  },
  {
    id: "q-15",
    level: "Intermediate",
    question: "What is the best first step in lock contention incident?",
    options: ["Restart database", "Identify blocker and waiter sessions", "Drop indexes", "Resize redo logs"],
    answerIndex: 1,
    explanation: "Always identify and validate lock chain before any action."
  },
  {
    id: "q-16",
    level: "Advanced",
    question: "ORA-01555 is generally associated with what condition?",
    options: ["Corrupt control file", "Snapshot too old due to undo overwrite", "Redo log missing", "Listener down"],
    answerIndex: 1,
    explanation: "Long query + insufficient undo retention can trigger ORA-01555."
  },
  {
    id: "q-17",
    level: "Advanced",
    question: "Which metric is most tied to commit latency complaints?",
    options: ["db file scattered read", "log file sync", "library cache lock", "enqueue: TM"],
    answerIndex: 1,
    explanation: "log file sync indicates wait for redo flush on commit."
  },
  {
    id: "q-18",
    level: "Advanced",
    question: "In RMAN, which command validates recoverability without restore output files?",
    options: ["RESTORE DATABASE", "RESTORE DATABASE VALIDATE", "RECOVER DATABASE", "LIST BACKUP"],
    answerIndex: 1,
    explanation: "RESTORE ... VALIDATE checks backup usability safely."
  },
  {
    id: "q-19",
    level: "Advanced",
    question: "If archive destination becomes full, what is high risk outcome?",
    options: ["Optimizer disabled", "Log switches can stall DML", "Control file reset", "Users lose privileges"],
    answerIndex: 1,
    explanation: "Redo cannot archive, eventually blocking further log reuse and DML."
  },
  {
    id: "q-20",
    level: "Advanced",
    question: "Least privilege principle mainly reduces what?",
    options: ["Patch time", "Blast radius of credential compromise", "Redo generation", "CPU consumption"],
    answerIndex: 1,
    explanation: "Minimal rights limit damage if account is abused."
  },
  {
    id: "q-21",
    level: "Advanced",
    question: "Which query helps detect stale optimizer statistics?",
    options: ["dba_tab_statistics where stale_stats='YES'", "v$session where status='ACTIVE'", "dba_users", "v$locked_object"],
    answerIndex: 0,
    explanation: "dba_tab_statistics exposes stale stats flags."
  },
  {
    id: "q-22",
    level: "Beginner",
    question: "Which Oracle file stores database structural metadata and checkpoint history?",
    options: ["Redo log", "Control file", "Datafile", "Password file"],
    answerIndex: 1,
    explanation: "Control files maintain critical structure and recovery metadata."
  },
  {
    id: "q-23",
    level: "Intermediate",
    question: "What does PMON do after a user process fails?",
    options: ["Applies archived logs", "Cleans up resources and session state", "Writes dirty buffers", "Collects statistics"],
    answerIndex: 1,
    explanation: "PMON recovers resources from failed sessions/processes."
  },
  {
    id: "q-24",
    level: "Intermediate",
    question: "Best command to verify recent Oracle backup inventory?",
    options: ["LIST BACKUP SUMMARY", "SHOW PARAMETER", "ARCHIVE LOG LIST", "SELECT * FROM dba_users"],
    answerIndex: 0,
    explanation: "LIST BACKUP SUMMARY quickly surfaces backup recency and type."
  },
  {
    id: "q-25",
    level: "Advanced",
    question: "What should be reviewed before killing a blocking session?",
    options: ["Only SID number", "Business impact, SQL, owner confirmation, rollback risk", "PGA usage only", "NLS settings"],
    answerIndex: 1,
    explanation: "Killing sessions without business/context validation is risky."
  },
  {
    id: "q-26",
    level: "Intermediate",
    question: "Which command helps enforce stronger password controls?",
    options: ["CREATE PROFILE ... PASSWORD_LIFE_TIME", "ALTER SYSTEM FLUSH BUFFER_CACHE", "TRUNCATE TABLE", "DROP ROLE"],
    answerIndex: 0,
    explanation: "Password policy is enforced using profiles."
  },
  {
    id: "q-27",
    level: "Beginner",
    question: "Data Pump import tool is:",
    options: ["expdp", "impdp", "rman", "sqlldr"],
    answerIndex: 1,
    explanation: "impdp imports logical objects/datasets from Data Pump dump files."
  },
  {
    id: "q-28",
    level: "Advanced",
    question: "Data Guard apply lag indicates:",
    options: ["Primary CPU usage", "Delay in redo apply on standby", "Schema invalid objects", "Listener latency"],
    answerIndex: 1,
    explanation: "Apply lag reflects standby currency behind primary commits."
  },
  {
    id: "q-29",
    level: "Intermediate",
    question: "Why use bind variables in applications?",
    options: ["Increase SQL injection risk", "Reduce hard parse and improve security", "Disable optimizer", "Avoid indexes"],
    answerIndex: 1,
    explanation: "Bind variables improve cursor reuse and reduce injection vectors."
  },
  {
    id: "q-30",
    level: "Advanced",
    question: "Which RMAN feature can recover a single table to past time?",
    options: ["RECOVER TABLE", "RESTORE CONTROLFILE", "BLOCKRECOVER", "CHANGE ARCHIVELOG"],
    answerIndex: 0,
    explanation: "RMAN RECOVER TABLE supports table-level point-in-time recovery."
  }
];
