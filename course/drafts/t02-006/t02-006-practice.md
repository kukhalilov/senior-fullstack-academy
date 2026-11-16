# ASP.NET Core Minimal APIs route handlers endpoint filters validation and results — Exercises and worked solutions

Sources: Microsoft's [Minimal API quick reference](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis?view=aspnetcore-11.0), [parameter binding](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding?view=aspnetcore-11.0), [filters](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/min-api-filters?view=aspnetcore-11.0), [responses](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/responses?view=aspnetcore-11.0), and [validation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/validation?view=aspnetcore-11.0).

## Goals

Diagnose where Minimal API behavior occurs; express stable binding/result contracts; use groups and filters with correct scope; configure validation and serialization; and test runtime behavior separately from OpenAPI metadata.

## Worked example

An API's `POST /orders` accepts a DTO but the handler runs with missing fields. First confirm `AddValidation` is registered, then confirm source-generated metadata includes the DTO/assembly, the endpoint uses a supported binding source, and validation attributes are present. Only then inspect the handler/domain checks. An absent generated metadata path can mean validation does not run; adding more attributes alone does not fix that pipeline configuration.

## Exercises

### 1. Stabilize ambiguous binding

An endpoint parameter `CreateUser request` changes from JSON body binding to service binding after a teammate registers `CreateUser` in DI. Fix the contract.

**Solution:** Mark it `[FromBody] CreateUser request` and service `[FromServices] IUserService users`, or restructure the DTO/service types so the intent is unambiguous. Add an HTTP integration test with JSON payload and a test that verifies DI registration changes do not alter binding.

### 2. Model a create endpoint

Return 201 and a representation on success, 400 for request validation, and 409 for a persistence conflict. Use typed results.

**Solution:** Declare an explicit `Results<Created<OrderDto>, ValidationProblem, Conflict<ProblemDetails>>` (or the actual typed error shape) return type, return `TypedResults.*`, and ensure validation and conflict mapping genuinely produce those response types. Document response metadata and integration-test status, Location, content type, and body. Do not return 409 for every exception.

### 3. Handle multiple sources without multiple body readers

An endpoint has two complex parameters both inferred from JSON. Explain why it fails and redesign.

**Solution:** Combine them into one request DTO because the request body is a single stream and Minimal API binding does not support multiple body-bound parameters. If the protocol truly needs a custom composite parser, read the stream once and parse explicitly; this adds complexity and should be tested with size limits and malformed payloads.

### 4. Choose filter or middleware

You need request IDs for static files, MVC, and Minimal APIs; argument validation for one endpoint family; and error mapping across the app.

**Solution:** Use middleware for request IDs and global error handling. Use built-in validation or an endpoint filter for a handler-specific cross-cutting argument concern. Do not write three copies of middleware logic as endpoint filters. Apply authorization policies through authorization infrastructure.

### 5. Avoid filter lifetime leaks

A factory-created filter stores `context.HttpContext.User` in a field and serves concurrent requests. Explain the failure and correction.

**Solution:** Factory/filter instances may be reused; mutable request state can cross-contaminate concurrent calls. Read user/context from the current `EndpointFilterInvocationContext` during each invocation and keep filter instance stateless. Inject long-lived services safely; do not capture scoped request services in a factory that outlives their scope.

### 6. Debug OpenAPI mismatch

An endpoint advertises a file as JSON but actually streams a PDF. What should change?

**Solution:** Align runtime content type with response metadata and describe binary content appropriately (often `Produces<Stream>(contentType: "application/pdf")` in the ASP.NET Core 11 built-in integration). File result types may need explicit OpenAPI metadata. Inspect the generated document and make a real request; metadata is not runtime enforcement.

### 7. Diagnose method-group warning

A handler method accepts only `HttpContext` and returns a typed result, but the response is empty. What happened?

**Solution:** Overload resolution may have selected `RequestDelegate`, which returns `Task`/void-like and discards the method's result, often with analyzer ASP0016. Map a lambda or cast the method group to `Delegate`, then assert response status/body in an integration test.

### 8. Use async validation correctly

A reservation DTO checks availability in a remote service. How should .NET 11 async validation be used, and what must remain elsewhere?

**Solution:** With `AddValidation`, implement `AsyncValidationAttribute` or `IAsyncValidatableObject` and pass cancellation through. Implement the required synchronous interface member too; Minimal API validation uses the asynchronous path. Validators can run concurrently and must not assume order. Treat the availability check as advisory if the resource can change; enforce booking atomically in the application/domain/persistence operation.

## Progressive hints

For each problem, name the stage first (mapping, selection, binding, validation, filter invocation, handler, result, document generation). Then state what configuration enables it. Finally state what an integration test must observe and what invariant still belongs in application logic.

## Complete solutions

Complete solutions are provided under each exercise. The key design discipline is to keep declared source/result metadata aligned with runtime behavior and not treat metadata or request validation as enforcement of every business/security rule.

## Tests and edge cases

Test omitted/malformed/unknown JSON members; generated validation metadata across assemblies; service-registration inference changes; multiple body parameters; async cancellation/concurrency; filter nesting/short circuit; method-group mapping; every status/content type/header; file streaming; generated OpenAPI version/schema; authorization; and domain race conditions.

## Reflection questions

Which parts of your API are explicit in the handler signature? What could DI registration change? Does your filter need bound arguments or should it be middleware? Can your typed result declaration actually produce every branch it advertises? Are validation and domain invariants separated?

