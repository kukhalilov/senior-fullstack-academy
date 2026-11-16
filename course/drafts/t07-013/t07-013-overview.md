<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# React application architecture security and deployment — Big-picture orientation and mental model

# Problem and purpose

A React application is only one layer of a system. It renders a user interface, coordinates client state, and communicates with server-owned services. Good architecture makes those responsibilities visible and keeps trust boundaries intact: browser code is controlled by the user, whereas credentials, authorization decisions, and privileged operations belong on trusted servers.

This topic connects frontend architecture to secure output handling and production delivery. It is not a replacement for backend security or platform-specific deployment design. The security sources are living OWASP and MDN guidance, checked alongside React 19.3 documentation on 2026-11-16.

# Plain-language mental model

Picture a restaurant: the browser is the dining room, a public place where anyone can inspect what is visible. The server is the kitchen, where private ingredients and privileged equipment belong. A client bundle is a copy of the menu and interface instructions sent to the public; anything baked into it can be read. A Server Function call is a request arriving from the dining room: even if its code is written beside a component, it is still a network entry point with untrusted inputs.

Output also depends on context. React escapes ordinary text children, but raw HTML insertion and URL attributes have different risks. Encoding for one context does not make a value safe for every context. CSP and SRI add layers; they do not replace correct output handling or authorization.

# How the parts fit together

Separate UI composition, feature ownership, and data access so changes have clear homes. Put secrets and privileged upstream calls behind server-only modules or a server proxy. Validate and authorize every request at the server boundary. Render untrusted text through normal React text output; only use raw HTML after a suitable sanitization and trust-policy decision. Validate URLs for allowed schemes/hosts before navigation or embedding.

For delivery, the build emits public assets, often fingerprinted by content. Serve assets with cache policies that match their mutability, serve HTML with an appropriate freshness policy, configure security headers, keep source maps from exposing sensitive source in public deployments, and monitor errors. Release and rollback processes should make failures observable and recoverable.

# Concept map

```text
trusted server: secrets + authorization + validation + privileged data access
       ▲                                             │
       │ request with untrusted input                 │ response with minimized data
       └─────────────────────────────────────────────┘
browser: public bundle + React output + client state + telemetry
```

The client can improve usability and catch obvious errors, but the server must enforce security. React's escaping helps with text rendering; raw HTML is a high-risk escape hatch. Deployment headers and integrity checks reduce attack surface, but they do not repair unsafe application logic.

# End-to-end walkthrough

A page lets a signed-in user update a profile. The client sends a Server Function/API request with a profile ID and fields. The server authenticates the session, checks that this user may edit that record, validates the field schema, applies only allowed fields, rate-limits abuse, and logs privileged changes without leaking secrets. It returns only the data the UI needs.

The React page renders returned text as children. If users can author rich HTML, the server or client applies an approved sanitizer and the raw insertion point receives only the sanitized/trusted value. URLs are checked against permitted schemes. The production build fingerprints static assets, serves them with long-lived immutable caching, gives HTML an appropriate cache policy, and reports runtime errors to monitoring. A bad release can be rolled back to the previous known-good artifact.

# When to use it and tradeoffs

Feature boundaries and data-access interfaces help teams change UI and server contracts independently. They add indirection, so align them with real ownership or trust boundaries rather than creating abstractions for every component. Static assets are efficient and cacheable; server-rendered or dynamic applications need server request handling and carefully scoped per-request data. CSP and SRI are useful defense-in-depth controls, but configuration errors can block legitimate code or create a false sense of safety.

# What later lessons cover

The concepts lesson draws the trust-boundary model. Reference lessons cover architecture boundaries, secret exposure, safe output handling, Server Function security, and build/delivery controls. Practice reviews a profile-edit flow; interview questions test security reasoning and deployability.

Sources: [React Server Functions security](https://react.dev/reference/rsc/use-server), [React raw HTML guidance](https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html), [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html), [MDN Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity).
