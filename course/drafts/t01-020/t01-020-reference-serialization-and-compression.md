<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# streams file system serialization sockets and HTTP clients — Reference: System.Text.Json serializer, DOM, converters, source generation, and compression streams

# Scope and version

This lesson covers all 104 names in `serialization-and-compression` for .NET 11. JSON web defaults are not identical to library defaults; pin options as part of the contract. Sources: [System.Text.Json overview](https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/overview), [how-to guide](https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/how-to), and [source generation](https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/source-generation).

# How this group fits the mental model

Serialization is a mapping from a domain value to a defined representation. Options, naming rules, converters, polymorphism, unknown-member handling, number policy, and source-generation metadata all affect compatibility. DOM and reader/writer APIs give different mutability/allocation tradeoffs. Compression wraps bytes but creates a second resource dimension: decompressed size and CPU. Do not deserialize arbitrary untrusted types or trust parsed values without domain validation.

# Supplied names explained

| Supplied name | Meaning and edge case |
|---|---|
| `System.Text.Json` | .NET JSON library providing object serialization, DOM, streaming reader/writer, converters, and source generation. |
| `JsonSerializer` | High-level API for converting CLR values to/from JSON using options or type metadata. |
| `JsonSerializer.Serialize<TValue>(TValue,JsonSerializerOptions)` | Serializes a value to a JSON string; encoding/allocation and options are part of the contract. |
| `JsonSerializer.SerializeAsync<TValue>(Stream,TValue,JsonSerializerOptions,CancellationToken)` | Writes JSON asynchronously to a stream; await completion and define stream ownership separately. |
| `JsonSerializer.SerializeToUtf8Bytes<TValue>` | Serializes to a new UTF-8 byte array; convenient but allocates the full output. |
| `JsonSerializer.SerializeToDocument<TValue>` | Serializes into an immutable `JsonDocument` DOM; dispose it when finished. |
| `JsonSerializer.Deserialize<TValue>(String,JsonSerializerOptions)` | Parses a JSON string into a value; malformed input throws and valid JSON can still violate domain rules. |
| `JsonSerializer.Deserialize<TValue>(ReadOnlySpan<Byte>,JsonSerializerOptions)` | Deserializes UTF-8 JSON bytes from a span without requiring an input string. |
| `JsonSerializer.DeserializeAsync<TValue>(Stream,JsonSerializerOptions,CancellationToken)` | Reads/deserializes one JSON value asynchronously from a stream. |
| `JsonSerializer.DeserializeAsyncEnumerable<TValue>(Stream,JsonSerializerOptions,CancellationToken)` | Streams a JSON array's elements asynchronously; do not assume arbitrary concatenated top-level JSON values are accepted by every overload. |
| `JsonSerializerOptions` | Mutable configuration object; after use/read-only transition, reuse consistently and avoid per-call construction. |
| `JsonSerializerOptions.PropertyNamingPolicy` | Controls serialized/deserialized object property name transformation. |
| `JsonSerializerOptions.DictionaryKeyPolicy` | Controls dictionary key naming during serialization; read-side matching follows serializer behavior/options. |
| `JsonSerializerOptions.PropertyNameCaseInsensitive` | Enables case-insensitive property matching on input; may cost lookup work and should match contract needs. |
| `JsonSerializerOptions.DefaultIgnoreCondition` | Controls omission of null/default-valued properties for relevant serialization cases. |
| `JsonSerializerOptions.NumberHandling` | Configures number representations such as reading numbers from strings or writing numbers as strings. |
| `JsonSerializerOptions.ReferenceHandler` | Chooses reference/cycle handling policy for object graphs. |
| `JsonSerializerOptions.MaxDepth` | Limits JSON nesting depth; choose a bound that fits the schema and resource threat model. |
| `JsonSerializerOptions.ReadCommentHandling` | Controls whether JSON comments are disallowed, skipped, or handled according to supported mode. |
| `JsonSerializerOptions.AllowTrailingCommas` | Allows a trailing comma in input when enabled; strict interoperable JSON usually avoids extensions. |
| `JsonSerializerOptions.Encoder` | Controls escaping of output characters; choose safe defaults for the destination context. |
| `JsonSerializerOptions.Converters` | Ordered custom converter collection for types and formats. |
| `JsonSerializerOptions.TypeInfoResolver` | Supplies contract metadata, including generated or composed resolvers. |
| `JsonSerializerOptions.MakeReadOnly()` | Locks options against mutation; configure first and then reuse safely. |
| `JsonSerializerOptions.IsReadOnly` | Indicates options are frozen/read-only. |
| `JsonSerializerDefaults.Web` | Preset for web-style naming/number handling/case behavior; it differs from general library defaults. |
| `JsonNamingPolicy.CamelCase` | Built-in camel-case policy for property names. |
| `JsonIgnoreCondition.WhenWritingNull` | Omits null-valued properties during serialization. |
| `JsonIgnoreCondition.WhenWritingDefault` | Omits values equal to type defaults; can change payload meaning when absence differs from explicit default. |
| `JsonNumberHandling.AllowReadingFromString` | Allows numeric JSON values to be represented as strings on input for compatibility. |
| `JsonNumberHandling.WriteAsString` | Writes numbers as JSON strings; alters the wire contract. |
| `ReferenceHandler.Preserve` | Emits metadata to preserve object references/cycles; resulting JSON is specialized and less interoperable. |
| `ReferenceHandler.IgnoreCycles` | Avoids cycle failures by writing null for circular references; data may be omitted. |
| `JsonDocument` | Immutable, disposable JSON DOM optimized for read-only inspection; elements depend on its lifetime. |
| `JsonDocument.Parse(String)` | Parses text into a document; input size/depth should be bounded. |
| `JsonDocument.Parse(Stream)` | Parses JSON from a stream and creates a document; it consumes input and owns its internal parsed representation. |
| `JsonDocument.Parse(ReadOnlyMemory<Byte>)` | Parses UTF-8 memory into a document; document lifetime remains explicit. |
| `JsonDocument.RootElement` | Root `JsonElement` view owned by the document. |
| `JsonDocument.Dispose()` | Releases document resources; elements from it must no longer be used unless cloned. |
| `JsonElement.ValueKind` | Indicates JSON kind: object, array, string, number, boolean, null, or undefined. |
| `JsonElement.GetProperty(String)` | Gets a named object property or throws if absent/wrong kind; names are case-sensitive for DOM lookup. |
| `JsonElement.TryGetProperty(String,JsonElement)` | Looks up a case-sensitive property on an object and returns false when absent. It throws `InvalidOperationException` if the current element is not an object, and `ObjectDisposedException` if its parent document has been disposed. If a name is duplicated, the last matching property is returned. |
| `JsonElement.EnumerateObject()` | Iterates object properties in source order; repeated property names require an explicit policy. |
| `JsonElement.EnumerateArray()` | Iterates array elements without materializing a CLR collection. |
| `JsonElement.GetString()` | Reads a string value or null for JSON null; throws for incompatible kinds. |
| `JsonElement.GetInt32()` | Reads a compatible 32-bit integer number; throws for wrong kind or out-of-range/fractional value. |
| `JsonElement.Deserialize<TValue>()` | Converts this element to a CLR value using selected serializer metadata/options. |
| `JsonElement.Clone()` | Copies element data into a document-independent element so it can outlive the original document. |
| `JsonNode` | Mutable DOM base abstraction for `JsonObject`, `JsonArray`, and `JsonValue`. |
| `JsonObject` | Mutable JSON object mapping property names to nodes/values. |
| `JsonArray` | Mutable ordered JSON array. |
| `JsonValue` | Mutable DOM wrapper for a scalar/serialized value. |
| `JsonNode.Parse(String)` | Parses JSON text into mutable DOM; enforce input limits. |
| `JsonNode.ToJsonString(JsonSerializerOptions)` | Serializes a node to JSON text using supplied options. |
| `JsonNode.DeepClone()` | Produces an independent deep copy of a mutable node tree. |
| `Utf8JsonReader` | Forward-only, low-allocation UTF-8 parser; a `ref struct` that cannot be stored on the heap. |
| `Utf8JsonReader.Read()` | Advances to the next token; state must be carried correctly when reading segmented input. |
| `Utf8JsonReader.TryGetInt32(Int32)` | Attempts to parse current numeric token as 32-bit integer without throwing for incompatible range/format. |
| `Utf8JsonReader.GetString()` | Gets current string/property-name token; decoded string can allocate. |
| `Utf8JsonReader.Skip()` | Skips the current value/container subtree while advancing reader state. |
| `Utf8JsonWriter` | Forward-only UTF-8 JSON writer that validates structural token sequencing. |
| `Utf8JsonWriter.WriteStartObject()` | Begins an object scope; must be closed by a matching end token. |
| `Utf8JsonWriter.WriteStartArray()` | Begins an array scope. |
| `Utf8JsonWriter.WriteString(String,String)` | Writes a named JSON string property, escaping as configured. |
| `Utf8JsonWriter.WriteNumber(String,Int32)` | Writes a named integer number property. |
| `Utf8JsonWriter.WriteEndObject()` | Closes an open object. |
| `Utf8JsonWriter.Flush()` | Flushes writer buffers to the destination; does not dispose the destination. |
| `JsonConverter<T>` | Custom converter implementing read/write for one type; must validate tokens, handle null/recursion, and preserve contract semantics. |
| `JsonConverter<T>.Read` | Converts current reader value to `T`; advance reader exactly according to converter contract. |
| `JsonConverter<T>.Write` | Writes `T` to the provided JSON writer. |
| `JsonConverterFactory` | Creates converters dynamically for a family of types, such as constructed generics. |
| `JsonConverterAttribute` | Associates a converter with a type/member/parameter according to supported usage. |
| `JsonPropertyNameAttribute` | Overrides JSON property name for a member. |
| `JsonIgnoreAttribute` | Excludes or conditionally excludes a member from serialization/deserialization behavior. |
| `JsonIncludeAttribute` | Includes eligible non-public accessors/fields according to serializer rules; it does not bypass all accessibility/trimming constraints. |
| `JsonConstructorAttribute` | Selects a constructor for deserialization when constructor selection needs to be explicit. |
| `JsonExtensionDataAttribute` | Captures unmatched JSON properties into an extension-data dictionary, useful for forward compatibility. |
| `JsonPolymorphicAttribute` | Configures polymorphic serialization behavior for a base contract. |
| `JsonDerivedTypeAttribute` | Declares an allowed derived type and optional discriminator for polymorphism. |
| `JsonUnmappedMemberHandlingAttribute` | Configures treatment of JSON properties not mapped to a member, such as skipping or disallowing. |
| `JsonRequiredAttribute` | Requires a property to be present during deserialization; presence does not validate business meaning. |
| `JsonSourceGenerationOptionsAttribute` | Configures source-generated JSON context behavior. |
| `JsonSerializableAttribute` | Registers a type in a source-generation context. |
| `JsonSerializerContext` | Base for generated context providing `JsonTypeInfo` metadata for declared types. |
| `JsonTypeInfo<T>` | Contract metadata for serializing/deserializing a type, including generated/customized properties. |
| `JsonSerializerContext.Default` | Generated singleton context instance where the generated context provides one. |
| `JsonTypeInfoResolver.Combine` | Composes metadata resolvers in precedence order. |
| `DefaultJsonTypeInfoResolver` | Reflection-based resolver that creates contracts from runtime types; can require trimming annotations. |
| `JsonSerializer reflection mode trimming limitations` | Reflection-discovered members can be removed by trimming if not statically visible; heed warnings and preserve accurately. |
| `System.Text.Json source generation` | Build-time generation of JSON metadata/serialization code for known types, improving AOT/trimming visibility and potentially performance. |
| `BinaryFormatter obsolete and disabled security boundary` | BinaryFormatter is obsolete/unsafe for untrusted input and disabled in modern runtimes; do not use it for new persistence or wire protocols. |
| `DataContractSerializer` | XML-oriented serializer using data-contract metadata; set quotas and secure the XML reader for untrusted content. |
| `XmlSerializer` | XML serializer based on public type shape/attributes; dynamic code and trimming support require attention. |
| `XmlReader` | Forward-only XML parser; configure secure settings and quotas, especially external resource resolution. |
| `XmlWriter` | Forward-only XML output writer with encoding and conformance settings. |
| `GZipStream` | Compression/decompression wrapper using gzip format; decompression output must be bounded. |
| `DeflateStream` | Compression/decompression wrapper for Deflate format; framing/format compatibility matters. |
| `BrotliStream` | Compression/decompression wrapper using Brotli format. |
| `CompressionLevel.Optimal` | Favors compression ratio with greater CPU cost than fastest settings. |
| `CompressionLevel.Fastest` | Favors speed, usually with larger output. |
| `CompressionMode.Compress` | Configures a compression stream to compress writes. |
| `CompressionMode.Decompress` | Configures a stream to produce decompressed bytes when read. |
| `CompressionStream leaveOpen behavior` | Compression wrappers usually dispose inner streams unless leave-open is requested; assign a single owner. |
| `Decompression bomb resource limit` | Compressed data can expand dramatically; enforce decompressed byte, time, and nesting/resource limits while reading. |

