# integration testing databases webapplicationfactory and contracts — Reference: ASP.NET Core in-process host setup and HTTP client behavior

# Scope and version

This reference explains exactly the supplied host/client items for ASP.NET Core integration tests. The API reference snapshot includes ASP.NET Core 11, while the integration-testing guide is published for ASP.NET Core 10; select the `Microsoft.AspNetCore.Mvc.Testing` package matching the application’s target framework and check its own API surface before applying a version-specific overload. The examples use established `WebApplicationFactory<TEntryPoint>` patterns and do not claim execution. [WebApplicationFactory API reference](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.testing.webapplicationfactory-1?view=aspnetcore-11.0) [Integration-testing guide](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests?view=aspnetcore-10.0)

# How this group fits the mental model

The host is the application under test, configured for a controlled environment. The client sends requests into it; the response gives the test an externally observable result. With the usual `TestServer` setup, the application pipeline is exercised in process. This is excellent for routing, middleware, service wiring and serialization checks, but it does not prove behavior that depends on real network sockets, TLS, DNS, a reverse proxy or deployment infrastructure.

# Supplied names explained

- `Integration test` — A test of collaboration across a boundary, such as the configured ASP.NET Core host handling an HTTP request. The term does not specify whether a real database, process or network is included; state the boundary explicitly.
- `Microsoft.AspNetCore.Mvc.Testing` — The package used by ASP.NET Core integration tests to configure the test host and provide `WebApplicationFactory<TEntryPoint>`. Keep its package version aligned with the application target framework.
- `WebApplicationFactory<TEntryPoint>` — A reusable factory that bootstraps the application for a test host. `TEntryPoint` identifies the app entry-point assembly/type used to locate and start the app. The default integration pattern creates an in-process server; custom factories can change configuration and service registration.
- `WebApplicationFactory<TEntryPoint>.CreateClient` — Creates an `HttpClient` associated with the factory’s test server. Dispose the client/factory according to fixture ownership and configure client behavior deliberately.
- `WebApplicationFactory<TEntryPoint>.Server` — Exposes the factory’s `TestServer`. Use it when a test needs lower-level access to the in-process server; ordinary endpoint tests can use the returned client.
- `WebApplicationFactory<TEntryPoint>.Services` — Exposes the host’s service provider. It can resolve application services for test setup or persistence assertions, but avoid asserting internal implementation details when an HTTP-visible result is the actual contract.
- `WebApplicationFactory<TEntryPoint>.ConfigureWebHost` — An override point for configuring the test web host. Use it to set a test environment or change a specific registration. If the factory removes most production registrations, the test may stop representing the application composition it claims to cover.
- `WebApplicationFactory<TEntryPoint>.WithWebHostBuilder` — Produces a further-customized factory for a particular test scenario. This is useful when one test needs an override without making every test class use that override.
- `ConfigureTestServices` — A test-host customization point used to replace or add services after application registrations are available. Replace only dependencies whose behavior is outside this test’s boundary; keep the real service when its collaboration is the subject of the test.
- `TestServer` — ASP.NET Core’s in-process test server. It routes the client request through the app pipeline without opening a real network socket. It does not prove TLS, proxy, DNS or operating-system network behavior.
- `TestServer.CreateHandler` — Creates an HTTP message handler that sends a client’s requests to this in-process server. This is a bridge from an HTTP client abstraction into the host pipeline, not a socket transport.
- `TestServer.SendAsync` — Sends a server request through the in-process pipeline and returns the resulting response context. It is a lower-level alternative when a test needs direct server request control; prefer the ordinary client path for typical endpoint behavior.
- `HttpClient` — The client used to issue requests and consume responses. Dispose it through a fixture or factory ownership pattern. Avoid creating uncontrolled client/host instances per assertion if a class fixture can share immutable host setup safely.
- `HttpResponseMessage` — Carries response status, headers and content. Dispose the response when appropriate, read content before disposal, and assert the contract that matters: status, relevant headers, and parsed body rather than incidental header order.
- `WebApplicationFactoryClientOptions` — Options applied when creating the factory client. Use these to configure redirect handling, cookies and the base address consistently with the scenario.
- `AllowAutoRedirect` — Controls whether the test client follows redirects automatically. Disable following when the redirect status and `Location` are the behavior under test; enable it only when testing the final destination behavior is intended.
- `HandleCookies` — Controls whether the client manages cookies between requests. Turn cookie handling on for a flow that depends on a session or authentication cookie; isolate cookie state between independent cases.
- `BaseAddress` — The client’s base URI for relative request paths. It makes endpoint requests concise but does not represent external DNS or public URL configuration unless the test uses a real network host.
- `ASPNETCORE_ENVIRONMENT` — An environment setting read by ASP.NET Core hosting. The standard integration-test guidance uses `Development` when no environment is otherwise set. Set it explicitly when behavior differs by environment, and avoid treating Development configuration as production configuration.
- `Development test environment` — A controlled environment label for test startup. It may enable development-only behavior, so tests should explicitly choose it or a dedicated test environment and ensure they are exercising the configuration intended by the test.
- `InternalsVisibleTo` — An assembly attribute that grants an identified assembly access to internal types. It is sometimes used to expose the entry-point type to a test assembly, but broad internal access increases coupling; prefer the documented public entry point pattern when practical.
- `public partial Program` — A declaration commonly added to a top-level ASP.NET Core app so tests in another assembly can use `Program` as the factory entry-point type. It must be placed in the app assembly; it does not create a new runtime entry point.

