
# React application architecture security and deployment — Exercises and worked solutions

# Goals

Review a profile-edit feature across browser UI, Server Function/API boundary, safe rendering, and production operations. Identify which controls improve feedback and which controls actually enforce security.

# Worked example

Scenario: a profile page displays a user's biography and lets them change their display name. A server function receives `{ userId, displayName, isAdmin }`, writes all fields to a database, and returns the full database record. The client renders the biography through `dangerouslySetInnerHTML` and stores an upstream admin token in a public build variable.

This design crosses multiple trust boundaries incorrectly: identity and privileges are client supplied; the update is broad; the response is excessive; raw HTML is unsafe without a sanitization policy; and the token is public. Fixing only the React component would leave server authorization broken.

# Exercises

1. **Trust-boundary review:** For each of the three provided input properties (`userId`, `displayName`, `isAdmin`), decide which should be trusted and where the server should obtain/validate the value.
2. **Authorization:** Describe the checks required before changing a profile. Explain why hiding an admin button is insufficient.
3. **Rendering:** Choose a safe rendering strategy for plain biography text and for a product requirement that allows limited rich text.
4. **Secret exposure:** Propose a replacement for the client-side admin token and list two incident-response steps if it has already shipped.
5. **Deployment:** Define asset/HTML caching, CSP, source-map, telemetry, and rollback decisions for a production release.
6. **Review:** Explain which controls are client-side defense in depth and which are mandatory server-side enforcement.

# Progressive hints

1. Derive identity from the authenticated server session. A user ID may be a target selector, but it still requires authorization. Never accept `isAdmin` as authority.
2. Check user identity, permission on the requested profile, schema constraints, and permitted fields. UI visibility is not access control.
3. Render plain text as a normal React child. For rich HTML, use a maintained sanitizer with a narrow allowlist and a reviewed trust boundary.
4. Move the credential to server-side secret management and expose only a narrow server endpoint. Revoke/rotate the shipped key and investigate usage.
5. Hashed assets can be immutable; HTML should revalidate/short cache; CSP and source maps require deliberate policy; telemetry needs redaction; rollback needs retained compatible artifacts/data migrations.
6. Client validation helps UX but can be bypassed. Server authorization, validation, rate limits, and response minimization enforce the request boundary.

# Complete solutions

1. `userId` from the body is not identity; derive the authenticated caller from the server session. If it identifies a target profile, parse it and authorize access to that exact target. `displayName` is untrusted input; validate length, Unicode/control characters, and domain rules. `isAdmin` must be ignored/rejected as a client claim; derive roles/permissions from trusted server-side identity and policy.
2. Authenticate the caller, load the target profile, authorize the caller to edit that profile, validate the display-name schema, and update only that field. Apply rate limiting where abuse is plausible, audit privileged changes, and return only the fields the UI needs. A hidden button affects only normal UI flow; callers can invoke the endpoint directly.
3. For plain text use `<p>{biography}</p>`. If limited formatting is a requirement, define the allowed HTML subset, sanitize it with a maintained sanitizer at the trust boundary, avoid post-sanitization string edits, consider a Trusted Types policy, and apply CSP as an additional layer. Keep the raw HTML sink in a small reviewed component.
4. Remove the token from all client build inputs and use server-side secret management. Add a server endpoint that authorizes the caller and permits only the intended upstream operation. Rotate/revoke the exposed token immediately; inspect provider audit logs for misuse and redeploy without the secret. Deleting it from source alone does not invalidate copies already shipped.
5. Fingerprint JS/CSS and cache those immutable URLs for a long duration; revalidate HTML and retain old chunks through the transition. Deliver a restrictive CSP compatible with the app, preferably nonce/hash strategies where available. Upload source maps privately or explicitly accept public exposure. Send sanitized error reports with release identifiers and no tokens/biography payloads. Keep a previous artifact and test rollback against the database migration plan.
6. Client-side validation/rendering controls are helpful but bypassable. Server authentication, per-resource authorization, schema validation, allowed-field mapping, CSRF protection for cookie-authenticated mutations, rate limiting, and response minimization are server responsibilities.

# Tests and edge cases

- Invoke the endpoint with another user's profile ID and confirm access is denied.
- Send `isAdmin: true`, unknown fields, malformed values, oversized display names, and unexpected content types.
- Verify the endpoint derives identity from session and never trusts UI flags.
- Render strings containing `<script>`, event-handler attributes, and `javascript:` URLs; confirm text remains text and URLs are rejected by policy.
- Verify the sanitizer rejects disallowed tags/attributes and that its output is not altered unsafely afterward.
- Inspect production bundle, source maps, logs, and telemetry payloads for credentials and sensitive user data.
- Test old cached HTML loading an earlier asset after a deployment and test rollback after a schema change.

# Reflection questions

1. Which security failure would remain if the biography were rendered safely but authorization stayed broad?
2. How does the chosen rich-text policy affect product flexibility and review burden?
3. Which data should be included in an audit record, and which should be redacted?
4. What must be true about database migrations before a rollback is safe?
5. How would you prove the production bundle contains no privileged credential?

Sources: [React use server](https://react.dev/reference/rsc/use-server), [React raw HTML](https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html), [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html), [OWASP Mass Assignment](https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html), [OWASP CSP](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html).
