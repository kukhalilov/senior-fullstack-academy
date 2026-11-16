<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# React application architecture security and deployment — Reference: Production build, delivery, observability, and recovery

# Scope and version

This lesson explains deployment controls without assuming a specific cloud host or bundler. Asset output and default headers differ by tool; verify the generated artifacts and response behavior for the chosen platform. See [OWASP Content Security Policy](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html), [MDN Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity), and [OWASP NPM Security](https://cheatsheetseries.owasp.org/cheatsheets/NPM_Security_Cheat_Sheet.html).

# How this group fits the mental model

A production release is a set of build artifacts plus a serving policy and operational response plan. Correctness depends on browsers receiving compatible HTML/assets, safe caching, defensive headers, observable failures, and a way to limit or reverse a bad rollout.

# Supplied names explained

- `Production build artifact` — The output generated for deployment, including JavaScript, CSS, HTML, and possibly server bundles or manifests. Inspect the built output for accidental secrets, unexpected dependencies, and correct asset paths.
- `Static asset fingerprinting` — Naming output assets with a content-derived identifier so changed bytes produce a new URL. This supports reliable cache invalidation.
- `Content hash cache busting` — Changing the asset URL when its contents change, allowing browsers/CDNs to cache immutable versions without confusing old bytes with new releases.
- `Long-lived immutable asset caching` — Cache policy such as long max-age plus immutable for fingerprinted files whose URL never serves different bytes. Do not apply this blindly to unhashed files or mutable HTML.
- `HTML cache policy` — Cache/revalidation policy for HTML documents. It often needs shorter caching or revalidation because HTML references the current asset graph and must not point clients at missing or deleted chunks.
- `Content Security Policy header` — HTTP response header restricting allowed script, style, frame, and other resource sources. Prefer nonce/hash strategies where suitable; monitor violations and do not rely on broad unsafe directives as a substitute for safe code.
- `Subresource Integrity` — Browser verification that a fetched external script or stylesheet matches a specified cryptographic hash. It protects against unexpected byte changes at a CDN but does not prove reviewed code is benign. Cross-origin use also interacts with CORS.
- `Compression and content negotiation` — Serving compressed representations such as Brotli/gzip when the client advertises support, with correct `Content-Encoding` and cache variation metadata. The server must not mislabel bytes or serve an encoding the client did not request.
- `Source map exposure policy` — Decision about whether source maps are public, private to an error-reporting service, or omitted. Maps can reveal source, paths, and comments; public deployment should be an intentional tradeoff.
- `Error reporting` — Capturing client/server failures with context useful for triage, source maps where appropriate, and privacy controls. Remove tokens, personal data, and sensitive payloads before transmission.
- `Structured client telemetry` — Consistent event/error fields for diagnosis and product reliability. Collect the minimum needed, avoid secrets and unnecessary personal data, sample high-volume events, and document retention/access.
- `Deployment rollback` — Returning traffic/artifacts to a known-good release when a rollout causes unacceptable failures. Rollback requires compatible data migrations, retained artifacts, and a tested procedure.
- `Feature flag rollout` — Releasing capability gradually or disabling it without a full redeploy. Flags need server-side authorization for protected behavior, an owner, expiry/cleanup, and observability; a client flag is not a security boundary.
- `Dependency vulnerability scanning` — Automated detection of known vulnerable packages and risky dependency changes in the software supply chain. Triage findings by reachability and severity, update/mitigate, and review transitive dependencies and lockfiles.

# Cross-item comparison

Fingerprinting enables long-lived caching for static assets; HTML needs a policy aligned to release frequency and chunk retention. SRI pins expected resource bytes when loading third-party scripts/styles; CSP limits which sources may execute. Neither validates the application's business authorization or sanitizes data. Rollback and feature flags reduce rollout risk, while telemetry/error reporting make failures visible; logging design must avoid collecting secrets.

# Examples

For a static app, a common policy is: content-hashed JS/CSS receive long-lived immutable caching; the HTML shell is revalidated or short-lived; previous hashed chunks remain available long enough for open tabs and cached HTML; CSP is set at the response or hosting layer; source maps upload to a private monitoring service; errors carry release IDs but no credentials. Exact headers and retention values depend on CDN/framework behavior and should be verified in deployment.

# Common mistakes

- Using immutable caching for `index.html` or unhashed filenames.
- Deleting previous chunks immediately while clients still use older HTML.
- Adding an SRI hash but forgetting cross-origin CORS requirements or failing to update it when the script changes.
- Deploying a CSP with broad unsafe sources and calling it strong protection.
- Publishing source maps by accident or collecting credentials in error telemetry.
- Assuming rollback is safe when database migrations are irreversible.
- Treating client feature flags as authorization.
- Ignoring transitive dependency and lockfile changes in scanning.

# Knowledge checks with answers

1. What should receive long-lived immutable caching? **Versioned/fingerprinted assets whose URL maps to fixed bytes.**
2. Why does HTML need a different cache policy? **It points to the current asset set and can become stale across deploys.**
3. What does SRI verify? **The fetched resource's bytes match the configured cryptographic hash.**
4. Does CSP replace output encoding? **No.**
5. What can prevent safe rollback? **Incompatible or irreversible data/schema changes, missing artifacts, or an untested procedure.**

Sources: [OWASP Content Security Policy](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html), [MDN Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity), [OWASP NPM Security](https://cheatsheetseries.owasp.org/cheatsheets/NPM_Security_Cheat_Sheet.html).
