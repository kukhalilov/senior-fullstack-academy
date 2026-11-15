<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# CSRF XSS CSP injection SSRF open redirects and clickjacking — Reference: Injection classes, URL validation, and server-side request controls

## Scope and version
This group explains server-side interpreter and outbound-request risks. See [OWASP Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html) and [SSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html). Framework-specific query APIs are outside this lesson.

## How this group fits the mental model
Injection happens when data changes the grammar or behavior of an interpreter. SSRF happens when a server uses its network position to request a destination influenced by an attacker. Separate data from syntax and constrain server destinations at multiple layers.

## Supplied names explained
- `SQL injection` — Attacker-controlled input changes a SQL statement's structure or meaning. Use parameterized queries for values and allowlist unavoidable dynamic identifiers.
- `Parameterized query` — Query structure is sent separately from values so a value is not parsed as SQL syntax. Parameters generally cannot stand in for identifiers such as column names; those need fixed choices/allowlists.
- `Command injection` — Input changes an operating-system command or its arguments. Avoid shell invocation; use safe APIs with argument separation and strict allowed operations.
- `LDAP injection` — Input alters an LDAP filter or distinguished-name grammar. Use correct context-specific escaping or safe query builders and constrain allowed operations.
- `XPath injection` — Input alters XPath expression structure. Prefer variables/bindings where available; otherwise avoid concatenating untrusted data into expressions.
- `Template injection` — Untrusted input becomes template source rather than data, potentially allowing expression evaluation or code execution. Keep templates trusted and pass user content as data.
- `NoSQL injection` — Input changes a NoSQL query/operator structure, often through object-valued request data. Validate schema and construct queries from server-controlled operators and fields.
- `Unsafe deserialization` — Processing untrusted serialized data can instantiate unexpected types or trigger dangerous behavior. Avoid unsafe object deserialization; use constrained data formats and allowlisted types.
- `Server-Side Request Forgery (SSRF)` — An attacker causes a server to make network requests to destinations the attacker selects or influences. This can expose internal services or cloud metadata.
- `SSRF allowlist` — Policy enumerating permitted destination hosts/schemes/ports rather than trying to blacklist every bad spelling. Match canonical parsed host identity and enforce at connect time.
- `DNS rebinding` — A hostname resolves to a permitted address during validation and a prohibited address later, exploiting resolution changes/time. Validate and constrain the actual connected address, not only an earlier lookup.
- `DNS pinning/rebinding defense` — Binding validation to the resolution used for the actual connection, rechecking all returned addresses, and preventing a second unchecked resolution. Implementation details depend on the HTTP stack.
- `Private and link-local address blocking` — Preventing requests to internal, loopback, link-local, and other prohibited address ranges. Define ranges for IPv4 and IPv6 and account for mapped forms and deployment-specific internal networks.
- `Cloud metadata endpoint protection` — Blocking access to provider metadata services from request features and using network identity/metadata protections where available. Do not rely on one hard-coded hostname alone.
- `Redirect following in outbound HTTP clients` — Automatic redirect behavior can move an allowed request to a prohibited destination. Disable redirects or validate each target and address before following.
- `Outbound network egress policy` — Network-level restrictions on which destinations workloads may reach. This limits blast radius when application validation fails.
- `URL parser normalization` — Parsing and normalizing scheme, host, port, path, and encoding according to a well-defined URL implementation. Security checks must use the same canonical representation as the actual client.
- `IPv4-mapped IPv6 address` — IPv6 representation of an IPv4 address. Address checks must normalize/map it correctly so an IPv4 private destination cannot bypass IPv6 filters.
- `Canonicalization before validation` — Convert a value to the representation the consumer will use before applying policy. Validation before decoding/normalization can be bypassed by alternate spellings.
- `Deny-by-default outbound destination policy` — Reject outbound destinations unless explicitly permitted. Combine with scheme/host/port constraints, address checks, redirect policy, and egress controls.

## Cross-item comparison
Parameterized SQL separates query grammar from values; escaping-only SQL attempts to transform syntax and is easier to get wrong. An SSRF allowlist names intended destinations; arbitrary outbound URLs expose the server's network position. DNS checks must match the address actually connected, and redirect targets need the same policy. OWASP explains layered [SSRF controls](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).

## Examples
For a feature that fetches customer logos, accept only HTTPS URLs from approved domains. Parse with the same URL library used for the request, reject userinfo and unexpected ports/schemes, resolve and reject all prohibited IPv4/IPv6 results, connect using the checked address where possible, and reapply checks for every redirect. Limit egress so app instances cannot reach metadata or administrative networks. For SQL, pass a value parameter rather than concatenating it into command text.

## Common mistakes
- Validating a string with a regex before URL parsing.
- Checking only the first DNS answer or ignoring IPv6.
- Following redirects without rechecking destination.
- Blocking only `127.0.0.1` while permitting other private/internal addresses.
- Assuming parameterization supports dynamic table/column names.
- Treating input validation as a replacement for safe interpreter APIs.

## Knowledge checks with answers
1. Why is URL suffix matching unsafe? **Hostnames can be crafted to end with an allowed string without being that host.** 2. Why check redirect targets? **An allowed host can redirect internally.** 3. What closes the gap if app validation fails? **Network egress restrictions.**
