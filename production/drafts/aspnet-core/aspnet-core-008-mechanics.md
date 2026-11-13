## Simple explanation

Imagine you run a restaurant. Customers place orders at the front (this is your web application handling incoming HTTP requests). But behind the kitchen doors, you also need people chopping vegetables, washing dishes, and managing inventory. These background tasks happen out of sight, without keeping the customers waiting at the register.

In ASP.NET Core, **Background Services** are your kitchen staff. They are C# classes that run continuously in the background, independent of any web request. They handle tasks like cleaning up old database records every night, sending batch emails, or processing queues of items.

**Resilient HTTP Clients** are your delivery drivers. When your restaurant needs to order supplies from a farm miles away (calling an external API), traffic jams, flat tires, or closed roads might happen. A normal driver gives up at the first roadblock and comes home. A *resilient* driver knows to take a detour, wait five minutes for a bridge to open, or try again later. In .NET, we use **Polly** combined with **`IHttpClientFactory`** to give our HTTP requests "smart retry" behavior.

---

## How it works

### Background Services Mechanics
ASP.NET Core applications run inside a host (`IHost` or `IWebHost`). The host manages the lifecycle of the application—starting it up, running it, and shutting it down gracefully.

1. **`IHostedService`**: The base interface for anything that runs with the host. It has two methods: `StartAsync` (called when the app starts) and `StopAsync` (called when the app shuts down).
2. **`BackgroundService`**: An abstract class that implements `IHostedService` to make our lives easier. It forces you to implement one method: `ExecuteAsync(CancellationToken stoppingToken)`.
3. **The Cancellation Token**: Because background services often run in infinite loops (`while (!stoppingToken.IsCancellationRequested)`), ASP.NET Core passes a `CancellationToken` to `ExecuteAsync`. When the application shuts down, it triggers this token. Your service must notice this signal and stop running gracefully, rather than being killed forcefully.

### Resilient HTTP Clients Mechanics
When an app makes an HTTP call using a standard `HttpClient`, several bad things can happen: DNS failures, temporary server outages, or rate-limiting (HTTP 429 Too Many Requests). 

To fix this, .NET uses a pipeline approach:
1. **`IHttpClientFactory`**: Manages the creation and disposal of `HttpClient` instances behind the scenes to prevent socket exhaustion (a bug where an app runs out of network ports).
2. **Polly**: A fault-handling library. It lets you define "policies" (like Retry, Circuit Breaker, Timeout) and wrap them around your HTTP client.
3. **The Circuit Breaker**: Imagine an electrical circuit breaker in your house. If too many appliances draw power, it trips to prevent a fire. Similarly, if an external API fails 50% of the time over 10 seconds, a Circuit Breaker "trips" and stops sending requests to that API for a short cooling-off period, preventing your app from wasting resources on a dead service.

---

## Examples

### 1. Implementing a Background Service
Here is a background service that simulates checking a database queue every 5 seconds.

```csharp
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

public class QueueProcessorService : BackgroundService
{
    private readonly ILogger<QueueProcessorService> _logger;

    public QueueProcessorService(ILogger<QueueProcessorService> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Queue Processor Service is starting.");

        // Loop runs until the application is shutting down
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Checking queue for new items...");
            
            try
            {
                // Simulate processing work
                await Task.Delay(2000, stoppingToken); 
            }
            catch (OperationCanceledException)
            {
                // Task.Delay throws this when stoppingToken is triggered. 
                // This is normal during shutdown; we break out of the loop.
                break;
            }

            // Wait 5 seconds before checking again
            try
            {
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }

        _logger.LogInformation("Queue Processor Service has stopped.");
    }
}
```

*Registration in `Program.cs`:*
```csharp
builder.Services.AddHostedService<QueueProcessorService>();
```

### 2. Implementing a Resilient HTTP Client with Polly
Here is how to configure an HTTP client that retries 3 times if it receives a 500 Internal Server Error.

```csharp
using Polly;
using Polly.Extensions.Http;

// In Program.cs
builder.Services.AddHttpClient<IExternalApiService, ExternalApiService>()
    .AddPolicyHandler(GetRetryPolicy());

static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
{
    // Retry 3 times, waiting 2 seconds, then 4 seconds, then 8 seconds (Exponential backoff)
    return HttpPolicyExtensions
        .HandleTransientHttpError() // Handles 5xx errors and network failures
        .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
}
```

---

## Tradeoffs and comparisons

| Mechanism | Primary Benefit | Main Risk / Downside | When to Use |
| :--- | :--- | :--- | :--- |
| **Background Service** (`BackgroundService`) | Runs code continuously without user requests. | If it throws an unhandled exception, it can crash the app (depending on configuration) or stop running silently. | Processing queues, scheduled maintenance, periodic data synchronization. |
| **Resilient HTTP Client** (Polly + `IHttpClientFactory`) | Recovers automatically from temporary network failures. | Can hide persistent upstream outages, causing longer response times as requests hang while retrying. | Calling third-party APIs, microservices communication. |
| **Alternative: Azure Functions / Hangfire** | Scalable, persistent across server restarts, advanced UI dashboards. | Introduces external infrastructure dependencies and costs. | Complex, long-running workflows that must survive server crashes. |

---

## Interview questions and answers

**1. Question:** What happens if an unhandled exception occurs inside a `BackgroundService.ExecuteAsync` method?
**Answer:** By default, if an unhandled exception is thrown inside `ExecuteAsync` and bubbles up, the exception is logged, but **the ASP.NET Core application continues running**. However, your background service will be dead and stop processing. To change this behavior so that the entire application crashes (fail-fast principle), you can configure host options or use third-party tools like Generic Host lifetime events.

