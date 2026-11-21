# ASP.NET Core endpoint routing route patterns constraints and binding — Reference: Template syntax, parameters, constraints, defaults, optional segments, and catch-alls

## Scope and version

Sources: Microsoft's [routing documentation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-11.0), [MVC routing](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/routing?view=aspnetcore-11.0), [RoutePattern API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.routing.routepattern?view=aspnetcore-11.0), and [route constraints API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.routing.constraints?view=aspnetcore-11.0). Route syntax is framework-versioned; test decoding/encoding through the actual proxy and server path.

## How this group fits the mental model

Templates describe the path candidates routing can match. Constraints/policies narrow candidates; parameter transformers affect outbound text; model binding converts selected route values into typed inputs. Keep route shape, conversion, and domain validation separate.

## Supplied names explained

- `Route template` — pattern describing literal and parameterized URL path segments, defaults, optional values, constraints, and catch-alls.
- `Literal route segment` — fixed text in a path template, often used to make resource/action distinctions explicit.
- `Route parameter` — named placeholder that captures a path segment into route values.
- `Required route parameter` — parameter that must match for the template to be eligible; absence means the endpoint does not match.
- `Optional route parameter` — parameter allowed to be absent, generally represented by optional syntax/default; optional placement can create ambiguity.
- `Optional parameter syntax (?)` — suffix syntax such as `{id?}` marking a parameter optional in a route template.
- `Default route value` — configured value used when an optional/defaulted parameter is omitted, also available during outbound generation.
- `Default route value syntax (=)` — inline syntax such as `{page=1}` specifying a default route value.
- `Catch-all route parameter (*)` — captures remaining path segments into one route value; during outbound URL generation it escapes `/` in the supplied value as `%2F`.
- `Encoded catch-all route parameter (**)` — catch-all form that preserves `/` separators when generating a URL from a route value, allowing path separators to round-trip; inbound encoded-slash handling can depend on server/proxy layers.
- `Multiple route parameters in one segment` — a segment may combine literal separators and several parameters, such as `{file}.{ext}`; routing matches complex segments from right to left, non-greedily, so delimiters should be chosen to avoid ambiguity.
- `Constrained route parameter` — parameter annotated with a policy, for example `{id:int}`, that narrows route candidates based on a shape/type check.
- `Parameter transformer` — transforms parameter text, primarily for outbound URL generation; it does not validate or change the stored route value.
- `Route constraint` — policy that tests whether a route value is compatible with a candidate endpoint. Failure generally rejects that route candidate; it is not a model/domain validation response.
- `int route constraint` — accepts an integer-shaped route value within supported `Int32` range; it does not establish a business invariant such as positivity.
- `bool route constraint` — accepts values convertible to Boolean according to route constraint rules; use typed binding/domain validation for richer semantics.
- `datetime route constraint` — tests date/time conversion using invariant culture; route values remain text, so define a stable URL format and bind/parse after matching.
- `decimal route constraint` — tests decimal conversion using invariant culture; the converted number is not stored in route values, and the constraint does not replace typed binding or validation.
- `double route constraint` — tests double-precision conversion using invariant culture; it does not validate finiteness or domain range, and the route value remains text.
- `float route constraint` — tests single-precision conversion using invariant culture; validate range/NaN semantics separately, and note that the route value remains text.
- `guid route constraint` — accepts a GUID-formatted value understood by the constraint.
- `long route constraint` — accepts a 64-bit integer-shaped value within range.
- `min route constraint` — accepts a numeric parameter at or above the configured lower bound.
- `max route constraint` — accepts a numeric parameter at or below the configured upper bound.
- `range route constraint` — accepts a numeric value within configured minimum and maximum bounds, inclusive according to the constraint behavior.
- `length route constraint` — accepts a string route value whose character length is within configured bounds or exact length as specified.
- `minlength route constraint` — requires route text to be at least the configured length.
- `maxlength route constraint` — requires route text to be no longer than the configured length.
- `alpha route constraint` — accepts only English ASCII letters `A`–`Z` and `a`–`z`; it is not Unicode or business validation.
- `regex route constraint` — applies a regular-expression policy to route text. Keep patterns bounded/safe to avoid catastrophic backtracking and don't expose a validation error via route rejection when a 400 is required.
- `required route constraint` — requires a route value to be present/non-empty according to policy; route templates should usually express required values structurally.
- `file route constraint` — classifies a final path segment as a file-like value using period semantics; useful for routing/static-file distinctions, not file existence/security validation.
- `nonfile route constraint` — classifies a path as not file-like under route semantics, often used to keep extensionless routes from matching file requests.
- `IRouteConstraint` — MVC routing extension contract for custom route constraint behavior; it rejects/accepts route candidates and should be deterministic and inexpensive.
- `IParameterPolicy` — marker/base contract for route parameter policies resolved from route templates; constraints and transformers use policy infrastructure.
- `IOutboundParameterTransformer` — transforms route parameter values during URL generation, such as converting a PascalCase token to a slug; inbound matching is not thereby transformed.
- `SlugifyParameterTransformer` — sample/custom transformer pattern that converts words/casing to a URL slug; define Unicode, punctuation, and collision rules explicitly.
- `RouteTokenTransformerConvention` — MVC convention that applies a parameter transformer to route tokens such as controller/action names in attribute route templates.
- `Route constraint rejection` — rejection removes an endpoint from candidate matching; if no endpoint remains, caller may see 404, so this is not equivalent to a 400 validation result.
- `Route constraint is not input validation` — constraints decide URL-shape eligibility; use model/application validation after successful binding to communicate invalid user input.
- `Route pattern precedence` — specificity ranking based on literals, constrained/parameter segments, and catch-alls; inspect docs rather than assuming mapping order.
- `Route template ambiguity` — two patterns can accept the same request with equal selection priority; fix the URL design or apply an intentional documented discriminator.
- `Case-insensitive route matching` — route literal matching is generally case-insensitive in ASP.NET Core routing; generated canonical URL casing and proxies/browser behavior should still be tested.
- `Trailing slash matching` — routing generally treats a trailing slash equivalently for matching in common configurations; canonical URL generation/redirect policy is separate.
- `Encoded path segment` — percent-encoded path text is decoded/normalized across server/proxy layers; encoded delimiters can change segment boundaries, so do not assume raw and decoded paths are identical.
- `Period in route segment` — in `files/{filename}.{ext?}`, the trailing period and extension are optional together, so both `/files/myFile.txt` and `/files/myFile` match.
- `Optional parameter followed by literal` — optional parameters adjacent to required literals can create matching/generation ambiguity or impossible combinations; restructure or provide explicit route variants.
- `Catch-all encoded slash behavior` — `*` escapes slashes in generated route values as `%2F`, while `**` emits them as path separators. This describes outbound generation; test inbound `%2F`, literal `/`, double encoding, and proxy normalization end to end because infrastructure may reject or normalize encoded separators.
- `Route value constraint composition` — multiple constraints/policies may be chained on a parameter and all must accept for the endpoint candidate to remain.
- `Route constraint policy registration` — custom constraint policies are registered through routing options/DI and resolved by policy name; keep registration consistent across application and tests.
- `ConstraintMap` — route options mapping from constraint names in templates to constraint implementations; use unique stable names and test parsing/behavior.

