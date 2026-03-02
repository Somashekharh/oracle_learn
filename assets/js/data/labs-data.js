/** @type {import('./contracts.js').LabItem[]} */
export const LAB_ITEMS = [
  {
    id: "lab-01",
    type: "SQL Practice",
    title: "Find Top 5 Salaries per Department",
    difficulty: "Beginner",
    prompt: "Write a query to list the top 5 salaries for each department from HR.EMPLOYEES.",
    solution: "Use ROW_NUMBER() OVER(PARTITION BY department_id ORDER BY salary DESC) and filter rn <= 5."
  },
  {
    id: "lab-02",
    type: "SQL Practice",
    title: "Null-safe Reporting Query",
    difficulty: "Beginner",
    prompt: "Display employee names and commission with zero shown for NULL values.",
    solution: "Use NVL(commission_pct, 0) in SELECT projection and format with aliases."
  },
  {
    id: "lab-03",
    type: "SQL Practice",
    title: "Detect Duplicate Emails",
    difficulty: "Intermediate",
    prompt: "Identify duplicate email IDs in a USERS table with count.",
    solution: "GROUP BY email HAVING COUNT(*) > 1 and sort by count desc."
  },
  {
    id: "lab-04",
    type: "SQL Practice",
    title: "Date Range Monthly Revenue",
    difficulty: "Intermediate",
    prompt: "Build monthly order revenue summary for last 12 months.",
    solution: "TRUNC(order_date,'MM'), SUM(amount), filtered with ADD_MONTHS(TRUNC(SYSDATE,'MM'),-12)."
  },
  {
    id: "lab-05",
    type: "SQL Practice",
    title: "Join Employees with Manager",
    difficulty: "Beginner",
    prompt: "Return employee and manager names from EMPLOYEES table.",
    solution: "Self join employees e and employees m on e.manager_id = m.employee_id with LEFT JOIN."
  },
  {
    id: "lab-06",
    type: "SQL Practice",
    title: "Update with Correlated Subquery",
    difficulty: "Advanced",
    prompt: "Update bonus column based on department average salary.",
    solution: "Use correlated subquery per employee department with CASE conditions."
  },
  {
    id: "lab-07",
    type: "DBA Scenario",
    title: "Tablespace at 95%",
    difficulty: "Intermediate",
    prompt: "USERS tablespace reached 95%. What checks and actions do you take?",
    solution: "Check dba_tablespace_usage_metrics, validate autoextend/maxsize, add/resize datafile, verify growth source queries."
  },
  {
    id: "lab-08",
    type: "DBA Scenario",
    title: "High Log File Sync Wait",
    difficulty: "Advanced",
    prompt: "Users report commit latency. log file sync is top wait. Outline troubleshooting flow.",
    solution: "Check redo log IO latency, LGWR process health, redo log sizing, commit frequency from app, storage metrics."
  },
  {
    id: "lab-09",
    type: "DBA Scenario",
    title: "Account Lockout Incident",
    difficulty: "Beginner",
    prompt: "Critical service account is locked due to failed logins. What is safe recovery?",
    solution: "Investigate source host/process, unlock account with expiry check, rotate credential in app, enable monitoring alert."
  },
  {
    id: "lab-10",
    type: "DBA Scenario",
    title: "Blocking Session Chain",
    difficulty: "Intermediate",
    prompt: "Production transaction queue is blocked. How do you identify blocker and resolve safely?",
    solution: "Use v$session and v$lock joins, confirm SQL and module, coordinate with owner, kill blocker if approved, capture evidence."
  },
  {
    id: "lab-11",
    type: "DBA Scenario",
    title: "Archive Destination Full",
    difficulty: "Advanced",
    prompt: "ARCH process reports destination full. What is immediate and preventive action?",
    solution: "Free/archive space, backup and delete archivelogs via RMAN, verify log switch recovery, adjust FRA sizing and alerting."
  },
  {
    id: "lab-12",
    type: "DBA Scenario",
    title: "Standby Apply Lag",
    difficulty: "Advanced",
    prompt: "Data Guard standby apply lag grows to 30 minutes. Plan diagnosis.",
    solution: "Check v$dataguard_stats lag metrics, network transport health, MRP process, redo generation spikes, standby IO bottlenecks."
  },
  {
    id: "lab-13",
    type: "Mini Challenge",
    title: "Create Least-Privilege Role",
    difficulty: "Beginner",
    prompt: "Design a role for read-only analysts with limited schema access.",
    solution: "CREATE ROLE, GRANT CREATE SESSION and SELECT on required objects only, avoid broad system privileges."
  },
  {
    id: "lab-14",
    type: "Mini Challenge",
    title: "RMAN Validation Drill",
    difficulty: "Intermediate",
    prompt: "Prepare commands for weekly backup validation checklist.",
    solution: "LIST BACKUP SUMMARY, CROSSCHECK BACKUP, RESTORE DATABASE VALIDATE, document completion timestamp."
  },
  {
    id: "lab-15",
    type: "Mini Challenge",
    title: "Explain Plan Review",
    difficulty: "Intermediate",
    prompt: "Given a full table scan plan, propose optimization checks.",
    solution: "Validate selective predicates, index existence, stats freshness, bind peeking effects, and histogram relevance."
  },
  {
    id: "lab-16",
    type: "Mini Challenge",
    title: "Hardening Checklist Audit",
    difficulty: "Advanced",
    prompt: "Assess 10-item security checklist for a new Oracle environment.",
    solution: "Review default accounts, password profiles, encryption, auditing policies, listener restrictions, patch state."
  },
  {
    id: "lab-17",
    type: "Mini Challenge",
    title: "Data Pump Migration Dry Run",
    difficulty: "Advanced",
    prompt: "Plan schema migration using expdp/impdp with minimal downtime.",
    solution: "Estimate size, export with flashback consistency, import to target with remap and validation scripts."
  },
  {
    id: "lab-18",
    type: "Mini Challenge",
    title: "Undo Growth Analysis",
    difficulty: "Intermediate",
    prompt: "Undo tablespace keeps growing during ETL. Identify investigation steps.",
    solution: "Check long-running queries, retention settings, uncommitted transactions, and batch commit strategy."
  },
  {
    id: "lab-19",
    type: "Interview Q&A",
    title: "Difference Between SGA and PGA",
    difficulty: "Beginner",
    prompt: "How would you explain SGA vs PGA in an interview?",
    solution: "SGA is shared instance memory for caches; PGA is private process memory for execution work areas and session info."
  },
  {
    id: "lab-20",
    type: "Interview Q&A",
    title: "Why Use ARCHIVELOG Mode?",
    difficulty: "Beginner",
    prompt: "What business capabilities does ARCHIVELOG enable?",
    solution: "Point-in-time recovery, hot backups, and robust disaster recovery continuity by preserving redo history."
  },
  {
    id: "lab-21",
    type: "Interview Q&A",
    title: "Handling ORA-01555",
    difficulty: "Advanced",
    prompt: "How do you diagnose snapshot too old errors?",
    solution: "Check undo retention/size, long query duration, commit frequency, and optimize query execution window."
  },
  {
    id: "lab-22",
    type: "Interview Q&A",
    title: "DBWR vs LGWR Responsibilities",
    difficulty: "Intermediate",
    prompt: "Explain DBWR and LGWR differences clearly.",
    solution: "DBWR writes dirty data blocks to datafiles; LGWR writes redo for transaction durability, especially on commit."
  },
  {
    id: "lab-23",
    type: "Interview Q&A",
    title: "How to Resolve Lock Contention",
    difficulty: "Intermediate",
    prompt: "Walk through resolving blocking sessions in production.",
    solution: "Identify blocker/waiter, inspect SQL and business context, coordinate stakeholders, kill blocker if necessary, prevent recurrence."
  },
  {
    id: "lab-24",
    type: "Interview Q&A",
    title: "What Is Oracle Hardening?",
    difficulty: "Advanced",
    prompt: "Describe practical Oracle hardening areas for security-focused roles.",
    solution: "Least privilege, account governance, auditing, encryption, patching, network ACL controls, and continuous configuration review."
  }
];
