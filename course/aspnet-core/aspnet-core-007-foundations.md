<!-- Generated with gemini-3.1-flash-lite; automated review only; source and code verification pending. -->

Here is the revised and corrected documentation. I have improved the technical accuracy regarding transport negotiation, clarified the scaling requirements, and refined the terminology.

## Simple explanation

SignalR is a library for ASP.NET Core that simplifies adding "real-time" web functionality to your applications. 

In a standard web request, the **client** (browser) initiates a request, and the **server** sends a response. Once the response is sent, the connection closes. If the data changes on the server, the client remains unaware until it initiates another request. SignalR changes this by maintaining a persistent connection, allowing the server to "push" content to connected clients the moment an event occurs. This is ideal for chat apps, live dashboards, or collaborative tools where low-latency updates are required.

## How it works

SignalR uses **Hubs** as a high-level abstraction to facilitate communication between client and server.

1.  **Connection:** The client initiates a handshake with the server to establish a persistent connection.
2.  **Transport Negotiation:** SignalR automatically selects the best available transport method based on the client's and server's capabilities:
    *   **WebSockets:** The preferred method. It provides a full-duplex, persistent connection.
    *   **Server-Sent Events (SSE):** Allows the server to push data to the browser over a single HTTP connection.
    *   **Long Polling:** The fallback. The client requests data; the server holds the request open until data is available or a timeout occurs, then the client immediately initiates a new request.
3.  **Invocation:** Once connected, the client can invoke methods on the Hub, and the Hub can invoke methods on specific clients, groups of clients, or all connected clients.

## Examples

**Server-side (Hub):**
```csharp
public class ChatHub : Hub
{
    // Clients call this method via the connection.invoke()
    public async Task SendMessage(string user, string message)
    {
        // Server pushes this to all connected clients
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }
}
```

**Client-side (JavaScript):**
```javascript
const connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

// Listen for messages from the server
connection.on("ReceiveMessage", (user, message) => {
    console.log(`${user} says: ${message}`);
});

// Start connection and send a message
connection.start().then(() => {
    connection.invoke("SendMessage", "Alice", "Hello!");
});
```

## Tradeoffs and comparisons

| Feature | SignalR | REST API |
| :--- | :--- | :--- |
| **Direction** | Two-way (Full Duplex) | One-way (Request/Response) |
| **Connection** | Persistent | Short-lived |
| **Overhead** | Low (after handshake) | Higher (headers per request) |
| **Complexity** | Higher (stateful) | Lower (stateless) |

**Tradeoffs:**
*   **Pros:** Real-time responsiveness, automatic transport fallback, simplified RPC-style API.
*   **Cons:** Increased server memory usage (must track active connections), requires sticky sessions or a backplane for horizontal scaling.

## Interview questions and answers

**Q: What happens if WebSockets are not supported by the client's environment?**
A: SignalR performs "Transport Negotiation." If WebSockets are unavailable, it automatically falls back to Server-Sent Events, and finally to Long Polling. This process is transparent to the developer.

**Q: How do you scale SignalR across multiple servers?**
A: Because connections are stateful, a client connected to Server A cannot receive a message broadcast from Server B. You must use a "Backplane" (such as Redis, Azure SignalR Service, or SQL Server) to synchronize messages across all server instances.

**Q: Is SignalR stateless?**
A: No. SignalR is stateful. The server must maintain a registry of active `ConnectionIDs` to route messages correctly.

## Exercises and solutions

**Exercise:** Create a "Notification Hub" that sends a message to all clients when a specific button is clicked on the server.

**Solution:**
1. Inject `IHubContext<NotificationHub>` into your controller via dependency injection.
2. In the controller action: 
   ```csharp
   await _hubContext.Clients.All.SendAsync("Notify", "System update!");
   ```
3. Client-side: 
   ```javascript
   connection.on("Notify", (msg) => alert(msg));
   ```

**DSA Problem (Connection Management):**
*Problem:* You have a list of `ConnectionIDs`. Write a C# method to remove a connection from a `HashSet<string>` and return true if it existed.
*Complexity:* O(1) average time complexity.

```csharp
public bool Disconnect(HashSet<string> activeConnections, string connectionId)
{
    return activeConnections.Remove(connectionId);
}
```

## Review questions

1. What is the primary advantage of WebSockets over Long Polling? (Answer: WebSockets provide a true full-duplex, low-latency connection without the overhead of repeated HTTP headers).
2. Why is a "Backplane" necessary in a load-balanced environment? (Answer: To ensure that a message broadcast from one server instance reaches clients connected to other instances).
3. Can a client call a method on another client directly? (Answer: No, the server acts as the intermediary/broker for all communication).

## Sources and limitations

*   **Sources:** Based on official Microsoft ASP.NET Core SignalR documentation.
*   **Limitations:** This guide covers foundational concepts. It does not cover advanced topics like Authentication/Authorization, Message Groups, or specific Backplane configurations (e.g., Redis setup).
*   **Performance:** SignalR performance is highly dependent on network stability and server memory. For massive scale, consider the managed Azure SignalR Service to offload connection management.
