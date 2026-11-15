# ASP.NET Core middleware pipeline order and branching — Big-picture orientation and mental model

## Problem and purpose

An HTTP server receives a request, applies cross-cutting behavior, chooses an endpoint, and sends a response. ASP.NET Core middleware is the ordered assembly line for that work. Each component can inspect or change the request, delegate to the rest of the chain, observe the response on the way back, or stop processing. The endpoint is one stage in this path, not a separate universe. [Middleware fundamentals](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware?view=aspnetcore-11.0)

This topic explains how to compose that path safely. Routing chooses an endpoint; middleware controls the stages around that choice and the work performed across requests.

## Plain-language mental model

Imagine a stack of doors. The request passes through each door from the outside toward the endpoint. A door can add context, reject the request, or let it continue. After the endpoint responds, control returns through the same doors in reverse order, allowing headers, timing, logging, and cleanup to run. A component that does not call its next delegate closes the door: every later stage is skipped.

A branch is a side corridor. `Map` selects a path-prefix branch and changes the branch's `Path` and `PathBase`; `MapWhen` diverts based on a predicate without automatically rejoining; `UseWhen` normally rejoins when its branch calls next. These compose middleware; endpoint mapping is a separate operation. [Branching](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware?view=aspnetcore-11.0)

## How the parts fit together

| Stage | Purpose | Example |
|---|---|---|
| Server/host | Creates the request context | Kestrel or another server |
| Early middleware | Establishes trusted context or rejects early | Exception handling, forwarded headers |
| Routing | Selects endpoint and metadata | Route matching |
| Endpoint-aware policy | Applies policy to the selected endpoint | CORS, authorization, rate limiting |
| Endpoint | Produces application result | Minimal API, controller, Razor Page |
| Response unwind | Observes or adjusts outgoing response | Timing, headers, logging |

`WebApplication` can insert routing, endpoint execution, development exception handling, and configured authentication/authorization based on environment, endpoints, and detected services. Defaults reduce boilerplate, but they cannot guess every application-specific placement requirement. Make stages explicit when policy depends on order and test the effective pipeline. [WebApplication defaults](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware?view=aspnetcore-11.0)

## Concept map

```text
server → HttpContext → middleware A → middleware B → routing
                                            ↓
                                 endpoint policies → endpoint
                                            ↓
response ← unwind B ← unwind A ← endpoint result

Any stage can short-circuit. Branches change which chain receives the request.
```

Ordering anchors: exception handling early enough to catch downstream faults; trusted forwarded headers before scheme/IP consumers; routing before endpoint-metadata policies; authentication before authorization; static files placed with their public exposure understood; and compression/caching ordered according to which representation should be stored. Endpoint-aware rate limiting needs routing first. [Ordering](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware?view=aspnetcore-11.0) [CORS](https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-11.0)

## End-to-end walkthrough

A browser requests `/api/orders/42`. The server creates a context containing method, path, headers, body, response, endpoint state, and cancellation token. An outer error boundary surrounds downstream work. Forwarded-header processing may establish the original scheme/client address, but only from configured trusted proxies. Routing selects the endpoint and attaches metadata. Authentication establishes the user; authorization and rate limiting apply policy. The endpoint writes JSON. As execution unwinds, middleware records duration or adds headers. A short circuit skips later stages; an exception before response start may be converted to a safe error response. [Custom middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/write?view=aspnetcore-11.0)

## When to use it and tradeoffs

Use middleware for behavior shared across endpoints or tied to a precise pipeline boundary. Use endpoint filters or endpoint conventions for behavior specific to selected handlers. Broad middleware centralizes policy but can silently affect every request when misplaced. Request bodies are forward-only by default; reading one can break binding unless bounded buffering and rewind are deliberate. Avoid request state in singleton middleware fields. [Request and response operations](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/request-response?view=aspnetcore-11.0)

## What later lessons cover

The concepts lesson traces execution, unwind, routing, and response commitment. Reference lessons cover the middleware contract; framework defaults and ordering; path/predicate branches; exact built-in registration names; and security/error failure modes. Practice repairs broken pipelines and writes safe middleware. Interview questions ask you to reason from observed behavior.
