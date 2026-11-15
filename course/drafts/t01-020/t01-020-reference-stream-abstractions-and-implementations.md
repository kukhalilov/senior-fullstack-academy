<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# streams file system serialization sockets and HTTP clients — Reference: Stream capabilities, memory and file streams, wrappers, readers, writers, and async I/O

# Scope and version

This reference covers all 100 names in `stream-abstractions-and-implementations` for .NET 11. Stream operations move bytes; framing, encoding, ownership, and resource bounds remain separate. Sources: [.NET I/O overview](https://learn.microsoft.com/en-us/dotnet/standard/io/) and [`Stream` API](https://learn.microsoft.com/en-us/dotnet/api/system.io.stream).

# How this group fits the mental model

Streams abstract ordered bytes behind capability flags. Implementations differ: files may seek, memory streams buffer, network streams usually do not seek, pipes connect processes, and wrappers add buffering or text/binary interpretation. Reads can be partial; fixed-size protocols need exact/minimum reads. Readers/writers own underlying streams by default unless configured to leave them open.

# Supplied names explained

| Supplied name | Meaning and important behavior |
|---|---|
| `Stream` | Abstract byte source/sink with read, write, seek, flush, and disposal operations; not every capability is supported. |
| `Stream.CanRead` | Reports read capability; false means read operations are unsupported. |
| `Stream.CanWrite` | Reports write capability; false means write operations are unsupported. |
| `Stream.CanSeek` | Reports whether `Length`, `Position`, and seeking are supported; network streams commonly return false. |
| `Stream.Length` | Total length when known and supported; may throw on non-seekable streams. |
| `Stream.Position` | Current cursor for seekable streams; changing it is not meaningful for all streams. |
| `Stream.Read(Byte[],Int32,Int32)` | Reads up to count bytes into an array slice and returns actual bytes read; can return fewer than requested or zero at EOF. |
| `Stream.Read(Span<Byte>)` | Synchronous span-based read without requiring an intermediate array; may be partial. |
| `Stream.ReadAsync(Memory<Byte>,CancellationToken)` | Asynchronously reads into memory and returns actual count; cancellation is cooperative and reads may be partial. |
| `Stream.ReadExactly(Span<Byte>)` | Fills the buffer or throws `EndOfStreamException` if the stream ends first. |
| `Stream.ReadExactlyAsync(Memory<Byte>,CancellationToken)` | Async exact-read counterpart; cancellation and premature EOF are distinct outcomes. |
| `Stream.ReadAtLeast(Span<Byte>,Int32,Boolean)` | Reads until minimum count, buffer full, or EOF; Boolean controls throwing on EOF before the minimum. |
| `Stream.ReadAtLeastAsync(Memory<Byte>,Int32,Boolean,CancellationToken)` | Async minimum-read counterpart; validate the requested minimum against the buffer and pass cancellation. |
| `Stream.Write(Byte[],Int32,Int32)` | Writes the specified byte-array range; successful return does not guarantee durable disk persistence. |
| `Stream.Write(ReadOnlySpan<Byte>)` | Synchronously writes all bytes in the span according to the stream contract. |
| `Stream.WriteAsync(ReadOnlyMemory<Byte>,CancellationToken)` | Asynchronously writes memory; await completion before reusing or returning backing storage. |
| `Stream.WriteByte(Byte)` | Writes one byte; repeated calls may be inefficient versus buffered/bulk writes. |
| `Stream.ReadByte()` | Reads one byte or returns -1 at EOF; repeated single-byte reads can be inefficient. |
| `Stream.CopyTo(Stream)` | Copies until source EOF using a buffer; does not impose a maximum byte count or preserve application framing. |
| `Stream.CopyToAsync(Stream,CancellationToken)` | Async copy until EOF; destination ownership is not transferred and size limits remain caller responsibility. |
| `Stream.Flush()` | Pushes buffered data toward the next layer; disk durability may require stronger OS-specific handling. |
| `Stream.FlushAsync(CancellationToken)` | Async flush with cancellation where supported; flush is not equivalent to durable commit. |
| `Stream.Seek(Int64,SeekOrigin)` | Changes cursor for seekable streams; origin is beginning/current/end. |
| `Stream.SetLength(Int64)` | Changes length for writable seekable streams; may extend/truncate and alter position semantics. |
| `Stream.Dispose()` | Releases stream resources and usually makes subsequent use invalid. |
| `Stream.DisposeAsync()` | Asynchronously releases resources when implementation supports asynchronous cleanup. |
| `Stream.Close()` | Closes/disposes the stream; prefer `Dispose`/`using` in modern code. |
| `Stream.Synchronized(Stream)` | Returns a wrapper synchronizing access to the stream's operations; it does not make a multi-call protocol transaction safe or guarantee async ordering. |
| `Stream.Null` | Sink/source stream that discards writes and returns EOF on reads; useful for optional output. |
| `FileStream` | Stream over a file handle with file access/share/mode semantics. |
| `FileStreamOptions` | Groups options for opening/creating a file stream, including access, mode, buffering, and OS-specific flags. |
| `FileStreamOptions.Access` | Selects read/write capabilities requested from the file. |
| `FileStreamOptions.Mode` | Selects create/open/truncate/append behavior; choose deliberately to avoid accidental data loss. |
| `FileStreamOptions.Share` | Controls sharing with other opens, including read/write/delete access. |
| `FileStreamOptions.Options` | Supplies `FileOptions` such as asynchronous, sequential/random access, write-through, or delete-on-close. |
| `FileStreamOptions.BufferSize` | Buffering preference; zero/default behavior and performance vary by runtime/platform. |
| `FileStreamOptions.PreallocationSize` | Requests preallocation of file space where supported; it is not a file length guarantee. |
| `FileStreamOptions.UnixCreateMode` | Unix permission mode for file creation on supported platforms; respect umask and platform semantics. |
| `FileStream.SafeFileHandle` | Exposes the underlying safe OS file handle; direct handle use must respect stream lifetime and position/buffering. |
| `FileStream.Flush(Boolean)` | When true, requests flushing intermediate file buffers to disk; stronger durability has performance/platform costs. |
| `FileStream.Lock(Int64,Int64)` | Requests an OS file-range lock; behavior and coordination scope vary by platform/filesystem. |
| `FileStream.Unlock(Int64,Int64)` | Releases a previously locked file range; coordinate with the same handle/range contract. |
| `FileStream asynchronous handle option` | Opening with asynchronous options enables async handle behavior; async APIs otherwise may have different cost/implementation. |
| `MemoryStream` | Seekable in-memory byte stream whose capacity can grow; it duplicates data if copied to arrays. |
| `MemoryStream.GetBuffer()` | Exposes the backing array only when the stream was created with publicly visible buffer; capacity may exceed length. |
| `MemoryStream.TryGetBuffer(ArraySegment<Byte>)` | Attempts to expose the written region as an array segment without copying. |
| `MemoryStream.ToArray()` | Allocates and returns a copy of written bytes, independent of buffer visibility. |
| `MemoryStream.SetLength(Int64)` | Changes logical length and may grow capacity; shrinking discards logical trailing content. |
| `BufferedStream` | Adds a buffer around another stream to reduce small I/O operations; evaluate whether the underlying stream already buffers. |
| `BufferedStream.Flush()` | Pushes wrapper-buffered writes to the underlying stream; it does not necessarily force durable storage. |
| `BufferedStream.ReadAsync(Memory<Byte>,CancellationToken)` | Asynchronously reads through the buffer into memory; may return fewer bytes than requested. |
| `BufferedStream.WriteAsync(ReadOnlyMemory<Byte>,CancellationToken)` | Asynchronously writes through the buffer; await before reusing source memory. |
| `UnmanagedMemoryStream` | Stream view over unmanaged memory with explicit pointer/lifetime bounds; caller must keep memory valid. |
| `PipeStream` | Base class for named/anonymous pipe streams connecting endpoints/processes. |
| `AnonymousPipeServerStream` | Creates an anonymous pipe server endpoint, typically for parent/child process communication. |
| `AnonymousPipeClientStream` | Connects to an anonymous pipe using an inherited handle/identifier. |
| `NamedPipeServerStream` | Server endpoint addressed by a pipe name; enforce access and local/remote connection policy. |
| `NamedPipeClientStream` | Client connection to a named pipe server, with platform and permissions considerations. |
| `PipeOptions.Asynchronous` | Requests asynchronous pipe operation support. |
| `PipeOptions.CurrentUserOnly` | Restricts named-pipe access to the current user where supported; still review OS security policy. |
| `PipeTransmissionMode.Byte` | Pipe carries a byte stream without message boundaries. |
| `PipeTransmissionMode.Message` | Message mode preserves pipe write message boundaries where supported; platform support differs. |
| `PipeStream.WaitForConnectionAsync(CancellationToken)` | Asynchronously waits for a client connection and observes cancellation. |
| `PipeStream.ReadMode` | Selects how reads interpret pipe data where message mode is available. |
| `PipeStream.IsConnected` | Reports current connection state, which can change immediately after observation. |
| `TextReader` | Abstract character reader; decoding from bytes belongs to derived readers such as `StreamReader`. |
| `TextReader.ReadLineAsync(CancellationToken)` | Asynchronously reads until line terminator or EOF; returns null at EOF. |
| `TextReader.ReadToEndAsync(CancellationToken)` | Reads remaining characters into one string; avoid for unbounded input. |
| `TextWriter` | Abstract character writer; encoding to bytes belongs to derived writers. |
| `TextWriter.WriteAsync(ReadOnlyMemory<Char>,CancellationToken)` | Asynchronously writes character memory; await before reusing aliased memory. |
| `TextWriter.WriteLineAsync(ReadOnlyMemory<Char>,CancellationToken)` | Writes characters followed by the writer's newline sequence. |
| `StreamReader` | Decodes a byte stream into characters using an encoding and optional BOM detection. |
| `StreamReader.CurrentEncoding` | Reports encoding currently used; BOM detection can change it after reading starts. |
| `StreamReader.DetectEncodingFromByteOrderMarks` | Configures whether a byte-order mark can override the supplied encoding. |
| `StreamReader.ReadAsync(Memory<Char>,CancellationToken)` | Asynchronously fills some or all character memory and returns count. |
| `StreamReader.ReadLineAsync(CancellationToken)` | Reads a line without its terminator, returning null at EOF. |
| `StreamWriter` | Encodes characters and writes bytes to an underlying stream. |
| `StreamWriter.AutoFlush` | Flushes after each write operation when enabled; can increase I/O and does not mean durable disk flush. |
| `StreamWriter.NewLine` | Gets/sets line terminator used by `WriteLine`; default is platform-sensitive. |
| `StreamWriter.FlushAsync(CancellationToken)` | Asynchronously flushes writer/encoder buffers to the underlying stream. |
| `BinaryReader` | Reads primitive values and strings using specified encoding/format from a stream. |
| `BinaryReader.ReadInt32()` | Reads a 32-bit integer in the reader's documented binary endianness (little-endian for modern .NET); ensure protocol agreement. |
| `BinaryReader.ReadString()` | Reads a length-prefixed string using its binary format and configured encoding; not a general text line read. |
| `BinaryWriter` | Writes primitive values/strings in a binary representation to a stream. |
| `BinaryWriter.Write(Int32)` | Writes an integer using the API's binary representation; document byte order in an external protocol. |
| `BinaryWriter.Write(String)` | Writes a length-prefixed encoded string; pair with a compatible reader, not arbitrary peers. |
| `Encoding.UTF8` | UTF-8 encoding instance with default fallback behavior; use strict encoder/decoder when malformed data must fail. |
| `UTF8Encoding(Boolean,Boolean)` | Configures BOM emission and invalid-byte exception behavior through its Boolean options. |
| `Encoding.GetBytes(String)` | Encodes characters into a newly allocated byte array. |
| `Encoding.GetString(Byte[],Int32,Int32)` | Decodes a byte range to a string using configured fallback policy. |
| `Encoding.DecoderFallback` | Policy for invalid byte sequences encountered during decoding, such as replacement or exception. |
| `Encoding.EncoderFallback` | Policy for characters that cannot be represented by an encoding. |
| `DecoderExceptionFallback` | Throws when decoding invalid byte sequences instead of silently replacing them. |
| `EncoderExceptionFallback` | Throws when encoding encounters unrepresentable characters. |
| `EndOfStreamException` | Signals that exact/binary reading expected more data but reached EOF first. |
| `Stream ownership with leaveOpen parameter` | Wrapper constructors often dispose the underlying stream unless `leaveOpen: true`; document one clear owner. |
| `Async stream disposal with await using` | Uses `IAsyncDisposable` cleanup and awaits completion; appropriate when stream cleanup performs asynchronous work. |
| `Stream read may return fewer bytes than requested` | Core contract; loop or use exact/minimum APIs when protocol fields require more bytes. |
| `Stream.CopyToAsync bufferSize selection` | Buffer size balances memory and call overhead; default is usually suitable until profiling shows otherwise. |
| `Stream position and seeking capability` | Only seekable streams support cursor-based repositioning; capability flags are authoritative. |

# Cross-item comparison

| Stream | Typical capability profile |
|---|---|
| `MemoryStream` | Seekable managed buffer; convenient but may copy/grow. |
| `FileStream` | OS-backed file handle; usually seekable, with sharing/permission semantics. |
| `NetworkStream` | Socket-backed ordered bytes; normally non-seekable and partial reads are expected. |
| `PipeStream` | Process communication; byte or supported message mode. |
| `StreamReader`/`StreamWriter` | Character conversion wrappers; own inner stream by default unless left open. |

# Examples

```csharp
byte[] header = new byte[8];
await source.ReadExactlyAsync(header, cancellationToken);
await destination.WriteAsync(header, cancellationToken);
```

This reads a complete fixed header, but the caller must still validate its fields and enforce a maximum payload size before allocating the payload. `WriteAsync` must complete before `header` is modified or returned to a pool.

# Common mistakes

- Assuming one `Read` fills the requested buffer or `CopyToAsync` limits total bytes.
- Treating a successful `Flush` as a durable commit.
- Sharing a stream across concurrent operations without coordinating position and ordering.
- Disposing a wrapper that owns a stream still needed by its caller.
- Using `MemoryStream.GetBuffer` without checking visibility or confusing capacity with logical length.
- Decoding each network chunk independently when a multibyte character may cross chunk boundaries.
- Assuming pipe message mode or file locking behaves identically on every platform.

# Knowledge checks with answers

1. **Does `ReadAsync` fill the buffer?** Not necessarily; it returns the actual count and may be partial.
2. **When should you use `ReadExactlyAsync`?** For protocol fields that require a fixed byte count, while still validating the decoded field.
3. **What does `leaveOpen` control?** Whether disposing a wrapper also disposes its underlying stream.
4. **Does `StreamWriter.AutoFlush` guarantee data is physically durable?** No; it flushes character/stream buffers only.
5. **Can a TCP stream be rewound?** Typically no; network streams are not seekable.
