<!-- Generated with gemini-3-flash-preview; automated review only; source and code verification pending. -->

Revised Markdown:

## Simple explanation

Imagine you are at a restaurant. You (the **Client**) want a pizza. You tell the waiter (the **Request**) what you want. The waiter goes to the kitchen (the **Server**). The kitchen makes the pizza and the waiter brings it back to you with a message like "Here is your food" (the **Response**).

**HTTP** (HyperText Transfer Protocol) is the set of rules for how the waiter and the kitchen talk to each other. It is **stateless**, which means the server "forgets" who you are as soon as the response is sent. To the server, every request is a brand-new interaction. To remember a user (like staying logged in), we have to use extra tools like **Cookies** or **Tokens**.

In **ASP.NET Core**, we build the "Kitchen." We write the logic that receives these requests, processes them (checks the database, calculates totals), and sends back the correct response.

## How it works

1.  **The Connection (TCP/IP):** Before HTTP can exchange data, a connection must be established. This happens via a **TCP Three-Way Handshake**, ensuring both the client and server are ready to talk without losing data.
2.  **The Request:** The client sends a formatted text message containing:
    *   **Verb (Method):** The action to perform. `GET` (read), `POST` (create), `PUT` (replace), `PATCH` (update), or `DELETE` (remove).
    *   **URL (Address):** The path to the resource (e.g., `/api/orders/123`).
    *   **Headers:** Metadata like `Accept: application/json` (I want JSON back) or `Authorization` (Here is my ID badge).
    *   **Body:** The actual data being sent (used in POST, PUT, and PATCH).
3.  **The Processing (ASP.NET Core Middleware):** The request enters the ASP.NET Core **Middleware Pipeline**. This is a sequence of code blocks that handle the request one by one. One piece might log the request, the next checks if you are authorized, and the final one (the Controller) executes your business logic.
4.  **The Response:** The server sends back:
    *   **Status Code:** A 3-digit number indicating the result (e.g., `200 OK`, `400 Bad Request`, `404 Not Found`, `500 Server Error`).
    *   **Headers:** Info about the response (e.g., `Content-Type: application/json`).
    *   **Body:** The data requested (the pizza).

## Examples

### A Raw HTTP Request
```http
GET /api/users/1 HTTP/1.1
Host: mysite.com
Accept: application/json
Authorization: Bearer [token_here]
```

### Sending a Request in C# (ASP.NET Core)
We use `IHttpClientFactory` to manage `HttpClient` instances efficiently.
```csharp
public class UserService
{
    private readonly HttpClient _httpClient;

    // HttpClient is injected via Dependency Injection
    public UserService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<string> GetUserDataAsync(int id)
    {
        // Sending a GET request
        var response = await _httpClient.GetAsync($"https://api.example.com/users/{id}");
        
        if (response.IsSuccessStatusCode)
        {
            // Read the body as a string
            return await response.Content.ReadAsStringAsync();
        }
        return $"Error: {response.StatusCode}";
    }
}
```

## Tradeoffs and comparisons

| Feature | HTTP/1.1 | HTTP/2 |
| :--- | :--- | :--- |
| **Speed** | Slower (Head-of-line blocking; one request at a time per connection). | Faster (Multiplexing; many requests over one connection). |
| **Format** | Text-based (Human-readable). | Binary (Machine-efficient). |
| **Headers** | Uncompressed (Redundant data). | Compressed (HPACK compression). |

| Method | GET | POST |
| :--- | :--- | :--- |
| **Purpose** | Retrieve data. | Create/Submit data. |
| **Visibility** | Data is in the URL (Visible in history/logs). | Data is in the Body (Not in URL). |
| **Security** | Less secure for sensitive data. | More secure, but **still requires HTTPS** to be encrypted. |
| **Idempotent** | Yes (Multiple identical requests have the same result). | No (Multiple requests may create multiple resources). |

**ASP.NET Core Tradeoff: Kestrel vs. IIS**
*   **Kestrel:** The default, high-performance, cross-platform web server. It is lightweight but lacks some advanced management features.
*   **IIS (Internet Information Services):** A robust Windows-only server. In production, IIS often acts as a **Reverse Proxy**, sitting in front of Kestrel to provide features like port sharing, security filtering, and certificate management.

