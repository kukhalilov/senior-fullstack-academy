<!-- Generated with gemini-3-flash-preview; automated review only; source and code verification pending. -->

# Hosting Kestrel, IIS, and Reverse Proxies

## Simple explanation
When you build an ASP.NET Core application, it needs a **web server** to listen for and process requests from the internet.

*   **Kestrel:** This is the default, high-performance, cross-platform web server included with ASP.NET Core. Think of it as the "engine" of your app. It is optimized for speed and modern web standards but lacks advanced management features like port sharing (running multiple apps on port 80) or advanced security filtering.
*   **IIS (Internet Information Services):** This is a full-featured web server that runs on Windows. Think of it as a "building manager." It handles complex tasks like process recycling, security certificates, and hosting multiple websites on a single server.
*   **Reverse Proxy:** This is a "middleman" server (like IIS, Nginx, or Apache) that sits between the user and your application. The user talks to the proxy, and the proxy forwards the request to Kestrel.

## How it works
While Kestrel is "edge-ready" (safe to expose to the internet), most professional setups use a **Reverse Proxy** for defense-in-depth and easier management.

1.  **The Request:** A user sends a request to your domain (e.g., `example.com`).
2.  **The Proxy:** The request hits the Reverse Proxy (IIS, Nginx, or YARP).
3.  **The Forwarding:** The proxy uses a component called the **ASP.NET Core Module (ANCM)** to forward the request to your application.
4.  **The Processing:** Your app processes the request and generates a response.
5.  **The Return:** The response travels back through the proxy to the user.

### Hosting Models in IIS
When using IIS, you must choose between two hosting models:
*   **In-Process:** The application is hosted inside the IIS worker process (`w3wp.exe`). It does **not** use Kestrel; instead, it uses a high-performance server implementation called `IISHttpServer`. This is the default and fastest model.
*   **Out-of-Process:** IIS acts as a proxy, and your app runs as a separate process (`dotnet.exe`) using Kestrel. IIS communicates with Kestrel over a local loopback network. This is useful for isolating the app from the IIS process or when cross-platform consistency is required.

## Examples

### 1. Basic Kestrel Configuration
You can customize Kestrel's behavior in `Program.cs`. This is useful when running as a standalone service or in a container (Docker).

```csharp
var builder = WebApplication.CreateBuilder(args);

// Configuring Kestrel limits and ports
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    // Limit connections for security
    serverOptions.Limits.MaxConcurrentConnections = 100;
    
    // Listen on a specific port
    serverOptions.ListenAnyIP(5001); 
    
    // Configure HTTPS
    serverOptions.ListenAnyIP(5002, listenOptions => 
    {
        listenOptions.UseHttps(); 
    });
});

var app = builder.Build();
app.MapGet("/", () => "Hello from Kestrel!");
app.Run();
```

### 2. IIS Configuration (web.config)
When you publish to IIS, the SDK generates a `web.config`. This file configures the **ASP.NET Core Module**.

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" resourceType="Unspecified" />
    </handlers>
    <!-- hostingModel="inprocess" is recommended for best performance on Windows -->
    <aspNetCore processPath="dotnet" arguments=".\YourApp.dll" stdoutLogEnabled="false" hostingModel="inprocess" />
  </system.webServer>
</configuration>
```

## Tradeoffs and comparisons

| Feature | Kestrel (Standalone) | IIS + Kestrel (Out-of-Process) | IIS (In-Process) |
| :--- | :--- | :--- | :--- |
| **Performance** | Very High | Lower (Network overhead) | Highest (Direct memory access) |
| **Platform** | Windows, Linux, macOS | Windows Only | Windows Only |
| **Port Sharing** | No (1 app per port) | Yes (Shared 80/443) | Yes (Shared 80/443) |
| **Management** | Manual/CLI | GUI (IIS Manager) | GUI (IIS Manager) |
| **Process Restart** | Needs external tool | Automatic (IIS handles it) | Automatic (IIS handles it) |

**Why use a Reverse Proxy?**
1.  **Security:** It provides an extra layer of protection against attacks like Slowloris.
2.  **Load Balancing:** It can distribute traffic across multiple backend servers.
3.  **SSL Termination:** The proxy handles the heavy encryption work, freeing up your app's CPU.
4.  **Static Content:** Proxies like Nginx are often faster at serving images and CSS than an application server.

## Interview questions and answers

**Q1: What is Kestrel and why do we need it?**
**A:** Kestrel is a cross-platform, asynchronous I/O-based web server for ASP.NET Core. We need it because it allows .NET applications to run on any platform (Linux, Windows, macOS) without being tied to a specific heavy web server like IIS.

**Q2: Why would you put IIS in front of Kestrel?**
**A:** IIS provides enterprise-grade features that Kestrel lacks, such as easy SSL certificate management, request filtering, port sharing (hosting multiple sites on port 80), and automatic process activation/recycling if the app crashes.

**Q3: Explain the difference between In-Process and Out-of-Process hosting.**
**A:** In-Process hosting runs the app inside the IIS process (`w3wp.exe`), bypassing Kestrel entirely for better performance. Out-of-Process hosting runs the app in its own process and uses IIS as a reverse proxy to forward requests to Kestrel. In-Process is generally preferred on Windows for its lower latency.

## Exercises and solutions

### Exercise 1: The "Round Robin" Load Balancer (DSA)
**Problem:** A Reverse Proxy often uses a "Round Robin" algorithm to distribute traffic. Given a list of server IP addresses, write a thread-safe class that returns the next server in line every time a request arrives.

**Solution:**
```csharp
public class RoundRobinBalancer
{
    private readonly List<string> _servers;
    private int _currentIndex = -1;
    private readonly object _lock = new object();

    public RoundRobinBalancer(List<string> servers)
    {
        if (servers == null || servers.Count == 0)
            throw new ArgumentException("Server list cannot be empty.");
        _servers = servers;
    }

    public string GetNextServer()
    {
        lock (_lock)
        {
            // Increment and use modulo to wrap around to 0
            _currentIndex = (_currentIndex + 1) % _servers.Count;
            return _servers[_currentIndex];
        }
    }
}
```

### Exercise 2: Configuration Practice
**Task:** Modify `Program.cs` to configure Kestrel to listen on all available IPs on port 8080 and set the maximum request body size to 10MB.

**Solution:**
```csharp
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(8080);
    options.Limits.MaxRequestBodySize = 10 * 1024 * 1024; // 10MB in bytes
});
```

## Review questions
1.  **True or False:** Kestrel is used when hosting ASP.NET Core "In-Process" in IIS.
2.  Which hosting model is the default for ASP.NET Core on IIS?
3.  What is the name of the IIS module required to host ASP.NET Core?
4.  If you are hosting on Linux using Nginx, is the app running In-Process or Out-of-Process?

### Answers to Review Questions
1.  **False.** In-Process hosting uses `IISHttpServer`, not Kestrel.
2.  **In-Process.**
3.  **AspNetCoreModuleV2 (ANCM).**
4.  **Out-of-Process.** Nginx acts as the proxy, and the app runs in its own process using Kestrel.

## Sources and limitations
*   **Sources:** This guide is based on Microsoft Learn documentation for "Host ASP.NET Core on Windows with IIS" and "Kestrel web server implementation."
*   **Limitations:** This guide focuses on IIS and Kestrel; it does not cover specific configurations for cloud-native proxies like Azure App Service (which uses a specialized version of this setup) or Kubernetes Ingress controllers.
*   **Uncertainty:** While In-Process is generally faster, the specific performance gap depends on the .NET version and the complexity of the request pipeline.
