<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# React application architecture security and deployment — Interview questions and reasoning

# Core questions

1. How do you decide boundaries in a React application?
2. Why is a browser bundle not a safe place for credentials?
3. What protections apply to ordinary React text, and what changes with `dangerouslySetInnerHTML`?
4. How do you safely display user-authored rich text?
5. How should a Server Function handle an update request?
6. Distinguish authentication, authorization, validation, and CSRF protection.
7. What does CSP protect against, and what does it not replace?
8. What does Subresource Integrity verify?
9. Why are cache policies different for fingerprinted assets and HTML?
10. What should rollback planning account for?

# Concise interview answers

1. Align UI, feature, data-access, and server boundaries with changes in ownership, testing needs, and trust; avoid abstractions without a reason.
2. Browser-delivered code and inlined build variables can be inspected and replayed by users.
3. React escapes ordinary text children; raw HTML insertion bypasses that path and may execute attacker-controlled markup.
4. Prefer text when possible; otherwise sanitize a narrowly allowed markup subset with a maintained sanitizer, use a reviewed Trusted Types policy where available, and add CSP as defense in depth.
5. Treat inputs as untrusted, derive identity from the server session, authorize that caller for the specific resource/action, validate schema, map allowed fields, rate-limit, minimize the response, and log safely.
6. Authentication identifies the caller; authorization decides permission; validation checks data shape/rules; CSRF controls cross-site use of ambient browser credentials.
7. CSP restricts what the browser may load/execute, reducing exploitability; it does not replace safe output handling or authorization.
8. It verifies fetched resource bytes against a configured cryptographic hash; it does not prove the pinned content is benign.
9. Hashed asset URLs represent immutable bytes, while HTML points to the current release's asset graph and can become stale.
10. Artifact retention, database migration reversibility/compatibility, routing, caches, feature flags, and a tested recovery owner.

# Deep follow-up answers

**How should a server proxy be scoped?** Fix the upstream destination and allowed operations, validate inputs, authenticate and authorize callers, apply quotas, minimize returned fields, avoid leaking upstream errors, and keep credentials server-side. A generic proxy turns the application's credential into an open relay.

**Why is HTML escaping not universal URL protection?** The HTML parser and URL interpreter apply different semantics. A syntactically escaped attribute can still contain an unsafe scheme. Parse and validate allowed schemes/destinations, then rely on the framework's correct attribute handling.

**How should source maps be handled?** Decide intentionally whether they are public. A common approach uploads maps to a private error-reporting service while excluding them from public assets. Maps improve stack traces but can expose source paths/comments and sometimes embedded sources.

**How do you balance CSP with application requirements?** Inventory required scripts/styles/frames, prefer nonce/hash-based script policies where the architecture supports them, test report-only first, monitor violations, and avoid broad unsafe allowances unless there is a documented temporary reason. CSP must complement safe sinks.

# Scenario questions

1. A user can change `profileId` in a form request. Which server checks prevent reading or editing another user's profile?
2. A private upstream key appears in a client sourcemap. What immediate and follow-up actions are required?
3. A marketing integration injects rich HTML. How do you constrain the risk without assuming the vendor is trustworthy?
4. A deploy changes asset filenames but some users still have old HTML cached. What serving/retention strategy prevents broken pages?
5. A CSP blocks an inline script needed by the app. How would you investigate without weakening the policy indiscriminately?

# Tradeoffs and alternatives

- Direct browser-to-public API calls: simpler and lower server load, but only appropriate for intentionally public credentials/data and server-enforced user authorization.
- Server proxy: protects privileged upstream credentials and centralizes policy, but creates infrastructure, latency, quota, and availability responsibilities.
- Raw HTML: supports rich content but expands XSS risk and sanitization burden; plain text is safer and simpler.
- Public source maps: easier client debugging; private upload reduces source disclosure at the cost of setup.
- Long cache lifetimes: improve repeat performance for immutable assets; stale HTML or mutable filenames can break release transitions.

# Common weak answers

- “The UI hides admin actions.” That is not authorization.
- “The value came from our React form.” The caller controls network inputs.
- “React prevents XSS.” Normal text escaping helps; raw HTML and unsafe DOM/URL sinks require more controls.
- “CSP fixes XSS.” It is defense in depth, not a replacement for safe sinks.
- “The API key is private because it is in an environment variable.” Client build substitution exposes it.
- “SRI guarantees a CDN script is safe.” It only pins bytes to a hash.
- “Rollback is just redeploying the last frontend build.” Data schema and external side effects may prevent a safe reversal.

# Self-check rubric

Score 0–2 for each: (a) architecture/trust boundaries, (b) client bundle secrecy, (c) context-specific output safety, (d) server authorization and validation, (e) CSP/SRI limits, (f) cache/release behavior, and (g) observable rollback planning. A strong answer scores 11–14 and identifies enforcement location for each control; 7–10 indicates sound principles with incomplete operational detail; below 7, revisit the references and practice scenario.

Sources: [React use server](https://react.dev/reference/rsc/use-server), [React raw HTML](https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html), [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html), [OWASP CSP](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html), [MDN SRI](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity).


## System-design scenario: React client, ASP.NET Core API, and tenant boundary

The browser renders controls and may hide unavailable actions for usability, but every API operation must authenticate the caller and authorize the requested tenant/resource on the server. The React app should send only the minimum identifiers and data needed; the API derives trusted identity from its validated credential and checks membership/permission against authoritative data. Avoid putting tenant secrets or privileged upstream keys in the client bundle. For multi-tenant caching, include a trustworthy tenant/authorization scope in the cache design or cache only public data. [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) · [React Server Functions](https://react.dev/reference/rsc/use-server).
