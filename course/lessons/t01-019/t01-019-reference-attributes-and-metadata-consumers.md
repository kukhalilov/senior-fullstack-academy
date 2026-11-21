
# CLR execution IL JIT AOT assemblies reflection attributes and loading — Reference: Attribute declarations, usage, retrieval, custom metadata, and framework conventions

# Scope and version

This is the complete `attributes-and-metadata-consumers` inventory. It focuses on what metadata declares and how frameworks/tooling consume it; C# declaration syntax itself is treated in the language topic. Sources: [assembly metadata](https://learn.microsoft.com/en-us/dotnet/standard/assembly/), [`CustomAttributeData`](https://learn.microsoft.com/en-us/dotnet/api/system.reflection.customattributedata), and [trimming guidance](https://learn.microsoft.com/en-us/dotnet/core/deploying/trimming/trim-self-contained).

# How this group fits the mental model

An attribute application is encoded metadata. The compiler/runtime stores it; it does not automatically implement its meaning. Frameworks, analyzers, source generators, and application code decide how to consume it. Retrieving attribute instances can run their constructors, whereas `CustomAttributeData` inspects the encoded values. Trimming annotations express contracts between dynamic code and the linker; they do not turn attributes into a security boundary.

# Supplied names explained

| Supplied name | Meaning and edge case |
|---|---|
| `Attribute class` | A class deriving from `Attribute` that defines metadata a consumer can inspect. |
| `AttributeUsageAttribute` | Controls which program elements may use an attribute, whether repeated uses are allowed, and whether usage is inherited. |
| `AttributeUsageAttribute.ValidOn` | The allowed `AttributeTargets` mask. |
| `AttributeUsageAttribute.AllowMultiple` | Allows more than one application on the same target when true; otherwise duplicate applications are rejected. |
| `AttributeUsageAttribute.Inherited` | Controls whether inherited attribute queries include the attribute from base declarations where applicable. |
| `AttributeTargets.Assembly` | Permits application to an assembly declaration. |
| `AttributeTargets.Module` | Permits application to a module declaration. |
| `AttributeTargets.Class` | Permits application to class declarations. |
| `AttributeTargets.Struct` | Permits application to struct declarations. |
| `AttributeTargets.Interface` | Permits application to interface declarations. |
| `AttributeTargets.Enum` | Permits application to enum declarations. |
| `AttributeTargets.Constructor` | Permits application to constructors. |
| `AttributeTargets.Method` | Permits application to methods. |
| `AttributeTargets.Property` | Permits application to properties. |
| `AttributeTargets.Field` | Permits application to fields. |
| `AttributeTargets.Event` | Permits application to events. |
| `AttributeTargets.Parameter` | Permits application to method/constructor parameters. |
| `AttributeTargets.ReturnValue` | Permits application to a return value's metadata, not the method declaration itself. |
| `AttributeTargets.GenericParameter` | Permits application to generic type or method parameters. |
| `AttributeTargets.Delegate` | Permits application to delegate declarations. |
| `AttributeTargets.All` | Combined target mask for all supported declaration categories. |
| `Attribute inheritance and AttributeUsage.Inherited` | Inheritance is query behavior for applicable declarations; it does not copy metadata onto every derived declaration. |
| `Attribute.AllowMultiple behavior` | Multiple applications can be represented only when the attribute's usage allows them; retrieval can return several instances. |
| `Attribute constructor arguments` | Positional attribute values encoded in metadata and supplied to the attribute constructor when instantiated. |
| `Attribute named arguments` | Named assignments to public writable fields/properties, stored separately from constructor arguments. |
| `Attribute suffix omission in C# syntax` | C# lookup permits omitting the conventional `Attribute` suffix when naming an attribute class; emitted metadata names the actual type. |
| `Attribute conditional emission` | `ConditionalAttribute` on an attribute class can make applications omitted from metadata when its conditional symbol is undefined. |
| `ConditionalAttribute` | Compiler-recognized attribute controlling conditional calls and conditional attribute applications; it is not a runtime feature toggle. |
| `ObsoleteAttribute` | Marks an API as obsolete and can provide a message/error severity; compiler diagnostics appear at use sites. |
| `FlagsAttribute` | Signals that an enum is intended for bitwise-combinable values; it does not validate values or change enum operations. |
| `SerializableAttribute legacy status` | Historical marker for formatter-based serialization; do not treat it as a modern serialization contract or assume binary formatter support. |
| `DebuggerDisplayAttribute` | Supplies debugger display text for an object; expressions may execute when the debugger evaluates them. |
| `DebuggerBrowsableAttribute` | Controls how a member is shown in debugger views. |
| `CallerMemberNameAttribute` | Compiler fills the caller member name for an optional parameter when omitted. |
| `CallerFilePathAttribute` | Compiler fills source file path for an optional parameter; can reveal build paths, so consider exposed diagnostics. |
| `CallerLineNumberAttribute` | Compiler fills source line number for an optional parameter. |
| `CallerArgumentExpressionAttribute` | Compiler supplies source text for a specified argument expression when the optional parameter is omitted. |
| `DefaultMemberAttribute` | Identifies a type's default member metadata, commonly associated with indexer lookup. |
| `CompilerGeneratedAttribute` | Marks compiler-generated artifacts for tooling; presence/shape is compiler implementation detail, not a public behavior contract. |
| `NullableAttribute compiler metadata` | Compiler-emitted nullability annotations used by tools/runtime metadata readers; representation is compiler-generated and should not be authored manually. |
| `DynamicallyAccessedMembersAttribute` | Declares which members of a type value must be preserved when it flows through a trimming-aware API. |
| `RequiresUnreferencedCodeAttribute` | Marks APIs whose behavior may break when trimming removes code not statically visible; callers receive linker/analyzer warnings. |
| `RequiresDynamicCodeAttribute` | Marks APIs that require runtime code generation which may be unavailable under Native AOT or other restricted runtimes. |
| `DynamicDependencyAttribute` | Adds a linker dependency to preserve selected members/types that static analysis cannot infer. |
| `SetsRequiredMembersAttribute` | Indicates a constructor or factory satisfies required members for compiler analysis; it is a contract claim, not runtime validation. |
| `Attribute reflection and trimming preservation` | Reflection-discovered members may be trimmed; express the required member set with supported annotations or avoid hidden discovery. |
| `Custom attribute metadata blob` | Encoded constructor and named argument data stored in metadata; reflection can decode it as instances or `CustomAttributeData`. |
| `Attribute instantiation versus CustomAttributeData inspection` | Instantiating may run constructors; metadata inspection reads declared values without constructing the attribute object. |
| `Attribute usage in analyzers and source generators` | Build-time tools inspect declarations to report diagnostics or emit code; attribute semantics are defined by each consumer. |
| `Attribute metadata is not a runtime security boundary` | Metadata can be missing, forged, or interpreted incorrectly; enforce authorization/security through trusted runtime checks. |
| `Declarative metadata versus runtime configuration` | Attributes describe declarations; configuration usually supplies environment/deployment-specific values and must be explicitly connected by a consumer. |

