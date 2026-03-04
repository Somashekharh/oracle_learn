/** @type {Record<string, import('./contracts.js').DataFlowOperationInfo>} */
export const DATAFLOW_OPERATION_INFO = {
  SELECT: {
    id: "SELECT",
    label: "SELECT",
    goal: "Read consistent result sets with minimal latency.",
    transactionClass: "Read-only (no explicit COMMIT required).",
    lockProfile: "No row locks for normal consistent reads.",
    durabilityRule: "No data change durability event.",
    dbaFocus: "Parse efficiency, buffer cache hit ratio, and I/O latency."
  },
  INSERT: {
    id: "INSERT",
    label: "INSERT",
    goal: "Add new rows safely with undo/redo generation.",
    transactionClass: "DML transaction; COMMIT required for durability.",
    lockProfile: "Row-level TX locks on inserted rows and related index entries.",
    durabilityRule: "Redo must be flushed by LGWR at COMMIT.",
    dbaFocus: "Undo sizing, redo rate, and commit batching."
  },
  UPDATE: {
    id: "UPDATE",
    label: "UPDATE",
    goal: "Modify existing row values while preserving read consistency.",
    transactionClass: "DML transaction; COMMIT required.",
    lockProfile: "Row locks held until COMMIT/ROLLBACK.",
    durabilityRule: "Redo flush controls commit latency.",
    dbaFocus: "Blocking chains, long transactions, and plan quality."
  },
  DELETE: {
    id: "DELETE",
    label: "DELETE",
    goal: "Remove targeted rows with rollback safety.",
    transactionClass: "DML transaction; COMMIT required.",
    lockProfile: "Row-level locks on deleted rows.",
    durabilityRule: "Undo+redo generated for recoverability.",
    dbaFocus: "Purge strategy, undo growth, and lock duration."
  },
  MERGE: {
    id: "MERGE",
    label: "MERGE",
    goal: "Perform conditional UPSERT in one SQL statement.",
    transactionClass: "DML transaction; COMMIT required.",
    lockProfile: "Locks depend on matched UPDATE and unmatched INSERT paths.",
    durabilityRule: "Redo generated across both branches.",
    dbaFocus: "Join path efficiency, batch size, and contention."
  },
  COMMIT: {
    id: "COMMIT",
    label: "COMMIT",
    goal: "Make transaction changes durable and visible.",
    transactionClass: "Transaction-control (TCL).",
    lockProfile: "Releases transaction-held row locks.",
    durabilityRule: "Commit returns after redo flush (log file sync).",
    dbaFocus: "LGWR performance, log sizing, and commit frequency."
  },
  ROLLBACK: {
    id: "ROLLBACK",
    label: "ROLLBACK",
    goal: "Undo uncommitted changes to restore prior state.",
    transactionClass: "Transaction-control (TCL).",
    lockProfile: "Locks released after rollback completion.",
    durabilityRule: "Rollback itself generates redo records.",
    dbaFocus: "Large rollback timing and undo pressure."
  },
  DDL: {
    id: "DDL",
    label: "DDL",
    goal: "Change object metadata safely with dictionary consistency.",
    transactionClass: "DDL with implicit commit behavior.",
    lockProfile: "May require metadata locks and object-level serialization.",
    durabilityRule: "Dictionary redo persisted via LGWR.",
    dbaFocus: "Change windows, dependent object invalidations, and auditing."
  },
  SELECT_FOR_UPDATE: {
    id: "SELECT_FOR_UPDATE",
    label: "SELECT FOR UPDATE",
    goal: "Read and reserve rows for controlled business update.",
    transactionClass: "Read + lock acquisition; COMMIT/ROLLBACK needed to release.",
    lockProfile: "TX row locks on selected rows.",
    durabilityRule: "Lock metadata and later DML redo are durable on commit.",
    dbaFocus: "Blocking-session monitoring and timeout strategy."
  },
  BULK_LOAD: {
    id: "BULK_LOAD",
    label: "BULK LOAD",
    goal: "Ingest large volumes with optimized direct path behavior.",
    transactionClass: "High-volume DML; commit strategy is critical.",
    lockProfile: "Can hold stronger locks depending on load mode.",
    durabilityRule: "High redo rate unless NOLOGGING path is used.",
    dbaFocus: "Redo/archivelog pressure, checkpoint behavior, and load windows."
  },
  FLASHBACK_QUERY: {
    id: "FLASHBACK_QUERY",
    label: "FLASHBACK QUERY",
    goal: "Query past committed data using undo-based reconstruction.",
    transactionClass: "Read-only historical query.",
    lockProfile: "No DML row locking; depends on undo availability.",
    durabilityRule: "No new data durability event; relies on retained undo.",
    dbaFocus: "Undo retention sizing and ORA-01555 prevention."
  }
};

