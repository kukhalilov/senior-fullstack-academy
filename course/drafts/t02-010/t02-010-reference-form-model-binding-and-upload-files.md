# HTTP request response headers forms files and streaming bodies — Reference: URL-encoded and multipart forms, buffered files, streamed sections, and upload safety

## Scope and version

Form binding buffers files by default. Streaming multipart avoids holding a whole file in application buffering but transfers parsing, limits, cancellation, and cleanup duties to your code. Current guidance lists 128 MiB multipart section and 64 KiB memory rollover defaults; deployments can add other limits. [File uploads](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/file-uploads?view=aspnetcore-11.0)

## How this group fits the mental model

For each member, ask: is it per-request state, untrusted metadata, a body consumer, a parser/resource limit, or a response commitment/output API? Track who owns the data and what downstream code can still do.

## Supplied names explained

- `IFormCollection` — Parsed form values and uploaded files for one request. Values and file metadata are client input; access may require parsing and buffering the body.
- `IFormCollection.Keys` — Parsed form collection member; reading form may trigger parsing/buffering. Keys and uploaded files must be validated and bounded.
- `IFormCollection.Files` — Parsed form collection member; reading form may trigger parsing/buffering. Keys and uploaded files must be validated and bounded.
- `IFormFile` — Model-bound representation of one uploaded file. Form parsing buffers content according to configured thresholds/limits; its name, media type, and bytes still require validation.
- `IFormFile.Name` — Form field name associated with this file; use it for binding identity, not as a storage path.
- `IFormFile.FileName` — Untrusted client-supplied file name for display only; never use it as a storage path and encode it when displayed.
- `IFormFile.ContentType` — Client-supplied media type claim, not proof of file contents. Validate content server-side.
- `IFormFile.ContentDisposition` — Multipart disposition metadata describing the form part; parse defensively and do not trust filename parameters.
- `IFormFile.Length` — Reported file length for validation against application limits; still enforce limits while copying.
- `IFormFile.Headers` — Headers supplied for this multipart part; all client-provided values remain untrusted.
- `IFormFile.OpenReadStream` — Opens a stream for buffered file content; dispose it and do not assume the content is memory-resident.
- `IFormFile.CopyToAsync` — Asynchronously copies file bytes to a destination stream; pass cancellation when available and enforce a byte cap.
- `IFormFile.CopyTo` — Synchronous copy convenience; async copying is preferred in request processing.
- `IFormFileCollection` — Collection of uploaded files grouped by form-field name. Multiple files may share a field; choose GetFile or GetFiles deliberately.
- `IFormFileCollection.GetFile` — Returns a file for a form field name, generally the first matching file; distinguish it from retrieving all files.
- `IFormFileCollection.GetFiles` — Returns all files associated with a form field name, supporting repeated file controls.
- `IFormFeature` — Request feature that provides parsed form state and sync/async form-reading operations. It is host/request scoped and may consume or buffer the request body.
- `IFormFeature.ReadForm` — Feature exposing parsed form state and asynchronous/synchronous parsing paths. Prefer async parsing and avoid repeated body consumers.
- `IFormFeature.ReadFormAsync` — Feature exposing parsed form state and asynchronous/synchronous parsing paths. Prefer async parsing and avoid repeated body consumers.
- `IFormFeature.Form` — Feature exposing parsed form state and asynchronous/synchronous parsing paths. Prefer async parsing and avoid repeated body consumers.
- `FormCollection` — Form parser data structure used to represent or accumulate submitted fields/files. It does not remove the need for count, length, and file validation.
- `FormFile` — Framework implementation of IFormFile backed by parsed multipart content. It is not a durable file store and its backing resources have a request/parser lifetime.
- `FormFileCollection` — Form parser data structure used to represent or accumulate submitted fields/files. It does not remove the need for count, length, and file validation.
- `FormFile.OpenReadStream` — Buffered implementation of an uploaded file. Its read stream and stored data have request parsing and temp-storage lifetimes; validate and cap copies.
- `IFormFileModelBinder` — MVC binder that binds uploaded multipart file parts to IFormFile-compatible action parameters/properties. Binding invokes form parsing and its buffering/limits.
- `FormFileModelBinder` — MVC implementation of file model binding. It associates uploaded file parts with model names; it does not validate content or choose safe storage.
- `MultipartReader` — Incremental multipart parser for streaming sections from the request body; the application must enforce limits, cancellation, and cleanup.
- `MultipartReader.ReadNextSectionAsync` — Reads the next section and its headers/body incrementally; stop on null and bound each section before persisting it.
- `MultipartSection` — One part returned by MultipartReader, with section headers and a forward-only body stream. Consume/bound it before requesting the next section.
- `MultipartSection.Body` — Forward-only stream for this section; consume it before advancing to the next section.
- `MultipartSection.Headers` — Untrusted per-section headers used to determine field/file semantics.
- `MultipartSection.ContentType` — Client-provided section media type; not proof of content.
- `MultipartSection.ContentDisposition` — Disposition metadata used to classify form field versus file; parse safely.
- `MultipartSection.AsFileSection` — One part of a multipart request; process incrementally and enforce section limits.
- `FileMultipartSection` — Multipart file-section view providing a stream and parsed field/file names. Names are untrusted and the section stream must be consumed within the multipart reader’s progression.
- `KeyValueAccumulator` — Form parser data structure used to represent or accumulate submitted fields/files. It does not remove the need for count, length, and file validation.
- `ContentDispositionHeaderValue` — Parsed multipart Content-Disposition metadata used to classify a field/file section; values including filename are client-controlled.
- `ContentDispositionHeaderValue.IsFileDisposition` — Parsed Content-Disposition classification for multipart processing; use the parsed result to distinguish form data from file data, but treat names and filenames as untrusted.
- `ContentDispositionHeaderValue.IsFormDisposition` — Parsed Content-Disposition classification for multipart processing; use the parsed result to distinguish form data from file data, but treat names and filenames as untrusted.
- `Buffered model binding` — Conveniently materializes form files/values but consumes memory and temp disk per concurrent request.
- `Streaming multipart processing` — Parses sections incrementally and reduces whole-file buffering, while placing parsing, limits, validation, and partial cleanup on application code.
- `multipart/form-data encoding` — Multipart media type with a boundary framing parts. HTML file forms must use it; validate boundary and section headers.
- `Form field name matching` — Model binding associates submitted form fields/files by field name; mismatches often yield empty or null bindings.
- `IReadOnlyList<IFormFile> binding` — MVC can bind multiple uploaded files to a compatible collection parameter/property. This is still buffered form model binding and remains subject to parser limits and aggregate resource costs.
- `IFormFileCollection binds all posted files` — Model-binding behavior that collects uploaded files; it does not imply validation, safe storage, or unbounded buffering is acceptable.
- `Antiforgery validation for form posts` — Cookie-authenticated browser form mutations need CSRF protection; multipart parsing and file validation do not replace antiforgery checks.
- `Upload file size limits` — Set total request, per-section/file, and application storage caps; reject oversized content while streaming as well as before buffering.
- `MultipartBodyLengthLimit default` — Current FormOptions default is 128 MiB per multipart body section; not the same as Kestrel's total request cap. Verify target runtime/configuration.
- `MemoryBufferThreshold disk rollover` — Current guidance describes a 64 KiB default threshold before buffered form files spill to temp storage; this is a placement threshold, not acceptance limit.
- `ASPNETCORE_TEMP` — Environment variable that selects temp storage used for buffered uploads; secure capacity, permissions, and cleanup for that location.
- `Server-generated storage filenames` — Generate collision-resistant server names and store outside the app/web root; never compose a path from client input.
- `Untrusted IFormFile.FileName` — Treat as display metadata only; sanitize/encode it if displayed and never use for file creation.
- `Extension allowlist and content inspection` — Validate approved extension plus content signatures/business rules; MIME type and extension alone do not prove safe bytes.
- `Upload storage outside web root` — Use dedicated non-executable storage with restrictive permissions so uploaded bytes cannot be served or executed as app content.
- `Concurrent upload resource exhaustion` — Buffered per-request memory/temp-disk use multiplies under concurrency; size limits, quotas, throttling, and streaming protect aggregate capacity.
- `Do not trust uploaded ContentType` — It is supplied by the client and can lie; inspect bytes with safe parsers/scanners as appropriate.

