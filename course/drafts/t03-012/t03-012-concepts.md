# injection safety permissions roles and authentication — Core concepts and how they fit together

# Learning objectives

Trace login-to-user authorization, calculate permission effects, design least-privilege roles, prevent SQL injection, and distinguish audit/transport/masking controls.

# Prerequisites

Know databases, schemas, tables, procedures, application identities, and connection strings.

# Core concepts

Authentication validates a Windows, SQL, or Microsoft Entra identity. On SQL Server, a server login is instance-scoped; a mapped database user or contained identity is needed for database access. A principal token includes roles/groups and execution context. SQL Server 2025 adds PBKDF2/RFC2898 with 100,000 SHA-512 iterations for SQL login password hashes, improving brute-force resistance with some login cost. Microsoft Entra support is hosting-dependent; SQL Server 2025 WITH OBJECT_ID addresses duplicate Entra display names, not ordinary identity creation.

Authorization checks accumulated grants, denies, covering/parent scopes, role/group memberships, and ownership chains. GRANT adds an assignment, DENY blocks most matching paths, and REVOKE removes that assignment only. SQL Server preserves a column-level GRANT exception over table-level DENY. sysadmin and dbo bypass ordinary checks. Fixed roles such as db_datareader and db_datawriter are broad. Prefer custom roles and narrow schema/object permissions.

Static same-owner DML references can benefit from ownership chaining; dynamic SQL does not. Global cross-database chaining is a privilege-escalation risk. EXECUTE AS changes context; module signing adds certificate permissions without impersonating caller, but ALTER drops the signature. Review module deployment and signing together.

Parameterized queries define SQL shape separately from bound values. Stored procedure parameters are safe at the call boundary only; internal dynamic SQL can still concatenate them. Values use parameters; table/column names and keywords require fixed allow-lists and safe identifier quoting. QUOTENAME protects syntax delimiting, not which object is allowed. Input validation complements but does not replace binding.

RLS filter predicates hide rows, while block predicates reject writes. Tenant predicates must rely on trusted identity-derived context. DDM masks output for principals without UNMASK but does not stop inference by ad hoc readers. Always Encrypted moves encryption/decryption to the client driver; key custody and enclave details are separate. SQL Server Audit records selected events to configured targets and requires monitoring/protection. TLS Encrypt Strict with TDS 8.0 validates the server certificate; TrustServerCertificate bypasses identity validation.

# Mechanisms and relationships

Use authentication to create a principal, database users/roles to authorize it, parameterization to preserve syntax, and TLS/audit to protect and observe the path. External database-scoped credentials are for SQL Server outbound access to resources; they are not application database logins.

# Worked examples

For a dynamic report, bind date/customer values with sp_executesql, map requested sort keys to a fixed list, quote the selected column, and grant the app only EXECUTE on the report procedure. Do not grant table-wide SELECT if the API does not need it.

# Misconceptions and edge cases

- A parameterized procedure call can call an internally injectable procedure.
- DENY is not the inverse of GRANT; REVOKE is the way to remove an assignment.
- RLS context supplied directly by a client is not proof of tenant identity.
- DDM is not authorization against a determined reader.
- Encryption without certificate validation can be vulnerable to a man-in-the-middle.
- Audit requires target security, capacity, retention, and failure alerting.

# Knowledge checks with answers

1. Does a server login automatically grant SELECT? No; database mapping and permissions are separate.
2. What is the primary injection defense? Bind values; allow-list and quote structural identifiers.
3. Why use custom roles? They express narrow, reviewable permissions rather than broad fixed roles.
4. What does Encrypt=Strict add? TDS 8.0 and mandatory server certificate validation.

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
