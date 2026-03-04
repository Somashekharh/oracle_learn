import { ARCHITECTURE_NODES } from "../data/architecture-data.js?v=20260303j";

const prefersReducedMotion =
  typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const nodeMap = new Map(ARCHITECTURE_NODES.map((node) => [node.id, node]));

const interactiveNodes = Array.from(document.querySelectorAll(".diagram-node[data-node]"));
const flowAwareNodes = Array.from(document.querySelectorAll(".diagram-node[data-flow-members]"));
const flowButtons = Array.from(document.querySelectorAll("[data-arch-flow]"));
const flowLines = Array.from(document.querySelectorAll(".diagram-flow-line"));
const flowParticles = Array.from(document.querySelectorAll(".flow-particle"));
const flowHitMap = new Map();

const stage = document.getElementById("diagram-stage");
const canvas = document.getElementById("diagram-canvas");
const svg = canvas?.querySelector("svg");

const titleEl = document.getElementById("node-title");
const descriptionEl = document.getElementById("node-description");
const importanceEl = document.getElementById("node-importance");
const failureEl = document.getElementById("node-failure");
const commandEl = document.getElementById("node-command");
const outputEl = document.getElementById("node-output");
const scenarioEl = document.getElementById("node-scenario");
const commandWhyEl = document.getElementById("node-check-why");
const copyCommandBtn = document.getElementById("node-copy-command");
const flowDescEl = document.getElementById("arch-flow-desc");

const expandBtn = document.getElementById("diagram-expand");
const zoomInBtn = document.getElementById("diagram-zoom-in");
const zoomOutBtn = document.getElementById("diagram-zoom-out");
const resetBtn = document.getElementById("diagram-reset");
const walkBtn = document.getElementById("arch-flow-walk");
const stopBtn = document.getElementById("arch-flow-stop");

const cdbToggleBtn = document.getElementById("arch-cdb-toggle");
const racToggleBtn = document.getElementById("arch-rac-toggle");
const storageToggleBtn = document.getElementById("arch-storage-toggle");
const combinedToggleBtn = document.getElementById("arch-combined-toggle");
const interviewToggleBtn = document.getElementById("arch-interview-toggle");
const modeDescEl = document.getElementById("arch-mode-desc");
const runtimeStatusEl = document.getElementById("arch-runtime-status");
const overlayCdb = document.getElementById("overlay-cdb");
const overlayRac = document.getElementById("overlay-rac");
const overlayStorage = document.getElementById("overlay-storage");
const storageStackPanel = document.getElementById("storage-stack-panel");

const failureButtons = Array.from(document.querySelectorAll("[data-failure-node]"));
const failureResetBtn = document.getElementById("failure-reset");
const failureImmediateEl = document.getElementById("failure-immediate");
const failureSymptomsEl = document.getElementById("failure-symptoms");
const failureActionsEl = document.getElementById("failure-actions");

const interviewStatusEl = document.getElementById("interview-status");
const interviewQuestionEl = document.getElementById("interview-question");
const interviewOptionsEl = document.getElementById("interview-options");
const interviewFeedbackEl = document.getElementById("interview-feedback");
const interviewNextBtn = document.getElementById("interview-next");
const interviewExitBtn = document.getElementById("interview-exit");

const scnOperationButtons = Array.from(document.querySelectorAll("[data-scn-operation]"));
const scnStripEl = document.getElementById("scn-strip");
const scnSummaryEl = document.getElementById("scn-summary");
const scnPrevBtn = document.getElementById("scn-prev");
const scnNextBtn = document.getElementById("scn-next");
const scnPlayBtn = document.getElementById("scn-play");
const scnStopBtn = document.getElementById("scn-stop");

const traceOperationEl = document.getElementById("trace-operation");
const traceStartBtn = document.getElementById("trace-start");
const traceNextBtn = document.getElementById("trace-next");
const traceStopBtn = document.getElementById("trace-stop");
const traceStepEl = document.getElementById("trace-step");
const traceCommandEl = document.getElementById("trace-command");
const traceNoteEl = document.getElementById("trace-note");
const traceTimelineEl = document.getElementById("trace-timeline");
const lineTitleEl = document.getElementById("line-title");
const lineDescriptionEl = document.getElementById("line-description");
const lineCommandEl = document.getElementById("line-command");

const FLOW_DESCRIPTIONS = {
  all: "All layers visible. Choose a flow mode to focus on one Oracle execution path.",
  query:
    "Query Path: client -> listener -> server process (PGA) -> shared pool parse -> buffer cache -> datafile read on cache miss.",
  dml:
    "DML + Commit Path: server process updates buffers + undo + redo buffer, LGWR flushes redo on COMMIT, ARCn archives switched redo, DBWn writes dirty buffers later.",
  checkpoint:
    "Checkpoint Path: CKPT signals DBWn and updates checkpoint metadata in control/datafile headers; DBWn performs actual block writes.",
  recovery:
    "Recovery Path: SMON uses control files plus online/archived redo to recover datafiles; RECO handles in-doubt distributed transactions.",
  shared:
    "Shared Server Path: listener -> dispatcher -> shared server with private PGA and shared memory usage (shared pool/large pool)."
};

const FLOW_SEQUENCES = {
  query: [
    "client_process",
    "listener",
    "dedicated_server",
    "pga",
    "shared_pool",
    "library_cache",
    "dictionary_cache",
    "buffer_cache",
    "datafiles",
    "result_cache"
  ],
  dml: [
    "client_process",
    "listener",
    "dedicated_server",
    "pga",
    "shared_pool",
    "buffer_cache",
    "undo_tablespace",
    "redo_buffer",
    "lgwr",
    "online_redo",
    "client_process",
    "arcn",
    "archived_redo"
  ],
  checkpoint: ["ckpt", "dbwn", "datafiles", "control_files"],
  recovery: ["control_files", "smon", "online_redo", "archived_redo", "datafiles", "undo_tablespace", "reco", "instance"],
  shared: ["client_process", "listener", "dispatcher", "shared_server", "pga", "large_pool", "shared_pool", "buffer_cache"]
};

const FLOW_PRIMARY_LINES = {
  all: [
    "flow-client-listener",
    "flow-listener-dedicated",
    "flow-dedicated-pga",
    "flow-pga-sharedpool",
    "flow-server-buffercache",
    "flow-server-redobuffer",
    "flow-redo-lgwr",
    "flow-lgwr-onlineredo",
    "flow-dbwn-datafiles",
    "flow-smon-control"
  ],
  query: [
    "flow-client-listener",
    "flow-listener-dedicated",
    "flow-dedicated-pga",
    "flow-pga-sharedpool",
    "flow-server-buffercache",
    "flow-datafiles-buffercache"
  ],
  dml: [
    "flow-client-listener",
    "flow-listener-dedicated",
    "flow-dedicated-pga",
    "flow-server-redobuffer",
    "flow-redo-lgwr",
    "flow-lgwr-onlineredo",
    "flow-onlineredo-arcn",
    "flow-arcn-archived",
    "flow-buffer-dbwn",
    "flow-dbwn-datafiles"
  ],
  checkpoint: ["flow-buffer-dbwn", "flow-dbwn-datafiles", "flow-ckpt-control", "flow-ckpt-datafiles"],
  recovery: [
    "flow-smon-control",
    "flow-onlineredo-datafiles",
    "flow-archived-datafiles",
    "flow-smon-undo",
    "flow-reco-control"
  ],
  shared: [
    "flow-client-listener",
    "flow-listener-dispatcher",
    "flow-dispatcher-sharedsrv",
    "flow-sharedsrv-pga",
    "flow-pga-sharedpool",
    "flow-server-buffercache",
    "flow-lreg-listener"
  ]
};

