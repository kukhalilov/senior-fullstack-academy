# ASP.NET Core endpoint routing route patterns constraints and binding — Big-picture orientation and mental model

Sources: Microsoft's [routing](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-11.0), [MVC routing](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/routing?view=aspnetcore-11.0), [MVC model binding](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/model-binding?view=aspnetcore-11.0), [Minimal API parameter binding](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding?view=aspnetcore-11.0), and [LinkGenerator API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.routing.linkgenerator?view=aspnetcore-11.0). The current ASP.NET Core 11 routing model is endpoint-based; inspect behavior for the actual endpoint style/provider/version.

## Problem and purpose

Routing maps an HTTP method and URL to an endpoint. Binding then converts request data into the endpoint's typed inputs. Keeping those stages separate helps explain 404s, ambiguous routes, binding failures, invalid input, and incorrect generated links.

## Plain-language mental model

Routing is a matching and selection process, not a loop that invokes routes in declaration order. The framework builds endpoint metadata, matches the request against route patterns, filters candidates by constraints/policies, and selects the best candidate. Only after endpoint selection does its parameter-binding model obtain values from route, query, headers, forms, body, or DI and convert them. Route constraints help choose between URL shapes; they do not validate the correctness of user input.

## How the parts fit together

Endpoint routing supports MVC attribute/conventional routes and Minimal API endpoints. Route patterns describe literals, parameters, defaults, optional segments, catch-alls, and constraints. Route values are strings in the request context; model binding converts them to declared parameter types. MVC has model binders, value providers, ModelState, and input formatters. Minimal APIs use source inference, special parameter types, parsers, and custom binding patterns. URL generation separately selects endpoint metadata and values, so successful inbound matching does not guarantee a desired outbound link.

## Concept map

```text
request method/path → match route patterns → candidate endpoints
                    → constraints/policies/order/precedence → selected endpoint
                    → bind typed parameters from request or DI → handler/action

URL generation: endpoint address/name + values → outbound path/URI
```

## End-to-end walkthrough

For `GET /products/42?page=3`, an endpoint pattern may contain `{id:int}`. Routing matches the path and provides route value `id` as text. A Minimal API handler can bind it as an integer, bind `page` from query, resolve a registered service from DI, and receive a cancellation token. If `42` cannot satisfy the `int` route constraint, that endpoint is rejected during matching and the request may become 404. If a valid route matches but a typed query parameter is malformed, binding fails after endpoint selection with the framework's binding behavior. MVC ModelState and Minimal API parameter failure handling differ; neither should be confused with route constraint rejection.

## When to use it and tradeoffs

Use constraints to define supported route shapes and resolve genuine route ambiguity, not to report domain validation errors. Use explicit source attributes when inference is unclear or API contracts should be obvious. Prefer stable named endpoints for link generation when route shape may evolve. Model API paths intentionally: optional parameters, catch-alls, encoded slashes, periods, trailing slashes, case behavior, and outbound URL generation need tests.

## What later lessons cover

The concepts lesson explains matching, constraints, and binding in order. Reference lessons cover endpoint matching/metadata/links, the route-template language, MVC model binding, and Minimal API binding. Practice and interview lessons diagnose ambiguity, malformed input, body-source errors, and link-generation failures.
