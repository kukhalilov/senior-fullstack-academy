<!-- Generated with gemini-3.1-flash-lite; automated review only; source and code verification pending. -->

Here is the revised documentation. I have corrected the technical inaccuracies regarding the "Negotiation" process, clarified the scalability section, and refined the code examples for better accuracy.

---

## Simple explanation

SignalR is a library for ASP.NET Core that enables real-time web functionality. It allows server-side code to push content to connected clients instantly, rather than waiting for the client to request it.

Normally, web communication follows a "Request-Response" model: the client asks for data, and the server replies. If the data changes on the server, the client remains unaware until it polls again. SignalR maintains a persistent connection, allowing the server to "push" data the moment an event occurs.

**Technical Terms:**
*   **Persistent Connection:** A long-lived connection that allows bidirectional data flow.
*   **Hub:** A high-level pipeline that allows the client and server to call methods on each other by name and parameters.
*   **Client:** The browser or application (e.g., .NET, Java, Python) receiving the data.
*   **Server:** The ASP.NET Core backend hosting the SignalR Hub.

---

## How it works

SignalR uses a process called **Negotiation**. When a client initiates a connection, it performs an HTTP POST request to the server to determine the best transport protocol supported by both parties.

1.  **WebSockets:** The most efficient method. It provides a full-duplex (two-way) connection over a single TCP socket.
2.  **Server-Sent Events (SSE):** Allows the server to push data to the browser automatically. (Note: Not supported by Internet Explorer).
3.  **Long Polling:** The fallback. The client requests data, and the server holds the request open until new data is available. If no data arrives, the server closes the request, and the client immediately opens a new one.

SignalR automatically negotiates the best available transport, starting with WebSockets and falling back to others if necessary.

---

## Examples

### 1. Server-side Hub
Create a class that inherits from `Hub`. This defines the methods clients can invoke.

```csharp
using Microsoft.AspNetCore.SignalR;

public class ChatHub : Hub
{
    // Clients call this method via the SignalR connection
    public async Task SendMessage(string user, string message)
    {
        // Broadcasts the message to all connected clients
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }
}
```

### 2. Client-side (JavaScript)
```javascript
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/chatHub")
    .withAutomaticReconnect() // Built-in resilience
    .build();

connection.on("ReceiveMessage", (user, message) => {
    console.log(`${user} says: ${message}`);
});

connection.start().catch(err => console.error(err));
```

---

## Tradeoffs and comparisons

| Feature | SignalR | WebSockets (Raw) | Polling (Standard HTTP) |
| :--- | :--- | :--- | :--- |
| **Ease of Use** | High (Handles fallbacks) | Low (Manual management) | Very High |
| **Performance** | High | Highest | Low (High overhead) |
| **Scalability** | Needs Backplane | Difficult to scale | Easy |
| **Complexity** | Low | High | Low |

**Tradeoff:** SignalR abstracts away the complexity of connection management and protocol fallbacks, making it significantly easier to maintain than raw WebSockets, though it introduces a small abstraction layer overhead.

---

## Interview questions and answers

**Q: What happens if a client loses internet connection while using SignalR?**
A: If configured with `.withAutomaticReconnect()`, the client will attempt to reconnect using an exponential backoff strategy. If the connection is lost for too long, the connection state is dropped, and the client must re-initialize.

**Q: Can SignalR work across multiple servers?**
A: By default, SignalR connections are local to the server process. If you have a load-balanced environment, a client connected to Server A cannot receive a message sent from Server B. You must use a **Backplane** (e.g., Redis, Azure SignalR Service, or SQL Server) to synchronize messages across all server instances.

**Q: When should you NOT use SignalR?**
A: Avoid SignalR for high-frequency, low-latency data streams (e.g., high-frequency trading or real-time gaming with sub-millisecond requirements) where the overhead of the Hub protocol is prohibitive. Also, avoid it for simple, infrequent data fetching where standard REST/GraphQL is sufficient.

---

## Exercises and solutions

### Exercise 1: Create a Notification Hub
**Task:** Create a Hub that sends a "Welcome" message to a user when they connect.

**Solution:**
```csharp
public override async Task OnConnectedAsync()
{
    // Clients.Caller targets only the user who just connected
    await Clients.Caller.SendAsync("ReceiveMessage", "System", "Welcome to the server!");
    await base.OnConnectedAsync();
}
```

### Exercise 2: DSA Challenge - Message Queueing
**Problem:** You have a list of messages arriving at different times. You need to process them in the order they arrive (FIFO). Use a `ConcurrentQueue<string>` to ensure thread safety in a multi-threaded server environment.

**Solution:**
```csharp
using System.Collections.Concurrent;

public class MessageHub : Hub {
    private static ConcurrentQueue<string> _queue = new ConcurrentQueue<string>();

    public void AddMessage(string msg) => _queue.Enqueue(msg);

    public async Task BroadcastNext() {
        if(_queue.TryDequeue(out var msg))
            await Clients.All.SendAsync("Receive", msg);
    }
}
```

---

## Review questions

1.  What is the primary purpose of the "Negotiation" phase in SignalR?
2.  Why is a "Backplane" required in a multi-server environment?
3.  What is the difference between `Clients.All` and `Clients.Caller`?
4.  If WebSockets are blocked by a firewall, what does SignalR do?

---

## Sources and limitations

*   **Sources:** Content synthesized from official Microsoft ASP.NET Core SignalR documentation and architectural best practices.
*   **Limitations:** This guide assumes basic C# and ASP.NET Core knowledge. It does not cover advanced topics like custom MessagePack protocols, authentication/authorization (JWT/Cookies), or specific Azure SignalR Service pricing tiers.
*   **Uncertainty:** Performance benchmarks are highly dependent on network topology and server resources; specific throughput numbers are omitted as they vary by implementation.