const FLOW_LINE_DETAILS = {
  "flow-client-listener": {
    title: "Client -> Listener",
    description: "Oracle Net connection request reaches listener for service routing.",
    command: "lsnrctl status"
  },
  "flow-listener-dedicated": {
    title: "Listener -> Dedicated Server",
    description: "Listener hands session to dedicated server process for execution.",
    command: "SELECT sid, serial#, server FROM v$session WHERE server='DEDICATED';"
  },
  "flow-listener-dispatcher": {
    title: "Listener -> Dispatcher",
    description: "Shared server entry path routes session through dispatcher queue.",
    command: "SELECT name, status FROM v$dispatcher;"
  },
  "flow-dispatcher-sharedsrv": {
    title: "Dispatcher -> Shared Server",
    description: "Shared server process picks request from dispatcher-managed queue.",
    command: "SELECT name, status FROM v$shared_server;"
  },
  "flow-dedicated-pga": {
    title: "Dedicated Server -> PGA",
    description: "Private process memory (PGA) is allocated for execution workareas.",
    command: "SELECT name, value FROM v$pgastat WHERE name='total PGA allocated';"
  },
  "flow-sharedsrv-pga": {
    title: "Shared Server -> PGA",
    description: "Shared server process also uses private PGA memory for runtime operations.",
    command: "SELECT name, value FROM v$pgastat WHERE name='total PGA allocated';"
  },
  "flow-pga-sharedpool": {
    title: "PGA -> Shared Pool",
    description: "Execution uses shared pool metadata for parse/cursor reuse and dictionary lookup.",
    command: "SELECT namespace, gets, gethits FROM v$librarycache;"
  },
  "flow-server-buffercache": {
    title: "Server -> Buffer Cache",
    description: "Logical block access goes through database buffer cache first.",
    command: "SELECT name, value FROM v$sysstat WHERE name IN ('session logical reads','physical reads');"
  },
  "flow-server-redobuffer": {
    title: "Server -> Redo Buffer",
    description: "DML change vectors are generated into redo log buffer.",
    command: "SELECT name, value FROM v$sysstat WHERE name IN ('redo entries','redo size');"
  },
  "flow-sharedpool-library": {
    title: "Shared Pool -> Library Cache",
    description: "SQL cursor text/executable forms are resolved or reused here.",
    command: "SELECT namespace, gets, gethits FROM v$librarycache WHERE namespace='SQL AREA';"
  },
  "flow-sharedpool-dictionary": {
    title: "Shared Pool -> Dictionary Cache",
    description: "Object and privilege metadata lookups happen in dictionary cache.",
    command: "SELECT parameter, gets, getmisses FROM v$rowcache ORDER BY gets DESC FETCH FIRST 5 ROWS ONLY;"
  },
  "flow-sharedpool-result": {
    title: "SQL Execution -> Result Cache (Optional)",
    description:
      "After parse/validation, Oracle can return an eligible result directly from the SQL result cache when enabled.",
    command: "SELECT name, value FROM v$result_cache_statistics;"
  },
  "flow-datafiles-buffercache": {
    title: "Datafiles -> Buffer Cache",
    description: "Physical blocks are loaded from datafiles on cache miss.",
    command: "SELECT file#, name, status FROM v$datafile ORDER BY file#;"
  },
  "flow-buffer-temp": {
    title: "Buffer Cache -> Temp",
    description: "Sort/hash spills use TEMP when workareas exceed PGA memory.",
    command: "SELECT tablespace_name, file_name FROM dba_temp_files;"
  },
  "flow-buffer-undo": {
    title: "Buffer Cache -> Undo",
    description: "Before-images are written into undo for rollback and read consistency.",
    command: "SELECT tablespace_name, contents FROM dba_tablespaces WHERE contents='UNDO';"
  },
  "flow-redo-lgwr": {
    title: "Redo Buffer -> LGWR",
    description: "LGWR flushes redo records for commit durability.",
    command: "SELECT event, total_waits FROM v$system_event WHERE event='log file sync';"
  },
  "flow-lgwr-onlineredo": {
    title: "LGWR -> Online Redo",
    description: "Online redo log files receive sequential redo writes.",
    command: "SELECT group#, status, archived FROM v$log ORDER BY group#;"
  },
  "flow-onlineredo-arcn": {
    title: "Online Redo -> ARCn",
    description: "On log switch, ARCn archives full redo log groups.",
    command: "SELECT process, status, log_sequence FROM v$archive_processes;"
  },
  "flow-arcn-archived": {
    title: "ARCn -> Archived Redo",
    description: "Archive logs are persisted for backup and media recovery chain.",
    command: "SELECT sequence#, applied FROM v$archived_log ORDER BY sequence# DESC FETCH FIRST 10 ROWS ONLY;"
  },
  "flow-buffer-dbwn": {
    title: "Buffer Cache -> DBWn",
    description: "DBWn is tasked with writing dirty buffers to disk.",
    command: "SELECT name, description FROM v$bgprocess WHERE name LIKE 'DBW%';"
  },
  "flow-dbwn-datafiles": {
    title: "DBWn -> Datafiles",
    description: "Dirty blocks are checkpointed/persisted into datafiles.",
    command: "SELECT file#, checkpoint_change# FROM v$datafile_header ORDER BY file#;"
  },
  "flow-ckpt-control": {
    title: "CKPT -> Control Files",
    description: "CKPT updates checkpoint metadata in control files.",
    command: "SELECT name, status FROM v$controlfile;"
  },
  "flow-ckpt-datafiles": {
    title: "CKPT -> Datafile Headers",
    description: "CKPT updates checkpoint SCN metadata in datafile headers.",
    command: "SELECT file#, checkpoint_change# FROM v$datafile_header ORDER BY file#;"
  },
  "flow-smon-control": {
    title: "SMON -> Control Files",
    description: "SMON uses control metadata to coordinate instance recovery steps.",
    command: "SELECT name FROM v$bgprocess WHERE name='SMON';"
  },
  "flow-onlineredo-datafiles": {
    title: "Online Redo -> Datafiles",
    description: "Crash recovery reapplies required online redo to restore consistency.",
    command: "SELECT group#, status FROM v$log ORDER BY group#;"
  },
  "flow-archived-datafiles": {
    title: "Archived Redo -> Datafiles",
    description: "Media recovery applies archived logs to bring files forward.",
    command: "SELECT sequence#, applied FROM v$archived_log ORDER BY sequence# DESC FETCH FIRST 10 ROWS ONLY;"
  },
  "flow-smon-undo": {
    title: "SMON -> Undo",
    description: "Uncommitted transactions are rolled back using undo records.",
    command: "SELECT tuned_undoretention FROM v$undostat ORDER BY end_time DESC FETCH FIRST 1 ROWS ONLY;"
  },
  "flow-reco-control": {
    title: "RECO -> Control Metadata",
    description: "RECO resolves in-doubt distributed transactions post-recovery.",
    command: "SELECT local_tran_id, state FROM dba_2pc_pending;"
  },
  "flow-lreg-listener": {
    title: "LREG -> Listener",
    description: "LREG registers instance/service handlers with listener.",
    command: "SELECT name FROM v$bgprocess WHERE name='LREG';"
  },
  "flow-rac-interconnect": {
    title: "RAC Instance 2 -> Interconnect",
    description: "RAC nodes exchange cache fusion messages over the private cluster interconnect.",
    command: "SELECT inst_id, name, value FROM gv$sysstat WHERE name LIKE 'gc % block receive time';"
  }
};

const FAILURE_SCENARIOS = {
  lgwr: {
    immediate: "Commit requests stall because redo cannot be flushed to current online redo log members.",
    symptoms: "Sessions report elevated log file sync waits and may hang on COMMIT under sustained load.",
    actions:
      "Check alert log and redo destination I/O, confirm redo member availability, and initiate failover or instance restart if LGWR is terminated."
  },
  dbwn: {
    immediate: "Dirty buffers accumulate and free buffer shortages begin to affect foreground DML.",
    symptoms: "free buffer waits and write complete waits increase while checkpoint progress slows.",
    actions:
      "Validate storage latency, inspect DBWn process state in v$bgprocess, and tune checkpoint/write workload before pressure escalates."
  },
  smon: {
    immediate: "Instance recovery and segment cleanup tasks are delayed or paused.",
    symptoms: "Startup recovery runs longer and some housekeeping operations remain incomplete.",
    actions:
      "Review background process status, alert log recovery messages, and restart the instance if SMON process termination is confirmed."
  },
  pmon: {
    immediate: "Failed-session cleanup and resource release are delayed.",
    symptoms: "Orphaned sessions/locks can persist longer, increasing contention and user-visible blocking.",
    actions:
      "Inspect v$process and v$session for stale process mappings and restart instance services if PMON is not recoverable."
  },
  ckpt: {
    immediate: "Checkpoint metadata updates to control file and datafile headers lag behind workload.",
    symptoms: "Longer crash recovery window and delayed checkpoint progression warnings in diagnostics.",
    actions:
      "Validate CKPT and DBWn health together (CKPT signals, DBWn writes blocks), then resolve control-file/datafile I/O bottlenecks."
  },
  arcn: {
    immediate: "Archived redo generation falls behind online redo switching in ARCHIVELOG mode.",
    symptoms: "Archive destination backlog grows; primary may eventually pause when online redo reuse is blocked.",
    actions:
      "Validate FRA/archive destination space, ARCn status, and transport errors. Add space or destinations and force archive as needed."
  }
};