# Cross-item comparison

| Metadata consumer | Typical role |
|---|---|
| Compiler-recognized attributes | Change diagnostics or compile-time substitution/call behavior. |
| Framework-consumed attributes | Configure framework behavior when its reflection/metadata scanner reads them. |
| Trimming/AOT annotations | Communicate preservation/dynamic-code contracts to analyzers and publish tooling. |
| `CustomAttributeData` | Read attribute declarations without instantiating their classes. |

# Examples

```csharp
using System;

[AttributeUsage(AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
sealed class PluginAttribute(string id) : Attribute
{
    public string Id { get; } = id;
}

[Plugin("image-export")]
sealed class ImageExporter { }
```

The declaration alone does not register a plugin. A consumer must scan or otherwise receive the metadata and define duplicate/inheritance behavior. Under trimming, runtime scanning needs its types/members preserved or replaced with explicit/generated registration.

# Common mistakes

- Assuming an attribute automatically changes runtime behavior without a consumer.
- Treating `Inherited=true` as copying the attribute onto derived metadata.
- Using `SerializableAttribute` as evidence of a safe/current serialization format.
- Instantiating custom attributes while inspecting untrusted assemblies when metadata inspection suffices.
- Treating `DynamicallyAccessedMembers` as a blanket “disable trimming” switch; its member contract is specific and must flow correctly.
- Using attributes as authorization or integrity validation.
- Relying on compiler-generated nullable metadata as a stable hand-authored API.

# Knowledge checks with answers

1. **Who defines an attribute's behavior?** The compiler, framework, analyzer, or application consumer that interprets it.
2. **What is the main difference between `CustomAttributeData` and an attribute instance?** The former inspects encoded values without running the attribute constructor.
3. **Does `FlagsAttribute` make enum operators safer?** No; it signals intended semantics but does not validate combinations.
4. **How should reflection-required members be handled under trimming?** Use accurate preservation annotations/dependencies or explicit/source-generated references and address warnings.
5. **Is attribute metadata an authorization boundary?** No; enforce authorization through trusted checks.