## Cross-item comparison

`Route constraint` rejects a candidate before action/handler validation; `ModelState validation error` or Minimal API binding/domain validation communicates an error after matching. Type constraints use invariant culture to test conversion but leave the route value as text. `IOutboundParameterTransformer` changes generated route text; `IRouteConstraint` narrows inbound candidates. `*` and `**` differ in how outbound generation escapes slash characters. Defaults and optional parameters affect both matching and URL generation, so verify both directions.

## Examples

An identifier route can use `{id:int}` to distinguish a numeric endpoint from a static literal route. Still validate `id > 0` in application logic and return the intended client error. A slug URL can use an outbound transformer to generate lowercase dashes; keep inbound slug lookup semantics explicit. For an asset path catch-all, test encoded slash handling behind the actual ingress because reverse proxies may decode or reject it before ASP.NET Core receives the request.

## Common mistakes

- Using `{id:int}` to return a clean 400 for malformed user input; rejection may become 404.
- Assuming `*` and `**` differ in inbound URL decoding; their documented distinction is outbound slash escaping.
- Using broad regex constraints without timeout/performance analysis.
- Assuming route constraints enforce authorization, resource existence, or business rules.
- Adding optional parameters/literals that create ambiguous inbound or outbound patterns.
- Testing encoded paths only with TestServer while production has a reverse proxy.

## Knowledge checks with answers

1. **What happens if an `int` route constraint rejects the segment?** That endpoint is removed from the candidate set; another endpoint may match or the request may become 404.
2. **Does a transformer validate inbound route values?** No; it primarily transforms outbound parameter text.
3. **Why should encoded slash behavior be tested end to end?** Proxy/server layers may normalize or reject the path before routing sees it.
4. **Where should domain range validation occur?** After binding, in model/application validation with an intentional client-facing response.