const INTERVIEW_QUESTIONS = [
  {
    prompt: "Which process writes redo entries to online redo logs at commit time?",
    options: ["dbwn", "lgwr", "ckpt", "smon"],
    answer: "lgwr",
    focusNode: "lgwr",
    explanation: "LGWR performs durable redo writes and controls commit confirmation latency."
  },
  {
    prompt: "What component stores parsed SQL and execution plans for reuse?",
    options: ["buffer_cache", "shared_pool", "undo_tablespace", "tempfiles"],
    answer: "shared_pool",
    focusNode: "shared_pool",
    explanation: "Shared pool hosts library cache and dictionary cache used during parse and execution reuse."
  },
  {
    prompt: "In multitenant architecture, where are common users and shared metadata maintained?",
    options: ["pdb_hr", "cdb_root", "fra_area", "control_files"],
    answer: "cdb_root",
    focusNode: "cdb_root",
    explanation: "CDB$ROOT owns common metadata and common users used across pluggable databases."
  },
  {
    prompt: "Which memory component keeps database blocks for logical reads and dirty write tracking?",
    options: ["redo_buffer", "buffer_cache", "large_pool", "pga"],
    answer: "buffer_cache",
    focusNode: "buffer_cache",
    explanation: "Buffer cache is the primary block cache for read consistency and DBWn writeback."
  },
  {
    prompt: "Which process archives full online redo log groups in ARCHIVELOG mode?",
    options: ["lreg", "arcn", "mmon", "reco"],
    answer: "arcn",
    focusNode: "arcn",
    explanation: "ARCn copies full online redo groups into archive destinations for media recovery."
  },
  {
    prompt: "What network component receives client connection requests before service handoff?",
    options: ["listener", "dispatcher", "shared_server", "instance"],
    answer: "listener",
    focusNode: "listener",
    explanation: "Listener accepts Oracle Net connections and routes sessions to ready handlers/services."
  },
  {
    prompt: "In RAC, which element carries cache fusion traffic between instances?",
    options: ["rac_interconnect", "asm_diskgroup", "datafiles", "spfile_pwfile"],
    answer: "rac_interconnect",
    focusNode: "rac_interconnect",
    explanation: "RAC interconnect handles low-latency global cache block transfer between nodes."
  },
  {
    prompt: "Which background process updates datafile headers with checkpoint information?",
    options: ["pmon", "smon", "ckpt", "reco"],
    answer: "ckpt",
    focusNode: "ckpt",
    explanation: "CKPT advances checkpoint metadata to shorten recovery scope."
  }
];

const SCN_TIMELINES = {
  SELECT: [
    {
      label: "Parse Cursor",
      summary: "Session checks shared pool for an existing cursor and parse metadata.",
      nodeId: "shared_pool"
    },
    {
      label: "Acquire SCN",
      summary: "Consistent read SCN is captured for the statement snapshot.",
      nodeId: "instance"
    },
    {
      label: "Dictionary Check",
      summary: "Object and privilege metadata is fetched from dictionary cache.",
      nodeId: "dictionary_cache"
    },
    {
      label: "Block Access",
      summary: "Blocks are read from buffer cache or physical datafiles if needed.",
      nodeId: "buffer_cache"
    },
    {
      label: "Consistent Read",
      summary: "Undo is consulted if block versions must be rewound to statement SCN.",
      nodeId: "undo_tablespace"
    },
    {
      label: "Result Return",
      summary: "Rows return to the client process with read-consistent results.",
      nodeId: "client_process"
    }
  ],
  INSERT: [
    {
      label: "Parse and Plan",
      summary: "Server validates SQL and allocates execution state.",
      nodeId: "shared_pool"
    },
    {
      label: "Buffer Change",
      summary: "Target block is modified in buffer cache and marked dirty.",
      nodeId: "buffer_cache"
    },
    {
      label: "Undo Record",
      summary: "Before-image information is written to undo segments.",
      nodeId: "undo_tablespace"
    },
    {
      label: "Redo Generation",
      summary: "Change vectors are staged in redo log buffer.",
      nodeId: "redo_buffer"
    },
    {
      label: "Commit SCN",
      summary: "Transaction receives commit SCN and waits for durable redo flush.",
      nodeId: "lgwr"
    },
    {
      label: "Checkpoint Persistence",
      summary: "DBWn and CKPT later persist dirty blocks/checkpoint metadata.",
      nodeId: "dbwn"
    }
  ],
  COMMIT: [
    {
      label: "Session Commit Request",
      summary: "Foreground session issues commit and requests SCN assignment.",
      nodeId: "dedicated_server"
    },
    {
      label: "SCN Allocation",
      summary: "Instance advances SCN and tags transaction as committing.",
      nodeId: "instance"
    },
    {
      label: "Redo Flush",
      summary: "LGWR flushes redo buffer entries to online redo logs.",
      nodeId: "lgwr"
    },
    {
      label: "Commit Ack",
      summary: "Foreground receives acknowledgement when redo is durable.",
      nodeId: "client_process"
    },
    {
      label: "Post-Commit Cleanup",
      summary: "Block cleanout and visibility cleanup happen lazily on subsequent access.",
      nodeId: "buffer_cache"
    }
  ],
  CHECKPOINT: [
    {
      label: "Checkpoint Start",
      summary: "Checkpoint target is requested by log switch or policy.",
      nodeId: "ckpt"
    },
    {
      label: "Dirty Queue Scan",
      summary: "DBWn identifies dirty buffers that must be persisted.",
      nodeId: "dbwn"
    },
    {
      label: "Datafile Write",
      summary: "Dirty blocks are written to datafiles.",
      nodeId: "datafiles"
    },
    {
      label: "Header Update",
      summary: "CKPT updates datafile/control file checkpoint SCN.",
      nodeId: "control_files"
    },
    {
      label: "Recovery Window Reduced",
      summary: "Crash recovery range is shortened after checkpoint completes.",
      nodeId: "smon"
    }
  ],
  RECOVERY: [
    {
      label: "Mount and Assess",
      summary: "Control files and file headers are compared for consistency.",
      nodeId: "control_files"
    },
    {
      label: "Redo Source Selection",
      summary: "SMON identifies required online and archived redo sequences.",
      nodeId: "smon"
    },
    {
      label: "Redo Apply",
      summary: "Redo stream is reapplied to bring datafiles forward.",
      nodeId: "archived_redo"
    },
    {
      label: "Undo Rollback",
      summary: "Uncommitted transactions are rolled back using undo.",
      nodeId: "undo_tablespace"
    },
    {
      label: "Open Resetlogs/Normal",
      summary: "Database opens when consistency checks are complete.",
      nodeId: "instance"
    }
  ]
};

