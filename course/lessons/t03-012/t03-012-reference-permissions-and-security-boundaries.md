# injection safety permissions roles and authentication — Reference: Permission hierarchy, grants, ownership, and execution context

# Scope and version
SQL Server 2025 (17.x) and Microsoft.Data.SqlClient behavior unless the hosting boundary is named. Azure SQL, Fabric, and server editions differ.

# How this group fits the mental model

Authentication creates an identity token; authorization evaluates its accumulated principals, permissions, ownership chains, and execution context against a securable. Injection safety preserves SQL syntax/data separation.

# Supplied names explained

| Exact inventory item | Meaning and important edge |
| --- | --- |
| `GRANT` | Adds a permission to a principal at a securable scope; effective access also includes inherited/group/role grants and ownership chains. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `DENY` | Blocks a permission in the relevant permission space in most cases; column-level GRANT has a documented exception to table-level DENY. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `REVOKE` | Removes a specific GRANT or DENY assignment; it does not necessarily remove access supplied by another grant. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `Permission securable` | Protected entity such as server, database, schema, object, or column; permission scope follows its hierarchy. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `Server-level permission` | Applies to instance securables and is generally granted to logins/server roles, not database roles. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `Database-level permission` | Applies to a database and may cover child schemas/objects through the permission hierarchy. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `Schema-level permission` | Covers current and future objects in a schema; useful for stable least-privilege boundaries. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `Object-level permission` | Permission on a table, view, procedure, function, or other object; use the narrowest required action. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `Column-level permission` | Narrow permission on selected columns; SQL Server retains a legacy exception where column GRANT can override table DENY. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `CONTROL permission` | Broad control authority over a securable and often implies subordinate permissions; do not treat it as read-only. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `SELECT permission` | Allows reading a securable subject to row policies, masking, encryption, and other controls. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `INSERT permission` | Allows inserting rows; constraints, triggers, block predicates, and column grants can still restrict outcomes. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `UPDATE permission` | Allows modifying specified securables/columns; column-level grant can narrow writes. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `DELETE permission` | Allows deleting rows subject to constraints, triggers, and security block predicates. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `EXECUTE permission` | Allows invoking a module; it does not automatically grant arbitrary access inside dynamically constructed SQL. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `ALTER permission` | Allows changing a securable definition and can become code-execution/elevation risk for privileged modules. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `Ownership chaining` | When adjacent objects share an owner, SQL Server can skip underlying permission checks for static DML references; it does not cover dynamic SQL. ([source](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/cross-db-ownership-chaining-server-configuration-option?view=sql-server-ver17)) |
| `Cross-database ownership chaining` | Allows ownership chains across databases; enabling instance-wide is not recommended due to privilege-escalation risk. Prefer disabled globally and tightly scoped exceptions. ([source](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/cross-db-ownership-chaining-server-configuration-option?view=sql-server-ver17)) |
| `EXECUTE AS OWNER` | Runs module under owner context after caller has EXECUTE; validate owner and dynamic SQL behavior to avoid unintended elevation. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/execute-as-clause-transact-sql?view=sql-server-ver17)) |
| `Certificate-signed module` | Adds certificate principal permissions to execution token without replacing caller identity; ALTERing the module drops the signature and requires re-signing. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `Permission inheritance` | Effective permission aggregates direct, role, group, public, covering, and ownership-chain sources; inspect token, not just one GRANT. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `Role-based least privilege` | Create capability roles with narrow grants, add identities to roles, and review transitive membership regularly. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/database-level-roles?view=sql-server-ver17)) |
| `Public database role` | Every database user belongs to public; public grants affect all users and cannot be removed from membership. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/database-level-roles?view=sql-server-ver17)) |
| `Fixed-role excess privilege` | Fixed roles grant broad fixed capabilities; db_datareader/writer span all user tables and are usually too broad for app accounts. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/database-level-roles?view=sql-server-ver17)) |
| `Row-Level Security predicate` | Security policy filter predicates silently restrict visible rows; block predicates reject writes that violate row rules. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/row-level-security?view=sql-server-ver17)) |
| `Dynamic Data Masking` | Masks query output for principals lacking UNMASK; it does not prevent inference or replace SELECT authorization. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/dynamic-data-masking?view=sql-server-ver17)) |
| `Always Encrypted boundary` | Client driver encrypts/decrypts column values using client-held keys; database engine cannot normally see plaintext, subject to enclave design. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/encryption/always-encrypted-database-engine?view=sql-server-ver17)) |
| `Audit action group` | Named set of events recorded by an audit specification; choose actions that answer a defined detection/compliance question. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/auditing/sql-server-audit-database-engine?view=sql-server-ver17)) |
| `SQL Server Audit` | Collects selected server/database actions and writes them to file or Windows logs; enable, monitor, protect, and test audit delivery. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/auditing/sql-server-audit-database-engine?view=sql-server-ver17)) |
| `GRANT WITH GRANT OPTION` | Lets grantee grant the same permission onward; expands authority and complicates revocation/review. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `Permission aggregation across role and group memberships` | SQL Server combines applicable principals in the security token; one direct user row is not the whole authorization result. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/database-level-roles?view=sql-server-ver17)) |
| `Column-level GRANT exception to table DENY` | Legacy SQL Server behavior: a column-level GRANT can take precedence over object-level DENY for that column. Avoid relying on this exception. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `sysadmin and dbo permission bypass` | sysadmin and database dbo bypass ordinary permission checks; no DENY can constrain these identities. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `Fixed database role broad permissions` | db_datareader reads all user tables/views; db_datawriter changes all user tables. Prefer narrower custom roles. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/database-level-roles?view=sql-server-ver17)) |
| `Fixed server role broad permissions` | Fixed roles have immutable broad permissions, and some roles imply powerful administrative access; use granular permissions/custom roles. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/server-level-roles?view=sql-server-ver17)) |
| `CONTROL SERVER is not sysadmin membership` | CONTROL SERVER and sysadmin can grant broad server ability but are not equivalent for code paths that check fixed-role membership. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `sys.database_permissions catalog view` | Shows explicit database permission rows, not the complete effective permission result; metadata visibility also limits what appears. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `fn_my_permissions effective permission check` | Reports permissions effective for current security context on a securable; test impersonated/app identity deliberately. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `Cross-database ownership chaining instance risk` | Instance-wide chaining can allow escalation through a compromised database; leave off globally unless all databases are trusted. ([source](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/cross-db-ownership-chaining-server-configuration-option?view=sql-server-ver17)) |
| `Ownership chaining does not cover dynamic SQL` | Dynamic batches are separately compiled and generally check caller permissions, even inside a signed/owned module. ([source](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/cross-db-ownership-chaining-server-configuration-option?view=sql-server-ver17)) |
| `Certificate module signature dropped on ALTER` | Any module definition change invalidates its signature; reapply ADD SIGNATURE after every deployment. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/add-signature-transact-sql?view=sql-server-ver17)) |
| `RLS filter predicate versus block predicate` | Filter hides rows from reads/modifications; block rejects insert/update/delete that would violate predicate conditions. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/row-level-security?view=sql-server-ver17)) |
| `SESSION_CONTEXT tenant predicate trust boundary` | SESSION_CONTEXT can carry per-session tenant state, but an application-controlled value is not proof of identity; bind it to trusted server-side context. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/row-level-security?view=sql-server-ver17)) |
| `Dynamic Data Masking UNMASK permission` | UNMASK can be scoped granularly; granting it reveals unmasked values but does not grant SELECT by itself. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `SQL Server Audit server audit versus database specification` | Server audit defines target/lifecycle; server and database audit specifications select event groups/actions. Database spec is disabled until enabled. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/auditing/sql-server-audit-database-engine?view=sql-server-ver17)) |
| `SQL Server Audit writes are not tamper-proof by default` | Protect target ACLs/storage and monitor dropped events, failures, retention, and tampering; SQL Server Audit is not a magical immutable log. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/auditing/sql-server-audit-database-engine?view=sql-server-ver17)) |