/** @type {Record<string, import('./contracts.js').DataFlowStep[]>} */
export const DATAFLOW_STEPS_BY_OPERATION = {
  SELECT: [
    {
      id: "select-1",
      operation: "SELECT",
      stage: "client_request",
      explanation: "Client sends a SELECT statement to the database service.",
      commandHint: "SELECT first_name, salary FROM hr.employees WHERE department_id = 60;",
      watchpoint: "Capture SQL text and module name for high-frequency reports.",
      failureRisk: "Unbounded report queries can saturate shared resources during peak hours.",
      animationTargetIds: ["client_request"]
    },
    {
      id: "select-2",
      operation: "SELECT",
      stage: "parse_check",
      explanation: "Oracle parses SQL, validates syntax, object existence, and user privileges.",
      commandHint: "SELECT sql_id, parse_calls FROM v$sqlarea ORDER BY parse_calls DESC FETCH FIRST 10 ROWS ONLY;",
      watchpoint: "High parse_calls indicate poor cursor reuse and possible bind variable issues.",
      failureRisk: "Excess hard parsing can cause CPU spikes and library cache contention.",
      animationTargetIds: ["parse_check", "shared_pool"]
    },
    {
      id: "select-3",
      operation: "SELECT",
      stage: "optimize_cursor",
      explanation: "Optimizer generates execution plan and builds/reuses SQL cursor.",
      commandHint: "EXPLAIN PLAN FOR SELECT first_name, salary FROM hr.employees WHERE department_id = 60;",
      watchpoint: "Monitor plan regressions after statistics or schema changes.",
      failureRisk: "Poor plans lead to high I/O and slow application response.",
      animationTargetIds: ["optimize_cursor", "shared_pool"]
    },
    {
      id: "select-4",
      operation: "SELECT",
      stage: "buffer_cache",
      explanation: "Server process checks buffer cache for required blocks.",
      commandHint: "SELECT name, value FROM v$sysstat WHERE name IN ('session logical reads','physical reads');",
      watchpoint: "Track logical-to-physical read ratio for cache effectiveness.",
      failureRisk: "Low cache hit drives unnecessary storage reads.",
      animationTargetIds: ["buffer_cache"]
    },
    {
      id: "select-5",
      operation: "SELECT",
      stage: "datafile_io",
      explanation: "On cache miss, Oracle reads blocks from datafiles into buffer cache.",
      commandHint: "SELECT event, total_waits FROM v$system_event WHERE event LIKE 'db file%read';",
      watchpoint: "Investigate top objects causing repeated physical reads.",
      failureRisk: "I/O latency can dominate query response time.",
      animationTargetIds: ["datafile_io", "buffer_cache"]
    },
    {
      id: "select-6",
      operation: "SELECT",
      stage: "undo_segment",
      explanation: "For read consistency, Oracle may reconstruct older block versions using undo.",
      commandHint: "SELECT begin_time, undoblks, txncount FROM v$undostat ORDER BY begin_time DESC FETCH FIRST 6 ROWS ONLY;",
      watchpoint: "Long-running queries require sufficient undo retention.",
      failureRisk: "Insufficient undo can produce ORA-01555 errors.",
      animationTargetIds: ["undo_segment", "buffer_cache"]
    },
    {
      id: "select-7",
      operation: "SELECT",
      stage: "result_return",
      explanation: "Result rows are returned to client; no commit is required for read-only operation.",
      commandHint: "-- SELECT does not need COMMIT",
      watchpoint: "Validate response-time SLA and row counts for critical dashboards.",
      failureRisk: "Stale statistics or poor indexing can degrade user-facing reports.",
      animationTargetIds: ["result_return"]
    }
  ],

  INSERT: [
    {
      id: "insert-1",
      operation: "INSERT",
      stage: "client_request",
      explanation: "Client submits INSERT request with row values.",
      commandHint: "INSERT INTO hr.audit_events(event_name, created_on) VALUES ('LOGIN', SYSDATE);",
      watchpoint: "Track insert burst patterns from ETL/app jobs.",
      failureRisk: "Sudden insert storms can pressure redo and undo subsystems.",
      animationTargetIds: ["client_request"]
    },
    {
      id: "insert-2",
      operation: "INSERT",
      stage: "parse_check",
      explanation: "Oracle validates syntax, table metadata, and privileges.",
      commandHint: "SELECT sql_id, executions FROM v$sqlarea WHERE sql_text LIKE 'INSERT INTO HR.AUDIT_EVENTS%';",
      watchpoint: "Use bind variables for high-frequency inserts.",
      failureRisk: "Literal-heavy insert SQL increases hard parse overhead.",
      animationTargetIds: ["parse_check", "shared_pool"]
    },
    {
      id: "insert-3",
      operation: "INSERT",
      stage: "buffer_cache",
      explanation: "Row changes are applied in memory to database blocks in buffer cache.",
      commandHint: "SELECT name, value FROM v$sysstat WHERE name='db block changes';",
      watchpoint: "Monitor block change rate during peak windows.",
      failureRisk: "High block churn can increase checkpoint and write pressure.",
      animationTargetIds: ["buffer_cache"]
    },
    {
      id: "insert-4",
      operation: "INSERT",
      stage: "undo_segment",
      explanation: "Undo records are generated so changes can be rolled back if needed.",
      commandHint: "SELECT used_ublk, used_urec FROM v$transaction;",
      watchpoint: "Large transactions can rapidly consume undo tablespace.",
      failureRisk: "Undo exhaustion triggers transaction failures and instability.",
      animationTargetIds: ["undo_segment"]
    },
    {
      id: "insert-5",
      operation: "INSERT",
      stage: "redo_buffer",
      explanation: "Change vectors are copied into redo log buffer.",
      commandHint: "SELECT name, value FROM v$sysstat WHERE name IN ('redo entries','redo size');",
      watchpoint: "Watch redo generation rate for log file sizing decisions.",
      failureRisk: "Under-sized redo groups increase switch frequency and waits.",
      animationTargetIds: ["redo_buffer"]
    },
    {
      id: "insert-6",
      operation: "INSERT",
      stage: "result_return",
      explanation: "Statement succeeds but changes become durable only after COMMIT.",
      commandHint: "COMMIT;",
      watchpoint: "Application commit strategy should balance durability and throughput.",
      failureRisk: "Uncommitted sessions can hold locks and inflate undo usage.",
      animationTargetIds: ["result_return"]
    }
  ],

  UPDATE: [
    {
      id: "update-1",
      operation: "UPDATE",
      stage: "client_request",
      explanation: "Client submits UPDATE with predicates.",
      commandHint: "UPDATE hr.employees SET salary = salary * 1.05 WHERE department_id = 60;",
      watchpoint: "Validate update cardinality before running in production.",
      failureRisk: "Wide updates can create lock contention and large undo/redo spikes.",
      animationTargetIds: ["client_request"]
    },
    {
      id: "update-2",
      operation: "UPDATE",
      stage: "optimize_cursor",
      explanation: "Optimizer chooses access path to locate target rows.",
      commandHint: "SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY_CURSOR(NULL,NULL,'BASIC +PREDICATE'));",
      watchpoint: "Check for full scans on large tables.",
      failureRisk: "Bad plans increase elapsed time and lock duration.",
      animationTargetIds: ["optimize_cursor", "shared_pool"]
    },
    {
      id: "update-3",
      operation: "UPDATE",
      stage: "buffer_cache",
      explanation: "Target blocks are updated in buffer cache under row-level locks.",
      commandHint: "SELECT sid, serial#, blocking_session FROM v$session WHERE blocking_session IS NOT NULL;",
      watchpoint: "Monitor lock waits during batch updates.",
      failureRisk: "Row lock contention can block downstream transactions.",
      animationTargetIds: ["buffer_cache"]
    },
    {
      id: "update-4",
      operation: "UPDATE",
      stage: "undo_segment",
      explanation: "Undo records preserve prior values for rollback and consistent reads.",
      commandHint: "SELECT begin_time, txncount, undoblks FROM v$undostat ORDER BY begin_time DESC FETCH FIRST 5 ROWS ONLY;",
      watchpoint: "Ensure undo retention supports active read workload.",
      failureRisk: "Insufficient undo can break long-running queries.",
      animationTargetIds: ["undo_segment"]
    },
    {
      id: "update-5",
      operation: "UPDATE",
      stage: "redo_buffer",
      explanation: "Redo entries describing updated block changes are generated.",
      commandHint: "SELECT value FROM v$sysstat WHERE name='redo size';",
      watchpoint: "Measure redo growth during maintenance windows.",
      failureRisk: "Excessive redo can saturate log I/O and increase commit waits.",
      animationTargetIds: ["redo_buffer"]
    },
    {
      id: "update-6",
      operation: "UPDATE",
      stage: "result_return",
      explanation: "Rows are updated in-memory; COMMIT is needed for durable visibility.",
      commandHint: "COMMIT;",
      watchpoint: "Split huge updates into controlled batches where possible.",
      failureRisk: "Large uncommitted units increase rollback cost on failure.",
      animationTargetIds: ["result_return"]
    }
  ],

  DELETE: [
    {
      id: "delete-1",
      operation: "DELETE",
      stage: "client_request",
      explanation: "Client submits DELETE with filter criteria.",
      commandHint: "DELETE FROM hr.audit_events WHERE created_on < SYSDATE - 30;",
      watchpoint: "Always verify predicate selectivity before delete execution.",
      failureRisk: "Unfiltered deletes can remove critical data and create huge undo.",
      animationTargetIds: ["client_request"]
    },
    {
      id: "delete-2",
      operation: "DELETE",
      stage: "parse_check",
      explanation: "Oracle checks syntax, privileges, and object metadata.",
      commandHint: "SELECT sql_text FROM v$sql WHERE sql_text LIKE 'DELETE FROM HR.AUDIT_EVENTS%';",
      watchpoint: "Use guarded scripts with row-count preview when possible.",
      failureRisk: "Operator mistakes can cause high-impact data loss incidents.",
      animationTargetIds: ["parse_check", "shared_pool"]
    },
    {
      id: "delete-3",
      operation: "DELETE",
      stage: "buffer_cache",
      explanation: "Target row blocks are marked with delete changes in cache.",
      commandHint: "SELECT name, value FROM v$sysstat WHERE name='db block changes';",
      watchpoint: "Monitor blocking and hot blocks if delete is concurrent with OLTP.",
      failureRisk: "Hot row deletes can amplify lock waits.",
      animationTargetIds: ["buffer_cache"]
    },
    {
      id: "delete-4",
      operation: "DELETE",
      stage: "undo_segment",
      explanation: "Undo stores row before-image for rollback/read consistency.",
      commandHint: "SELECT used_ublk, used_urec FROM v$transaction;",
      watchpoint: "Track undo growth and transaction length.",
      failureRisk: "Undo pressure can destabilize concurrent workloads.",
      animationTargetIds: ["undo_segment"]
    },
    {
      id: "delete-5",
      operation: "DELETE",
      stage: "redo_buffer",
      explanation: "Delete operation creates redo records for recovery.",
      commandHint: "SELECT name, value FROM v$sysstat WHERE name='redo entries';",
      watchpoint: "Adjust redo log sizing if purge jobs run frequently.",
      failureRisk: "Redo bottlenecks can slow commit-heavy purge operations.",
      animationTargetIds: ["redo_buffer"]
    },
    {
      id: "delete-6",
      operation: "DELETE",
      stage: "result_return",
      explanation: "DELETE completes logically; COMMIT finalizes transaction visibility.",
      commandHint: "COMMIT;",
      watchpoint: "Use controlled commit intervals for bulk purges.",
      failureRisk: "Very large single transactions are harder to recover or rollback quickly.",
      animationTargetIds: ["result_return"]
    }
  ],

  MERGE: [
    {
      id: "merge-1",
      operation: "MERGE",
      stage: "client_request",
      explanation: "Client submits MERGE to perform matched UPDATE and unmatched INSERT in one statement.",
      commandHint: "MERGE INTO hr.emp_target t USING hr.emp_stage s ON (t.emp_id = s.emp_id) WHEN MATCHED THEN UPDATE SET t.salary = s.salary WHEN NOT MATCHED THEN INSERT (emp_id, salary) VALUES (s.emp_id, s.salary);",
      watchpoint: "Use MERGE for controlled upsert patterns in ETL pipelines.",
      failureRisk: "Poor merge predicates can create duplicate or incorrect updates.",
      animationTargetIds: ["client_request"]
    },
    {
      id: "merge-2",
      operation: "MERGE",
      stage: "optimize_cursor",
      explanation: "Optimizer evaluates join path between source and target rows.",
      commandHint: "EXPLAIN PLAN FOR MERGE INTO ... ;",
      watchpoint: "Indexing join keys is crucial for merge scalability.",
      failureRisk: "Full scans on large source/target tables can saturate I/O.",
      animationTargetIds: ["optimize_cursor", "shared_pool"]
    },
    {
      id: "merge-3",
      operation: "MERGE",
      stage: "buffer_cache",
      explanation: "Matched rows are updated and unmatched rows inserted in buffer cache.",
      commandHint: "SELECT name, value FROM v$sysstat WHERE name IN ('db block changes','session logical reads');",
      watchpoint: "Merge workloads can combine read-heavy and write-heavy pressure.",
      failureRisk: "Large merge jobs may conflict with OLTP workload.",
      animationTargetIds: ["buffer_cache"]
    },
    {
      id: "merge-4",
      operation: "MERGE",
      stage: "undo_segment",
      explanation: "Undo is generated for both update and insert branches where needed.",
      commandHint: "SELECT begin_time, txncount, maxquerylen FROM v$undostat ORDER BY begin_time DESC FETCH FIRST 5 ROWS ONLY;",
      watchpoint: "Size undo for combined DML behavior, not just one branch.",
      failureRisk: "Under-sized undo can interrupt long merge operations.",
      animationTargetIds: ["undo_segment"]
    },
    {
      id: "merge-5",
      operation: "MERGE",
      stage: "redo_buffer",
      explanation: "Redo is generated for all changed blocks in merge statement.",
      commandHint: "SELECT name, value FROM v$sysstat WHERE name='redo size';",
      watchpoint: "Monitor redo throughput and log switch rate during bulk merge.",
      failureRisk: "Redo surge can slow commit and increase LGWR wait events.",
      animationTargetIds: ["redo_buffer"]
    },
    {
      id: "merge-6",
      operation: "MERGE",
      stage: "result_return",
      explanation: "MERGE row counts are returned; commit controls transaction durability.",
      commandHint: "COMMIT;",
      watchpoint: "Validate affected row counts against source expectations.",
      failureRisk: "Incorrect merge logic may silently corrupt target data quality.",
      animationTargetIds: ["result_return"]
    }
  ],

  COMMIT: [
    {
      id: "commit-1",
      operation: "COMMIT",
      stage: "client_request",
      explanation: "Session issues COMMIT after DML to make changes durable.",
      commandHint: "COMMIT;",
      watchpoint: "Observe commit frequency and transaction size patterns.",
      failureRisk: "Excessive small commits can increase log file sync overhead.",
      animationTargetIds: ["client_request"]
    },
    {
      id: "commit-2",
      operation: "COMMIT",
      stage: "redo_buffer",
      explanation: "Oracle confirms required redo for the transaction is ready in redo buffer.",
      commandHint: "SELECT value FROM v$sysstat WHERE name='user commits';",
      watchpoint: "Compare user commits with redo volume to profile workload behavior.",
      failureRisk: "Unbalanced commit patterns can reduce throughput.",
      animationTargetIds: ["redo_buffer"]
    },
    {
      id: "commit-3",
      operation: "COMMIT",
      stage: "lgwr_flush",
      explanation: "LGWR flushes transaction redo to online redo logs; commit waits for completion.",
      commandHint: "SELECT event, time_waited_micro/1000000 sec_waited FROM v$system_event WHERE event='log file sync';",
      watchpoint: "Track log file sync and log file parallel write waits.",
      failureRisk: "Slow redo I/O can directly impact end-user transaction latency.",
      animationTargetIds: ["lgwr_flush"]
    },
    {
      id: "commit-4",
      operation: "COMMIT",
      stage: "result_return",
      explanation: "Oracle marks transaction committed and releases row locks.",
      commandHint: "SELECT name, value FROM v$sysstat WHERE name='user commits';",
      watchpoint: "Post-commit locks should clear quickly under normal behavior.",
      failureRisk: "If not, blocked sessions can accumulate and affect throughput.",
      animationTargetIds: ["result_return"]
    },
    {
      id: "commit-5",
      operation: "COMMIT",
      stage: "dbwr_write",
      explanation: "DBWn later writes dirty buffers to datafiles during checkpoints (not necessarily at commit instant).",
      commandHint: "SELECT name, value FROM v$sysstat WHERE name='physical writes';",
      watchpoint: "Commit durability comes from redo flush; ARCn archiving happens on log switch, not on every commit.",
      failureRisk: "Confusing commit, checkpoint, and archive timelines leads to incorrect RCA and recovery assumptions.",
      animationTargetIds: ["dbwr_write", "datafile_io"]
    }
  ],

  ROLLBACK: [
    {
      id: "rollback-1",
      operation: "ROLLBACK",
      stage: "client_request",
      explanation: "Session issues ROLLBACK to cancel uncommitted transaction changes.",
      commandHint: "ROLLBACK;",
      watchpoint: "Large rollback can run for significant time depending on transaction size.",
      failureRisk: "Application timeouts may occur if rollback duration is underestimated.",
      animationTargetIds: ["client_request"]
    },
    {
      id: "rollback-2",
      operation: "ROLLBACK",
      stage: "undo_segment",
      explanation: "Oracle applies undo records to restore blocks to previous state.",
      commandHint: "SELECT used_ublk, used_urec FROM v$transaction;",
      watchpoint: "Track undo block usage for large transactional sessions.",
      failureRisk: "Rollback of huge units can hold resources longer than expected.",
      animationTargetIds: ["undo_segment", "buffer_cache"]
    },
    {
      id: "rollback-3",
      operation: "ROLLBACK",
      stage: "redo_buffer",
      explanation: "Rollback actions themselves generate redo for recovery consistency.",
      commandHint: "SELECT name, value FROM v$sysstat WHERE name IN ('redo entries','user rollbacks');",
      watchpoint: "Rollback storms can increase redo pressure unexpectedly.",
      failureRisk: "Redo path saturation can impact concurrent commit operations.",
      animationTargetIds: ["redo_buffer"]
    },
    {
      id: "rollback-4",
      operation: "ROLLBACK",
      stage: "lgwr_flush",
      explanation: "LGWR flushes rollback redo, preserving transactional correctness.",
      commandHint: "SELECT event, total_waits FROM v$system_event WHERE event='log file sync';",
      watchpoint: "Observe commit/rollback mix to understand redo device pressure.",
      failureRisk: "Heavy rollback activity can worsen user response latency.",
      animationTargetIds: ["lgwr_flush"]
    },
    {
      id: "rollback-5",
      operation: "ROLLBACK",
      stage: "result_return",
      explanation: "Session is returned to clean transaction state and locks are released.",
      commandHint: "SELECT name, value FROM v$sysstat WHERE name='user rollbacks';",
      watchpoint: "Frequent rollbacks may indicate app logic or error handling flaws.",
      failureRisk: "Persistent rollback-heavy behavior reduces throughput and increases contention.",
      animationTargetIds: ["result_return"]
    }
  ],

  DDL: [
    {
      id: "ddl-1",
      operation: "DDL",
      stage: "client_request",
      explanation: "Client sends DDL (for example CREATE/ALTER/DROP) request.",
      commandHint: "ALTER TABLE hr.employees ADD (security_flag VARCHAR2(1));",
      watchpoint: "Run DDL in controlled windows and with change management.",
      failureRisk: "Unplanned DDL can invalidate dependent code and affect uptime.",
      animationTargetIds: ["client_request"]
    },
    {
      id: "ddl-2",
      operation: "DDL",
      stage: "parse_check",
      explanation: "Oracle validates syntax and required system/object privileges.",
      commandHint: "SELECT privilege FROM dba_sys_privs WHERE grantee = USER;",
      watchpoint: "Limit DDL privileges to authorized roles.",
      failureRisk: "Excessive DDL rights create high security and stability risk.",
      animationTargetIds: ["parse_check", "shared_pool"]
    },
    {
      id: "ddl-3",
      operation: "DDL",
      stage: "redo_buffer",
      explanation: "DDL changes generate redo and data dictionary updates; Oracle performs implicit transaction control.",
      commandHint: "SELECT name, value FROM v$sysstat WHERE name='redo entries';",
      watchpoint: "Understand implicit commit behavior around DDL statements.",
      failureRisk: "Unexpected implicit commits can affect surrounding transaction logic.",
      animationTargetIds: ["redo_buffer"]
    },
    {
      id: "ddl-4",
      operation: "DDL",
      stage: "lgwr_flush",
      explanation: "LGWR persists redo for dictionary/object structure changes.",
      commandHint: "SELECT event, total_waits FROM v$system_event WHERE event='log file sync';",
      watchpoint: "Large DDL operations can stress redo subsystem.",
      failureRisk: "Redo path delay may extend DDL maintenance windows.",
      animationTargetIds: ["lgwr_flush"]
    },
    {
      id: "ddl-5",
      operation: "DDL",
      stage: "dbwr_write",
      explanation: "DBWn/checkpoint activity eventually writes changed blocks to datafiles.",
      commandHint: "SELECT file#, checkpoint_change# FROM v$datafile_header ORDER BY file# FETCH FIRST 10 ROWS ONLY;",
      watchpoint: "Track checkpoint behavior after large structural changes.",
      failureRisk: "Insufficient planning can increase post-DDL recovery time.",
      animationTargetIds: ["dbwr_write", "datafile_io"]
    },
    {
      id: "ddl-6",
      operation: "DDL",
      stage: "result_return",
      explanation: "DDL statement completes; metadata is visible to subsequent sessions.",
      commandHint: "SELECT object_name, object_type, status FROM user_objects ORDER BY created DESC FETCH FIRST 10 ROWS ONLY;",
      watchpoint: "Recompile or validate dependent objects after DDL if needed.",
      failureRisk: "Invalid dependent objects can break application runtime behavior.",
      animationTargetIds: ["result_return"]
    }
  ],

  SELECT_FOR_UPDATE: [
    {
      id: "sfu-1",
      operation: "SELECT_FOR_UPDATE",
      stage: "client_request",
      explanation: "Session issues SELECT ... FOR UPDATE to reserve candidate rows before modification.",
      commandHint: "SELECT employee_id, salary FROM hr.employees WHERE department_id = 60 FOR UPDATE NOWAIT;",
      watchpoint: "Use NOWAIT/WAIT clauses to control blocking behavior.",
      failureRisk: "Unbounded lock waits can stall transaction throughput and user experience.",
      animationTargetIds: ["client_request"]
    },
    {
      id: "sfu-2",
      operation: "SELECT_FOR_UPDATE",
      stage: "parse_check",
      explanation: "Oracle validates syntax, privileges, and lock request semantics.",
      commandHint: "SELECT sid, event, blocking_session FROM v$session WHERE event LIKE 'enq: TX%';",
      watchpoint: "Track lock waits in v$session during high-concurrency windows.",
      failureRisk: "Improper lock ordering increases deadlock risk.",
      animationTargetIds: ["parse_check", "shared_pool"]
    },
    {
      id: "sfu-3",
      operation: "SELECT_FOR_UPDATE",
      stage: "buffer_cache",
      explanation: "Rows are read and corresponding row-level TX locks are taken.",
      commandHint: "SELECT sid, serial#, blocking_session FROM v$session WHERE blocking_session IS NOT NULL;",
      watchpoint: "Identify long-running lockers quickly.",
      failureRisk: "Extended lock holding blocks downstream DML operations.",
      animationTargetIds: ["buffer_cache"]
    },
    {
      id: "sfu-4",
      operation: "SELECT_FOR_UPDATE",
      stage: "redo_buffer",
      explanation: "Lock-related transaction metadata changes produce redo entries.",
      commandHint: "SELECT name, value FROM v$sysstat WHERE name IN ('redo entries','user commits');",
      watchpoint: "Commit quickly after business logic completes.",
      failureRisk: "Slow mid-tier processing keeps locks open and escalates contention.",
      animationTargetIds: ["redo_buffer"]
    },
    {
      id: "sfu-5",
      operation: "SELECT_FOR_UPDATE",
      stage: "result_return",
      explanation: "Rows are returned to client while remaining locked until COMMIT or ROLLBACK.",
      commandHint: "COMMIT; -- release locks after update sequence",
      watchpoint: "Validate application transaction boundaries.",
      failureRisk: "Forgotten commits lead to blocked sessions and incidents.",
      animationTargetIds: ["result_return"]
    }
  ],

  BULK_LOAD: [
    {
      id: "bulk-1",
      operation: "BULK_LOAD",
      stage: "client_request",
      explanation: "Bulk load job starts (for example INSERT /*+ APPEND */ or Data Pump import).",
      commandHint: "INSERT /*+ APPEND */ INTO sales_fact SELECT * FROM sales_stage;",
      watchpoint: "Schedule heavy loads during low-traffic windows.",
      failureRisk: "Large load overlap with OLTP can cause severe latency spikes.",
      animationTargetIds: ["client_request"]
    },
    {
      id: "bulk-2",
      operation: "BULK_LOAD",
      stage: "optimize_cursor",
      explanation: "Optimizer evaluates direct-path and parallel execution strategies.",
      commandHint: "SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY_CURSOR(NULL,NULL,'ALLSTATS LAST +PARALLEL'));",
      watchpoint: "Validate degree of parallelism and plan shape.",
      failureRisk: "Misconfigured parallelism can flood CPU and I/O.",
      animationTargetIds: ["optimize_cursor", "shared_pool"]
    },
    {
      id: "bulk-3",
      operation: "BULK_LOAD",
      stage: "redo_buffer",
      explanation: "Large volume redo is generated (unless workload uses controlled NOLOGGING patterns).",
      commandHint: "SELECT name, value FROM v$sysstat WHERE name IN ('redo size','redo entries');",
      watchpoint: "Track redo MB/sec to protect log writer path.",
      failureRisk: "Redo surge can trigger frequent log switches and commit waits.",
      animationTargetIds: ["redo_buffer"]
    },
    {
      id: "bulk-4",
      operation: "BULK_LOAD",
      stage: "lgwr_flush",
      explanation: "LGWR flushes large redo bursts to online redo logs.",
      commandHint: "SELECT event, total_waits FROM v$system_event WHERE event IN ('log file sync','log file parallel write');",
      watchpoint: "Ensure redo storage latency remains stable during load.",
      failureRisk: "Slow redo writes can back up application commits.",
      animationTargetIds: ["lgwr_flush"]
    },
    {
      id: "bulk-5",
      operation: "BULK_LOAD",
      stage: "dbwr_write",
      explanation: "DBWn writes dirty blocks and checkpoints progress as workload advances.",
      commandHint: "SELECT name, value FROM v$sysstat WHERE name='physical writes';",
      watchpoint: "Observe checkpoint and write pressure.",
      failureRisk: "Under-provisioned I/O can prolong load windows.",
      animationTargetIds: ["dbwr_write", "datafile_io"]
    },
    {
      id: "bulk-6",
      operation: "BULK_LOAD",
      stage: "archiver",
      explanation: "ARCn archives completed redo logs produced during load cycle.",
      commandHint: "SELECT process, status, log_sequence FROM v$archive_processes;",
      watchpoint: "Verify archive destinations keep up with generated redo volume.",
      failureRisk: "Archive lag can fill FRA and eventually halt DML.",
      animationTargetIds: ["archiver"]
    },
    {
      id: "bulk-7",
      operation: "BULK_LOAD",
      stage: "result_return",
      explanation: "Load session commits and exposes newly loaded data to consumers.",
      commandHint: "COMMIT; SELECT COUNT(*) FROM sales_fact;",
      watchpoint: "Validate row counts and reconciliation metrics post-load.",
      failureRisk: "Unvalidated loads can introduce silent data quality defects.",
      animationTargetIds: ["result_return"]
    }
  ],

  FLASHBACK_QUERY: [
    {
      id: "fbq-1",
      operation: "FLASHBACK_QUERY",
      stage: "client_request",
      explanation: "Session requests historical view using AS OF TIMESTAMP/SCN.",
      commandHint: "SELECT * FROM hr.employees AS OF TIMESTAMP (SYSTIMESTAMP - INTERVAL '10' MINUTE) WHERE employee_id = 100;",
      watchpoint: "Use flashback queries for investigation before attempting recovery.",
      failureRisk: "Assuming historical visibility exists without verifying undo retention.",
      animationTargetIds: ["client_request"]
    },
    {
      id: "fbq-2",
      operation: "FLASHBACK_QUERY",
      stage: "parse_check",
      explanation: "Oracle validates SQL and resolves requested SCN/timestamp point.",
      commandHint: "SELECT current_scn FROM v$database;",
      watchpoint: "Correlate event timestamp with SCN window when possible.",
      failureRisk: "Incorrect time reference can return misleading historical state.",
      animationTargetIds: ["parse_check", "shared_pool"]
    },
    {
      id: "fbq-3",
      operation: "FLASHBACK_QUERY",
      stage: "buffer_cache",
      explanation: "Oracle reads current blocks and prepares consistent historical reconstruction.",
      commandHint: "SELECT begin_time, maxquerylen FROM v$undostat ORDER BY begin_time DESC FETCH FIRST 10 ROWS ONLY;",
      watchpoint: "Compare query lookback time with maxquerylen and retention.",
      failureRisk: "Long lookback requests can fail with ORA-01555.",
      animationTargetIds: ["buffer_cache"]
    },
    {
      id: "fbq-4",
      operation: "FLASHBACK_QUERY",
      stage: "undo_segment",
      explanation: "Undo records are applied logically to reconstruct row versions as of requested time.",
      commandHint: "SELECT begin_time, undoblks, txncount FROM v$undostat ORDER BY begin_time DESC FETCH FIRST 6 ROWS ONLY;",
      watchpoint: "Ensure undo tablespace sizing matches investigation/recovery needs.",
      failureRisk: "Insufficient undo retention blocks forensic query capability.",
      animationTargetIds: ["undo_segment", "buffer_cache"]
    },
    {
      id: "fbq-5",
      operation: "FLASHBACK_QUERY",
      stage: "result_return",
      explanation: "Historical result set is returned without affecting current committed data.",
      commandHint: "-- read-only historical output returned to client",
      watchpoint: "Cross-check historical rows against business timeline.",
      failureRisk: "Wrong interpretation can lead to incorrect incident decisions.",
      animationTargetIds: ["result_return"]
    }
  ]
};
