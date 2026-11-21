
# React application architecture security and deployment — Reference: Frontend architecture and responsibility boundaries

# Scope and version

This reference describes framework-independent frontend boundaries for React applications. It focuses on where responsibilities and trust change, not on one vendor's router, build system, or hosting platform. See [React Server Components](https://react.dev/reference/rsc/server-components) and [OWASP JavaScript Security](https://cheatsheetseries.owasp.org/cheatsheets/JavaScript_Security_Cheat_Sheet.html).

# How this group fits the mental model

Boundaries give each kind of change a clear owner. UI composition renders; feature modules organize domain interaction; data-access code communicates across the network; server-only code protects credentials and authorization. A boundary should follow a real change or trust boundary, not exist solely to increase file count.

# Supplied names explained

- `UI composition boundary` — Component/view layer that maps state and user events into visual output. It should not own privileged credentials or duplicate server authorization.
- `Feature module boundary` — Cohesive grouping of a business capability's UI, state, and client-side behavior. Public APIs between features reduce accidental coupling.
- `Data-access boundary` — Interface/adapters that translate feature needs into HTTP/RPC calls and response handling. It centralizes transport details and supports fakes in tests.
- `Client-server trust boundary` — Point where browser-controlled requests and input cross to trusted server code. Treat all client values as untrusted, even if typed or validated in the UI.
- `Server-only module` — Code constrained by framework/build tooling to execute only on the server, such as private database access or secret-bearing SDKs. Verify framework markers and build checks; a filename convention alone does not enforce this property.
- `Client bundle` — JavaScript and assets sent to a browser. Users can download, inspect, modify, and replay them; minification or obfuscation is not a security boundary.
- `Environment-specific configuration` — Runtime or build settings that vary by environment, such as public API origin or server credentials. Distinguish public values from secrets and distinguish runtime configuration from values compiled into static bundles.
- `Dependency inversion at data boundaries` — Feature logic depends on an abstract data-access contract; concrete HTTP, mock, or framework adapters implement it. Use where it reduces coupling and improves verification.
- `Route-level code splitting` — Loading code for a route/feature only when needed. This reduces initial transfer and can improve startup but does not hide code from a user who can access that route or chunk.
- `Feature ownership` — Clear responsibility for a domain behavior, including its UI, client state, API contract, and maintainers. Ownership boundaries help teams change and review the feature without centralizing every decision.

# Cross-item comparison

The `UI composition boundary` and `Feature module boundary` organize client code; the `Client-server trust boundary` changes who controls execution and data. Code splitting optimizes delivery but creates no trust boundary. A `Server-only module` enforces a runtime/build boundary only when the framework actually prevents it from entering the browser bundle.

# Examples

```text
features/profile/       React UI and profile-specific client behavior
data/profile-client.ts  browser-safe API adapter
server/profile.ts       server-only authorization and persistence
```

The exact folder structure is optional. The important contract is that browser code calls a server endpoint, while the endpoint independently checks permission and never trusts client-supplied role/ownership claims.

# Common mistakes

- Treating `src/server` as server-only without a build-enforced boundary.
- Making a generic abstraction for every component when one cohesive feature API would be simpler.
- Believing route chunking prevents source inspection.
- Passing a trusted role flag from UI to endpoint instead of deriving identity/permissions on the server.
- Letting data fetching details leak into many unrelated components.

# Knowledge checks with answers

1. Does code splitting make code secret? **No; downloaded chunks are inspectable.**
2. Where should server authorization happen? **At the server endpoint or Server Function handling the request.**
3. What is the purpose of a data-access boundary? **Centralize transport/response details and decouple features from a particular adapter.**
4. What must enforce a server-only module boundary? **Framework or build tooling, not a naming convention alone.**

Sources: [React Server Components](https://react.dev/reference/rsc/server-components), [OWASP JavaScript Security](https://cheatsheetseries.owasp.org/cheatsheets/JavaScript_Security_Cheat_Sheet.html).