# Cross-item comparison

Identity is not permission. A login usually maps to a database user; roles aggregate grants. Parameterization prevents syntax injection but does not authorize row access. TLS protects transport only when the server certificate is validated.

# Examples

Give an application a custom database role with EXECUTE on a narrow procedure API, bind all data values, and permit-list dynamic identifiers. Keep server identity, database user, and external-resource credential separate.

# Common mistakes

- Granting db_owner/db_datareader/db_datawriter because setup is easier.
- Using DENY to remove one grant when REVOKE is intended.
- Assuming a stored procedure, role, masked column, or encrypted connection alone is a security boundary.
- Treating QUOTENAME as authorization or trusting client-provided tenant context.

# Knowledge checks with answers

1. Does a login grant table access? No; database user/contained identity and permissions are required.
2. Can a parameter represent a table name? No; allow-list and quote the identifier.
3. Does DDM prevent a malicious reader from inferring values? No.
4. Does Encrypt=True always validate the server identity? Driver options matter; Strict mandates validation, while trust bypass weakens it.

# Sources

- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/getting-started-with-database-engine-permissions?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/principals-database-engine?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-login-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-user-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/azure-ad-authentication-sql-server-overview?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/database-level-roles?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/server-level-roles?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/grant-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/deny-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/cross-db-ownership-chaining-server-configuration-option?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/execute-as-clause-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/add-signature-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/security/sql-injection?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-executesql-transact-sql?view=sql-server-ver17)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/security/row-level-security?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-security-policy-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/security/dynamic-data-masking?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/security/auditing/sql-server-audit-database-engine?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/security/auditing/create-a-server-audit-and-database-audit-specification?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-database-scoped-credential-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-external-data-source-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/security/networking/tds-8?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/connect/ado-net/connection-string-syntax?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/security/encryption/always-encrypted-database-engine?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/sql-server/what-s-new-in-sql-server-2025?view=sql-server-ver17)
