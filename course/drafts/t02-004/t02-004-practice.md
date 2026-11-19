# ASP.NET Core endpoint routing route patterns constraints and binding — Exercises and worked solutions

Sources: Microsoft's [routing](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-11.0), [MVC model binding](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/model-binding?view=aspnetcore-11.0), [Minimal API binding](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding?view=aspnetcore-11.0), and [LinkGenerator](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.routing.linkgenerator?view=aspnetcore-11.0).

## Goals

Trace endpoint matching and binding separately, avoid route ambiguity, choose correct binding sources, and debug URL generation independently from inbound routing.

## Worked example

Define `GET /products/{id:int}` with a Minimal API handler taking a route ID, a query `page`, a DI repository, and a cancellation token. `/products/42?page=2` matches and binds. `/products/abc` is rejected by the route constraint and may become 404. `/products/42?page=two` selects the endpoint but fails integer binding. If `page` must be a positive number, let it bind and apply application validation to return the documented client response. Named endpoint URL generation can produce a link for `/products/42` separately.

## Exercises

1. Two GET endpoints use `/orders/{value}` and `/orders/{id}` with the same constraints. Explain the failure and redesign it.
2. A client sends `/orders/abc` to a route with `{id:int}` but product requirements expect a validation message. Where should the type/range rule move?
3. An MVC action binds an entity from form fields. A caller changes `IsAdmin` in the request. How do you prevent the overposting risk?
4. A Minimal API has two complex parameters without source attributes. Explain how to make the body contract unambiguous.
5. A body upload is 3 GB and handler currently binds `byte[]`. Propose safer binding and limits.
6. A route works inbound, but `LinkGenerator.GetPathByName` returns null. What do you inspect?
7. A catch-all route works locally but not behind ingress for `%2F`. What should be tested?

## Progressive hints

1. The route names do not distinguish the path shape; route matching does not use parameter variable names as semantic distinctions.
2. Constraint rejection happens before handler binding/validation.
3. Bind to a request DTO with only caller-editable fields.
4. The body is one stream; declare one body object or explicit source attributes.
5. Stream incrementally and cap consumed bytes; do not trust content length alone.
6. Check endpoint name metadata and all required route values/context.
7. Multiple layers may decode or reject encoded separators before ASP.NET Core sees them.

## Complete solutions

1. Both patterns have equivalent matching shape, so names alone do not disambiguate; the best candidate may be ambiguous. Use distinct literals such as `/orders/by-number/{number}` versus `/orders/{id:int}`, or another clearly meaningful route/HTTP-method design. Do not depend on mapping order.
2. If `abc` should reach a validation response, avoid a constraint that rejects the candidate. Bind a string or broader supported type, parse explicitly, and return the documented validation result; keep route constraints for genuine endpoint-shape selection.
3. Use an input DTO containing only allowed fields and map explicitly to the entity; enforce authorization/domain rules server-side. `BindNever` can help in a legacy model but is not a substitute for a narrow request contract.
4. Define one request DTO and mark/use `[FromBody]` explicitly. Other parameters should have clear route/query/header/form/service sources. Validate the actual binding and generated API description for the target framework.
5. Bind `Stream` or `PipeReader`, count bytes while reading, enforce request/server limits and timeouts, pass cancellation to storage, and write to non-public storage using a generated name. Verify file type/content safely and clean partial uploads. `Content-Length` can be absent or untrusted, so enforce the cap during consumption.
6. Confirm the endpoint was mapped and has the expected unique name; provide required route values, scheme/host/path base/context as required; inspect `SuppressLinkGenerationMetadata`; distinguish named endpoint generation from MVC action URL generation. A valid inbound path is not proof every outbound-value set can generate a URL.
7. Test generated URLs separately: `*` encodes a supplied `/` as `%2F`, while `**` preserves it as a separator. For inbound requests, test raw/encoded slash, double encoding, path base, and proxy normalization using the exact ingress/server chain. Do not assume TestServer models proxy decoding. Validate authorization and path traversal separately.

## Tests and edge cases

- A numeric route segment at min/max `Int32` bounds and one value outside range.
- Missing optional/required query values, malformed conversions, explicit null and default behavior.
- Two candidates with same template but different endpoint metadata/order; confirm intended unique selection.
- Route and query parameters use the same key; explicit binding source should choose the intended source.
- Empty, malformed, oversized, and canceled request body; ensure one body reader and bounded memory.
- Link generation with missing/default/ambient route values, non-default path base, and untrusted host input.
- Encoded slash/period/trailing slash behavior through actual reverse proxy.

## Reflection questions

1. Which stage failed: matching, endpoint selection, binding, validation, authorization, or link generation?
2. Which parameters should be explicit in a public API contract?
3. What values must be validated after typed binding?
4. Does the API require an ambiguous input to return 404, 400, or another response, and is that behavior tested?
