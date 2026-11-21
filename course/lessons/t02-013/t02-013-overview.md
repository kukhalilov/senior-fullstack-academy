# API versioning OpenAPI contracts Problem Details validation pagination and idempotency — Big-picture orientation and mental model

## Problem and purpose

An API is a contract that clients depend on. Its route and method behavior, request and response shapes, status codes, errors, pagination rules, and compatibility policy all affect whether clients can use it safely. OpenAPI describes much of that contract for people and tools. Versioning provides a controlled path for incompatible changes. Problem Details makes failures machine-readable. Pagination bounds collection work. Idempotency and conditional requests make retries and concurrent updates safer. None of these mechanisms can compensate for an unclear contract or incorrect implementation. [ASP.NET Core OpenAPI](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/aspnetcore-openapi) [API implementation guidance](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-implementation)

ASP.NET Core includes OpenAPI generation through `Microsoft.AspNetCore.OpenApi`. API versioning comes from the separate `Asp.Versioning` community packages. Problem Details support is built into ASP.NET Core, while pagination and idempotency-key processing are application contracts and implementation patterns, not built-in universal middleware. [Asp.Versioning documentation](https://dotnet.github.io/aspnet-api-versioning/) [Error handling](https://learn.microsoft.com/en-us/aspnet/core/web-api/handle-errors)

## Plain-language mental model

Treat the API contract as a promise about what a client can send and what it will observe. OpenAPI is a structured description of that promise, not a proof that runtime behavior matches it. Versioning identifies which compatible contract a client uses. Error responses describe why a request failed without exposing internals. Pagination says how to continue through a collection without requesting unbounded data. Retry semantics say whether repeating a request can repeat an effect.

Think of a request lifecycle as:

```text
client contract/version
        │
        ▼
route + method + request validation
        │
        ├── success → response schema + status + pagination continuation
        │
        └── failure → status + Problem Details or other documented error
                              │
                              └── retry only under the method/idempotency contract
```

The contract includes negative behavior too: which versions are supported, what happens for an unsupported version, how validation errors are shaped, whether cursor tokens expire, and whether a repeated idempotency key returns the original result.

## How the parts fit together

| Concern | Main mechanism | Responsibility boundary |
|---|---|---|
| Describe routes, inputs, outputs and schemas | OpenAPI document | Generator derives metadata; team verifies it against actual behavior |
| Evolve incompatible APIs | API versioning | Separate version contracts, negotiate/report versions, plan deprecation |
| Explain HTTP errors consistently | Problem Details + exception/status handling | Middleware/writers shape transport errors; domain semantics remain app-owned |
| Bound collection reads | Page size and offset or stable cursor | API defines ordering, filters, limits, and continuation semantics |
| Safely retry a non-idempotent operation | Durable idempotency record/key contract | Application coordinates duplicate requests and stores/replays the outcome |
| Prevent lost updates | ETag + `If-Match` precondition | Server checks resource version before applying a mutation |

OpenAPI generation can run at runtime or build time. A runtime endpoint can be restricted or cached; it is not automatically private. Build-time generation runs application startup with a mock server and can execute startup configuration, so generation must not depend on production-only infrastructure or secrets. OpenAPI UI tools such as Swagger UI render a document; they do not generate the framework's document or enforce the contract. [OpenAPI generation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/aspnetcore-openapi)

Recent protocol details can change generated contracts: HTTP `QUERY` is now standardized by RFC 10008 as a safe, idempotent method with a request representation. It can express a large search payload that would be awkward in a URI, but clients/proxies must support it and declare the query media type. ASP.NET Core 11 emits a native QUERY operation only in OpenAPI 3.2; 3.0/3.1 output uses an extension. [RFC 10008](https://www.rfc-editor.org/rfc/rfc10008.html) [OpenAPI 3.2 generation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/aspnetcore-openapi)

## Concept map

```text
API contract
├── routes + HTTP methods + schemas + status codes
│   └── OpenAPI document (generated, then reviewed/contract-tested)
├── versions
│   ├── request version reader and negotiation
│   ├── endpoint/controller version metadata
│   └── explorer/document grouping + deprecation policy
├── failures
│   ├── validation → 400 + validation details
│   ├── known domain conflict → meaningful 4xx semantics
│   └── unexpected exception → safe 5xx Problem Details
└── collection/mutation semantics
    ├── pagination → deterministic ordering + bounded continuation
    ├── retries → HTTP idempotency + optional durable request deduplication
    └── concurrency → ETag + If-Match + 412/428/409 policy
```

## End-to-end walkthrough

An order API publishes a versioned OpenAPI contract. A client requests API version 2; the server selects the v2 endpoint and reports supported versions. A list endpoint applies filters and a stable `(createdAt, id)` ordering, then returns a bounded page plus an opaque continuation cursor. If a client submits an invalid page size, the API returns 400 with a validation Problem Details document that identifies the invalid field without echoing secrets.

For a payment-creation POST, the client sends an idempotency key. The server atomically reserves the key within a defined user/operation scope, stores a request fingerprint, performs the payment once, and records the response. A duplicate with the same key and same fingerprint replays the recorded outcome; the same key with a different payload is rejected. For a later order update, the client sends the ETag it read in `If-Match`; the server updates only if the representation is still current. These are explicit application contracts, not a guarantee supplied by OpenAPI or HTTP middleware alone. [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) [API implementation guidance](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-implementation)

## When to use it and tradeoffs

Generate OpenAPI for every API whose clients benefit from discoverable machine-readable contracts, but restrict sensitive schemas and compare the document to integration behavior. Version only when a contract change is incompatible; additive changes can still break strict clients, so compatibility must be measured rather than assumed. Use offset pagination for small, stable datasets and simple navigation; prefer keyset/cursor pagination for large ordered data that changes during traversal. Use an idempotency key when clients must retry an operation whose duplicate effect would be harmful, and define storage, scope, expiry, concurrency, and replay behavior first. Use ETags/conditional requests when concurrent edits must not silently overwrite one another.

## What later lessons cover

The references explain built-in OpenAPI generation and transformers, the separate `Asp.Versioning` package family, Problem Details and exception/status handling, plus pagination, retries, idempotency, and contract evolution. Practice scenarios combine these choices; the interview lesson asks you to explain semantics and tradeoffs rather than recite configuration.

## Sources

- [Generate OpenAPI documents](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/aspnetcore-openapi)
- [Customize OpenAPI documents](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/customize-openapi)
- [ASP.NET Core API versioning](https://dotnet.github.io/aspnet-api-versioning/)
- [Handle errors in ASP.NET Core APIs](https://learn.microsoft.com/en-us/aspnet/core/web-api/handle-errors)
- [HTTP Semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)
