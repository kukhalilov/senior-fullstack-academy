# ASP.NET Core middleware pipeline order and branching — Core concepts and how they fit together

## Learning objectives

Trace a request and response through delegates; distinguish short-circuiting from endpoint selection; explain how routing exposes metadata; place policy middleware at the right boundary; compare the branch forms; implement safe custom middleware; diagnose body, response-start, proxy-trust, and exception mistakes.

## Prerequisites

An HTTP request has a method, target, headers, optional body, and cancellation signal. A response has a status, headers, and optional body. A delegate is a callable value; a `Task` represents asynchronous work. An endpoint is the selected handler. Middleware receives the current `HttpContext` and usually a delegate representing the remainder of the chain.

## Core concepts

### Recent release notes

ASP.NET Core 11 changes worth remembering here include response compression adding `Vary: Accept-Encoding` to every response when compression is enabled, including responses that remain uncompressed, so shared caches distinguish negotiated representations. Kestrel also applies `RequestHeadersTimeout` to incomplete HTTP/2 and HTTP/3 trailer header blocks. These are targeted behavior changes; the request-delegate and ordering model remains the same. [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)

### Request-in, response-out

For A → B → C, pre-next code runs A, then B, then C. If each awaits next, the endpoint runs and continuations execute C, B, A. This is why timing begins before next and is recorded after it. If B returns without calling next, C and the endpoint are skipped; A can still resume after B returns. An unhandled exception propagates outward until caught. `Run` registers terminal work. [Middleware pipeline](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware?view=aspnetcore-11.0)

### Routing separates request-wide and endpoint-aware behavior

Before routing, middleware sees raw request data but cannot rely on a selected endpoint. After `UseRouting`, the selected endpoint and metadata are available. Endpoint-aware authorization, CORS, and rate limiting must run after matching and before endpoint execution. `WebApplication` may insert routing/endpoints and configured authentication/authorization when endpoints and services are present. Explicit placement is needed when another middleware has a special requirement. [WebApplication](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware?view=aspnetcore-11.0) [Routing](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-11.0)

A useful starting order is error boundary; trusted forwarded headers; transport policy; routing; culture selection before culture-sensitive consumers; CORS; authentication; authorization; endpoint-aware rate limiting; other app behavior; endpoint execution. This is a checklist, not a universal copy-paste recipe. Static files served before endpoint authorization are public. Caching and compression have scenario-specific ordering.

### Branches have different control flow

- `Map` branches by path prefix. The matched prefix is removed from branch `Request.Path` and incorporated into `PathBase`.
- `MapWhen` branches by a predicate and does not automatically rejoin the main chain.
- `UseWhen` branches by a predicate and normally rejoins if the branch calls its next delegate to completion.
- Endpoint `MapGet` and friends register route handlers; they do not create middleware branches.

Use a pipeline branch for a real cross-cutting path boundary; use endpoint mapping for route-to-handler selection. [Branching](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware?view=aspnetcore-11.0) [Endpoint routing](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-11.0)

### Context and body lifetimes

`HttpContext` belongs to one request; do not retain it after completion. `RequestAborted` communicates cancellation and should be passed to cancellable I/O. The request body is usually forward-only. `EnableBuffering` allows rereading by buffering and rewinding, but costs memory/disk and needs size/privacy policy. Do not consume it casually before model binding. [Request/response](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/request-response?view=aspnetcore-11.0)

Response headers can change only before response start. `OnStarting` runs immediately before headers are sent; callbacks execute in reverse registration order, so register before downstream work. Once the response has started, an outer exception handler generally cannot replace status and body. `OnCompleted` is a completion hook, not proof that the client received every byte.

### Activation and dependencies

Conventional middleware is generally constructed once for the application. Its constructor is therefore not a per-request place for scoped services. Put per-request services on `Invoke`/`InvokeAsync` parameters or use `IMiddleware`, activated through `IMiddlewareFactory`. Do not keep request state in middleware fields. [Writing middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/write?view=aspnetcore-11.0)

## Mechanisms and relationships

| Symptom | Likely cause | Investigation |
|---|---|---|
| Endpoint never runs | Short circuit, branch, exception, terminal registration | Trace each `next` and branch predicate |
| Authorization appears ignored | Static file served before authorization or metadata unavailable | Check the actual matched path and middleware order |
| Limiter policy is absent | Limiter runs before route match | Ensure routing precedes endpoint-aware limiting |
| Body binding is empty | Earlier middleware consumed body | Avoid reading or buffer, cap, and rewind |
| Error response cannot replace output | Response already started | Log failure and stop/abort appropriately |
| Wrong scheme/IP behind proxy | Forwarded headers untrusted or too late | Configure known proxies and run early |

## Worked examples

### Reverse unwind

With A and B each logging before and after `await next`, followed by endpoint E, the order is A-before, B-before, E, B-after, A-after. If B rejects before calling next, the order is A-before, B, A-after. Endpoint execution and B's downstream work never occur.

### Add a header before a streaming response

```csharp
app.Use(async (context, next) =>
{
    context.Response.OnStarting(() =>
    {
        context.Response.Headers["X-Request-Id"] = context.TraceIdentifier;
        return Task.CompletedTask;
    });
    await next(context);
});
```

Registering before next ensures the callback is available before headers are committed. A callback registered after response start is too late.

### Read and rewind only when justified

```csharp
app.Use(async (context, next) =>
{
    context.Request.EnableBuffering(bufferThreshold: 30 * 1024, bufferLimit: 1024 * 1024);
    using var reader = new StreamReader(context.Request.Body, leaveOpen: true);
    var body = await reader.ReadToEndAsync(context.RequestAborted);
    context.Request.Body.Position = 0;
    await next(context);
});
```

This shows the rewind contract, not an endorsement of logging arbitrary bodies. Production code must consider limits, privacy, encoding, cancellation, and storage cost.

## Misconceptions and edge cases

- Every middleware does not run: a previous component can end, branch, or throw.
- Code after next runs during reverse unwind; the response might already be committed.
- Automatic `WebApplication` stages do not make ordering irrelevant.
- Static files served directly are not automatically protected by endpoint authorization.
- CORS is not authentication or authorization.
- Forwarded headers are untrusted until restricted to configured proxies.
- Thread-safe pipeline resolution does not make shared middleware fields request-safe.

## Knowledge checks with answers

1. Why does response timing happen after next? The downstream request finishes before the outer middleware can measure total elapsed time.
2. Which predicate branch normally rejoins? `UseWhen`, provided its branch delegates onward.
3. When does endpoint metadata become available? After routing matches the request.
4. Why cap body buffering? It can consume memory or temporary storage and retain sensitive content.
5. Can an exception handler replace a response after headers are sent? Generally no; the response is committed.