const TRACE_FLOWS = {
  SELECT: [
    {
      label: "Connection Handshake",
      nodeId: "listener",
      command: "lsnrctl status",
      note: "Listener accepts the session and routes to a registered service/handler."
    },
    {
      label: "Server Process Assignment",
      nodeId: "dedicated_server",
      command: "SELECT sid, serial#, server FROM v$session WHERE audsid = USERENV('SESSIONID');",
      note: "Dedicated server (or shared path) executes the statement on behalf of the client."
    },
    {
      label: "PGA Work Area",
      nodeId: "pga",
      command: "SELECT name, value FROM v$pgastat WHERE name IN ('total PGA allocated','cache hit percentage');",
      note: "Sort/hash/runtime memory is private to the process (PGA), not shared SGA memory."
    },
    {
      label: "Parse and Cursor Lookup",
      nodeId: "library_cache",
      command: "SELECT namespace, gets, gethits FROM v$librarycache WHERE namespace='SQL AREA';",
      note: "Oracle attempts soft parse by reusing an existing cursor."
    },
    {
      label: "Metadata Validation",
      nodeId: "dictionary_cache",
      command: "SELECT parameter, gets, getmisses FROM v$rowcache ORDER BY gets DESC FETCH FIRST 10 ROWS ONLY;",
      note: "Privileges and object definitions are checked via dictionary cache."
    },
    {
      label: "Block Retrieval",
      nodeId: "buffer_cache",
      command: "SELECT name, value FROM v$sysstat WHERE name IN ('session logical reads','physical reads');",
      note: "Blocks are read from buffer cache; misses trigger physical I/O."
    },
    {
      label: "Read Consistency",
      nodeId: "undo_tablespace",
      command: "SELECT tuned_undoretention FROM v$undostat ORDER BY end_time DESC FETCH FIRST 1 ROWS ONLY;",
      note: "Undo records reconstruct older block images when required."
    }
  ],
  INSERT: [
    {
      label: "Cursor and Plan",
      nodeId: "shared_pool",
      command: "SELECT sql_id, executions, parse_calls FROM v$sql ORDER BY last_active_time DESC FETCH FIRST 5 ROWS ONLY;",
      note: "Statement is parsed and execution resources are allocated."
    },
    {
      label: "PGA Allocation",
      nodeId: "pga",
      command: "SELECT name, value FROM v$pgastat WHERE name='total PGA allocated';",
      note: "Process-private memory is allocated for execution workareas and runtime state."
    },
    {
      label: "Block Modification",
      nodeId: "buffer_cache",
      command: "SELECT name, value FROM v$sysstat WHERE name='db block changes';",
      note: "Modified rows update in-memory data blocks and mark them dirty."
    },
    {
      label: "Undo Generation",
      nodeId: "undo_tablespace",
      command: "SELECT tablespace_name, status FROM dba_tablespaces WHERE contents='UNDO';",
      note: "Undo records preserve before-image for rollback and consistent reads."
    },
    {
      label: "Redo Staging",
      nodeId: "redo_buffer",
      command: "SELECT name, value FROM v$sysstat WHERE name IN ('redo entries','redo size');",
      note: "Redo vectors are staged in memory before LGWR flushes."
    },
    {
      label: "Commit Durability",
      nodeId: "lgwr",
      command: "SELECT event, total_waits FROM v$system_event WHERE event='log file sync';",
      note: "Commit acknowledgement waits for durable LGWR write to online redo."
    },
    {
      label: "Background Persistence",
      nodeId: "dbwn",
      command: "SELECT name, description FROM v$bgprocess WHERE name LIKE 'DBW%';",
      note: "DBWn later writes dirty buffers to datafiles independent of commit."
    }
  ],
  COMMIT: [
    {
      label: "Foreground Commit",
      nodeId: "dedicated_server",
      command: "SELECT s.sid, t.start_time FROM v$transaction t JOIN v$session s ON t.ses_addr=s.saddr;",
      note: "Foreground marks transaction commit intent and requests SCN."
    },
    {
      label: "SCN Advancement",
      nodeId: "instance",
      command: "SELECT CURRENT_SCN FROM v$database;",
      note: "Instance allocates commit SCN for transactional ordering."
    },
    {
      label: "Redo Flush",
      nodeId: "lgwr",
      command: "SELECT group#, sequence#, status FROM v$log ORDER BY group#;",
      note: "LGWR writes commit record and dependent redo to online redo logs."
    },
    {
      label: "Client Acknowledgement",
      nodeId: "client_process",
      command: "SELECT status, state, event FROM v$session WHERE audsid=USERENV('SESSIONID');",
      note: "Foreground session returns success only after durable write confirmation."
    }
  ],
  ROLLBACK: [
    {
      label: "Rollback Trigger",
      nodeId: "dedicated_server",
      command: "SELECT used_ublk, used_urec FROM v$transaction;",
      note: "Rollback starts from transaction state and undo segment pointers."
    },
    {
      label: "Undo Readback",
      nodeId: "undo_tablespace",
      command: "SELECT segment_name, tablespace_name FROM dba_rollback_segs WHERE status='ONLINE';",
      note: "Undo records are traversed in reverse order to revert row changes."
    },
    {
      label: "Buffer Reversion",
      nodeId: "buffer_cache",
      command: "SELECT name, value FROM v$sysstat WHERE name='db block changes';",
      note: "In-memory blocks are reverted; redo still records rollback activity."
    },
    {
      label: "Cleanup and Release",
      nodeId: "result_return",
      command: "SELECT status, state, event FROM v$session WHERE audsid = USERENV('SESSIONID');",
      note: "Session returns to a clean transactional state and held row locks are released."
    }
  ],
  CHECKPOINT: [
    {
      label: "Checkpoint Initiation",
      nodeId: "ckpt",
      command: "ALTER SYSTEM CHECKPOINT;",
      note: "Checkpoint can be forced manually or triggered by redo/log pressure."
    },
    {
      label: "Write Dirty Buffers",
      nodeId: "dbwn",
      command: "SELECT name, value FROM v$sysstat WHERE name='physical writes';",
      note: "DBWn writes targeted dirty blocks from cache to datafiles."
    },
    {
      label: "Header Synchronization",
      nodeId: "control_files",
      command: "SELECT checkpoint_change# FROM v$datafile_header ORDER BY file# FETCH FIRST 5 ROWS ONLY;",
      note: "CKPT updates file headers and control file checkpoint metadata."
    }
  ],
  RECOVERY: [
    {
      label: "Recovery Coordination",
      nodeId: "smon",
      command: "SELECT name FROM v$bgprocess WHERE name='SMON';",
      note: "SMON coordinates crash/instance recovery sequence at startup."
    },
    {
      label: "Redo Chain Access",
      nodeId: "archived_redo",
      command: "SELECT sequence#, applied FROM v$archived_log ORDER BY sequence# DESC FETCH FIRST 10 ROWS ONLY;",
      note: "Required redo logs are identified from online and archive destinations."
    },
    {
      label: "Current Online Redo Check",
      nodeId: "online_redo",
      command: "SELECT group#, status, archived FROM v$log ORDER BY group#;",
      note: "Current and active online redo groups are validated as part of recovery sequencing."
    },
    {
      label: "Distributed Recovery",
      nodeId: "reco",
      command: "SELECT local_tran_id, state FROM dba_2pc_pending;",
      note: "RECO resolves in-doubt distributed transactions after recovery."
    },
    {
      label: "Datafile Consistency",
      nodeId: "datafiles",
      command: "SELECT file#, checkpoint_change# FROM v$datafile_header ORDER BY file#;",
      note: "Datafile headers are validated before database open."
    }
  ]
};

const modeState = {
  cdb: false,
  rac: false,
  storage: false,
  combined: false,
  interview: false
};

const scnState = {
  operation: "SELECT",
  index: 0,
  timer: null
};

const traceState = {
  operation: (traceOperationEl?.value || "SELECT").toUpperCase(),
  index: 0,
  active: false
};

let activeNodeId = "instance";
let activeFlow = "query";
let zoomLevel = 1;
let walkTimer = null;
let walkIndex = 0;
let traceNodeId = "";
let activeLineId = "";
let interviewQueue = [];
let interviewIndex = 0;
let interviewAnswered = false;
let pinnedNodeId = "";
let listenersBound = false;

