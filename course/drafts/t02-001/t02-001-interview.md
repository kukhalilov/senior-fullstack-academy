# ASP.NET Core platform model and framework choices — Interview questions and reasoning

Sources: Microsoft's [ASP.NET Core overview](https://learn.microsoft.com/en-us/aspnet/core/introduction-to-aspnet-core), [server implementations](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/), [hosting fundamentals](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/), and [.NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core). Current release status checked 2026-11-16.

## Core questions

1. Explain the path of an HTTP request through ASP.NET Core.
2. Distinguish host, server, middleware, routing, and endpoint.
3. Compare Kestrel, HTTP.sys, and IIS hosting models.
4. Are Minimal APIs tied to the Minimal Host? Can MVC and Minimal APIs coexist?
5. Compare framework-dependent and self-contained deployment.
6. How do you decide between ASP.NET Core, Express, Spring Boot, and Django?
7. What is the difference between LTS and STS?
8. When would serverless function hosting be preferable to a continuously running web app?
9. How do you evaluate a claim that one framework is faster?
10. Which concerns are shared across app styles and which are style-specific?

## Concise interview answers

1. The host configures services and lifecycle; a server accepts HTTP and creates request context/features; ordered middleware executes; routing selects an endpoint; its handler produces a response that returns through middleware/server.
2. Host manages application configuration/services/lifetime; server handles HTTP; middleware processes the pipeline; routing matches requests; endpoint code implements a selected behavior.
3. Kestrel is the default cross-platform server and can run directly or behind a proxy. HTTP.sys is Windows-only with specialized kernel capabilities. IIS can host in-process with IIS HTTP Server or proxy out-of-process to Kestrel through ANCM.
4. No. Minimal APIs are endpoint style; the host is a separate hosting choice. Different endpoint styles can coexist where useful.
5. Framework-dependent relies on a compatible installed runtime/shared framework and can use platform-patched runtime updates. Self-contained includes the runtime for a target and requires the publisher to refresh bundled runtime bits.
6. Define team/language fit, hosting target, workload, ecosystem integrations, identity, security patching, observability, lifecycle, operations, migration risk, and cost; validate only relevant performance claims.
7. Both are supported release tracks. LTS has a longer support period (three years) than STS (two years in the checked policy); both require current patches and have the same quality level.
8. For bounded event/request-triggered work that fits provider limits and benefits from managed scaling/lifecycle, after evaluating cold start, state, networking, duration, observability, and lock-in.
9. Match workload, hardware, version, deployment, data, concurrency, warm-up, correctness, and metrics; run repeated representative measurements and include tail latency/resource use.
10. Hosting, DI, configuration, logging, HTTP server, pipeline, security, and observability fundamentals are shared; controllers, page/component rendering, hubs, and RPC contracts have style-specific conventions.

## Deep follow-up answers

### How would you draw the request pipeline?

Draw the running process and host around the request path. A reverse proxy may terminate TLS/route traffic; Kestrel or IIS HTTP Server accepts the proxied/direct request, populates `HttpContext`, and invokes middleware in order. Middleware may short-circuit or pass control. Endpoint routing selects the handler, then the response unwinds. Add database/remote calls as dependencies of the handler rather than as properties of the HTTP server.

### What would make you choose HTTP.sys?

An explicit Windows requirement for capabilities unavailable or unsuitable in Kestrel, such as kernel-mode authentication, port sharing, or other documented HTTP.sys behavior. Otherwise Kestrel is the common cross-platform choice. Validate hosting integrations, proxy trust, TLS, operations, and current supported OS behavior; do not use generalized speed claims as the decision.

### How would you choose LTS versus STS?

Check Microsoft's live support policy, target platforms, required features, and upgrade capacity. On the checked date, .NET 10 is LTS and .NET 11 is STS. LTS offers longer servicing; STS offers a shorter supported horizon. Both need monthly/current patches. Plan the next upgrade before selecting a release.

### The company already uses another stack

Compare reuse and operational consistency against product fit. Another language stack may be appropriate for a team with specialized libraries or skills. Cross-stack communication can use versioned HTTP/gRPC/messaging contracts, but identity, schema compatibility, latency, and on-call ownership remain explicit. Avoid rewriting a stable system solely for theoretical benchmark gains.

## Scenario questions

1. **The service runs behind IIS and the app assumes the client IP comes from the socket.** Identify proxy/forwarded-header trust configuration and test the actual topology; network peer and original client differ.
2. **The app works in Development but fails in production.** Compare effective environment, configuration providers/precedence, runtime/shared framework, filesystem/content-root/web-root, secrets, hosting model, and startup logs.
3. **A self-contained container is not receiving .NET security patches.** The app artifact bundles its runtime; rebuild and deploy with refreshed runtime bits rather than assuming host image updates patch it.
4. **A serverless migration is proposed to reduce cost.** Compare invocation profile, cold start, duration, concurrency quotas, connection reuse, state, egress, observability, and provider charges against the always-on baseline.

## Tradeoffs and alternatives

Prefer the smallest application style that supports the product contract and team conventions. Choose server and hosting topology independently. Choose deployment based on runtime-patching ownership. Compare frameworks by the whole operating lifecycle, not syntax, popularity, or a single benchmark. Maintain interoperability where it reduces migration costs but keep protocol security/versioning explicit.

## Common weak answers

- “ASP.NET Core is the web server.” It is a framework; Kestrel/HTTP.sys/IIS server integration handles HTTP.
- “Minimal APIs require a tiny host.” Endpoint style and host capabilities are separate.
- “Self-contained means no maintenance.” The bundled runtime still needs updates.
- “LTS is higher quality.” The distinction is support duration, not quality.
- “Framework X is fastest” without conditions, current benchmark evidence, and matching workload.
- “A new `HttpContext` means each request is isolated.” Shared services, DB state, and external effects still need correct concurrency/security design.

## Self-check rubric

| Skill | A strong answer demonstrates |
|---|---|
| Request flow | Separates proxy, server, host, middleware, routing, and endpoint. |
| Hosting choice | Names required capabilities and platform/topology consequences. |
| Deployment | Explains runtime and patch ownership. |
| Framework selection | Uses explicit product/team/operations constraints. |
| Lifecycle | Checks current support status and plans upgrades/patches. |
| Evidence | Rejects universal benchmark claims and specifies a representative method. |
