# injection safety permissions roles and authentication — Reference: Injection prevention, dynamic statements, and data-access controls

# Scope and version
SQL Server 2025 (17.x) and Microsoft.Data.SqlClient behavior unless the hosting boundary is named. Azure SQL, Fabric, and server editions differ.

# How this group fits the mental model

Authentication creates an identity token; authorization evaluates its accumulated principals, permissions, ownership chains, and execution context against a securable. Injection safety preserves SQL syntax/data separation.

# Supplied names explained

| Exact inventory item | Meaning and important edge |
| --- | --- |
| `SQL injection` | Untrusted data becomes SQL syntax and changes query meaning; impact is bounded only by effective database permissions. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/sql-injection?view=sql-server-ver17)) |
| `Parameterized query` | Keeps SQL structure separate from values through driver binding; still enforce authorization and validate business rules. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-executesql-transact-sql?view=sql-server-ver17)) |
| `sp_executesql parameter binding` | Declare typed parameters in dynamic batch and pass values separately; identifiers and keywords are not bindable. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-executesql-transact-sql?view=sql-server-ver17)) |
| `Prepared statement` | A driver API that binds values separately from SQL syntax; concatenating before prepare defeats protection. ([source](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)) |
| `Dynamic SQL value parameter` | Bind with the driver or sp_executesql; never paste a data value into statement text. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-executesql-transact-sql?view=sql-server-ver17)) |
| `Dynamic SQL identifier quoting` | Choose identifier from strict allow-list, then quote each identifier part; quoting does not authorize the selected object. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/sql-injection?view=sql-server-ver17)) |
| `QUOTENAME` | Quotes a SQL identifier up to 128 input characters; it is syntax protection, not allow-listing or permission control. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/sql-injection?view=sql-server-ver17)) |
| `Allowlist validation` | Map structural choices to finite application-owned values and reject unknown input; continue binding all data values. ([source](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)) |
| `Escaping-only defense failure` | Manual escaping is dialect/configuration-sensitive and error-prone; parameter binding is the primary defense. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/sql-injection?view=sql-server-ver17)) |
| `Second-order SQL injection` | Previously stored attacker-controlled text becomes SQL syntax when later concatenated into a new dynamic statement. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/sql-injection?view=sql-server-ver17)) |
| `Stored procedure injection risk` | Parameterized call protects arguments at call boundary only; procedure internals can still concatenate arguments into unsafe SQL. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/sql-injection?view=sql-server-ver17)) |
| `Least-privilege database account` | Restrict application identity to required database and operations so injection impact is limited; avoid db_owner/sysadmin. ([source](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)) |
| `Read-only database principal` | Allows reads but can still exfiltrate/abuse accessible data; not a substitute for row/column authorization or least privilege. ([source](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)) |
| `Error-message information disclosure` | Detailed SQL errors may expose schema/query data; log securely server-side and return bounded client-safe errors. ([source](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)) |
| `Connection string secret` | Do not commit database passwords/tokens; use managed identity or secret vault, rotation, narrow access, and redaction. ([source](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)) |
| `TLS-encrypted database connection` | Encrypts transport; certificate validation establishes server identity. Encryption without validation can permit interception. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/networking/tds-8?view=sql-server-ver17)) |
| `SQL Server Audit specification` | Selects server/database audit action groups and sends events through an enabled server audit. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/auditing/sql-server-audit-database-engine?view=sql-server-ver17)) |
| `Audit target` | File, Windows Application log, or Windows Security log for SQL Server Audit; secure permissions/retention and alert on failure. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/auditing/sql-server-audit-database-engine?view=sql-server-ver17)) |
| `Database-scoped credential` | Stores identity/secret for outbound external-resource access, not SQL login mapping; protect with database master key and scoped grants. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-database-scoped-credential-transact-sql?view=sql-server-ver17)) |
| `External data source permission boundary` | External access uses its credential and data source object; grant only required database permissions and protect credential secrets. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `Stored procedure call parameterization boundary` | Bind the call arguments, then separately inspect procedure body for internal dynamic SQL concatenation. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-executesql-transact-sql?view=sql-server-ver17)) |
| `Dynamic identifiers cannot be SQL parameters` | Parameter markers represent values only; fixed allow-list selection and identifier quoting are required. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-executesql-transact-sql?view=sql-server-ver17)) |
| `QUOTENAME syntax protection is not authorization` | A quoted name can still target a sensitive but valid object; allow-list and grant least privilege as separate controls. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/sql-injection?view=sql-server-ver17)) |
| `Input validation does not replace parameterization` | Validation checks business format but does not make concatenated data syntactically safe; always bind values. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-executesql-transact-sql?view=sql-server-ver17)) |
| `Dynamic SQL truncation injection` | If constructed text buffer truncates, quotes/filters can be removed and attacker-controlled syntax can execute; size and validate buffers. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/sql-injection?view=sql-server-ver17)) |
| `Blind SQL injection` | Attacker infers data from true/false behavior, delays, or side effects when direct result output is unavailable. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/sql-injection?view=sql-server-ver17)) |
| `SQL injection from second-order stored data` | Stored input can later become executable syntax when reused in generated SQL; treat database-originated values as untrusted too. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/sql-injection?view=sql-server-ver17)) |
| `Minimum EXECUTE-only application permission pattern` | Grant execute on a narrow procedure API, not broad table rights; secure its static and dynamic SQL internals and execution context. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `Encrypt Strict and TDS 8.0 certificate validation` | SqlClient Encrypt=Strict uses TDS 8.0 and requires server-certificate validation; server/driver support and a valid matching certificate are required. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/networking/tds-8?view=sql-server-ver17)) |
| `TrustServerCertificate bypasses server identity validation` | Driver encrypts but accepts presented server certificate without normal identity validation, weakening MITM protection. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/networking/tds-8?view=sql-server-ver17)) |
| `Managed identity avoids stored app passwords` | Host-issued Entra identity removes an application password secret but still needs supported SQL authentication and least-privilege database user. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/azure-ad-authentication-sql-server-overview?view=sql-server-ver17)) |
| `Database-scoped credential is not a database login` | Credential authenticates SQL Server to an external resource; it does not let an app connect to SQL Server. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-database-scoped-credential-transact-sql?view=sql-server-ver17)) |
| `External data source credential permission boundary` | Database-scoped credential is associated with external data source; accessing it requires relevant object permissions and scope. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `Microsoft.Data.SqlClient Encrypt default and TrustServerCertificate behavior` | For current Microsoft.Data.SqlClient, Encrypt defaults to true and TrustServerCertificate defaults false; Strict requires TDS 8.0 and certificate validation. Verify driver/version settings explicitly. ([source](https://learn.microsoft.com/en-us/sql/connect/ado-net/connection-string-syntax?view=sql-server-ver17)) |

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
