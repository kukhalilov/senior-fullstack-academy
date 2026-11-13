<!-- Generated with gemini-3.5-flash-lite; automated review only; source and code verification pending. -->

## Simple explanation

Imagine you are at a restaurant. 

In traditional web applications (using standard HTTP requests), ordering food is like raising your hand, waiting for a waiter to walk over, asking for a burger, and the waiter walking away to the kitchen. If you want to know when your burger is ready, you have to keep raising your hand and asking, *"Is it ready yet?"* This is wasteful and slow.

**SignalR** is like having an open, dedicated walkie-talkie between you and the kitchen. The kitchen can talk to you the exact second your burger is ready without you having to ask. 

In computer terms, standard web traffic is **request-response** (the client always speaks first). SignalR enables **real-time bidirectional (two-way) communication**. The server can push data to the client instantly, and the client can push data to the server instantly.

Under the hood, SignalR manages the underlying network connection for you. It automatically chooses the best communication method available:
1. **WebSockets:** The modern gold standard. A single, persistent, two-way TCP (Transmission Control Protocol - a reliable network protocol) connection.
2. **Server-Sent Events (SSE):** A one-way channel where the server can push data to the browser over HTTP.
3. **Long Polling:** A fallback method where the client asks the server for data, and the server holds the request open until new data arrives.

---

## How it works

SignalR abstracts the complexity of real-time web communication into a simple concept: **Hubs**. A Hub is a high-level pipeline that allows a client and server to call methods on each other.

### End-to-End Behavior (Lifecycle)

1. **Negotiation (`/negotiate`):** 
   When a client (e.g., a browser) wants to connect to a SignalR hub, it first sends an HTTP POST request to the server's negotiate endpoint (SignalR uses a POST request for negotiation to exchange connection metadata securely). The server responds with connection details, a unique connection ID, and a list of available transport methods.
2. **Connection Establishment:**
   The client picks the best available transport (usually WebSockets) and opens a persistent connection.
3. **Invocation (Client to Server):**
   The client invokes a method on the Hub (e.g., `SendMessage("Hello")`). The message is serialized (usually into JSON - JavaScript Object Notation, a lightweight text format for data interchange) and sent over the wire.
4. **Invocation (Server to Client):**
   The server executes logic and pushes data back to the client by invoking a client-side method (e.g., `ReceiveMessage("Hello")`).
5. **Disconnection:**
   If the user closes the browser or loses internet, the connection drops. The server detects the timeout and fires clean-up events (`OnDisconnectedAsync`).

```
[Client Browser]                                 [ASP.NET Core Server]
       |                                                    |
       |--- 1. HTTP POST /negotiate ----------------------->|
       |<-- 2. Returns Connection ID & Transports ----------|
       |                                                    |
       |=== 3. WebSocket Handshake & Connection Opens =====>|
       |                                                    |
       |--- 4. Client invokes Hub method (SendMessage) ---->|
       |<-- 5. Server pushes update (ReceiveMessage) -------|
       |                                                    |
```

---

## Examples

### 1. Basic Server-Side Hub

This is an ASP.NET Core backend class that inherits from `Hub`.

```csharp
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

public class ChatHub : Hub
{
    // A method that clients can call
    public async Task SendMessage(string user, string message)
    {
        // Broadcast the message to ALL connected clients
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }
}
```

### 2. Registering SignalR in `Program.cs`

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add SignalR services to the dependency injection container
builder.Services.AddSignalR();

var app = builder.Build();

// Map the Hub to a URL endpoint
app.MapHub<ChatHub>("/chathub");

app.Run();
```

### 3. Client-Side JavaScript Usage

```javascript
// Ensure you have included the @microsoft/signalr client library
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/chathub")
    .withAutomaticReconnect()
    .build();

// Define a function that the server can call
connection.on("ReceiveMessage", (user, message) => {
    console.log(`${user}: ${message}`);
});

// Start the connection
async function start() {
    try {
        await connection.start();
        console.log("SignalR Connected.");
    } catch (err) {
        console.error(err);
        setTimeout(start, 5000); // Retry every 5 seconds
    }
}

start();

