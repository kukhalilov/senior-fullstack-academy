# deployment settings environments troubleshooting and performance — Reference: runtime environment configuration sources content roots and secret boundaries

## Scope and version

This reference covers the modern host/environment objects, default configuration sources and precedence, environment variables, content roots, validation, and secret boundaries. Current apps should use `WebApplication.CreateBuilder`; ASP.NET Core 10 marks the legacy `WebHost` model obsolete. For modern hosting, `DOTNET_ENVIRONMENT` takes precedence over `ASPNETCORE_ENVIRONMENT`; legacy `WebHost` uses the reverse order. [Environments](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/environments) [Configuration](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration) [WebHost deprecation](https://learn.microsoft.com/en-us/dotnet/core/compatibility/aspnet-core/10/webhostbuilder-deprecated)

## How this group fits the mental model

Host configuration determines how the process starts and which environment is active. App configuration layers values from providers; later providers override earlier ones. Environment names select environment-specific behavior and files but are not secret stores. Content-root and web-root paths determine where the app resolves content and static assets after publication. Validate effective settings without emitting their secret values.

## Supplied names explained

### Builder, environment, and roots

| Supplied name | Explanation |
|---|---|
| `WebApplication.CreateBuilder` | Creates the modern host builder, default configuration, dependency injection container, logging, and web-host defaults. It should normally be created once. |
| `WebApplicationOptions` | Inputs for constructing a builder when startup needs explicit arguments, app name, roots, or environment. |
| `WebApplicationOptions.Args` | Command-line arguments used by the builder's command-line configuration provider. |
| `WebApplicationOptions.ApplicationName` | Sets the application name used by hosting and content-root discovery. |
| `WebApplicationOptions.ContentRootPath` | Sets the base directory for app content/configuration files. Avoid assuming the shell's current directory is the deployed root. |
| `WebApplicationOptions.EnvironmentName` | Explicitly selects the host environment; deployment variables and builder inputs must be coordinated. |
| `WebApplicationOptions.WebRootPath` | Sets the web/static-assets root relative to the application layout. |
| `WebApplicationBuilder.Environment` | Provides the `IWebHostEnvironment` for builder-time registration and environment-specific configuration. |
| `WebApplication.Environment` | Exposes the environment after build, useful for conditional pipeline composition. |
| `IWebHostEnvironment` | Web-host environment abstraction adding web-root properties to host environment data. |
| `IWebHostEnvironment.EnvironmentName` | Name such as Development, Staging, Production, or a deployment-defined value. |
| `IWebHostEnvironment.ApplicationName` | Name of the application assembly/host context used by framework features. |
| `IWebHostEnvironment.ContentRootPath` | Absolute root path for application content and default file configuration. |
| `IWebHostEnvironment.ContentRootFileProvider` | File provider rooted at the app content directory; useful for abstraction/testing and deployed files. |
| `IWebHostEnvironment.WebRootPath` | Physical path used for public web assets when configured. |
| `IWebHostEnvironment.WebRootFileProvider` | File provider for web-root assets. |
| `IHostEnvironment` | Host environment abstraction exposing environment name, app name, and content root without web-root members. |
| `HostEnvironmentEnvExtensions.IsDevelopment` | Checks whether the environment name is Development. Use it to restrict developer-only middleware. |
| `HostEnvironmentEnvExtensions.IsStaging` | Checks for the conventional Staging name. It does not create a staging deployment automatically. |
| `HostEnvironmentEnvExtensions.IsProduction` | Checks for Production; Production is also the default when no environment variable is set. |
| `HostEnvironmentEnvExtensions.IsEnvironment` | Checks an exact custom environment name for deployments with a controlled naming scheme. |

### Environment selection

| Supplied name | Explanation |
|---|---|
| `Development environment` | Local-development environment where developer exception details and User Secrets may be enabled. Never infer production security from the name alone. |
| `Staging environment` | Common preproduction name for production-like verification; deployment configuration still must be supplied explicitly. |
| `Production environment` | Secure default environment name used when no environment variable is configured. It selects behavior/files; it does not provide production secrets. |
| `Custom environment names` | Valid names when code, config files, and deployment agree; framework helpers only recognize their named conventional values. |
| `ASPNETCORE_ENVIRONMENT` | Web-specific environment variable used by ASP.NET Core host bootstrap. |
| `DOTNET_ENVIRONMENT` | Generic host environment variable. |
| `WebApplication environment precedence between DOTNET_ENVIRONMENT and ASPNETCORE_ENVIRONMENT` | With `WebApplication.CreateBuilder`, `DOTNET_ENVIRONMENT` takes precedence when both are set. |
| `WebHost environment precedence between ASPNETCORE_ENVIRONMENT and DOTNET_ENVIRONMENT` | Legacy WebHost uses the reverse precedence, with `ASPNETCORE_ENVIRONMENT` taking precedence; WebHost is obsolete from ASP.NET Core 10. |
| `Production as the default environment when no environment variable is set` | Prevents missing configuration from accidentally enabling Development behavior. |
| `Windows and macOS environment variable case-insensitivity` | Environment variable names are case-insensitive on these operating systems. |
| `Linux environment variable case-sensitivity` | Names differ by case on Linux, which can make deployment typos appear as missing values. |

### Configuration providers and secrets

| Supplied name | Explanation |
|---|---|
| `appsettings.json` | Base JSON application settings file, normally suitable for nonsecret defaults. |
| `appsettings.{Environment}.json` | Environment-specific JSON overlay loaded for the active environment, such as `appsettings.Staging.json`. |
| `Environment-specific configuration provider precedence` | Default appsettings layering places environment-specific JSON after base JSON; later providers can still override it. |
| `IConfiguration configuration root and provider precedence` | Key/value abstraction composed from providers; if several supply a key, the last provider wins. Inspect provider order and effective nonsecret values. |
| `Command-line configuration provider` | Reads command-line arguments and is normally the highest-priority default application provider. Protect command lines from exposing secrets in process listings/logs. |
| `Environment variables configuration provider` | Loads app environment variables after JSON and Development User Secrets in the default configuration. |
| `User Secrets configuration provider in Development` | Adds per-user development secrets outside the project tree; it is a local development facility, not production vault storage. |
| `Secret Manager dotnet user-secrets` | CLI tool for initializing and modifying the development User Secrets store associated with a project. |
| `Secret Manager is for development, not production secret storage` | User Secrets are not encrypted production secret management and should not hold production credentials. |
| `Production secret provider and managed identity boundary` | Use a protected production secret provider or a platform identity with least privilege; keep credential retrieval out of source-controlled defaults. |
| `Configuration key naming with double underscore environment variables` | `__` maps to `:` for hierarchical configuration keys across platforms, for example `Logging__LogLevel__Default`. |
| `ASPNETCORE_ host configuration prefix` | Prefix for ASP.NET Core host settings; those variables participate in bootstrap rather than ordinary unprefixed app configuration. |
| `DOTNET_ host configuration prefix` | Prefix for generic host settings such as `DOTNET_ENVIRONMENT`. |
| `Configuration reloadOnChange behavior` | File providers can reload when configured; not every provider/value consumer automatically rebinds, and deployment filesystem semantics vary. |
| `Configuration value validation at startup` | Validate required option values before serving requests so malformed deployment input fails clearly and early. |
| `Avoid printing configuration values containing secrets` | Log key names and safe validation outcomes, never a full configuration dump or credential values. |

### Files and hosting configuration

| Supplied name | Explanation |
|---|---|
| `WebRootPath versus ContentRootPath` | Content root holds app content/configuration; web root holds public static files. They serve different resolution and exposure purposes. |
| `Path resolution in containers and published applications` | Relative paths resolve against configured roots/process context; explicitly configure roots and mount paths instead of relying on a developer shell. |
| `WebApplicationOptions.WebRootPath and static web asset location` | Builder option selecting where static web assets are served from; publish output/layout may differ from source-tree layout. |
| `UseEnvironment on IHostBuilder legacy hosting model` | Legacy host-builder API for selecting environment during migration/maintenance; use `WebApplicationOptions.EnvironmentName` or deployment configuration for current apps. |

## Cross-item comparison

`IHostEnvironment` covers common host identity and content root; `IWebHostEnvironment` adds web-root paths/providers. `ContentRootPath` is for application content and configuration, while `WebRootPath` is for public static assets. Environment name selects environment-dependent behavior; provider precedence selects the winning value. Host prefixes such as `DOTNET_` participate in bootstrap and should not be confused with ordinary app environment variables. User Secrets solve local developer-secret handling; production uses a protected secret provider or platform identity.

## Examples

### Set explicit builder inputs

```csharp
var options = new WebApplicationOptions
{
    Args = args,
    ApplicationName = typeof(Program).Assembly.FullName,
    ContentRootPath = AppContext.BaseDirectory,
    WebRootPath = "wwwroot"
};

var builder = WebApplication.CreateBuilder(options);
```

Use an explicit content root only when it matches the published layout; blindly setting `AppContext.BaseDirectory` can change where JSON config files are expected. The example deliberately leaves environment selection to deployment.

### Validate without leaking values

```csharp
var endpoint = builder.Configuration["Payments:Endpoint"];
if (!Uri.TryCreate(endpoint, UriKind.Absolute, out var paymentUri))
{
    throw new InvalidOperationException("Payments:Endpoint must be an absolute URI.");
}
```

Report the key and safe validation rule, not `endpoint` if it might contain credentials or query tokens. Strongly typed options with startup validation are preferable when several values form one contract.

## Common mistakes

- Setting `DOTNET_ENVIRONMENT=Production` and `ASPNETCORE_ENVIRONMENT=Development` with a modern builder, then assuming the latter wins.
- Treating `Production` as a secret provider or storing credentials in committed appsettings.
- Using User Secrets as production storage.
- Logging the full configuration root to debug precedence.
- Using `ASPNETCORE_` keys as if they were ordinary app-provider keys when a host setting is intended.
- Assuming file reload reconfigures every already-bound service automatically.
- Resolving application files relative to the current working directory without verifying the deployed process root.
- Serving the entire content root publicly instead of only the web root.

## Knowledge checks with answers

1. **Modern builder sets both environment variables. Which takes precedence?** `DOTNET_ENVIRONMENT` with `WebApplication.CreateBuilder`.
2. **Which path should hold private app configuration files?** The content root; the web root is for publicly served static content.
3. **Do environment variables override default JSON settings?** Yes, and command-line configuration normally has higher default priority still.
4. **Are User Secrets encrypted production storage?** No; they are for local development and keep values outside source control.

## Sources

[Environments](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/environments) · [Configuration](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration) · [WebHost deprecation](https://learn.microsoft.com/en-us/dotnet/core/compatibility/aspnet-core/10/webhostbuilder-deprecated)
