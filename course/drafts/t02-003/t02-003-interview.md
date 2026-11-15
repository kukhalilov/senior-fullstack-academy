# ASP.NET Core middleware pipeline order and branching — Interview questions and reasoning

## Core questions

1. What is middleware, and why does registration order matter?
2. Trace request traversal and response unwind.
3. Explain short-circuiting versus endpoint selection.
4. Compare `Map`, `MapWhen`, and `UseWhen`.
5. Why must endpoint-aware rate limiting run after routing?
6. What can `WebApplication` insert automatically?
7. Why can a static file remain public despite authorization middleware?
8. How do conventional middleware and `IMiddleware` differ for scoped dependencies?
9. When is request-body buffering justified?
10. What changes when `HttpResponse.HasStarted` is true?

## Concise interview answers

1. Middleware is an ordered chain of delegates that can inspect, modify, continue, branch, or terminate a request. Order decides who observes it and how the response unwinds.
2. Pre-next code runs A → B → C; awaited continuations run C → B → A. Any stage that does not call next skips later stages.
3. Short-circuiting ends the remaining middleware path. Routing selects endpoint metadata; endpoint execution is a later stage.
4. `Map` branches by path prefix and adjusts `Path`/`PathBase`; `MapWhen` diverts by predicate; `UseWhen` normally rejoins if its branch delegates to completion.
5. The limiter needs the selected endpoint's metadata, available after routing.
6. Depending on environment, endpoints, and registered services, `WebApplication` can add development errors, routing, endpoint execution, authentication, and authorization. Special placement still needs explicit configuration.
7. Static-file handling can return the file before endpoint authorization is evaluated. Private files need an authorized delivery path outside the public web root.
8. Conventional middleware is reused for the app lifetime. Use invocation parameters or DI factory activation for request-scoped dependencies.
9. Only when another consumer truly needs a second read. Buffering costs memory/storage and can retain secrets; bound it, rewind, redact, and honor cancellation.
10. Status/headers/body are committed; an error handler cannot reliably send a clean replacement response.

## Deep follow-up answers

**Authorization appears configured, but a file is accessible.** Trace short circuits and inspect whether static-file middleware matched before endpoint policy evaluation. Move private content outside the web root and serve only after authentication/authorization. Test both access outcomes.

**Middleware or endpoint filter?** Middleware fits app-wide boundaries and work spanning request/response. Filters fit selected Minimal API handlers. Choose the narrowest execution boundary that matches the policy.

**Why trust configuration for proxies?** Forwarded scheme/address values influence transport and identity decisions. Arbitrary clients can forge them; configure known proxies/networks and hop limits, then process early.

**How debug unexpected order?** List explicit registrations, identify host-inserted stages and service detection, then use diagnostics and integration tests to assert observable behavior. Do not rely on source listing alone.

## Scenario questions

- A request logs at entry but not downstream. Consider short circuit, exception, branch, or terminal registration.
- CORS preflight receives 401. Inspect routing, CORS placement, authentication/authorization order, and endpoint policy metadata.
- A singleton middleware stores `currentUser`. Concurrent requests share the object; keep user state in context/local variables.
- A client disconnects during slow work. Pass `RequestAborted` to cancellable operations and handle cancellation distinctly from server faults.

## Tradeoffs and alternatives

Middleware has broad reach but creates app-wide coupling. Endpoint filters and conventions are narrower. Path branches suit path-wide behavior; endpoint groups/metadata suit route behavior. Buffering supports rereads but consumes resources; streaming is memory-efficient but forward-only. Automatic host defaults reduce boilerplate; explicit registration improves auditability for sensitive order.

## Common weak answers

- “Middleware runs in order and stops” omits short circuits, exceptions, branches, and reverse unwind.
- “Authorization protects everything” ignores direct static-file responses.
- “`Map` and `MapGet` are the same” confuses pipeline branches and endpoint registrations.
- “CORS blocks unauthorized callers” confuses browser policy with access control.
- “Forwarded headers are safe” ignores the proxy trust boundary.
- “Exception handling always returns 500” ignores response commitment.

## Self-check rubric

You are ready when you can trace next calls and unwind; identify endpoint-metadata dependencies; explain branch path/rejoin effects; find static-file and proxy trust boundaries; handle cancellation/body/response-start behavior; and justify ordering with an integration test.

## Sources

[ASP.NET Core middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware?view=aspnetcore-11.0) · [Writing custom middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/write?view=aspnetcore-11.0) · [Routing](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-11.0)
