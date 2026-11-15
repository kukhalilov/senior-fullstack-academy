<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# streams file system serialization sockets and HTTP clients — Exercises and worked solutions

## Goals

Practice safe bounded I/O across files, streams, JSON, and HTTP. For each problem, identify the protocol/data contract, resource owner, maximum size, cancellation path, and failure behavior before writing code. Consult the official [stream I/O guide](https://learn.microsoft.com/en-us/dotnet/standard/io/), [JSON guide](https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/overview), and [HttpClient guidance](https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/http/httpclient-guidelines).

## Worked example

### Read a length-prefixed frame safely

Suppose a protocol uses a 4-byte little-endian length followed by that many payload bytes. A safe reader must read the fixed header exactly, reject negative or excessive lengths before allocating, then read the body exactly.

```csharp
using System;
using System.Buffers.Binary;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

static async Task<byte[]> ReadFrameAsync(Stream stream, int maximumLength, CancellationToken token)
{
    byte[] header = new byte[sizeof(int)];
    await stream.ReadExactlyAsync(header, token);
    int length = BinaryPrimitives.ReadInt32LittleEndian(header);
    if (length < 0 || length > maximumLength)
        throw new InvalidDataException("Invalid frame length.");

    byte[] payload = new byte[length];
    await stream.ReadExactlyAsync(payload, token);
    return payload;
}
```

The wire format explicitly defines byte order and a maximum. Exact reads handle partial TCP delivery. EOF during the header/body throws. In a server, also enforce an overall deadline and consider pooling for large frames only after measuring.

## Exercises

### Exercise 1: Replace a fragile TCP read

An application calls `await networkStream.ReadAsync(buffer)` once and then parses the entire array as a message. Explain why this fails and propose a framing strategy and a read loop.

### Exercise 2: Stream an HTTP response under a hard limit

Download an unknown-length response to a destination stream. It must not buffer the whole response and must stop after 5 MiB. Include status handling, cancellation, response disposal, and cleanup.

### Exercise 3: Secure a file path

A user supplies a file name below an upload directory. Explain why `Path.Combine(root, input)` plus `File.Exists` is unsafe. Give defenses for traversal, rooted components, symbolic links, and the check/open race.

### Exercise 4: Fix a JSON DOM lifetime bug

```csharp
JsonElement element;
using (JsonDocument doc = JsonDocument.Parse(json))
    element = doc.RootElement.GetProperty("name");
Console.WriteLine(element.GetString());
```

Explain the bug and repair it. Then explain when source generation is a better serializer contract.

### Exercise 5: Protect a compressed import

An import endpoint accepts gzip JSON and decompresses it before parsing. Name at least five limits or validation steps needed to resist resource exhaustion and unsafe data.

### Exercise 6: Select an HttpClient lifetime

Compare one `HttpClient` per request, a long-lived client with `PooledConnectionLifetime`, and `IHttpClientFactory`. Give a suitable scenario for each recommended pattern.

## Progressive hints

1. TCP has no message boundaries; consider a length prefix or a delimiter with escaping and a maximum size.
2. Use `ResponseHeadersRead`; increment cumulative bytes after every read and dispose the response on all paths.
3. A later path component can be rooted; links can escape a lexical root; state can change after checking.
4. `JsonElement` borrows lifetime from its document; `Clone` detaches it.
5. Bound compressed bytes, decompressed bytes, nesting/depth, processing time, collection sizes, and accepted schema.
6. Handler connection pools are the key; a client object is cheap, creating a new handler/connection pool for every request is not.

## Complete solutions

### Solution 1

One `ReadAsync` can return fewer bytes than requested, and the network stream provides a byte stream rather than application messages. The parser may consume an incomplete message, leave bytes for the next one, or treat a partial frame as complete. Add explicit framing: a fixed-size length header, a delimiter with escaping, or another protocol-defined scheme. Read the header with `ReadExactlyAsync`, validate its length against a maximum before allocation, and then read the payload exactly. For streaming parsers, accumulate bytes and parse complete frames while preserving any trailing partial frame. Pass cancellation and time limits.

### Solution 2

```csharp
using System;
using System.IO;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

static async Task CopyLimitedAsync(HttpClient client, Uri uri, Stream destination, CancellationToken token)
{
    const long maximum = 5 * 1024 * 1024;
    using var request = new HttpRequestMessage(HttpMethod.Get, uri);
    using HttpResponseMessage response = await client.SendAsync(
        request, HttpCompletionOption.ResponseHeadersRead, token);
    response.EnsureSuccessStatusCode();

    await using Stream source = await response.Content.ReadAsStreamAsync(token);
    byte[] buffer = new byte[8192];
    long total = 0;
    while (true)
    {
        int read = await source.ReadAsync(buffer, token);
        if (read == 0) return;
        if (read > maximum - total)
            throw new InvalidDataException("Response exceeds 5 MiB.");
        total += read;
        await destination.WriteAsync(buffer.AsMemory(0, read), token);
    }
}
```

The subtraction-style check avoids overflow when adding a large read count. The caller owns `destination`; this method does not dispose it. Use a reused/factory-managed `HttpClient`. The cancellation token should represent the overall operation deadline; the response and source stream are disposed even on failure.

### Solution 3

`Path.Combine` can allow a rooted second component to replace the root. Lexical `..` traversal can escape, and a symbolic link inside the root can point elsewhere. `File.Exists` is only a transient observation and creates a TOCTOU window. Reject rooted/fully qualified user components, compute and check a canonical relative path, use restrictive directory permissions and safe create modes, and avoid check-then-open. For a strong adversarial threat model, use platform-supported handle-relative/open mechanisms that prevent link traversal and operate on the opened handle; lexical checks alone do not solve link races.

### Solution 4

`JsonElement` refers to storage owned by `JsonDocument`; disposing the document invalidates the element. Clone before disposal:

```csharp
using System.Text.Json;

JsonElement element;
using (JsonDocument doc = JsonDocument.Parse(json))
    element = doc.RootElement.GetProperty("name").Clone();

Console.WriteLine(element.GetString());
```

For a known stable model set, source generation makes metadata visible at build time, can reduce reflection work, and supports trimming/AOT analysis. It also makes the serialization contract explicit. DOM remains useful for genuinely dynamic JSON shapes.

### Solution 5

Limit compressed request bytes before decompression; limit decompressed bytes while reading; set parser max depth; cap collection counts and string sizes; enforce request time/cancellation and concurrency limits; reject unexpected content encodings/types; validate the JSON schema and domain invariants; avoid arbitrary polymorphic type activation; and ensure temporary files/buffers are bounded and cleaned up. A small compressed input can expand dramatically.

### Solution 6

Creating a new client and handler per request risks connection churn and socket exhaustion. A long-lived `HttpClient` with finite `SocketsHttpHandler.PooledConnectionLifetime` suits a stable application client that needs eventual DNS refresh. `IHttpClientFactory` suits DI applications needing named/typed clients, centralized policies, and managed handler rotation. Factory-created clients are lightweight/short-lived, while handlers are pooled. Avoid capturing a typed client in a singleton in a way that defeats expected configuration/lifetime behavior.

## Tests and edge cases

- For Exercise 1, feed the frame one byte at a time, include multiple frames in one network chunk, truncate header/body, and test a negative/oversized length.
- For Exercise 2, test missing/incorrect `Content-Length`, exactly 5 MiB, one byte over, cancellation mid-stream, destination failure, and non-2xx response.
- For Exercise 3, test `..`, rooted paths, alternate separators, symlink targets outside the root, case differences, and concurrent replacement.
- For Exercise 4, test missing/wrong-kind `name`, JSON null, malformed input, and use after document disposal.
- For Exercise 5, test compression expansion, deeply nested JSON, huge arrays/strings, slow input, and cancellation.
- For Exercise 6, test DNS changes and connection rotation, handler disposal, retries with non-replayable content, and application deadlines.

## Reflection questions

1. Which layer owns the stream/response and when does the lease end?
2. What is the exact message boundary and maximum accepted size?
3. Does cancellation stop every operation, including body reads and writes?
4. Which platform filesystem assumptions does the path check make?
5. What data-contract version and unknown-field behavior does the serializer enforce?