function parseFlowTags(raw) {
  return (raw || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function flowMatch(element, flowName) {
  if (flowName === "all") {
    return true;
  }
  const tags = parseFlowTags(element.getAttribute("data-flows") || element.getAttribute("data-flow-members") || "");
  return tags.includes(flowName) || tags.includes("all");
}

function setButtonPressed(button, state) {
  if (!button) {
    return;
  }
  button.classList.toggle("is-active", state);
  button.setAttribute("aria-pressed", String(state));
}

function burstToggleButton(button) {
  if (!button) {
    return;
  }
  button.classList.remove("is-burst");
  void button.offsetWidth;
  button.classList.add("is-burst");
  window.setTimeout(() => button.classList.remove("is-burst"), 420);
}

function pulseStatusText(el, className = "is-updating", duration = 360) {
  if (!el || prefersReducedMotion) {
    return;
  }
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
  window.setTimeout(() => el.classList.remove(className), duration);
}

function animateOverlayReveal(overlayEl) {
  if (!overlayEl) {
    return;
  }
  overlayEl.classList.remove("is-revealing");
  void overlayEl.getBoundingClientRect();
  overlayEl.classList.add("is-revealing");
  window.setTimeout(() => overlayEl.classList.remove("is-revealing"), 540);
}

function animatePanelReveal(panelEl) {
  if (!panelEl || prefersReducedMotion) {
    return;
  }
  panelEl.classList.remove("is-revealing");
  void panelEl.getBoundingClientRect();
  panelEl.classList.add("is-revealing");
  window.setTimeout(() => panelEl.classList.remove("is-revealing"), 470);
}

function updatePanel(node) {
  if (!node || !titleEl || !descriptionEl || !importanceEl || !failureEl || !commandEl || !outputEl || !scenarioEl) {
    return;
  }

  titleEl.textContent = node.label;
  descriptionEl.textContent = node.description;
  importanceEl.textContent = node.importance;
  failureEl.textContent = node.failureImpact;
  commandEl.textContent = node.checkCommand;
  outputEl.textContent = node.outputExample;
  scenarioEl.textContent = node.practicalScenario;
  if (commandWhyEl) {
    const pinHint = pinnedNodeId
      ? "Pinned selection is active. Click the same component again to unpin."
      : "Click a component to pin details. Hover is highlight-only to avoid accidental panel changes.";
    commandWhyEl.textContent = `This command validates live runtime state for ${node.label} so you can confirm health before deeper tuning. ${pinHint}`;
  }
}

function setLineInspectorDefault() {
  if (lineTitleEl) {
    lineTitleEl.textContent = "Flow Line Inspector";
  }
  if (lineDescriptionEl) {
    lineDescriptionEl.textContent =
      "Hover, focus, or click an animated flow line to inspect what that path does in Oracle Database.";
  }
  if (lineCommandEl) {
    lineCommandEl.textContent = "SELECT instance_name, status FROM v$instance;";
  }
}

function clearLineFocus() {
  if (activeLineId) {
    document.getElementById(activeLineId)?.classList.remove("is-focused");
    activeLineId = "";
  }
}

function updateLineInspector(lineId) {
  if (!lineId) {
    return;
  }
  const lineEl = document.getElementById(lineId);
  if (!lineEl || lineEl.classList.contains("is-hidden")) {
    return;
  }

  clearLineFocus();
  lineEl.classList.add("is-focused");
  activeLineId = lineId;

  const details = FLOW_LINE_DETAILS[lineId] || {
    title: lineId.replace(/-/g, " "),
    description: "Flow detail is not mapped yet.",
    command: "SELECT instance_name, status FROM v$instance;"
  };

  if (lineTitleEl) {
    lineTitleEl.textContent = details.title;
  }
  if (lineDescriptionEl) {
    lineDescriptionEl.textContent = details.description;
  }
  if (lineCommandEl) {
    lineCommandEl.textContent = details.command;
  }
}

function clearTraceHighlight() {
  if (traceNodeId) {
    document
      .querySelectorAll(`[data-node="${traceNodeId}"]`)
      .forEach((nodeEl) => nodeEl.classList.remove("is-trace"));
  }
  traceNodeId = "";
}

function clearNodePreview() {
  interactiveNodes.forEach((nodeEl) => nodeEl.classList.remove("is-preview"));
}

function setNodePreview(nodeId) {
  clearNodePreview();
  if (!nodeId || pinnedNodeId) {
    return;
  }
  interactiveNodes.forEach((nodeEl) => {
    nodeEl.classList.toggle("is-preview", nodeEl.getAttribute("data-node") === nodeId);
  });
}

function applyTraceHighlight(nodeId) {
  clearTraceHighlight();
  if (!nodeId) {
    return;
  }
  document.querySelectorAll(`[data-node="${nodeId}"]`).forEach((nodeEl) => nodeEl.classList.add("is-trace"));
  traceNodeId = nodeId;
}

function applyActiveNode(nodeId) {
  if (!nodeMap.has(nodeId)) {
    return;
  }

  activeNodeId = nodeId;
  interactiveNodes.forEach((nodeEl) => {
    const isMatch = nodeEl.getAttribute("data-node") === nodeId;
    nodeEl.classList.toggle("is-active", isMatch);
    nodeEl.classList.toggle("is-pinned", isMatch && pinnedNodeId === nodeId);
  });
  updatePanel(nodeMap.get(nodeId));
}

function pinNode(nodeId) {
  pinnedNodeId = nodeId;
  clearNodePreview();
  applyActiveNode(nodeId);
}

function clearPinnedNode() {
  pinnedNodeId = "";
  interactiveNodes.forEach((nodeEl) => nodeEl.classList.remove("is-pinned"));
  if (nodeMap.has(activeNodeId)) {
    updatePanel(nodeMap.get(activeNodeId));
  }
}

function stopWalkthrough() {
  if (walkTimer) {
    window.clearInterval(walkTimer);
    walkTimer = null;
  }
  walkIndex = 0;
}

function disableStructureOverlaysForFlow() {
  const hadOverlay = modeState.cdb || modeState.rac || modeState.storage;
  if (!hadOverlay) {
    return false;
  }
  modeState.cdb = false;
  modeState.rac = false;
  modeState.storage = false;
  setButtonPressed(cdbToggleBtn, false);
  setButtonPressed(racToggleBtn, false);
  setButtonPressed(storageToggleBtn, false);
  overlayCdb?.classList.add("is-hidden");
  overlayRac?.classList.add("is-hidden");
  overlayStorage?.classList.add("is-hidden");
  storageStackPanel?.classList.add("is-hidden");
  stage?.classList.remove("is-structure-overlay");
  if (lineDescriptionEl) {
    lineDescriptionEl.textContent =
      "Flow mode resumed: structure overlays were turned off so line-level tracing is visible and clickable.";
  }
  updateModeDescription();
  return true;
}

function applyFlowMode(flowName) {
  activeFlow = flowName;
  const primarySet = FLOW_PRIMARY_LINES[flowName] ? new Set(FLOW_PRIMARY_LINES[flowName]) : null;

  flowButtons.forEach((button) => {
    button.classList.toggle("is-active", button.getAttribute("data-arch-flow") === flowName);
  });

  flowLines.forEach((line) => {
    const visibleByTag = flowMatch(line, flowName);
    const visibleByPriority = !primarySet || primarySet.has(line.id);
    const overlayGroup = line.closest("#overlay-cdb, #overlay-rac, #overlay-storage");
    const overlayVisible = overlayGroup instanceof Element && !overlayGroup.classList.contains("is-hidden");
    const visible = overlayVisible || (visibleByTag && visibleByPriority);
    line.classList.toggle("is-hidden", !visible);
    const hitEl = flowHitMap.get(line.id);
    if (hitEl) {
      hitEl.classList.toggle("is-hidden", !visible);
    }
  });

  flowParticles.forEach((particle) => {
    const visibleByTag = flowMatch(particle, flowName);
    const pathRef = particle.querySelector("mpath")?.getAttribute("href") || "";
    const pathId = pathRef.startsWith("#") ? pathRef.slice(1) : "";
    const pathVisible = pathId ? !document.getElementById(pathId)?.classList.contains("is-hidden") : true;
    particle.classList.toggle("is-hidden", !(visibleByTag && pathVisible));
  });

  flowAwareNodes.forEach((nodeEl) => {
    nodeEl.classList.toggle("is-dim", !flowMatch(nodeEl, flowName));
  });

  if (activeLineId && document.getElementById(activeLineId)?.classList.contains("is-hidden")) {
    clearLineFocus();
    setLineInspectorDefault();
  }

  if (flowDescEl) {
    flowDescEl.textContent = FLOW_DESCRIPTIONS[flowName] || FLOW_DESCRIPTIONS.all;
  }
}

function startWalkthrough() {
  disableStructureOverlaysForFlow();
  const sequence = FLOW_SEQUENCES[activeFlow === "all" ? "query" : activeFlow];
  if (!sequence || !sequence.length) {
    return;
  }

  stopWalkthrough();
  const interval = prefersReducedMotion ? 2000 : 1250;
  const step = () => {
    const nodeId = sequence[walkIndex % sequence.length];
    applyActiveNode(nodeId);
    walkIndex += 1;
  };

  step();
  walkTimer = window.setInterval(step, interval);
}

function applyZoom() {
  if (!svg) {
    return;
  }
  svg.style.transform = `scale(${zoomLevel})`;
  svg.style.transformOrigin = "center";
}

function updateModeDescription() {
  if (!modeDescEl) {
    return;
  }
  const enabled = [];
  if (modeState.cdb) enabled.push("CDB/PDB overlay (bottom-left of diagram)");
  if (modeState.rac) enabled.push("RAC overlay (top-right of diagram)");
  if (modeState.storage) enabled.push("Expanded storage stack (bottom-right + storage card)");
  if (modeState.interview) enabled.push("Interview mode");
  const overlayMode = modeState.combined
    ? "Overlay mode: expert combined view (multiple overlays allowed)."
    : "Overlay mode: single layer (recommended).";
  modeDescEl.textContent = enabled.length
    ? `Enabled: ${enabled.join(", ")}. ${overlayMode}`
    : `All advanced overlays are currently disabled. ${overlayMode}`;
  pulseStatusText(modeDescEl);
}

function setRuntimeStatus(message, state = "info") {
  if (!runtimeStatusEl) {
    return;
  }
  runtimeStatusEl.hidden = !message;
  runtimeStatusEl.textContent = message || "";
  if (message) {
    runtimeStatusEl.setAttribute("data-state", state);
  } else {
    runtimeStatusEl.removeAttribute("data-state");
  }
}

function setOverlayMode(modeKey, enabled) {
  const wasEnabled = modeState[modeKey];
  const layeredModes = ["cdb", "rac", "storage"];

  if (enabled && layeredModes.includes(modeKey)) {
    if (!modeState.combined) {
      layeredModes.forEach((key) => {
        if (key !== modeKey) {
          modeState[key] = false;
        }
      });
    }
    modeState.interview = false;
  }

  if (enabled && modeKey === "interview") {
    layeredModes.forEach((key) => {
      modeState[key] = false;
    });
  }

  modeState[modeKey] = enabled;

  if (modeKey === "cdb" && modeState.cdb !== wasEnabled) {
    burstToggleButton(cdbToggleBtn);
  }
  setButtonPressed(cdbToggleBtn, modeState.cdb);
  overlayCdb?.classList.toggle("is-hidden", !modeState.cdb);
  if (modeState.cdb && !wasEnabled && modeKey === "cdb") {
    animateOverlayReveal(overlayCdb);
  }

  if (modeKey === "rac" && modeState.rac !== wasEnabled) {
    burstToggleButton(racToggleBtn);
  }
  setButtonPressed(racToggleBtn, modeState.rac);
  overlayRac?.classList.toggle("is-hidden", !modeState.rac);
  if (modeState.rac && !wasEnabled && modeKey === "rac") {
    animateOverlayReveal(overlayRac);
  }

  if (modeKey === "storage" && modeState.storage !== wasEnabled) {
    burstToggleButton(storageToggleBtn);
  }
  setButtonPressed(storageToggleBtn, modeState.storage);
  overlayStorage?.classList.toggle("is-hidden", !modeState.storage);
  storageStackPanel?.classList.toggle("is-hidden", !modeState.storage);
  if (modeState.storage && !wasEnabled && modeKey === "storage") {
    animateOverlayReveal(overlayStorage);
    animatePanelReveal(storageStackPanel);
  }

  if (modeKey === "interview" && modeState.interview !== wasEnabled) {
    burstToggleButton(interviewToggleBtn);
  }
  setButtonPressed(interviewToggleBtn, modeState.interview);
  setButtonPressed(combinedToggleBtn, modeState.combined);
  stage?.classList.toggle("is-interview", modeState.interview);
  if (modeState.interview) {
    startInterview();
  } else {
    stopInterview();
  }

  const hasStructureOverlay = modeState.cdb || modeState.rac || modeState.storage;
  stage?.classList.toggle("is-structure-overlay", hasStructureOverlay);
  if (hasStructureOverlay && !activeLineId && lineDescriptionEl) {
    lineDescriptionEl.textContent =
      "Overlay mode is active. Hover any animated flow line to inspect what that path is doing.";
  }

  updateModeDescription();
}

function setCombinedMode(enabled) {
  modeState.combined = enabled;
  burstToggleButton(combinedToggleBtn);
  setButtonPressed(combinedToggleBtn, modeState.combined);
  if (!enabled) {
    const layeredModes = ["cdb", "rac", "storage"];
    const activeLayered = layeredModes.filter((key) => modeState[key]);
    if (activeLayered.length > 1) {
      const keep = activeLayered[0];
      layeredModes.forEach((key) => {
        modeState[key] = key === keep;
      });
    }
  }
  setOverlayMode("cdb", modeState.cdb);
  setOverlayMode("rac", modeState.rac);
  setOverlayMode("storage", modeState.storage);
  updateModeDescription();
}

function getCurrentInterviewQuestion() {
  return interviewQueue[interviewIndex] || null;
}

function resetInterviewUI() {
  if (interviewStatusEl) {
    interviewStatusEl.textContent = "Interview mode is off.";
  }
  if (interviewQuestionEl) {
    interviewQuestionEl.textContent = "Enable interview mode to start random component-role questions.";
  }
  if (interviewOptionsEl) {
    interviewOptionsEl.innerHTML = "";
  }
  if (interviewFeedbackEl) {
    interviewFeedbackEl.textContent = "";
  }
}

function shuffleQuestions(items) {
  const copy = [...items];
  for (let idx = copy.length - 1; idx > 0; idx -= 1) {
    const swap = Math.floor(Math.random() * (idx + 1));
    [copy[idx], copy[swap]] = [copy[swap], copy[idx]];
  }
  return copy;
}

function markInterviewButtons(correctId, selectedId) {
  if (!interviewOptionsEl) {
    return;
  }
  interviewOptionsEl.querySelectorAll("button").forEach((button) => {
    const optionId = button.getAttribute("data-option");
    button.disabled = true;
    if (optionId === correctId) {
      button.classList.add("is-correct");
    } else if (optionId === selectedId) {
      button.classList.add("is-wrong");
    }
  });
}

function answerInterview(optionId) {
  const question = getCurrentInterviewQuestion();
  if (!question || interviewAnswered) {
    return;
  }
  interviewAnswered = true;
  const isCorrect = optionId === question.answer;
  if (interviewFeedbackEl) {
    interviewFeedbackEl.textContent = isCorrect
      ? `Correct. ${question.explanation}`
      : `Not correct. ${question.explanation}`;
  }
  markInterviewButtons(question.answer, optionId);
  if (question.focusNode) {
    applyActiveNode(question.focusNode);
  }
}

function renderInterviewQuestion() {
  const question = getCurrentInterviewQuestion();
  if (!question) {
    resetInterviewUI();
    return;
  }

  interviewAnswered = false;
  if (interviewStatusEl) {
    interviewStatusEl.textContent = `Interview mode active. Question ${interviewIndex + 1} of ${interviewQueue.length}.`;
  }
  if (interviewQuestionEl) {
    interviewQuestionEl.textContent = question.prompt;
  }
  if (interviewFeedbackEl) {
    interviewFeedbackEl.textContent = "";
  }
  if (!interviewOptionsEl) {
    return;
  }
  interviewOptionsEl.innerHTML = "";
  question.options.forEach((optionId) => {
    const node = nodeMap.get(optionId);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip interview-option";
    button.setAttribute("data-option", optionId);
    button.textContent = node?.label || optionId;
    button.addEventListener("click", () => answerInterview(optionId));
    interviewOptionsEl.appendChild(button);
  });
}

function startInterview() {
  if (!modeState.interview) {
    return;
  }
  if (!interviewQueue.length) {
    interviewQueue = shuffleQuestions(INTERVIEW_QUESTIONS);
    interviewIndex = 0;
  }
  renderInterviewQuestion();
}

function stopInterview() {
  interviewQueue = [];
  interviewIndex = 0;
  interviewAnswered = false;
  resetInterviewUI();
}

function resetFailureSimulation() {
  failureButtons.forEach((button) => button.classList.remove("is-active"));
  if (failureImmediateEl) {
    failureImmediateEl.textContent = "Select a process to simulate.";
  }
  if (failureSymptomsEl) {
    failureSymptomsEl.textContent = "Symptoms will appear here.";
  }
  if (failureActionsEl) {
    failureActionsEl.textContent = "Action plan will appear here.";
  }
}

function applyFailureSimulation(nodeId) {
  const model = FAILURE_SCENARIOS[nodeId];
  if (!model) {
    return;
  }
  failureButtons.forEach((button) => {
    button.classList.toggle("is-active", button.getAttribute("data-failure-node") === nodeId);
  });
  if (failureImmediateEl) {
    failureImmediateEl.textContent = model.immediate;
  }
  if (failureSymptomsEl) {
    failureSymptomsEl.textContent = model.symptoms;
  }
  if (failureActionsEl) {
    failureActionsEl.textContent = model.actions;
  }
  applyActiveNode(nodeId);
}

function getScnTimeline() {
  return SCN_TIMELINES[scnState.operation] || SCN_TIMELINES.SELECT;
}

function stopScnPlayback() {
  if (scnState.timer) {
    window.clearInterval(scnState.timer);
    scnState.timer = null;
  }
}

function updateScnSummary() {
  if (!scnSummaryEl) {
    return;
  }
  const timeline = getScnTimeline();
  const step = timeline[scnState.index];
  if (!step) {
    scnSummaryEl.textContent = "Select an operation to view SCN progression.";
    return;
  }
  scnSummaryEl.textContent = `${scnState.operation} Step ${scnState.index + 1}/${timeline.length}: ${step.label} - ${step.summary}`;
}

function updateScnStrip() {
  if (!scnStripEl) {
    return;
  }
  const timeline = getScnTimeline();
  const points = Array.from(scnStripEl.querySelectorAll(".scn-point"));
  points.forEach((point, idx) => {
    point.classList.toggle("is-past", idx < scnState.index);
    point.classList.toggle("is-active", idx === scnState.index);
    point.classList.toggle("is-upcoming", idx > scnState.index);
  });
  const activeStep = timeline[scnState.index];
  if (activeStep?.nodeId) {
    applyActiveNode(activeStep.nodeId);
  }
  updateScnSummary();
}

function renderScnStrip() {
  if (!scnStripEl) {
    return;
  }
  const timeline = getScnTimeline();
  scnStripEl.innerHTML = "";
  timeline.forEach((step, idx) => {
    const point = document.createElement("button");
    point.type = "button";
    point.className = "scn-point";
    point.innerHTML = `<span class="scn-point-title">${step.label}</span><span class="scn-point-note">${step.summary}</span>`;
    point.addEventListener("click", () => {
      scnState.index = idx;
      updateScnStrip();
    });
    scnStripEl.appendChild(point);
  });
  updateScnStrip();
}

function setScnOperation(operation) {
  scnState.operation = operation;
  scnState.index = 0;
  stopScnPlayback();
  scnOperationButtons.forEach((button) => {
    button.classList.toggle("is-active", button.getAttribute("data-scn-operation") === operation);
  });
  renderScnStrip();
}

function scnNextStep() {
  const timeline = getScnTimeline();
  scnState.index = Math.min(timeline.length - 1, scnState.index + 1);
  updateScnStrip();
}

function scnPreviousStep() {
  scnState.index = Math.max(0, scnState.index - 1);
  updateScnStrip();
}

function playScn() {
  stopScnPlayback();
  const interval = prefersReducedMotion ? 2300 : 1500;
  scnState.timer = window.setInterval(() => {
    const timeline = getScnTimeline();
    if (scnState.index >= timeline.length - 1) {
      stopScnPlayback();
      return;
    }
    scnState.index += 1;
    updateScnStrip();
  }, interval);
}

function getTraceFlow() {
  return TRACE_FLOWS[traceState.operation] || TRACE_FLOWS.SELECT;
}

function renderTraceTimeline() {
  if (!traceTimelineEl) {
    return;
  }
  const steps = getTraceFlow();
  traceTimelineEl.innerHTML = "";
  steps.forEach((step, idx) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "flow-timeline-step";
    button.textContent = `${idx + 1}. ${step.label}`;
    button.addEventListener("click", () => {
      traceState.active = true;
      traceState.index = idx;
      updateTraceStep();
    });
    traceTimelineEl.appendChild(button);
  });
}

function updateTraceStep() {
  const steps = getTraceFlow();
  const step = steps[traceState.index];
  if (!step) {
    return;
  }
  if (traceStepEl) {
    traceStepEl.textContent = `Step ${traceState.index + 1} of ${steps.length}: ${step.label}`;
  }
  if (traceCommandEl) {
    traceCommandEl.textContent = step.command;
  }
  if (traceNoteEl) {
    traceNoteEl.textContent = step.note;
  }

  Array.from(traceTimelineEl?.children || []).forEach((child, idx) => {
    child.classList.toggle("is-active", idx === traceState.index);
  });

  if (step.nodeId) {
    applyTraceHighlight(step.nodeId);
    applyActiveNode(step.nodeId);
  }
}

function startTrace() {
  traceState.active = true;
  traceState.index = 0;
  stopWalkthrough();
  stopScnPlayback();
  renderTraceTimeline();
  updateTraceStep();
}

function nextTraceStep() {
  const steps = getTraceFlow();
  if (!traceState.active) {
    startTrace();
    return;
  }
  traceState.index = Math.min(steps.length - 1, traceState.index + 1);
  updateTraceStep();
}

function stopTrace() {
  traceState.active = false;
  traceState.index = 0;
  clearTraceHighlight();
  if (traceStepEl) {
    traceStepEl.textContent = "Step 1 of 1";
  }
  if (traceCommandEl) {
    traceCommandEl.textContent = "SELECT instance_name, status FROM v$instance;";
  }
  if (traceNoteEl) {
    traceNoteEl.textContent = "Trace note will appear here.";
  }
  Array.from(traceTimelineEl?.children || []).forEach((child) => {
    child.classList.remove("is-active");
  });
}

function toggleExpandedView() {
  if (!stage || !expandBtn) {
    return;
  }
  const willExpand = !stage.classList.contains("is-expanded");
  stage.classList.toggle("is-expanded", willExpand);
  expandBtn.classList.toggle("is-active", willExpand);
  expandBtn.textContent = willExpand ? "Collapse" : "Expand";
  expandBtn.setAttribute("aria-pressed", String(willExpand));
  document.body.classList.toggle("is-arch-expanded", willExpand);
}

async function copyNodeCommand() {
  if (!commandEl || !copyCommandBtn) {
    return;
  }
  const cmd = commandEl.textContent?.trim();
  if (!cmd) {
    return;
  }

  const originalText = copyCommandBtn.textContent;
  let copied = false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(cmd);
      copied = true;
    } else {
      throw new Error("Clipboard API not available");
    }
  } catch {
    try {
      const input = document.createElement("textarea");
      input.value = cmd;
      input.setAttribute("readonly", "true");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      copied = document.execCommand("copy");
      input.remove();
    } catch {
      copied = false;
    }
  }
  if (copied) {
    copyCommandBtn.textContent = "Copied";
  } else {
    try {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(commandEl);
      selection?.removeAllRanges();
      selection?.addRange(range);
    } catch {
      // no-op
    }
    try {
      window.prompt("Copy this command", cmd);
    } catch {
      // no-op
    }
    copyCommandBtn.textContent = "Copy failed";
  }
  window.setTimeout(() => {
    copyCommandBtn.textContent = originalText;
  }, 1300);
}

