# injection safety permissions roles and authentication — Exercises and worked solutions

# Goals

Trace effective permissions, secure dynamic SQL, select identity boundaries, and assess what defense-in-depth controls do and do not guarantee.

# Worked example

An order API needs to read one tenant’s records. Use a managed identity where supported, map its login to a database user, grant a custom role EXECUTE on a parameterized procedure, and derive tenant context from trusted server-side identity. Do not trust a caller-chosen tenant id.

# Exercises

1. A login authenticates successfully but SELECT fails. What layers should you inspect?
2. A user gets SELECT through a group and a direct grant is revoked. Does access necessarily disappear?
3. Why can table DENY plus column GRANT yield access?
4. What is the safe way to accept a user-chosen ORDER BY column?
5. A stored procedure uses sp_executesql for its call but concatenates the value internally. Is it safe?
6. What happens to a certificate module signature after ALTER PROCEDURE?
7. Does DDM prevent a reader with ad hoc SELECT from discovering a value?
8. Why can TrustServerCertificate=true undermine TLS security?
9. Why is db_datareader broader than a reporting procedure grant?
10. What are the distinct jobs of server audit and database audit specification?

# Progressive hints

1. Separate authentication, database mapping, and database authorization.
2. Permissions aggregate across security token.
3. SQL Server has a documented legacy column exception.
4. Values and SQL structure are different.
5. Inspect internal dynamic statement.
6. A changed module invalidates signature.

# Complete solutions

1. Confirm server login/token, default/target database, user mapping or contained identity, role/group memberships, effective permissions, and any DENY/ownership-chain behavior.
2. No. The group grant can still provide SELECT; REVOKE removes only the named assignment.
3. SQL Server preserves a legacy behavior where column-level GRANT can override object-level DENY. Avoid relying on it; design narrow permissions consistently.
4. Map the choice to a fixed application-owned allow-list, quote the selected identifier, bind all values, and reject unknown keys.
5. No. Parameterization at the outer call does not protect string concatenation inside the procedure.
6. ALTER drops the signature; re-sign the exact deployed module and verify certificate principal permissions.
7. No. DDM is intended to reduce accidental exposure; inference attacks can recover values if ad hoc predicates are allowed. Restrict SELECT and audit.
8. Data may be encrypted but the client skips normal server identity verification, allowing interception by an attacker presenting another certificate.
9. db_datareader reads every user table/view. A narrow procedure grant exposes only intended operations/results.
10. Server audit configures event collection/target/lifecycle; database audit specification selects database events/actions for that audit. Enable and monitor both.

# Tests and edge cases

- Test app token and effective permissions under the actual service identity.
- Fuzz values and stored payloads through static and dynamic SQL paths.
- Test identifier allow-list rejection and maximum-length/truncation cases.
- Verify server certificate name, trust chain, and driver Encrypt mode.
- Alert on audit stop, failure, dropped events, and target exhaustion.

# Reflection questions

Which identity reaches SQL Server? Which identity is used for outbound access? Which grant path enabled an operation? Can untrusted data change syntax? Which control would detect a failure?

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
