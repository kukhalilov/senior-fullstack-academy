<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# authentication versus authorization identities claims and roles — Interview questions and reasoning

## Core questions
1. Distinguish authentication and authorization.
2. When is role-based access insufficient?
3. Explain the difference between 401 and 403.

## Concise interview answers
1. Authentication validates evidence and establishes a principal; authorization decides whether that principal may perform an operation on a resource.
2. Roles are often too coarse when decisions depend on tenant, object ownership, operation, current state, or individual properties. Use a policy and resource check with trusted server-side data.
3. HTTP 401 signals missing/invalid authentication credentials and requires a challenge; 403 means the server refuses the request. The status names are easy to misread. See [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html).

## Deep follow-up answers
**How do claims differ from roles?** A claim is an issuer-associated assertion about a subject. A role is a common membership claim/convention used for coarse grouping. Neither is inherently authoritative without trusted issuance, validation, and defined semantics.

**How do you prevent IDOR-style access?** Authorize every operation against the loaded object. Constrain lookup to the authenticated subject's tenant where possible, check ownership or a specific grant, and avoid returning or mutating fields beyond the caller's permission. Random identifiers are not an access-control mechanism. OWASP recommends per-request checks and protection against guessed IDs in its [Authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

**How do you handle stale permission state?** Define how roles/claims refresh, bound cached decision lifetime, and invalidate affected decisions when permissions or ownership change. Evaluate all inputs that affect the decision; stale allows are especially consequential.

## Scenario questions
- A manager can open an edit page but changes the URL to edit a different tenant's record. Explain which server checks are required.
- A user loses administrator role but the current session still contains the old role. Describe the freshness decision and cache/session invalidation strategy.
- A public endpoint has a default allow and later gains sensitive fields. Explain why default-deny and property-level projection reduce risk.

## Tradeoffs and alternatives
Roles are understandable and efficient for stable coarse groups. Policies represent combinations more clearly. Resource checks are necessary when access depends on the target object, though they require loading the right data and testing alternate paths. Declarative endpoint rules aid visibility; imperative checks handle loaded resources. They can be combined. OWASP recommends least privilege and default-deny; consult its [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

## Common weak answers
- “They logged in, so they can access the page.” Authentication is not a grant.
- “The ID is a GUID, so it is secure.” Unpredictability does not replace authorization.
- “The UI hides the button.” Attackers can call the endpoint directly.
- “401 means permission denied.” In HTTP, missing/invalid authentication is 401; forbidden access is 403.

## Self-check rubric
You can name the principal, operation, resource, and policy inputs; explain issuer and claim trust; distinguish coarse roles from resource decisions; enforce checks on every server path; fail closed; and account for stale cached permission state.