# Cross-item comparison

| API | Best fit | Lifetime/property |
|---|---|---|
| `JsonDocument`/`JsonElement` | Immutable read-only inspection with low overhead. | Dispose the document; clone elements that must outlive it. |
| `JsonNode` tree | Mutable, convenient structural edits. | Deep clone to detach; can allocate more. |
| `Utf8JsonReader`/`Writer` | Incremental custom processing with precise control. | Maintain parser/writer state correctly. |
| Reflection resolver | Flexible runtime contracts. | Trimming/AOT warnings and reflection costs. |
| Source-generated context | Known model set and static visibility. | Requires model registration at build time. |
| Compression | Reduce bytes transferred/stored. | Costs CPU and creates decompression amplification risk. |

# Examples

```csharp
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

var options = new JsonSerializerOptions(JsonSerializerDefaults.Web)
{
    MaxDepth = 32,
    PropertyNameCaseInsensitive = false
};

string json = """{"lines":["item-1","item-2"]}""";
Order? order = JsonSerializer.Deserialize<Order>(json, options);
if (order is null || order.Lines.Count > 10_000)
    throw new InvalidDataException("Invalid order payload.");

sealed class Order
{
    public List<string> Lines { get; init; } = new();
}
```

Max depth is only one limit: also cap byte length, collection sizes, strings, and downstream work. Deserialized types should be explicit and domain-validated.

# Common mistakes

- Assuming JSON web defaults equal general `JsonSerializerOptions` defaults.
- Leaving a `JsonElement` alive after disposing its owning document without cloning.
- Using `ReferenceHandler.Preserve` to hide an unsuitable cyclic wire model.
- Treating `JsonRequired` as validation of semantic values.
- Trusting unknown or polymorphic type names from untrusted JSON.
- Ignoring trimming/source-generation warnings.
- Assuming compression stream disposal closes an inner stream when `leaveOpen` is enabled, or vice versa.
- Decompressing unbounded attacker-controlled content.

# Knowledge checks with answers

1. **When use `JsonDocument` versus `JsonNode`?** Read-only inspection versus mutable DOM editing.
2. **How can a `JsonElement` outlive its document?** Call `Clone` before disposing the owning `JsonDocument`.
3. **Why is source generation useful for Native AOT?** It makes known type contracts statically visible and avoids some reflection discovery.
4. **Is `JsonRequired` domain validation?** No; it checks presence, not business correctness.
5. **What limit is needed when decompressing?** Bound decompressed bytes and processing/time, not only compressed input size.
