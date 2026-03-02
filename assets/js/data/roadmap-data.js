/** @type {import('./contracts.js').RoadmapWeek[]} */
export const ROADMAP_WEEKS = [
  {
    week: 1,
    focus: "SQL Basics",
    estimatedHours: 10,
    milestone: "Write confident query logic without copy-paste dependency.",
    interviewCheckpoint: "Explain JOIN types, GROUP BY behavior, and transaction control with examples.",
    outcomes: [
      "Write SELECT queries with filters, joins, and group functions.",
      "Understand DDL vs DML vs TCL command categories.",
      "Practice transactions with COMMIT and ROLLBACK.",
      "Use execution plans to reason about query cost."
    ],
    exercises: [
      "Solve 20 SQL query drills on sample HR schema.",
      "Build one report query with joins and aggregates.",
      "Run EXPLAIN PLAN on 5 statements and note access methods."
    ],
    deliverables: [
      "SQL revision notebook with 30+ solved patterns.",
      "One mini report query set ready for interview discussion."
    ]
  },
  {
    week: 2,
    focus: "Oracle Architecture",
    estimatedHours: 9,
    milestone: "Map end-to-end SQL lifecycle across memory, process, and storage.",
    interviewCheckpoint: "Describe SGA, PGA, DBWn, LGWR, CKPT, ARCn responsibilities accurately.",
    outcomes: [
      "Explain instance, SGA, PGA, and background process responsibilities.",
      "Differentiate datafiles, redo logs, and control files.",
      "Map query execution to Oracle memory and process flow.",
      "Understand checkpoint and recovery consistency model."
    ],
    exercises: [
      "Use architecture page to inspect every component command.",
      "Document each process failure impact in your notes.",
      "Run architecture mini quiz and correct weak areas."
    ],
    deliverables: [
      "Architecture one-page summary sheet.",
      "Failure-impact matrix for core background processes."
    ]
  },
  {
    week: 3,
    focus: "Installation & Configuration",
    estimatedHours: 12,
    milestone: "Set up and validate Oracle environment confidently.",
    interviewCheckpoint: "Walk through startup modes, parameter files, and listener flow.",
    outcomes: [
      "Understand Oracle installation prerequisites and listener setup.",
      "Configure initialization parameters and startup modes.",
      "Validate environment variables and service registration.",
      "Perform controlled startup/shutdown and mount/open transitions."
    ],
    exercises: [
      "Prepare silent install checklist.",
      "Practice startup/shutdown commands and status checks.",
      "Review alert log and listener log after each restart."
    ],
    deliverables: [
      "Environment build checklist.",
      "Startup and baseline validation runbook."
    ]
  },
  {
    week: 4,
    focus: "User & Tablespace Management",
    estimatedHours: 10,
    milestone: "Operate least-privilege access and storage governance controls.",
    interviewCheckpoint: "Show how to create users, roles, profiles, quotas, and space checks.",
    outcomes: [
      "Create users, roles, and profiles with least privilege.",
      "Monitor tablespace utilization and autoextend strategy.",
      "Handle account lifecycle and access reviews.",
      "Implement quota and audit-aware privilege model."
    ],
    exercises: [
      "Implement role-based access for sample app users.",
      "Create alert thresholds for tablespace usage.",
      "Perform one mock access review report."
    ],
    deliverables: [
      "Access policy matrix (user -> role -> privilege).",
      "Tablespace capacity dashboard query set."
    ]
  },
  {
    week: 5,
    focus: "Performance & Backup",
    estimatedHours: 12,
    milestone: "Diagnose slow workload and validate recoverability chain.",
    interviewCheckpoint: "Explain top waits, SQL tuning workflow, and RMAN validation sequence.",
    outcomes: [
      "Analyze top wait events and expensive SQL.",
      "Run RMAN backup jobs and validation routines.",
      "Interpret AWR-style metrics for tuning decisions.",
      "Correlate host metrics with database waits for incident RCA."
    ],
    exercises: [
      "Tune one slow query with execution plan review.",
      "Execute RMAN restore validate sequence.",
      "Simulate a backup-chain verification checklist."
    ],
    deliverables: [
      "One performance RCA write-up with before/after evidence.",
      "Backup readiness checklist signed off."
    ]
  },
  {
    week: 6,
    focus: "Advanced Tuning",
    estimatedHours: 14,
    milestone: "Present production-grade troubleshooting and optimization decisions.",
    interviewCheckpoint: "Handle lock contention, memory tuning tradeoffs, and DR readiness questions.",
    outcomes: [
      "Investigate locking, latching, and parse contention.",
      "Refine memory parameters for workload behavior.",
      "Prepare interview-ready incident response explanations.",
      "Build complete DBA incident response narrative from alert to fix."
    ],
    exercises: [
      "Create performance incident report from sample metrics.",
      "Complete full mock interview using quiz + flashcards.",
      "Run DR readiness checks and summarize findings."
    ],
    deliverables: [
      "Final interview prep packet (commands + scenarios + RCA samples).",
      "6-week completion report with strengths and next focus areas."
    ]
  }
];
