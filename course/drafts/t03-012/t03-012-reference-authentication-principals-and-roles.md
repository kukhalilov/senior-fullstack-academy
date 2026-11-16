# injection safety permissions roles and authentication — Reference: Logins, users, authentication, and role membership

# Scope and version
SQL Server 2025 (17.x) and Microsoft.Data.SqlClient behavior unless the hosting boundary is named. Azure SQL, Fabric, and server editions differ.

# How this group fits the mental model

Authentication creates an identity token; authorization evaluates its accumulated principals, permissions, ownership chains, and execution context against a securable. Injection safety preserves SQL syntax/data separation.

# Supplied names explained

| Exact inventory item | Meaning and important edge |
| --- | --- |
| `Windows authentication` | Authenticates using Windows identity and integrated security; SQL permissions then apply to the mapped login/user and group memberships. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/azure-ad-authentication-sql-server-overview?view=sql-server-ver17)) |
| `Microsoft Entra authentication` | Uses Entra identities/tokens; SQL Server hosting and configuration requirements differ from Azure SQL and from classic AD. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/azure-ad-authentication-sql-server-overview?view=sql-server-ver17)) |
| `SQL Server authentication` | Uses SQL login/password and requires mixed authentication mode on SQL Server; secret handling and password policy are application responsibilities. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/azure-ad-authentication-sql-server-overview?view=sql-server-ver17)) |
| `Server login` | Server-scoped principal that authenticates a connection; database access generally also requires a mapped user or contained identity. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/principals-database-engine?view=sql-server-ver17)) |
| `Database user` | Database-scoped principal mapped to a login, certificate, key, or created without a login in contained scenarios. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/principals-database-engine?view=sql-server-ver17)) |
| `Contained database user` | Can authenticate directly to a contained database without a server login; improves portability but still needs scoped permissions. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/principals-database-engine?view=sql-server-ver17)) |
| `Server principal` | Login or server role participating in server permission checks and authentication. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/principals-database-engine?view=sql-server-ver17)) |
| `Database principal` | User, role, application role, or other database identity contributing to database authorization. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/principals-database-engine?view=sql-server-ver17)) |
| `Database role` | Groups database users so permissions are assigned to a job function rather than individually. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/database-level-roles?view=sql-server-ver17)) |
| `Fixed server role` | Predefined server-wide role with fixed permissions; scope and availability differ across SQL products. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/server-level-roles?view=sql-server-ver17)) |
| `Fixed database role` | Predefined database-wide role whose assigned permissions generally cannot be customized; broad data roles expose every user table/view. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/database-level-roles?view=sql-server-ver17)) |
| `User-defined database role` | Custom role with explicitly granted permissions; preferred for application-specific capability sets. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/database-level-roles?view=sql-server-ver17)) |
| `Application role` | Activated by sp_setapprole to apply application-specific database permissions; credential handling and pooled-connection reset matter. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/database-level-roles?view=sql-server-ver17)) |
| `CREATE LOGIN` | Creates server principal. SQL Server 2025 applies PBKDF2 password hashing for SQL logins; Entra options require supported hosting/configuration. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-login-transact-sql?view=sql-server-ver17)) |
| `CREATE USER` | Creates database principal and can map a login or external principal; WITH OBJECT_ID is a SQL Server 2025 collision-specific option for Entra names. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/principals-database-engine?view=sql-server-ver17)) |
| `CREATE ROLE` | Creates a database role; grant the minimum object/schema permissions to it, then add users. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/database-level-roles?view=sql-server-ver17)) |
| `ALTER ROLE ADD MEMBER` | Adds a database principal to a database role using current syntax; role membership can accumulate with direct/group permissions. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/database-level-roles?view=sql-server-ver17)) |
| `DROP USER` | Removes database user only when no owned securables or schema ownership dependencies remain; it does not delete its server login. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/principals-database-engine?view=sql-server-ver17)) |
| `Orphaned database user` | A mapped database user whose login SID is absent/mismatched; remap deliberately after restore/migration rather than recreating blindly. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/principals-database-engine?view=sql-server-ver17)) |
| `EXECUTE AS USER` | Switches database execution context; REVERT restores prior context and it cannot impersonate beyond database scope. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/execute-as-clause-transact-sql?view=sql-server-ver17)) |
| `EXECUTE AS LOGIN` | Switches server login context and can affect server/database permission evaluation; REVERT is required. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/execute-as-clause-transact-sql?view=sql-server-ver17)) |
| `Contained database authentication` | Database option and contained authentication mode allow selected users to authenticate at the database; does not grant server-wide rights. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/principals-database-engine?view=sql-server-ver17)) |
| `Service account` | Identity used by a service/process; grant only required access and prefer managed identity or managed service account where supported. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/principals-database-engine?view=sql-server-ver17)) |
| `Managed identity connection` | Obtains an Entra token from the host identity instead of storing an app password; SQL Server support is hosting/CU specific. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/azure-ad-authentication-sql-server-overview?view=sql-server-ver17)) |
| `Credential` | SQL Server object holding authentication material for an external resource or proxy use; it is not a login or database user. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-database-scoped-credential-transact-sql?view=sql-server-ver17)) |
| `Certificate login` | Certificate/asymmetric-key login principal in master is used for module signing permissions and cannot authenticate an interactive client connection. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-login-transact-sql?view=sql-server-ver17)) |
| `Windows group login` | Maps a Windows group so member identities receive the login token; nested group membership contributes to authorization. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/principals-database-engine?view=sql-server-ver17)) |
| `Login-to-user SID mapping` | Instance login and database user map by SID; names can differ, and restores can create mismatched/orphaned users. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/principals-database-engine?view=sql-server-ver17)) |
| `Contained database user without login` | A contained user authenticates within that database without a corresponding server login; permissions stay database-scoped. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/principals-database-engine?view=sql-server-ver17)) |
| `Application role activation sp_setapprole` | Activates a database application-role token and changes effective database permissions for the connection; reset pooled connections safely. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/database-level-roles?view=sql-server-ver17)) |
| `REVERT execution-context reset` | Ends an EXECUTE AS impersonation and restores the previous context; use balanced execution/revert paths. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/principals-database-engine?view=sql-server-ver17)) |
| `ORIGINAL_LOGIN and SUSER_SNAME identity functions` | ORIGINAL_LOGIN reports initial login; SUSER_SNAME reports current server principal and can reflect impersonation. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/principals-database-engine?view=sql-server-ver17)) |
| `sysadmin permission-bypass boundary` | sysadmin members bypass normal permission checks; DENY does not constrain sysadmin. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/permissions-database-engine?view=sql-server-ver17)) |
| `Microsoft Entra WITH OBJECT_ID for duplicate display names` | SQL Server 2025 option disambiguates nonunique Entra display names using object ID; use the documented alias/collision scenario. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-login-transact-sql?view=sql-server-ver17)) |
| `SQL Server 2025 PBKDF2 password hashing` | SQL login passwords use SHA-512 through PBKDF2/RFC2898 with 100,000 iterations by default; evaluate login-rate overhead in high-churn/no-pooling systems. ([source](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-login-transact-sql?view=sql-server-ver17)) |
| `Azure Arc and Azure VM Entra authentication boundary` | SQL Server 2025 Entra support depends on Arc-enabled host or supported Azure VM setup/CU; do not generalize Azure SQL behavior to on-prem instances. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/azure-ad-authentication-sql-server-overview?view=sql-server-ver17)) |
| `SQL Server 2022 least-privilege ##MS_ server roles` | SQL Server 2022 introduced granular ##MS_* server roles to delegate selected administration; compare exact role membership before broad fixed roles. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/server-level-roles?view=sql-server-ver17)) |
| `CREATE SERVER ROLE` | Creates a custom server role for granular server permissions; member-management delegation must also be scoped. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/security/authentication-access/server-level-roles?view=sql-server-ver17)) |

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
