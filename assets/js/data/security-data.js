const createSecurityControl = (
  id,
  domain,
  priority,
  level,
  title,
  summary,
  whyImportant,
  verifyCommand,
  expectedOutput,
  riskIfMissed,
  reference
) => ({
  id,
  domain,
  priority,
  level,
  title,
  summary,
  whyImportant,
  verifyCommand,
  expectedOutput,
  riskIfMissed,
  reference
});

/** @type {string[]} */
export const SECURITY_DOMAINS = [
  "Identity & Access",
  "Auditing & Monitoring",
  "Data Protection",
  "Network Hardening",
  "Patch & Vulnerability"
];

/** @type {Array<{
 * id: string,
 * domain: string,
 * priority: "Critical"|"High"|"Medium",
 * level: "Beginner"|"Intermediate"|"Advanced",
 * title: string,
 * summary: string,
 * whyImportant: string,
 * verifyCommand: string,
 * expectedOutput: string,
 * riskIfMissed: string,
 * reference: string
 * }>}
 */
export const SECURITY_CONTROLS = [
  createSecurityControl(
    "sec-ctrl-01",
    "Identity & Access",
    "Critical",
    "Beginner",
    "Lock and Review Default Accounts",
    "Disable unused seeded users and enforce account ownership records.",
    "Default accounts are common target points in automated attacks.",
    "SELECT username, account_status, lock_date FROM dba_users WHERE oracle_maintained='Y' ORDER BY username;",
    "Only required Oracle-maintained accounts remain OPEN.",
    "Unmanaged default accounts increase unauthorized access risk.",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/dbseg/configuring-authentication.html"
  ),
  createSecurityControl(
    "sec-ctrl-02",
    "Identity & Access",
    "Critical",
    "Intermediate",
    "Enforce Password Profile Policy",
    "Apply profile limits for failed logins, password lifetime, and complexity.",
    "Strong auth policy reduces brute force and weak credential exposure.",
    "SELECT profile, resource_name, limit FROM dba_profiles WHERE profile='SECURE_PROFILE' ORDER BY resource_name;",
    "SECURE_PROFILE should include failed login and password controls.",
    "Weak password policy increases takeover probability.",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/dbseg/configuring-authentication.html"
  ),
  createSecurityControl(
    "sec-ctrl-03",
    "Identity & Access",
    "High",
    "Intermediate",
    "Review Powerful System Privileges",
    "Audit non-DBA users with broad grants such as ANY privileges.",
    "Excessive privileges amplify blast radius during compromise.",
    "SELECT grantee, privilege FROM dba_sys_privs WHERE privilege LIKE '%ANY%' AND grantee NOT IN ('SYS','SYSTEM') ORDER BY grantee;",
    "Only approved admin roles should retain broad privileges.",
    "Privilege creep leads to compliance and breach risk.",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/dbseg/configuring-privilege-and-role-authorization.html"
  ),
  createSecurityControl(
    "sec-ctrl-04",
    "Auditing & Monitoring",
    "Critical",
    "Beginner",
    "Enable Unified Audit Policy for Admin Changes",
    "Audit user, role, and privilege changes centrally.",
    "Administrative changes must be traceable for forensics and compliance.",
    "SELECT policy_name, enabled_opt FROM audit_unified_enabled_policies ORDER BY policy_name;",
    "Policy for DBA changes should be present and enabled.",
    "No admin audit trail means weak incident reconstruction.",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/dbseg/administering-the-audit-trail.html"
  ),
  createSecurityControl(
    "sec-ctrl-05",
    "Auditing & Monitoring",
    "High",
    "Intermediate",
    "Monitor Failed Logins and Return Codes",
    "Track authentication failures and denied attempts in audit trail.",
    "Repeated failures often indicate credential attacks or misconfigured clients.",
    "SELECT event_timestamp, dbusername, action_name, return_code FROM unified_audit_trail WHERE return_code <> 0 ORDER BY event_timestamp DESC FETCH FIRST 30 ROWS ONLY;",
    "Repeated failures should trigger investigation workflow.",
    "Attack signals can be missed without active monitoring.",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/dbseg/administering-the-audit-trail.html"
  ),
  createSecurityControl(
    "sec-ctrl-06",
    "Auditing & Monitoring",
    "Medium",
    "Advanced",
    "Control Audit Trail Growth",
    "Define retention and purge process for unified audit records.",
    "Audit coverage fails if storage pressure disables or degrades capture.",
    "SELECT COUNT(*) rows_today FROM unified_audit_trail WHERE event_timestamp > SYSTIMESTAMP - INTERVAL '1' DAY;",
    "Daily volume should align with planned retention capacity.",
    "Unmanaged growth can fill storage and affect instance stability.",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/dbseg/administering-the-audit-trail.html"
  ),
  createSecurityControl(
    "sec-ctrl-07",
    "Data Protection",
    "Critical",
    "Intermediate",
    "Validate TDE Wallet Status",
    "Ensure encryption wallet is open and master keys are available.",
    "Encrypted tablespaces are unreadable if wallet state is broken.",
    "SELECT wallet_type, status, wallet_order FROM v$encryption_wallet;",
    "Wallet status should be OPEN in normal operations.",
    "Closed wallet can cause service impact and data inaccessibility.",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/asoag/configuring-transparent-data-encryption.html"
  ),
  createSecurityControl(
    "sec-ctrl-08",
    "Data Protection",
    "High",
    "Intermediate",
    "Identify Unencrypted Sensitive Tablespaces",
    "Verify encryption posture for business-critical data stores.",
    "Data at rest controls are mandatory in many compliance frameworks.",
    "SELECT tablespace_name, encrypted FROM dba_tablespaces ORDER BY tablespace_name;",
    "Sensitive tablespaces should show ENCRYPTED=YES.",
    "Plaintext datafiles increase theft impact if storage is exposed.",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/asoag/configuring-transparent-data-encryption.html"
  ),
  createSecurityControl(
    "sec-ctrl-09",
    "Data Protection",
    "Medium",
    "Advanced",
    "Protect Data Pump Exports",
    "Use encrypted exports and controlled directory grants.",
    "Logical export files can leak full schema data if unprotected.",
    "SELECT owner, directory_name, directory_path FROM dba_directories ORDER BY owner, directory_name;",
    "Only approved export paths and grants should exist.",
    "Unsecured dumps can expose sensitive records outside DB controls.",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/sutil/oracle-data-pump.html"
  ),
  createSecurityControl(
    "sec-ctrl-10",
    "Network Hardening",
    "Critical",
    "Beginner",
    "Validate Listener Exposure",
    "Confirm listener endpoints and registered services are expected only.",
    "Unnecessary listener exposure enlarges external attack surface.",
    "lsnrctl status",
    "Only approved endpoints and services should be exposed.",
    "Unexpected endpoints can allow unauthorized probing and abuse.",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/netag/"
  ),
  createSecurityControl(
    "sec-ctrl-11",
    "Network Hardening",
    "High",
    "Intermediate",
    "Review Database Network ACLs",
    "Restrict outbound package network access (UTL_HTTP, UTL_TCP, etc.).",
    "ACL governance prevents abuse of database as outbound pivot point.",
    "SELECT host, lower_port, upper_port, acl FROM dba_network_acls ORDER BY host;",
    "ACL entries should map to explicit business use cases.",
    "Broad ACLs can enable data exfiltration paths.",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/dbseg/managing-fine-grained-access-in-pl-sql-packages-and-types.html"
  ),
  createSecurityControl(
    "sec-ctrl-12",
    "Network Hardening",
    "Medium",
    "Advanced",
    "Enforce SQL Injection-Safe Patterns",
    "Require bind variables and DBMS_ASSERT for dynamic SQL in PL/SQL.",
    "Application-side input safety must be enforced at SQL boundary.",
    "SELECT owner, name, type FROM dba_source WHERE UPPER(text) LIKE '%EXECUTE IMMEDIATE%' AND owner NOT IN ('SYS','SYSTEM') ORDER BY owner, name;",
    "Dynamic SQL usage should be reviewed and constrained.",
    "Unsafe dynamic SQL enables privilege abuse and data loss.",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/arpls/DBMS_ASSERT.html"
  ),
  createSecurityControl(
    "sec-ctrl-13",
    "Patch & Vulnerability",
    "Critical",
    "Beginner",
    "Track Oracle Home Patch Baseline",
    "Validate current patch inventory against approved release baseline.",
    "Known vulnerabilities remain exploitable on outdated homes.",
    "opatch lsinventory",
    "Inventory should match approved CPU/RU patch level.",
    "Outdated homes increase exposure to publicly documented CVEs.",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/dbptc/index.html"
  ),
  createSecurityControl(
    "sec-ctrl-14",
    "Patch & Vulnerability",
    "High",
    "Intermediate",
    "Check Invalid Objects After Patching",
    "Review and recompile invalid objects introduced post patch cycle.",
    "Invalid components can hide runtime failures after maintenance windows.",
    "SELECT owner, object_name, object_type FROM dba_objects WHERE status='INVALID' ORDER BY owner, object_name;",
    "Invalid object count should return to baseline quickly.",
    "Unresolved invalid objects can break business paths silently.",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/admin/managing-auditing.html"
  ),
  createSecurityControl(
    "sec-ctrl-15",
    "Patch & Vulnerability",
    "Medium",
    "Advanced",
    "Correlate Security Events with Alert Log",
    "Cross-check ORA security events with operational timeline.",
    "Timeline correlation accelerates incident triage and containment.",
    "SELECT originating_timestamp, message_text FROM v$diag_alert_ext WHERE message_text LIKE '%ORA-%' ORDER BY originating_timestamp DESC FETCH FIRST 100 ROWS ONLY;",
    "Critical ORA events should be tied to tickets and ownership.",
    "Missed correlation delays root cause and recurrence prevention.",
    "https://docs.oracle.com/en/database/oracle/oracle-database/19/admin/monitoring-the-database.html"
  )
];

