# integration testing databases webapplicationfactory and contracts — Reference: Consumer/provider contracts and external HTTP boundary testing

# Scope and version

This lesson covers the supplied service-contract and outbound HTTP boundary terms. PactNet and WireMock.Net evolve independently; use the package/documentation version selected by the project. The lesson describes the roles of the tools and concepts without claiming that a specific package release or every API was checked. [PactNet](https://github.com/pact-foundation/pact-net) [Pact FAQ](https://docs.pact.io/faq) [WireMock.Net](https://github.com/WireMock-Net/WireMock.Net)

# How this group fits the mental model

An independently deployed consumer and provider need a shared expectation at their boundary. A consumer contract records the interactions a consumer depends on; provider verification checks the provider implementation against those examples. An outbound HTTP stub is a different technique: it controls what a client receives so the client’s own behavior can be tested. A loopback server makes the request/response exchange more realistic, but it is still not the remote provider. For PactNet provider verification, start the provider on a reachable TCP endpoint; `TestServer` is not sufficient.

# Supplied names explained

- `Consumer-driven contract testing` — A method where consumers define the provider interactions they need and provider implementations verify compatibility with those interactions. It keeps the tested contract connected to actual consumer assumptions rather than a schema nobody uses.
- `Provider contract verification` — Checking that a provider implementation satisfies a set of consumer contracts. Verification results should be associated with the provider version/commit and shared through the team’s deployment process.
- `Consumer contract` — The recorded expectations for a consumer’s relevant requests and responses. It should contain only interactions the consumer relies on; an unnecessarily broad contract makes harmless provider changes harder.
- `Provider verification` — The provider-side execution of a contract against the provider implementation or a configured verification environment. It checks the selected interactions, not all provider behavior or the entire distributed workflow.
- `PactNet` — The .NET implementation in the Pact ecosystem for writing and verifying consumer/provider contracts. Confirm package setup and supported runtime from its current project documentation before adoption.
- `Pact consumer test` — A consumer-side test that runs the consumer against Pact’s simulated provider and records the interaction contract. It validates the consumer’s construction/use of the interaction; it does not contact the real provider.
- `Pact provider verification` — Running the recorded consumer interactions against a provider implementation. Provider state setup must make each interaction’s preconditions explicit so results remain repeatable.
- `Contract broker` — A service that stores contracts and verification results so consumers and providers can coordinate which versions are compatible. A broker supports compatibility decisions; it does not automatically deploy services or guarantee that every environment has compatible configuration.
- `Contract version` — An identifier tying a generated contract or verification to a source revision/build. A moving “latest” alone is ambiguous; use traceable versions so a deployment decision can relate evidence to artifacts.
- `Backward-compatible contract change` — A provider change that preserves behavior relied upon by current consumers, or a consumer change that remains valid with supported provider versions. Additive fields are not automatically safe if clients reject unknown values or meaning changes; validate actual consumer expectations.
- `HTTP integration test` — A test exercising an HTTP interaction across a selected boundary. With an in-process app host it checks the application pipeline; with a loopback server it checks an HTTP client/server exchange; against a deployed system it includes more infrastructure. Name the actual boundary.
- `Loopback HTTP server` — A local server bound for test traffic so an ordinary HTTP client can issue real HTTP requests without contacting an external system. It offers more protocol realism than a handler stub, while remaining local and controlled.
- `WireMock.Net` — A .NET HTTP mock-server project that can accept requests and return configured responses for tests. It can verify selected request details and simulate responses/errors without contacting the real dependency.
- `HttpMessageHandler stub` — A test replacement at the `HttpClient` handler boundary that returns predetermined responses. It is fast and precise for client logic, but does not exercise a server, sockets, HTTP framing, or server routing.
- `TestServer versus Kestrel` — A boundary distinction. The common `TestServer` host is in-process and does not open a real socket; Kestrel on a real socket can exercise network-level behavior when the test actually launches and connects to it. PactNet provider verification also needs a provider reachable over a real TCP socket; the PactNet project specifically warns that its verifier cannot call an ASP.NET Core `TestServer`/`WebApplicationFactory` host. A Kestrel test still does not automatically include a reverse proxy or production deployment.
- `Mock external service boundary` — Replacing a remote dependency with a controlled double at the boundary. It gives repeatable failures and avoids unwanted side effects; use separate contract or sandbox tests to verify assumptions about the real provider.
- `Schema compatibility test` — A check that request/response data conforms to an agreed schema across versions. Schema compatibility can catch structural incompatibility, but schemas may not encode semantic constraints, timing, authorization, or all consumer expectations.
- `OpenAPI contract test` — A check that an HTTP API implementation or client conforms to selected OpenAPI-described operations and schemas. Passing schema checks does not prove semantic behavior such as authorization policy, idempotency, or business invariants unless those are modeled and asserted separately.
- `Consumer/provider deployment compatibility` — A decision based on available consumer contract and provider verification evidence about whether a consumer build and provider build can be deployed together. It depends on correct version metadata and complete relevant contracts; it is not a guarantee about untested runtime configuration or rollout topology.

# Cross-item comparison

**Consumer test vs provider verification:** The consumer test checks that the consumer produces/uses the interaction it records against a simulated provider. Provider verification checks that the provider satisfies that recorded interaction. Both sides are needed for the compatibility claim; consumer-only tests cannot establish provider behavior.

**Handler stub vs loopback server:** A handler stub is the narrowest seam and best for deterministic client branches such as 4xx, 5xx, timeout or malformed-content handling. A loopback server exercises an ordinary HTTP request and server-side matching. Neither proves the actual remote service’s behavior; contracts and provider verification address that compatibility question.

**Contract vs OpenAPI/schema test:** A contract test captures selected consumer interactions; schema tests validate a structural description. They complement one another. Pact’s documentation describes a simulated provider for consumer work and the broker as a place to exchange contracts and verification results. [Pact FAQ](https://docs.pact.io/faq)

# Examples

### A consumer-provider workflow

An order service calls a pricing service. The order-service test describes the request fields it sends and the response fields it uses. The test runs against a simulated provider and writes a contract associated with the consumer build. The pricing service verifies that contract using a known provider state. The broker stores the contract and verification result. Deployment tooling can then check the exact candidate consumer/provider versions against that evidence.

This does not prove that pricing is correct for every order or that the deployment environment has correct DNS and credentials. It proves the specific interactions in the contract, under the verification setup.

### A client retryable error

To verify that the pricing client maps a 503 response into a retryable failure, a handler stub can return that status deterministically. To verify the request path, headers and body are actually formatted as expected by an HTTP server, use a loopback server such as WireMock.Net. To prove the provider honors the request/response agreement, run provider verification. Use a separate test for network/deployment behavior if that is a risk.

### Structural and semantic compatibility

An OpenAPI schema can require a field to be a number and mark a response as a particular shape. It may not express that a price is in a specific currency, is nonnegative, or is calculated at a certain time. Add semantic assertions or a consumer contract for behaviors the consumer depends on; do not infer business correctness from a schema match.

# Common mistakes

- Calling a consumer Pact test a request to the real provider; it commonly uses a simulated provider.
- Treating consumer verification as provider verification, or omitting provider-side verification.
- Assuming a contract enumerates every behavior of the system. It covers only recorded interactions.
- Publishing untraceable contracts without linking them to a source revision or artifact version.
- Making contracts so broad that they lock every provider detail and block safe changes.
- Treating additive schema changes as universally compatible without considering consumer parsers and semantics.
- Using a handler stub to claim the client works over real sockets or that a server routes correctly.
- Using WireMock.Net as evidence that the real external service behaves the same way.
- Treating an OpenAPI structural check as proof of authorization, business rules, timing, or deployment compatibility.

# Knowledge checks with answers

1. **What does a consumer-side Pact test usually run against?** A simulated provider, to record and check the consumer’s expected interaction.
2. **What additional evidence does provider verification provide?** It checks the provider implementation against the selected consumer contract.
3. **When prefer a handler stub?** When testing client logic at the handler boundary, such as deterministic response/error handling, without needing HTTP server behavior.
4. **What can WireMock.Net add over a handler stub?** A local HTTP server boundary so a regular client makes actual HTTP requests to a controlled endpoint.
5. **Does a passing OpenAPI schema check prove a business rule?** Only if that rule is represented and asserted; structural conformance alone does not establish all semantics.

# Sources

- [Pact documentation](https://docs.pact.io/)
- [Pact FAQ](https://docs.pact.io/faq)
- [PactNet](https://github.com/pact-foundation/pact-net)
- [WireMock.Net](https://github.com/WireMock-Net/WireMock.Net)
- [ASP.NET Core integration tests](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests?view=aspnetcore-10.0)