// Call a method on the server
document.getElementById("sendButton").addEventListener("click", () => {
    const user = document.getElementById("userInput").value;
    const message = document.getElementById("messageInput").value;
    
    connection.invoke("SendMessage", user, message)
        .catch(err => console.error(err.toString()));
});
```

### Common Misconceptions

* **Misconception:** SignalR is just WebSockets.
  * *Correction:* SignalR *uses* WebSockets when available, but it is a higher-level abstraction. It automatically falls back to Server-Sent Events or Long Polling if corporate firewalls or older browsers block WebSockets.
* **Misconception:** SignalR Hubs are singletons instantiated once for all users.
  * *Correction:* Hub instances are **transient**. A new instance of the `Hub` class is created for *every* incoming method call, meaning you cannot store user state inside instance fields of the Hub class. Use external stores (like a database or Redis) or `Context.ConnectionId` mappings for state.

---

## Tradeoffs and comparisons

| Feature / Metric | SignalR | Raw WebSockets | Server-Sent Events (SSE) | HTTP Polling |
| :--- | :--- | :--- | :--- | :--- |
| **Direction** | Bidirectional (Two-way) | Bidirectional (Two-way) | Server-to-Client only | Client-to-Server (per poll) |
| **Fallbacks** | Built-in (WebSocket, SSE, Polling) | None (WebSockets only) | None (SSE only) | None |
| **Ease of Use** | High (RPC abstraction) | Low (Manual frame parsing) | Medium (Native browser API) | High |
| **Scalability** | Requires Redis backplane for multiple servers | Requires custom sticky sessions / Redis | Requires custom state management | Extremely High (stateless) |
| **Overhead** | Low (over WebSockets) | Lowest | Low | Very High (repetitive headers) |

---

## Interview questions and answers

**Q1: How does SignalR scale across multiple server instances in a load-balanced environment?**
* **Answer:** By default, if User A is connected to Server 1 and User B is connected to Server 2, Server 1 cannot directly push a message to User B because it doesn't hold that WebSocket connection. To fix this, you use a **SignalR Backplane** (such as Redis). The backplane acts as a message broker. When Server 1 wants to broadcast a message, it publishes it to Redis, and all other servers subscribed to Redis receive the message and forward it to their locally connected clients.

**Q2: Why are Hub instances considered transient, and how do you maintain state for a connected user?**
* **Answer:** ASP.NET Core creates a new Hub class instance per method invocation to keep memory clean and prevent memory leaks. Because the instance is destroyed immediately after the method finishes, saving data in class-level variables will fail. Instead, you use `Context.ConnectionId` linked to an external storage mechanism, or utilize the `Hub`'s built-in `Groups` feature to track users.

**Q3: Explain what happens during a SignalR negotiation request and why it is necessary.**
* **Answer:** The negotiation request (`/negotiate`) is an initial HTTP POST made by the client before establishing a persistent connection. It queries the server to determine supported protocols, connection identifiers, and which transports are allowed/available. This allows the client and server to agree on the best connection method before upgrading to a permanent protocol like WebSockets.

---

## Exercises and solutions

### Exercise 1: Targeted Group Messaging
**Problem Statement:**
Modify the `ChatHub` class so that clients can join specific "Rooms". Add a method `JoinRoom(string roomName)` that adds the current connection to a SignalR group, and a method `SendMessageToRoom(string roomName, string user, string message)` that sends the message *only* to clients inside that specific room.

**Solution:**
```csharp
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

public class ChatHub : Hub
{
    public async Task JoinRoom(string roomName)
    {
        // Groups is a built-in feature of SignalR Hubs
        await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
        await Clients.Group(roomName).SendAsync("ReceiveMessage", "System", $"{Context.ConnectionId} joined {roomName}");
    }

    public async Task SendMessageToRoom(string roomName, string user, string message)
    {
        // Send only to clients in the specified group
        await Clients.Group(roomName).SendAsync("ReceiveMessage", user, message);
    }
}
```

---

## Review questions

1. What protocol does SignalR try to establish first when attempting to connect?
2. Can an HTTP POST request trigger a method on a SignalR Hub directly without the SignalR client library? (Hint: SignalR uses a specific Hub Protocol format over the transport).
3. If your web application scales to 3 servers behind an Azure Load Balancer, what component must you configure to ensure broadcasts reach *all* connected users?

---

## Sources and limitations

* *Limitations:* This guide covers ASP.NET Core SignalR. Older versions (such as .NET Framework ASP.NET SignalR) have structural architectural differences (e.g., scaleout providers, self-host options). 
* *Uncertainty Notice:* Internal wire protocols and client SDK signatures may evolve across minor .NET updates; always reference official Microsoft documentation for version-specific namespace modifications.
