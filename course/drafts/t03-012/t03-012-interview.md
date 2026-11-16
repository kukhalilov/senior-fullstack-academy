# injection safety permissions roles and authentication — Interview questions and reasoning

# Core questions

1. Login versus database user?
2. How are GRANT, DENY, and REVOKE different?
3. Why prefer custom roles to db_datareader/db_datawriter?
4. How do you safely vary identifiers in dynamic SQL?
5. Can a stored procedure still be injectable?
6. Ownership chaining versus module signing?
7. RLS versus DDM?
8. Does TLS encryption alone ensure a trusted endpoint?
9. What does SQL Server 2025 change for SQL passwords and Entra names?
10. Database-scoped credential versus login?

# Concise interview answers

1. Login authenticates at server scope; user authorizes within database or contained database.
2. GRANT adds assignment; DENY blocks most inherited/granted paths; REVOKE removes the assignment but other grant sources may remain.
3. Fixed roles grant broad immutable capability; custom roles make narrowly scoped application access auditable.
4. Choose from a strict allow-list and quote each identifier; bind all data values separately.
5. Yes. Internal concatenated SQL can be vulnerable even when the call arguments are bound.
6. Same-owner static references can skip underlying checks; signing adds certificate permissions while retaining caller identity, but module changes drop signature.
7. RLS filters or blocks row access; DDM masks output but does not authorize or stop inference.
8. No. Validate server certificate identity; trust bypass weakens protection against MITM.
9. PBKDF2 with 100,000 iterations hashes SQL passwords by default; WITH OBJECT_ID can disambiguate colliding Entra display names.
10. Login/user authenticates and authorizes an app connection; database-scoped credential authenticates SQL Server to an external resource.

# Deep follow-up answers

Permission checks aggregate direct grants, role/group/public token members, scope hierarchy, covering permissions, and execution context. Column-level grants retain a legacy exception over object-level deny. sysadmin/dbo bypass checks. A negative test should use the actual app token and inspect effective permission paths.

TDS 8.0 Strict requires certificate validation, whereas TrustServerCertificate skips normal verification. SQL Server Audit can record selected events but target access, retention, dropped events, and audit failure monitoring remain operational responsibilities.

# Scenario questions

**An application can read every table after a deployment.** Compare role memberships, grants, `public`, module execution context, recent signatures, and default/user mapping. Reproduce using the app token and remove the broad path rather than adding DENY patches.

# Tradeoffs and alternatives

Stored procedures can provide a narrow execution API but must keep internal SQL safe. RLS can add tenant isolation but depends on trusted context. Integrated identity removes stored secrets but requires hosting integration. Auditing supports detection and accountability but does not prevent access.

# Common weak answers

- “The user has a login, so it can read.”
- “DENY is how you remove a GRANT.”
- “Stored procedures prevent injection.”
- “QUOTENAME makes any table choice safe.”
- “Masked data is hidden from malicious users.”
- “Encrypted connection means the server is authentic.”

# Self-check rubric

Score 0–2: (0) slogans only; (1) names mechanism but misses boundary; (2) traces identity/permission path, handles runtime SQL safely, and states control limitations.

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