function resetAll() {
  zoomLevel = 1;
  applyZoom();
  applyFlowMode("query");
  stopWalkthrough();
  stopScnPlayback();
  stopTrace();
  resetFailureSimulation();
  modeState.combined = false;
  setOverlayMode("cdb", false);
  setOverlayMode("rac", false);
  setOverlayMode("storage", false);
  setOverlayMode("interview", false);
  clearPinnedNode();
  clearLineFocus();
  setLineInspectorDefault();
  applyActiveNode("instance");
  setScnOperation("SELECT");
}

function setupFallbackInteractions(reason = "Unknown initialization error") {
  if (window.__oracleArchFallbackInit) {
    return;
  }
  window.__oracleArchFallbackInit = true;
  setRuntimeStatus(
    `Architecture fallback mode is active because advanced initialization failed (${reason}). Basic controls remain available.`,
    "warn"
  );

  let fallbackWalkTimer = null;
  let fallbackWalkIndex = 0;
  let fallbackFlow = activeFlow || "query";

  const stopFallbackWalk = () => {
    if (!fallbackWalkTimer) {
      return;
    }
    window.clearInterval(fallbackWalkTimer);
    fallbackWalkTimer = null;
    fallbackWalkIndex = 0;
  };

  const refreshFallbackFlowUI = (flowName) => {
    fallbackFlow = flowName || "query";
    flowButtons.forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-arch-flow") === fallbackFlow);
    });
    if (flowDescEl) {
      flowDescEl.textContent = FLOW_DESCRIPTIONS[fallbackFlow] || FLOW_DESCRIPTIONS.query;
    }
  };

  const refreshFallbackModeUI = () => {
    setButtonPressed(cdbToggleBtn, modeState.cdb);
    setButtonPressed(racToggleBtn, modeState.rac);
    setButtonPressed(storageToggleBtn, modeState.storage);
    setButtonPressed(combinedToggleBtn, modeState.combined);
    setButtonPressed(interviewToggleBtn, modeState.interview);
    overlayCdb?.classList.toggle("is-hidden", !modeState.cdb);
    overlayRac?.classList.toggle("is-hidden", !modeState.rac);
    overlayStorage?.classList.toggle("is-hidden", !modeState.storage);
    storageStackPanel?.classList.toggle("is-hidden", !modeState.storage);
    stage?.classList.toggle("is-interview", modeState.interview);
    stage?.classList.toggle("is-structure-overlay", modeState.cdb || modeState.rac || modeState.storage);
    updateModeDescription();
  };

  flowButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const flow = button.getAttribute("data-arch-flow") || "query";
      fallbackFlow = flow;
      stopFallbackWalk();
      try {
        applyFlowMode(flow);
      } catch {
        refreshFallbackFlowUI(flow);
      }
    });
  });

  walkBtn?.addEventListener("click", () => {
    stopFallbackWalk();
    const sequence = FLOW_SEQUENCES[fallbackFlow === "all" ? "query" : fallbackFlow] || FLOW_SEQUENCES.query;
    if (!sequence || !sequence.length) {
      return;
    }
    const step = () => {
      const nodeId = sequence[fallbackWalkIndex % sequence.length];
      fallbackWalkIndex += 1;
      if (nodeMap.has(nodeId)) {
        try {
          applyActiveNode(nodeId);
        } catch {
          // no-op
        }
      }
    };
    step();
    fallbackWalkTimer = window.setInterval(step, prefersReducedMotion ? 2200 : 1300);
  });
  stopBtn?.addEventListener("click", stopFallbackWalk);

  expandBtn?.addEventListener("click", () => {
    try {
      toggleExpandedView();
    } catch {
      const willExpand = !stage?.classList.contains("is-expanded");
      stage?.classList.toggle("is-expanded", !!willExpand);
      expandBtn.classList.toggle("is-active", !!willExpand);
      expandBtn.textContent = willExpand ? "Collapse" : "Expand";
    }
  });
  zoomInBtn?.addEventListener("click", () => {
    zoomLevel = Math.min(1.9, zoomLevel + 0.1);
    applyZoom();
  });
  zoomOutBtn?.addEventListener("click", () => {
    zoomLevel = Math.max(0.65, zoomLevel - 0.1);
    applyZoom();
  });
  resetBtn?.addEventListener("click", () => {
    zoomLevel = 1;
    applyZoom();
    stopFallbackWalk();
    modeState.cdb = false;
    modeState.rac = false;
    modeState.storage = false;
    modeState.combined = false;
    modeState.interview = false;
    refreshFallbackFlowUI("query");
    refreshFallbackModeUI();
    setLineInspectorDefault();
    if (nodeMap.has("instance")) {
      applyActiveNode("instance");
    }
  });

  cdbToggleBtn?.addEventListener("click", () => {
    modeState.cdb = !modeState.cdb;
    burstToggleButton(cdbToggleBtn);
    if (!modeState.combined && modeState.cdb) {
      modeState.rac = false;
      modeState.storage = false;
    }
    refreshFallbackModeUI();
    if (modeState.cdb) {
      animateOverlayReveal(overlayCdb);
    }
  });
  racToggleBtn?.addEventListener("click", () => {
    modeState.rac = !modeState.rac;
    burstToggleButton(racToggleBtn);
    if (!modeState.combined && modeState.rac) {
      modeState.cdb = false;
      modeState.storage = false;
    }
    refreshFallbackModeUI();
    if (modeState.rac) {
      animateOverlayReveal(overlayRac);
    }
  });
  storageToggleBtn?.addEventListener("click", () => {
    modeState.storage = !modeState.storage;
    burstToggleButton(storageToggleBtn);
    if (!modeState.combined && modeState.storage) {
      modeState.cdb = false;
      modeState.rac = false;
    }
    refreshFallbackModeUI();
    if (modeState.storage) {
      animateOverlayReveal(overlayStorage);
      animatePanelReveal(storageStackPanel);
    }
  });
  combinedToggleBtn?.addEventListener("click", () => {
    modeState.combined = !modeState.combined;
    burstToggleButton(combinedToggleBtn);
    refreshFallbackModeUI();
  });
  interviewToggleBtn?.addEventListener("click", () => {
    modeState.interview = !modeState.interview;
    burstToggleButton(interviewToggleBtn);
    if (modeState.interview) {
      modeState.cdb = false;
      modeState.rac = false;
      modeState.storage = false;
    }
    refreshFallbackModeUI();
  });

  traceStartBtn?.addEventListener("click", () => {
    try {
      startTrace();
    } catch {
      // no-op
    }
  });
  traceNextBtn?.addEventListener("click", () => {
    try {
      nextTraceStep();
    } catch {
      // no-op
    }
  });
  traceStopBtn?.addEventListener("click", () => {
    try {
      stopTrace();
    } catch {
      // no-op
    }
  });
  copyCommandBtn?.addEventListener("click", () => {
    try {
      copyNodeCommand();
    } catch {
      // no-op
    }
  });

  refreshFallbackFlowUI(fallbackFlow);
  refreshFallbackModeUI();
}

