const createResource = (id, title, url, category, level, summary, tags) => ({
  id,
  title,
  url,
  category,
  level,
  summary,
  tags
});

/** @type {string[]} */
export const RESOURCE_CATEGORIES = [
  "Architecture",
  "Administration",
  "Backup & Recovery",
  "Performance",
  "Security",
  "Linux Platform",
  "Hands-on Labs",
  "Community"
];

/** @type {Array<{
 * id: string,
 * title: string,
 * url: string,
 * category: string,
 * level: "Beginner"|"Intermediate"|"Advanced",
 * summary: string,
 * tags: string[]
 * }>}
 */
export const RESOURCE_LINKS = [
  createResource(
    "res-01",
    "Oracle Database Concepts (19c)",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/",
    "Architecture",
    "Beginner",
    "Primary conceptual reference for instance, memory, process, and storage architecture.",
    ["concepts", "instance", "sga", "pga"]
  ),
  createResource(
    "res-02",
    "Process Architecture",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/process-architecture.html",
    "Architecture",
    "Beginner",
    "Background processes and server-process model explained by Oracle docs.",
    ["dbwr", "lgwr", "smon", "pmon"]
  ),
  createResource(
    "res-03",
    "Memory Architecture",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/memory-architecture.html",
    "Architecture",
    "Beginner",
    "Detailed understanding of SGA pools and PGA behavior.",
    ["shared pool", "buffer cache", "redo buffer"]
  ),
  createResource(
    "res-04",
    "SQL Processing",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/tgsql/sql-processing.html",
    "Architecture",
    "Intermediate",
    "SQL parse, optimization, cursor management, and execution workflow.",
    ["optimizer", "cursor", "parse"]
  ),
  createResource(
    "res-05",
    "Oracle Database Administrator's Guide",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/admin/",
    "Administration",
    "Beginner",
    "Core operational guide for instance management and everyday DBA tasks.",
    ["startup", "shutdown", "tablespace", "users"]
  ),
  createResource(
    "res-06",
    "Oracle Database Reference",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/refrn/",
    "Administration",
    "Intermediate",
    "Reference for dynamic performance views and initialization parameters.",
    ["v$ views", "parameters", "monitoring"]
  ),
  createResource(
    "res-07",
    "SQL Language Reference",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/",
    "Administration",
    "Beginner",
    "Authoritative syntax for SQL, DDL, and transaction statements.",
    ["sql", "ddl", "dml"]
  ),
  createResource(
    "res-08",
    "Backup and Recovery User's Guide",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/bradv/",
    "Backup & Recovery",
    "Intermediate",
    "Official backup strategy and restore/recovery workflows.",
    ["backup", "restore", "recovery", "rman"]
  ),
  createResource(
    "res-09",
    "RMAN Reference",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/rcmrf/",
    "Backup & Recovery",
    "Advanced",
    "Command-level reference for RMAN operations and syntax.",
    ["rman", "catalog", "validate"]
  ),
  createResource(
    "res-10",
    "Data Guard Concepts and Administration",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/sbydb/",
    "Backup & Recovery",
    "Advanced",
    "Primary guide for standby databases, transport, apply, and role transitions.",
    ["data guard", "standby", "dr"]
  ),
  createResource(
    "res-11",
    "Oracle Data Pump Guide",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/oracle-data-pump.html",
    "Backup & Recovery",
    "Intermediate",
    "Export/import tooling for migrations and logical backups.",
    ["expdp", "impdp", "migration"]
  ),
  createResource(
    "res-12",
    "SQL Tuning Guide",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/tgsql/",
    "Performance",
    "Intermediate",
    "Covers optimizer behavior, SQL tuning techniques, and execution plans.",
    ["tuning", "optimizer", "plan"]
  ),
  createResource(
    "res-13",
    "Performance Tuning Guide",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/tgdba/",
    "Performance",
    "Advanced",
    "System-level performance diagnostics and workload tuning patterns.",
    ["awr", "ash", "wait events"]
  ),
  createResource(
    "res-14",
    "DBMS_XPLAN Package",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/arpls/DBMS_XPLAN.html",
    "Performance",
    "Intermediate",
    "Official package documentation for execution plan display and runtime stats.",
    ["dbms_xplan", "execution plan"]
  ),
  createResource(
    "res-15",
    "Oracle Database Security Guide",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/dbseg/",
    "Security",
    "Intermediate",
    "Canonical security reference for authentication, privileges, auditing, and network controls.",
    ["security", "roles", "auditing"]
  ),
  createResource(
    "res-16",
    "Transparent Data Encryption",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/asoag/configuring-transparent-data-encryption.html",
    "Security",
    "Advanced",
    "Detailed setup and lifecycle guidance for TDE keystores and encrypted data.",
    ["tde", "keystore", "encryption"]
  ),
  createResource(
    "res-17",
    "DBMS_ASSERT Reference",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/arpls/DBMS_ASSERT.html",
    "Security",
    "Advanced",
    "Oracle package for validating dynamic SQL inputs to reduce injection risk.",
    ["sql injection", "plsql", "dbms_assert"]
  ),
  createResource(
    "res-18",
    "Oracle Linux Documentation",
    "https://docs.oracle.com/en/operating-systems/oracle-linux/",
    "Linux Platform",
    "Beginner",
    "Official Oracle Linux administration docs used by DBAs in production.",
    ["linux", "os", "operations"]
  ),
  createResource(
    "res-19",
    "Oracle Linux Monitoring and Tuning",
    "https://docs.oracle.com/en/operating-systems/oracle-linux/9/monitoring/",
    "Linux Platform",
    "Intermediate",
    "Host-level monitoring guidance for CPU, memory, storage, and process diagnostics used during DBA incidents.",
    ["iostat", "vmstat", "sar", "oswatcher", "monitoring"]
  ),
  createResource(
    "res-20",
    "Oracle Database Installation Guide for Linux",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/rilin/",
    "Linux Platform",
    "Intermediate",
    "Installation prerequisites and platform-specific deployment details.",
    ["install", "oracle home", "linux"]
  ),
  createResource(
    "res-21",
    "Oracle Live SQL",
    "https://livesql.oracle.com/",
    "Hands-on Labs",
    "Beginner",
    "Browser-based Oracle SQL lab environment for practice and sharing scripts.",
    ["practice", "sql", "sandbox"]
  ),
  createResource(
    "res-22",
    "Oracle by Example Learning Library",
    "https://www.oracle.com/database/technologies/appdev/sql.html",
    "Hands-on Labs",
    "Intermediate",
    "Oracle training exercises and guided practice materials.",
    ["learning", "tutorial", "oracle by example"]
  ),
  createResource(
    "res-23",
    "Ask TOM",
    "https://asktom.oracle.com/",
    "Community",
    "Intermediate",
    "Expert Q&A and deep practical discussions from Oracle technical leaders.",
    ["community", "q&a", "best practices"]
  ),
  createResource(
    "res-24",
    "Oracle Forums",
    "https://forums.oracle.com/",
    "Community",
    "Beginner",
    "Community troubleshooting threads for real operational and SQL problems.",
    ["forum", "troubleshooting", "community"]
  )
];
