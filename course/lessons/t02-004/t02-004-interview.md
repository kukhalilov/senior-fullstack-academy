# ASP.NET Core endpoint routing route patterns constraints and binding — Interview questions and reasoning

Sources: Microsoft's [routing](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-11.0), [MVC routing/model binding](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/routing?view=aspnetcore-11.0), [Minimal API binding](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding?view=aspnetcore-11.0), and [.NET RoutePattern API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.routing.routepattern?view=aspnetcore-11.0).

## Core questions

1. Explain endpoint routing candidate matching and selection.
2. Does routing choose the first endpoint declared in `Program.cs`?
3. Compare route precedence and explicit endpoint order.
4. Why should route constraints not be used as validation?
5. Distinguish route values from bound parameters.
6. Compare MVC model binding and Minimal API parameter binding.
7. How are route/query/header/body/services sources selected?
8. Why is more than one body-bound parameter problematic?
9. Compare `BindAsync`, `TryParse`, and `IParsable<TSelf>`.
10. How do catch-all `*` and `**` differ?
11. In ASP.NET Core 11, can endpoint filters observe a failed parameter parse?
12. Where can C# union types be used for Minimal API binding?
13. How can an inbound route work while URL generation fails?
14. How do you diagnose `AmbiguousMatchException`?

## Concise interview answers

1. Routing matches request data against endpoint patterns, builds candidates, applies constraints/policies, then selects the best endpoint using precedence/order/metadata. Binding and handler execution follow.
2. No; routing is candidate-based. Declaration order is not a universal selection rule.
3. Lower `RouteEndpoint.Order` has priority first; when orders tie, route-template precedence favors the more specific pattern. Conventional MVC route mapping assigns order based on invocation sequence. Do not use order to hide unclear public route design.
4. Constraint failure rejects a candidate and can lead to 404; it does not naturally produce a validation error for the selected endpoint. Bind and validate when the caller should receive a 400/domain error.
5. Route values are captured text/object values from path matching. Binding selects a source and converts them into a typed method parameter.
6. MVC uses model binders, value providers, ModelState and input formatters. Minimal APIs infer sources from parameter type/registration/route and use attributes, parsing/custom binding; rules differ.
7. Inference is based on explicit attributes, route values, special types, service registration, and supported parsing/body rules. Explicit attributes make public API intent clear.
8. The request body is a single stream; multiple consumers cannot independently read it. Use one body DTO or one explicit custom reader.
9. `TryParse`/`IParsable<TSelf>` convert a string-like value; `BindAsync` can bind from broader HTTP context/parameter info and can be asynchronous.
10. Both catch remaining path. For URL generation, `*` escapes `/` in a route value as `%2F`, while `**` emits `/` separators so the path can round-trip. Inbound encoded-slash handling still depends on the server/proxy chain.
11. Yes. Configured filters can run after supported route/query/header parameter-check failures and inspect the 400 status while the handler is skipped. In Development, `ThrowOnBadRequest` must be false; body deserialization failures and arbitrary binding exceptions are not covered by that filter behavior.
12. .NET 11 union types are supported for JSON request/response bodies processed by `System.Text.Json`; they are not supported for route, query, header, or form sources.
13. URL generation needs an address/name and sufficient compatible values/metadata/context; inbound match and outbound generation are distinct.
14. Inspect matched endpoint candidates/templates/HTTP methods/constraints/metadata and equal order/precedence. Redesign patterns or add a deliberate documented discriminator.

## Deep follow-up answers

### What should happen for `/orders/abc` when route is `{id:int}`?

The constraint can reject the endpoint during matching, producing no match or selecting another endpoint. If product semantics require a descriptive 400, keep the route broad enough to select the endpoint and parse/validate the value afterward. Choose based on API contract, not convenience.

### Which source wins when a type is both registered and complex?

Minimal API source inference considers DI service discovery and supported binding conventions. It can infer a registered complex type from services where an unregistered type might be body-bound. Make the source explicit for public contracts and verify the target framework's behavior to prevent a registration from silently changing API binding.

### How would you avoid overposting?

Bind a dedicated request DTO with only caller-editable fields and map explicitly to persistence/domain objects. Enforce authorization and invariants after binding. Binding attributes such as `BindNever` can constrain a legacy shape but do not replace a narrow contract.

### What would you inspect for an outbound link bug?

Check the endpoint name/address, required route values, defaults, optional segments, constraints, ambient route values, path base, host/scheme, and link-suppression metadata. Compare `LinkGenerator` with MVC `IUrlHelper` only when the endpoint style warrants it. Test the generated URI and then request it through the actual deployment topology.

## Scenario questions

1. **`/products/42?page=two` reaches endpoint but fails.** Matching succeeded; query integer binding failed. Decide framework response and validate application-specific bounds separately.
2. **Two handlers differ only in `{id}` versus `{name}`.** Template names do not distinguish candidates; use distinct literals/constraints/HTTP methods consistent with contract.
3. **A required query value is missing.** Decide whether omission should be a binding error or optional default/null, and explicitly model/test that contract.
4. **A GET handler needs a body.** Explicit binding may be possible but is often unsupported by clients/proxies/caches; reconsider the HTTP contract, or document/test the unusual requirement end-to-end.
5. **A wildcard file path yields inconsistent production behavior.** Verify outbound slash escaping and inbound encoded-slash handling separately through the actual proxy/server chain; never treat route text as a trusted filesystem path.

## Tradeoffs and alternatives

Use constraints for candidate disambiguation, binders/parsers for conversion, validation for correctness, authorization for access, and URL-generation APIs for links. Keep MVC and Minimal API source rules explicit where behavior matters. Favor stable named endpoints for links and distinct route shapes for public APIs.

## Common weak answers

- “Routes run in registration order.”
- “The `int` constraint validates the user's ID.”
- “Route values are already typed.”
- “MVC and Minimal API use the same binding rules.”
- “Each body parameter can deserialize its part of the body automatically.”
- “If GET doesn't support a body, `[FromBody]` is impossible.” (Explicit reading is possible, but interoperability must be considered.)
- “The route works, so link generation must work.”

## Self-check rubric

| Skill | A strong answer demonstrates |
|---|---|
| Matching | Explains candidates, policies, precedence/order, and ambiguity. |
| Binding | Separates raw source, conversion, validation, and response policy. |
| API design | Uses clear route shapes and explicit sources for public contracts. |
| Security | Avoids overposting, trusts no client IDs for authorization, and bounds bodies. |
| URL generation | Diagnoses endpoint address/values separately from inbound routing. |
| Operations | Accounts for encoded paths, reverse proxies, and real-host verification. |