function buildFlowHitAreas() {
  if (!svg) {
    return;
  }
  let layer = svg.querySelector("#flow-hit-layer");
  if (!layer) {
    layer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    layer.setAttribute("id", "flow-hit-layer");
  }
  const firstNodeEl = svg.querySelector(".diagram-node");
  if (firstNodeEl) {
    svg.insertBefore(layer, firstNodeEl);
  } else if (!layer.parentNode) {
    svg.appendChild(layer);
  }
  layer.innerHTML = "";
  flowHitMap.clear();

  flowLines.forEach((line) => {
    if (!line.id) {
      return;
    }
    const details = FLOW_LINE_DETAILS[line.id];
    const label = (details?.title || line.id).replace(/\s+/g, " ").trim();
    const nativeTooltip = details ? `${details.title}: ${details.description}` : label;
    line.setAttribute("aria-label", label);
    line.setAttribute("title", nativeTooltip);
    const hit = document.createElementNS("http://www.w3.org/2000/svg", "path");
    hit.setAttribute("class", "diagram-flow-hit");
    hit.setAttribute("d", line.getAttribute("d") || "");
    hit.setAttribute("data-target-line", line.id);
    hit.setAttribute("tabindex", "0");
    hit.setAttribute("aria-label", label);
    hit.setAttribute("title", nativeTooltip);
    layer.appendChild(hit);
    flowHitMap.set(line.id, hit);
  });
}