## Cross-item comparison

Buffered form binding offers simpler access to bounded files and fields. Multipart streaming avoids buffering a whole large upload but requires explicit section parsing, size enforcement, cancellation, temporary-file cleanup, and partial-failure handling. The choice follows upload size and resource limits.
## Examples

For a small, bounded upload, form binding is convenient. Enforce request and file limits, use a server-generated name, and avoid trusting the uploaded filename as a storage path. Large uploads need a streaming approach so the entire body is not buffered in memory.

```csharp
app.MapPost("/avatar", async (IFormFile file, CancellationToken cancellationToken) =>
{
    if (file.Length is <= 0 or > 2_000_000) return Results.BadRequest();
    var safeName = Guid.NewGuid().ToString("N");
    await using var output = File.Create(Path.Combine("uploads", safeName));
    await file.CopyToAsync(output, cancellationToken);
    return Results.Created($"/avatars/{safeName}", new { id = safeName });
});
```

This is a bounded illustrative endpoint; configure the required antiforgery handling for the selected Minimal API/framework version, plus authentication/authorization, storage permissions, content validation, and upload limits.
## Common mistakes

- Retaining HttpContext or RequestServices for background work.
- Reading the body before EnableBuffering or mixing a consumed BodyReader with a reset stream.
- Treating Content-Length, a file extension, or ContentType as proof of safety.
- Raising a form limit while forgetting a server/proxy limit.
- Calling AdvanceTo incorrectly or accessing buffer memory afterward.
- Setting response metadata after the first write/StartAsync.
- Assuming a flush proves the peer received all bytes.

## Knowledge checks with answers

1. Does MultipartBodyLengthLimit replace the server request-size limit? No; multipart section and whole-request limits are separate controls.
2. Which filename should be used for storage? A server-generated name, not the untrusted upload filename.
3. What cleanup is required after a failed streamed upload? Remove incomplete temporary output and report failure without exposing a partial file.