## Interview questions and answers

**Q1: What is the difference between a 401 and a 403 status code?**
**Answer:** `401 Unauthorized` means the server doesn't know who you are (Authentication failed). `403 Forbidden` means the server knows who you are, but you do not have the required permissions for that resource (Authorization failed).

**Q2: What is "Middleware" in ASP.NET Core?**
**Answer:** Middleware is code assembled into an application pipeline to handle requests and responses. Each component can perform logic before and after the next component is called. Examples include Authentication, Routing, CORS, and Response Compression.

**Q3: Why should you use `IHttpClientFactory` instead of `new HttpClient()`?**
**Answer:** Manually disposing of `HttpClient` can leave sockets in a `TIME_WAIT` state, leading to **Socket Exhaustion**. Conversely, reusing a single static `HttpClient` indefinitely fails to react to DNS changes. `IHttpClientFactory` solves this by pooling the underlying `HttpMessageHandler` objects.

**Q4: What are "Idempotent" methods?**
**Answer:** An idempotent method is one where making the same request multiple times produces the same result on the server as making it once. `GET`, `PUT`, `DELETE`, `HEAD`, and `OPTIONS` are idempotent. `POST` is not.

## Exercises and solutions

### Exercise 1: The Middleware Logic
**Problem:** You want to measure how long every request takes to process in your ASP.NET Core app.
**Solution:** Create a custom Middleware and register it in `Program.cs`.

```csharp
// 1. The Middleware Class
public class TimingMiddleware
{
    private readonly RequestDelegate _next;

    public TimingMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        var watch = System.Diagnostics.Stopwatch.StartNew();
        
        // Call the next middleware in the pipeline
        await _next(context); 
        
        watch.Stop();
        Console.WriteLine($"Request to {context.Request.Path} took: {watch.ElapsedMilliseconds}ms");
    }
}

// 2. Registration (in Program.cs)
// app.UseMiddleware<TimingMiddleware>();
```

### Exercise 2: DSA - IP Address Validator
**Problem:** Write a function to check if a string is a valid IPv4 address (`x.x.x.x`). Each `x` must be 0-255, no leading zeros (unless the number is 0), and exactly 4 segments.

**C# Solution:**
```csharp
public bool IsValidIPv4(string ip) {
    if (string.IsNullOrWhiteSpace(ip)) return false;
    
    string[] parts = ip.Split('.');
    if (parts.Length != 4) return false;

    foreach (string segment in parts) {
        // Check length and non-numeric characters
        if (segment.Length == 0 || segment.Length > 3) return false;
        
        // Check leading zeros: "0" is okay, "01" is not
        if (segment.Length > 1 && segment[0] == '0') return false;

        // Check range
        if (!int.TryParse(segment, out int val)) return false;
        if (val < 0 || val > 255) return false;
    }
    return true;
}
```
*   **Complexity:** Time: $O(N)$ where $N$ is the length of the string. Space: $O(1)$ (the split array size is constant at 4).
*   **Edge Cases handled:** "192.168.1" (too short), "256.0.0.1" (out of range), "192.168.01.1" (leading zero).

## Review questions

1.  **Which HTTP status code range represents Server Errors?** (Answer: 5xx, e.g., 500 Internal Server Error).
2.  **Does a GET request usually have a body?** (Answer: No. While technically possible in some specs, it is widely discouraged and ignored by most servers).
3.  **What is the default web server used in ASP.NET Core templates?** (Answer: Kestrel).
4.  **In the OSI model, which layer does HTTP belong to?** (Answer: Layer 7 - Application Layer).

## Sources and limitations

*   **Sources:** Based on Microsoft Learn documentation for ASP.NET Core Fundamentals and RFC 9110 (HTTP Semantics).
*   **Limitations:** This guide focuses on HTTP/1.1 and HTTP/2. It does not cover **HTTP/3**, which runs on **QUIC** (UDP-based) to reduce connection latency.
*   **Uncertainty:** While `IHttpClientFactory` is the standard recommendation, extremely high-throughput microservices may require custom `SocketsHttpHandler` tuning for specific connection-pooling behaviors.
