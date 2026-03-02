/** @type {import('./contracts.js').RoadmapWeek[]} */
export const ROADMAP_WEEKS = [
  {
    week: 1,
    focus: "SQL Basics",
    outcomes: [
      "Write SELECT queries with filters, joins, and group functions.",
      "Understand DDL vs DML vs TCL command categories.",
      "Practice transactions with COMMIT and ROLLBACK."
    ],
    exercises: [
      "Solve 20 SQL query drills on sample HR schema.",
      "Build one report query with joins and aggregates."
    ]
  },
  {
    week: 2,
    focus: "Oracle Architecture",
    outcomes: [
      "Explain instance, SGA, PGA, and background process responsibilities.",
      "Differentiate datafiles, redo logs, and control files.",
      "Map query execution to Oracle memory and process flow."
    ],
    exercises: [
      "Use architecture page to inspect every component command.",
      "Document each process failure impact in your notes."
    ]
  },
  {
    week: 3,
    focus: "Installation & Configuration",
    outcomes: [
      "Understand Oracle installation prerequisites and listener setup.",
      "Configure initialization parameters and startup modes.",
      "Validate environment variables and service registration."
    ],
    exercises: [
      "Prepare silent install checklist.",
      "Practice startup/shutdown commands and status checks."
    ]
  },
  {
    week: 4,
    focus: "User & Tablespace Management",
    outcomes: [
      "Create users, roles, and profiles with least privilege.",
      "Monitor tablespace utilization and autoextend strategy.",
      "Handle account lifecycle and access reviews."
    ],
    exercises: [
      "Implement role-based access for sample app users.",
      "Create alert thresholds for tablespace usage."
    ]
  },
  {
    week: 5,
    focus: "Performance & Backup",
    outcomes: [
      "Analyze top wait events and expensive SQL.",
      "Run RMAN backup jobs and validation routines.",
      "Interpret AWR-style metrics for tuning decisions."
    ],
    exercises: [
      "Tune one slow query with execution plan review.",
      "Execute RMAN restore validate sequence."
    ]
  },
  {
    week: 6,
    focus: "Advanced Tuning",
    outcomes: [
      "Investigate locking, latching, and parse contention.",
      "Refine memory parameters for workload behavior.",
      "Prepare interview-ready incident response explanations."
    ],
    exercises: [
      "Create performance incident report from sample metrics.",
      "Complete full mock interview using quiz + flashcards."
    ]
  }
];