# Cross-item comparison

`CreateClient` is the common high-level route; `Server` and `TestServer.SendAsync` give closer access to the in-process server. `ConfigureWebHost` applies common factory configuration; `WithWebHostBuilder` allows a scoped variation. `ConfigureTestServices` is for test service registrations, while setting the environment or configuration controls the host’s inputs. These controls do not transform `TestServer` into Kestrel on a real socket.

Redirect and cookie behavior are independent. Automatic redirects can hide the first response; cookie handling can preserve state across requests. Decide which behavior the test is measuring and set both deliberately. No within-group comparison applies to a single item.

# Examples

The following is a C# snippet for a test project with the matching testing package and an app assembly that exposes `Program`. It sends a request through the factory-created in-process client and checks an observable status. Replace the path and expected status with the endpoint contract being tested.

```csharp
using Microsoft.AspNetCore.Mvc.Testing;

using var factory = new WebApplicationFactory<Program>();
using var client = factory.CreateClient();
using var response = await client.GetAsync("/health");

if (!response.IsSuccessStatusCode)
{
    throw new InvalidOperationException($"Unexpected status: {(int)response.StatusCode}");
}
```

The `using` declarations make ownership visible. This still does not test a real socket or TLS. A test that checks a redirect would configure automatic redirects off and assert the initial response before following it.

For a top-level app, the app project commonly includes this declaration in a source file so the test assembly can name `Program`:

```csharp
public partial class Program { }
```

The syntax shown is a C# class declaration using a semicolon body, available in modern C#. If a project’s language version or app structure differs, use the matching declaration form supported by that project. [ASP.NET Core integration-test guide](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests?view=aspnetcore-10.0)

# Common mistakes

- Calling a factory-client test “network end-to-end” when it uses the in-process server.
- Replacing the service under test in `ConfigureTestServices`, then claiming the test proves that service’s integration.
- Forgetting that a test environment can enable different configuration from production.
- Allowing redirects automatically and therefore asserting only the destination, not the redirect contract.
- Sharing cookie state or mutable server state across tests unintentionally.
- Resolving internal services from `Services` when the public HTTP behavior is what matters, making tests brittle to harmless refactoring.
- Granting the test assembly access to internals broadly when a public entry-point type suffices.

# Knowledge checks with answers

1. **What is the ordinary boundary of a factory-created client?** The ASP.NET Core app pipeline in an in-process `TestServer`, not a real socket/TLS/proxy path.
2. **When should automatic redirects be disabled?** When the initial redirect status and destination header are part of the behavior being asserted.
3. **Why use `WithWebHostBuilder`?** To create a scoped test-host customization without changing the shared factory configuration for every test.
4. **What does `public partial Program` solve in a top-level app?** It exposes the generated entry-point type to the test project so the factory can identify the app assembly.
5. **Does `Services` prove the endpoint works?** No. It permits service resolution, but the endpoint’s HTTP behavior should be asserted through the client when that is the contract.

# Sources

- [ASP.NET Core integration tests](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests?view=aspnetcore-10.0)
- [WebApplicationFactory API reference](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.testing.webapplicationfactory-1?view=aspnetcore-11.0)
