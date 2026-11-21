
# React application architecture security and deployment — Reference: Client bundle exposure and secret handling

# Scope and version

This lesson explains the browser's public trust model and general secret-handling controls. It does not prescribe a specific hosting provider's secret store. See [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html), [OWASP NPM Security](https://cheatsheetseries.owasp.org/cheatsheets/NPM_Security_Cheat_Sheet.html), and [React Server Functions](https://react.dev/reference/rsc/use-server).

# How this group fits the mental model

Anything delivered to a browser is available to the user. Secrets must remain on a server that can enforce access and scope. A server proxy can perform privileged upstream calls, but it becomes a security-sensitive endpoint that must authenticate callers and constrain operations.

# Supplied names explained

- `Client bundle contents are public` — Browser JavaScript, static HTML, CSS, and related assets can be fetched and inspected. Minification and source-map omission do not hide embedded values from a determined user.
- `Server-only credential` — Secret credential used only by trusted server code, such as a database password or privileged upstream API token. Never transmit it to the browser or include it in logs.
- `Public build-time configuration` — A build-time value intentionally exposed to the client, such as a public API base URL or analytics site identifier. Treat it as public even if sourced from an environment variable.
- `Environment variable substitution at build time` — Build tools replace references with literal values in emitted browser bundles. A variable prefix like `PUBLIC_` or `VITE_` signals exposure; the exact convention is framework-specific, but any inlined value is public.
- `Secret manager` — Central service or protected mechanism for storing, access-controlling, auditing, and delivering secrets to server workloads. It reduces ad hoc secret distribution but does not protect a secret after the app logs or exposes it.
- `Credential rotation` — Replacing credentials on a planned schedule or after suspected exposure, then revoking old values. Rotation requires a rollout plan so consumers update safely and compromised credentials are invalidated promptly.
- `Secret scanning` — Automated inspection of repositories, commits, artifacts, and sometimes runtime/log streams for credential patterns. It helps detect accidental exposure; a detected key must still be revoked/rotated.
- `Never embed private API keys in client code` — Rule for credentials granting privileged access. If browser code needs an upstream capability, proxy a narrowly defined operation through a server that enforces identity, authorization, quotas, and validation.
- `Server proxy for privileged upstream APIs` — Server endpoint that holds a private upstream credential and makes constrained requests on behalf of authenticated clients. Avoid a generic open proxy; restrict methods, destinations, inputs, output fields, rate, and user access.

# Cross-item comparison

`Public build-time configuration` is designed for exposure; a `Server-only credential` is not. `Environment variable substitution at build time` describes how both can be sourced, but source location does not determine secrecy—where the value ends up does. A `Secret manager` protects storage and distribution; a `Server proxy` protects client access only when its own endpoint enforces policy.

# Examples

Unsafe:

```ts
const upstreamToken = import.meta.env.VITE_PRIVATE_TOKEN
fetch('https://api.example.test/admin', { headers: { Authorization: `Bearer ${upstreamToken}` } })
```

Safer shape: the browser calls a narrow authenticated application endpoint; the server reads the upstream token from its secret manager, validates the requested operation, calls the fixed upstream destination, and returns only the authorized result. Do not accept arbitrary URLs or forward every upstream field.

# Common mistakes

- Assuming `.env.local` is secret after the bundler injects a value into browser code.
- Putting credentials into source maps, telemetry, error messages, or query strings.
- Treating a secret scanner alert as resolved without revoking the exposed credential.
- Creating an unrestricted proxy that lets users spend the credential against arbitrary upstream paths.
- Using client-side feature flags as authorization controls.

# Knowledge checks with answers

1. What determines whether an environment variable is secret? **Whether it remains in trusted server execution; an inlined client value is public.**
2. What should happen after a private key is found in a public bundle? **Revoke/rotate it and investigate use, not merely delete the visible string.**
3. Why is a server proxy still security-sensitive? **It holds privileged access and must enforce authentication, authorization, validation, quotas, and narrow destinations.**
4. Does minification conceal a secret? **No.**

Sources: [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html), [OWASP NPM Security](https://cheatsheetseries.owasp.org/cheatsheets/NPM_Security_Cheat_Sheet.html), [React Server Functions](https://react.dev/reference/rsc/use-server).