/** @type {Array<{
 * id: string,
 * title: string,
 * trigger: string,
 * steps: string[],
 * commands: string[],
 * reference: string
 * }>}
 */
export const SECURITY_PLAYBOOKS = [
  {
    id: "sec-play-01",
    title: "Compromised Account Response",
    trigger: "Unexpected failed/success login bursts from unknown host.",
    steps: [
      "Lock suspected account and capture current grants.",
      "Collect login audit records and source client details.",
      "Rotate password/secret and re-enable only after validation.",
      "Open incident RCA ticket with timeline evidence."
    ],
    commands: [
      "ALTER USER app_user ACCOUNT LOCK;",
      "SELECT event_timestamp, dbusername, userhost, action_name, return_code FROM unified_audit_trail WHERE dbusername='APP_USER' ORDER BY event_timestamp DESC;",
      "SELECT grantee, privilege FROM dba_sys_privs WHERE grantee='APP_USER';"
    ],
    reference: "https://docs.oracle.com/en/database/oracle/oracle-database/19/dbseg/administering-the-audit-trail.html"
  },
  {
    id: "sec-play-02",
    title: "Suspicious Privilege Escalation",
    trigger: "Unexpected GRANT ANY or role changes outside CAB window.",
    steps: [
      "Capture current and previous privilege state.",
      "Identify change actor and change ticket mapping.",
      "Revoke unapproved grants with owner sign-off.",
      "Strengthen audit policy for privilege administration."
    ],
    commands: [
      "SELECT event_timestamp, dbusername, action_name, sql_text FROM unified_audit_trail WHERE action_name IN ('GRANT','REVOKE') ORDER BY event_timestamp DESC FETCH FIRST 50 ROWS ONLY;",
      "SELECT grantee, privilege FROM dba_sys_privs WHERE grantee='APP_USER';",
      "REVOKE ANY TABLE FROM app_user;"
    ],
    reference: "https://docs.oracle.com/en/database/oracle/oracle-database/19/dbseg/configuring-privilege-and-role-authorization.html"
  },
  {
    id: "sec-play-03",
    title: "TDE Wallet Not Open",
    trigger: "Application errors after restart tied to encrypted objects.",
    steps: [
      "Validate wallet location and status.",
      "Open keystore using controlled operational process.",
      "Confirm encrypted tablespace accessibility.",
      "Document preventive startup validation step."
    ],
    commands: [
      "SELECT wallet_type, status FROM v$encryption_wallet;",
      "ADMINISTER KEY MANAGEMENT SET KEYSTORE OPEN IDENTIFIED BY <wallet_password>;",
      "SELECT tablespace_name, encrypted FROM dba_tablespaces ORDER BY tablespace_name;"
    ],
    reference: "https://docs.oracle.com/en/database/oracle/oracle-database/19/asoag/configuring-transparent-data-encryption.html"
  },
  {
    id: "sec-play-04",
    title: "Listener Exposure Alert",
    trigger: "New network scan flags unexpected open Oracle listener service.",
    steps: [
      "Confirm active listener endpoints and service registrations.",
      "Restrict listener access and valid node checking.",
      "Validate firewall and host control alignment.",
      "Retest from approved client segments only."
    ],
    commands: [
      "lsnrctl status",
      "ss -ltnp | grep 1521",
      "SELECT value FROM v$parameter WHERE name='local_listener';"
    ],
    reference: "https://docs.oracle.com/en/database/oracle/oracle-database/19/netag/"
  },
  {
    id: "sec-play-05",
    title: "Audit Trail Storage Pressure",
    trigger: "Audit repository growth threatens FRA or filesystem capacity.",
    steps: [
      "Measure audit growth over last 24 hours.",
      "Apply retention purge process safely.",
      "Increase storage threshold alerts and retention governance.",
      "Review policy scope to remove noisy low-value events."
    ],
    commands: [
      "SELECT COUNT(*) FROM unified_audit_trail WHERE event_timestamp > SYSTIMESTAMP - INTERVAL '1' DAY;",
      "BEGIN DBMS_AUDIT_MGMT.CLEAN_AUDIT_TRAIL(DBMS_AUDIT_MGMT.AUDIT_TRAIL_UNIFIED, TRUE); END;",
      "SELECT tablespace_name, used_percent FROM dba_tablespace_usage_metrics ORDER BY used_percent DESC;"
    ],
    reference: "https://docs.oracle.com/en/database/oracle/oracle-database/19/dbseg/administering-the-audit-trail.html"
  }
];
