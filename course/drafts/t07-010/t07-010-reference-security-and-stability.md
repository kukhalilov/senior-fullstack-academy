# React Server Components directives resources and server functions — Reference: Server boundary security and framework responsibilities

## Scope and version

Security guidance reflects React’s public `'use server'` security rules and the critical React RSC transport advisory published 2026-10-14, checked 2026-11-16. Patch versions change; check the linked React advisory and framework release before deployment. [React advisory](https://github.com/react/react/security/advisories/GHSA-xqc2-xf4c-x3h3) [React Server Function security](https://react.dev/reference/rsc/use-server)

## Supplied names explained

- `Client-controlled Server Function arguments` — Every argument sent by browser code can be modified or forged. TypeScript types and the generated function reference do not validate runtime input.
- `Server Function input validation` — Parse unknown values, enforce schema, ranges, lengths, and business invariants on the server before using them. Escape for the eventual output context where applicable.
- `Server Function authorization` — Check the logged-in principal and permission for the exact operation and resource on every invocation. A prior server render or hidden UI control is not proof of authorization.
- `Server Function mutation` — A state-changing operation should validate and authorize, apply an atomic/transactional change where needed, and return a minimal result. Design duplicate submission/retry behavior explicitly.
- `Server Function is not a data-fetching cache` — React describes Server Functions primarily as mutation Actions; implementations commonly process one at a time and do not cache return values. Use the framework’s server data/loading APIs for reads and caching.
- `Server Function network request` — Calling a Server Function crosses the network, even if source syntax looks like an imported function. Expect latency, serialization limits, request failure, replay, and deployment/runtime dependencies.
- `Framework or bundler integration requirement` — React’s public semantics need an RSC-aware framework/bundler that transforms module boundaries, references, and transport. Plain React plus `'use server'` text is not enough to create a working server endpoint.
- `Stable React Server Components semantics in React 19` — React states that the documented user-facing RSC and Server Function behavior is stable across React 19 minor versions.
- `Unstable lower-level RSC implementation APIs` — APIs frameworks/bundlers use to implement RSC do not follow React semver and can change between 19.x minors. Application code should use its framework contract rather than private transport functions.
- `Pinning React versions for framework RSC integration` — React recommends framework/bundler implementers pin a specific React version or use Canary because the internal implementation APIs are not semver-stable. App developers should follow their framework’s tested dependency matrix.
- `RSC transport package security advisory` — React security notices apply to `react-server-dom-webpack`, `react-server-dom-parcel`, and `react-server-dom-turbopack` in affected releases; frameworks may bundle or constrain these dependencies.
- `Unauthenticated RCE risk in vulnerable RSC transport packages` — The 2026-10-14 critical advisory describes crafted payloads to frameworks supporting RSC leading to remote code execution in a rare condition involving multiple typed arrays and attacker-controlled data. This is a package/runtime vulnerability, not something input validation alone fixes. [Advisory details](https://github.com/react/react/security/advisories/GHSA-xqc2-xf4c-x3h3)
- `React RSC security advisory patched versions` — Advisory GHSA-xqc2-xf4c-x3h3 lists affected releases through 19.0.8, 19.1.9, 19.2.8, and 19.3.0; patched releases are 19.0.9, 19.1.10, 19.2.9, and 19.3.1 respectively. Check the advisory at study/deploy time for newer advisories and framework backports. [Patched releases](https://github.com/react/react/security/advisories/GHSA-xqc2-xf4c-x3h3)
- `RSC support can be vulnerable without an app-defined Server Function endpoint` — React’s security guidance warns that support for RSC can expose a vulnerable transport even if the app does not implement a Server Function endpoint itself. Inventory the framework and resolved packages, not only application source.
- `Experimental React taint APIs are not a security substitute` — React marks taint APIs under construction. Do not use them as a replacement for minimizing returned data, authorization, validation, and secure framework updates.

## How this group fits the mental model

The feature boundary and the implementation-package boundary are different risks: validate/authorize user calls in application code and patch the RSC transport/framework independently.

## Cross-item comparison

Public React semantics are documented as stable across React 19 minors; lower-level framework/bundler implementation APIs are not. Application validation cannot repair a vulnerable decoder that runs before the function body.

## Examples

### App-level defense checklist

For each callable mutation, start from `unknown`, validate, authenticate from trusted server context, authorize the record/tenant, then perform the change. Avoid object spreading arbitrary user input into database updates. Bound batch sizes and expensive work; consider CSRF controls, rate limiting, idempotency keys, transaction isolation, audit logging, and safe error responses according to the framework and threat model. Return only fields the caller may read.

Then separately update React and the framework/bundler to patched versions. A secure function body cannot repair an RCE in request decoding before the function runs. Check lockfiles and the resolved dependency tree: framework package ranges, overrides, and bundled copies can make direct `react` version checks insufficient. [Critical RSC advisory](https://github.com/react/react/security/advisories/GHSA-xqc2-xf4c-x3h3)

## Version and feature caveats

React 19.3 adds direct rendering of a Context imported from a `'use client'` module in a Server Component. Server Components still cannot call `createContext`; the context definition lives in client-marked code. This is a public feature update, distinct from the unstable framework implementation APIs. [React 19.3](https://react.dev/blog/2026/09/09/react-19-3)

## Knowledge checks with answers

1. Which branch versions did the 2026-10-14 advisory list as patched? **19.0.9, 19.1.10, 19.2.9, and 19.3.1; recheck current advisories before applying.**
2. Is input validation enough to repair RCE in the RSC request decoder? **No; update the vulnerable transport/framework packages.**
3. Are lower-level RSC framework APIs covered by React’s public 19.x stability promise? **No.**
4. Does the React 19.3 Context change allow Server Components to call `createContext`? **No; the Context is still created in a client-marked module.**

## Common mistakes

- Treating a Server Function reference as secret or unguessable authorization.
- Trusting IDs, roles, price, tenant IDs, or “isAdmin” flags supplied by the client.
- Believing CSRF or authentication behavior is supplied by the directive itself.
- Fixing a transport package vulnerability only by adding checks inside user functions.
- Checking only `react` and `react-dom` while missing framework-resolved `react-server-dom-*` packages.
- Copying old patched versions from a lesson into a new deployment without rechecking current React/framework advisories.