**2. Question:** Why should you use `IHttpClientFactory` instead of using `new HttpClient()` directly inside your code?
**Answer:** Creating `HttpClient` manually with `new` can lead to a socket exhaustion problem. Even when disposed, `HttpClient` holds onto network sockets under the surface for a few minutes, which can exhaust the operating system's available ports under high load. `IHttpClientFactory` pools and manages the lifetime of the underlying handlers safely.

**3. Question:** What is the difference between a Retry Policy and a Circuit Breaker Policy?
**Answer:** A **Retry Policy** immediately tries the operation again, assuming the failure was a temporary glitch (like a brief network hiccup). A **Circuit Breaker Policy** monitors failures over a sliding time window. If too many failures occur, it "trips" and fails fast *without* hitting the external service, giving that service time to recover.

---

## Exercises and solutions

### Exercise 1: Background Service Graceful Shutdown
**Problem:** Write a background service that processes mock database rows one by one in a `while` loop. Ensure that if the application shuts down mid-processing, the current row finishes processing before the service exits.

**Solution:**
```csharp
public class SafeWorkerService : BackgroundService
{
    private readonly ILogger<SafeWorkerService> _logger;

    public SafeWorkerService(ILogger<SafeWorkerService> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Processing a batch of work...");

            // Simulate work that takes 3 seconds and ignores the stopping token 
            // to ensure it finishes its current unit of work.
            try
            {
                await Task.Delay(3000, CancellationToken.None); 
                _logger.LogInformation("Batch processed successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing batch.");
            }

            // Now check if we should stop before starting the next loop
            if (stoppingToken.IsCancellationRequested) break;

            await Task.Delay(2000, stoppingToken);
        }
    }
}
```

### Exercise 2: DSA Problem — Rate-Limiter Token Bucket
*Context: Background services often process items from queues. To avoid overwhelming external APIs, we must throttle our processing speed using a Rate Limiter pattern.*

**Problem Statement:**
Implement a thread-safe token bucket rate limiter in C# that allows a maximum of $C$ tokens and refills tokens at a rate of $R$ tokens per second. Write a method `bool TryTakeToken()` that returns `true` if a token was successfully acquired, and `false` otherwise.

**Progressive Hints:**
1. **Hint 1:** You need to track two things: the current number of tokens and the timestamp of the last refill.
2. **Hint 2:** Calculate how much time has passed since the last check, multiply it by the refill rate ($R$), and add those new tokens to the bucket, capped at the maximum capacity ($C$).
3. **Hint 3:** Because background services or concurrent requests might call `TryTakeToken` simultaneously, you must use a synchronization mechanism like `lock` or `SemaphoreSlim` to prevent race conditions.

**Working C# Solution:**
```csharp
using System;

public class TokenBucketRateLimiter
{
    private readonly int _capacity;
    private readonly double _fillRatePerSecond;
    private double _tokens;
    private DateTime _lastRefillTime;
    private readonly object _lock = new();

    public TokenBucketRateLimiter(int capacity, double fillRatePerSecond)
    {
        _capacity = capacity;
        _fillRatePerSecond = fillRatePerSecond;
        _tokens = capacity;
        _lastRefillTime = DateTime.UtcNow;
    }

    public bool TryTakeToken()
    {
        lock (_lock)
        {
            Refill();

            if (_tokens >= 1.0)
            {
                _tokens -= 1.0;
                return true;
            }

            return false;
        }
    }

    private void Refill()
    {
        DateTime now = DateTime.UtcNow;
        double elapsedSeconds = (now - _lastRefillTime).TotalSeconds;
        _lastRefillTime = now;

        // Calculate tokens to add based on elapsed time
        double tokensToAdd = elapsedSeconds * _fillRatePerSecond;
        
        // Update token count, cannot exceed capacity
        _tokens = Math.Min(_capacity, _tokens + tokensToAdd);
    }
}
```

**Example Usage:**
```csharp
var limiter = new TokenBucketRateLimiter(capacity: 5, fillRatePerSecond: 1); // 5 max, 1 per second
bool success = limiter.TryTakeToken(); 
Console.WriteLine(success); // True
```

**Edge Cases Handled:**
* **Time Jumps:** If the system clock shifts backwards or jumps, `elapsedSeconds` could theoretically be negative. A robust implementation might guard against negative time, though `DateTime.UtcNow` is generally monotonic enough for simple use cases.
* **Burst Traffic:** The bucket allows bursting up to the maximum capacity ($C$) instantly if it has been sitting idle.

**Complexity Analysis:**
* **Time Complexity:** $O(1)$ for every call to `TryTakeToken()`, as it only involves basic arithmetic and comparisons.
* **Space Complexity:** $O(1)$ since it only stores a few primitive state variables.

---

## Review questions

1. What interface does `BackgroundService` implement under the hood?
2. Why is passing `CancellationToken` into asynchronous methods inside a background service important?
3. What is socket exhaustion, and which ASP.NET Core mechanism prevents it?
4. When should you choose a Circuit Breaker over a simple Retry policy?

---

## Sources and limitations

*Note: This material is synthesized from standard Microsoft documentation concepts regarding ASP.NET Core Hosting (`IHostedService`, `BackgroundService`), `IHttpClientFactory`, and Polly fault-handling patterns as of .NET 6/7/8. External link validations cannot be performed locally; refer to official Microsoft Learn documentation for real-time API reference updates.*