# injection safety permissions roles and authentication — Big-picture orientation and mental model

# Problem and purpose

Database security is a chain of distinct controls. Authentication identifies a principal; mapping and authorization determine what it can do; query construction ensures inputs remain data; transport and audit controls protect and record exchanges. A failure in one layer is not repaired by another.

# Plain-language mental model

A login gets you to the server; a database user and its token determine database actions. Roles bundle permissions. Parameters keep values from becoming SQL code. TLS protects a connection only when the client validates which server it reached.

# How the parts fit together

1. Choose an authentication mechanism appropriate to hosting and lifecycle.
2. Map identities to narrow database principals and custom roles.
3. Grant the minimum operations on the narrowest securables.
4. Bind every data value; allow-list and quote structural SQL choices.
5. Secure execution context, external credentials, transport, and audit evidence.

# Concept map

| Control | Establishes | Does not establish |
| --- | --- | --- |
| Authentication | Principal identity | Table/row permission |
| Authorization | Allowed securable actions | Safe SQL construction |
| Parameter binding | Data remains data | Business authorization |
| TLS with certificate validation | Confidential channel and server identity | Safe query or least privilege |
| Audit | Recorded selected events | Prevention or immutable storage by itself |

# End-to-end walkthrough

A web service connects using managed identity where supported. A database user belongs to a custom role with EXECUTE on a small set of procedures. Procedure parameters are bound, and dynamic identifiers are chosen from an allow-list. A row-level policy can use session or execution context to select a tenant, but the application must establish that context from an authenticated identity and prevent callers from setting another tenant's value; the predicate does not authenticate the context by itself. The connection uses TLS with certificate validation, while audit events are written to a protected target.

# When to use it and tradeoffs

Prefer integrated/Entra/workload identity to long-lived shared passwords when the hosting path supports it. Use SQL logins only with strong secret protection and rotation. Custom roles and procedure APIs can narrow access but require lifecycle and deployment discipline. RLS adds defense in depth, not a substitute for trusted identity context.

# What later lessons cover

Encryption key custody and Always Encrypted design are in t03-014. Web tokens and application authorization live in track-05; cloud identity patterns are in track-06.

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