try {
  interactiveNodes.forEach((nodeEl) => {
    const nodeId = nodeEl.getAttribute("data-node");
    if (!nodeId || !nodeMap.has(nodeId)) {
      return;
    }
    const activateHover = () => {
      setNodePreview(nodeId);
    };
    const clearHover = () => setNodePreview("");
    const activateClick = () => {
      stopWalkthrough();
      if (pinnedNodeId === nodeId) {
        clearPinnedNode();
        applyActiveNode(nodeId);
        return;
      }
      pinNode(nodeId);
    };
    nodeEl.addEventListener("mouseenter", activateHover);
    nodeEl.addEventListener("mouseleave", clearHover);
    nodeEl.addEventListener("focus", () => {
      stopWalkthrough();
      applyActiveNode(nodeId);
    });
    nodeEl.addEventListener("blur", clearHover);
    nodeEl.addEventListener("click", activateClick);
    nodeEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateClick();
      }
    });
  });

  buildFlowHitAreas();

  flowLines.forEach((line) => {
    if (!line.id) {
      return;
    }
    const activate = () => updateLineInspector(line.id);
    line.addEventListener("mouseenter", activate);
    line.addEventListener("focus", activate);
    line.addEventListener("click", activate);
    line.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });

  flowHitMap.forEach((hitEl, lineId) => {
    const activate = () => updateLineInspector(lineId);
    hitEl.addEventListener("mouseenter", activate);
    hitEl.addEventListener("focus", activate);
    hitEl.addEventListener("click", activate);
    hitEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });

  canvas?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    if (target.closest(".diagram-node[data-node], .diagram-flow-line, .diagram-flow-hit")) {
      return;
    }
    if (pinnedNodeId) {
      clearPinnedNode();
      if (nodeMap.has(activeNodeId)) {
        applyActiveNode(activeNodeId);
      }
    }
  });

  flowButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const flow = button.getAttribute("data-arch-flow") || "all";
      stopWalkthrough();
      disableStructureOverlaysForFlow();
      applyFlowMode(flow);
    });
  });

  walkBtn?.addEventListener("click", startWalkthrough);
  stopBtn?.addEventListener("click", stopWalkthrough);

  expandBtn?.addEventListener("click", toggleExpandedView);
  zoomInBtn?.addEventListener("click", () => {
    zoomLevel = Math.min(1.9, zoomLevel + 0.1);
    applyZoom();
  });
  zoomOutBtn?.addEventListener("click", () => {
    zoomLevel = Math.max(0.65, zoomLevel - 0.1);
    applyZoom();
  });
  resetBtn?.addEventListener("click", resetAll);

  cdbToggleBtn?.addEventListener("click", () => setOverlayMode("cdb", !modeState.cdb));
  racToggleBtn?.addEventListener("click", () => setOverlayMode("rac", !modeState.rac));
  storageToggleBtn?.addEventListener("click", () => setOverlayMode("storage", !modeState.storage));
  combinedToggleBtn?.addEventListener("click", () => setCombinedMode(!modeState.combined));
  interviewToggleBtn?.addEventListener("click", () => setOverlayMode("interview", !modeState.interview));

  copyCommandBtn?.addEventListener("click", copyNodeCommand);

  failureButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nodeId = button.getAttribute("data-failure-node");
      if (nodeId) {
        applyFailureSimulation(nodeId);
      }
    });
  });
  failureResetBtn?.addEventListener("click", resetFailureSimulation);

  interviewNextBtn?.addEventListener("click", () => {
    if (!modeState.interview) {
      return;
    }
    if (!interviewQueue.length) {
      interviewQueue = shuffleQuestions(INTERVIEW_QUESTIONS);
      interviewIndex = 0;
    } else {
      interviewIndex = (interviewIndex + 1) % interviewQueue.length;
    }
    renderInterviewQuestion();
  });
  interviewExitBtn?.addEventListener("click", () => {
    setOverlayMode("interview", false);
  });

  scnOperationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const operation = (button.getAttribute("data-scn-operation") || "SELECT").toUpperCase();
      setScnOperation(operation);
    });
  });
  scnPrevBtn?.addEventListener("click", scnPreviousStep);
  scnNextBtn?.addEventListener("click", scnNextStep);
  scnPlayBtn?.addEventListener("click", playScn);
  scnStopBtn?.addEventListener("click", stopScnPlayback);

  traceOperationEl?.addEventListener("change", () => {
    traceState.operation = (traceOperationEl.value || "SELECT").toUpperCase();
    traceState.active = false;
    traceState.index = 0;
    clearTraceHighlight();
    renderTraceTimeline();
    stopTrace();
  });
  traceStartBtn?.addEventListener("click", () => {
    disableStructureOverlaysForFlow();
    startTrace();
  });
  traceNextBtn?.addEventListener("click", nextTraceStep);
  traceStopBtn?.addEventListener("click", stopTrace);
  listenersBound = true;

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && stage?.classList.contains("is-expanded")) {
      toggleExpandedView();
    }
    if (event.key === "Escape" && pinnedNodeId) {
      clearPinnedNode();
    }
  });

  applyZoom();
  setLineInspectorDefault();
  applyFlowMode("query");
  applyActiveNode(activeNodeId);
  updateModeDescription();
  resetFailureSimulation();
  setScnOperation("SELECT");
  renderTraceTimeline();
  stopTrace();
  setRuntimeStatus("", "info");
  window.__oracleArchInit = true;
} catch (error) {
  window.__oracleArchInit = false;
  window.__oracleArchError = String(error?.message || error || "Unknown architecture init error");
  console.error("Architecture init failed:", error);
  if (!listenersBound) {
    setupFallbackInteractions(window.__oracleArchError);
  } else {
    setRuntimeStatus(`Some advanced architecture features failed to initialize: ${window.__oracleArchError}`, "warn");
  }
}
