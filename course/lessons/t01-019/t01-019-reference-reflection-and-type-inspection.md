
# CLR execution IL JIT AOT assemblies reflection attributes and loading — Reference: System.Type, members, binding flags, invocation, generic inspection, and metadata-only loading

# Scope and version

This lesson covers every item in the manifest group `reflection-and-type-inspection`. It distinguishes runtime inspection/invocation from metadata-only analysis and includes trimming/AOT implications. Sources: [assembly reflection](https://learn.microsoft.com/en-us/dotnet/standard/assembly/), [`Assembly`](https://learn.microsoft.com/en-us/dotnet/api/system.reflection.assembly), [`CustomAttributeData`](https://learn.microsoft.com/en-us/dotnet/api/system.reflection.customattributedata), and [MetadataLoadContext inspection](https://learn.microsoft.com/en-us/dotnet/standard/assembly/inspect-contents-using-metadataloadcontext).

# How this group fits the mental model

Reflection starts from runtime metadata for loaded types and can invoke code; it is not merely reading source declarations. Query carefully: overloaded members can make name-only lookup ambiguous, nonpublic members need explicit binding flags, generic definitions differ from constructed types, and invocation wraps target exceptions. MetadataLoadContext instead creates metadata-only type objects so tools can inspect assemblies without executing them; those types are not interchangeable with runtime types.

# Supplied names explained

Every item name is reproduced verbatim.

| Supplied name | Meaning and edge case |
|---|---|
| `System.Type` | Runtime descriptor for a type; instances are obtained from runtime objects, `typeof`, or type lookup. |
| `Type.GetType(String)` | Resolves a type name using documented lookup rules; assembly-qualified names are often needed outside the caller's assembly/core library. |
| `Type.GetType(String,Boolean)` | Overload controls whether an unresolved name throws; false can return null, while true reports failure. |
| `Type.AssemblyQualifiedName` | Type name combined with defining assembly identity; useful for persistence only with versioning/security care. |
| `Type.FullName` | Namespace-qualified metadata name; may be null for some generic parameters and differs from assembly-qualified name. |
| `Type.Name` | Simple type/member name without namespace; not guaranteed unique. |
| `Type.Namespace` | Namespace metadata string; nested types and global-namespace types require care. |
| `Type.IsClass` | Indicates a class type; delegates count as classes, while interfaces/value types do not. |
| `Type.IsValueType` | Indicates value-type classification, including enums and structs. |
| `Type.IsInterface` | Indicates interface classification. |
| `Type.IsEnum` | Indicates enum classification. |
| `Type.IsGenericType` | True for generic type definitions and constructed generic types. |
| `Type.IsGenericTypeDefinition` | True for an open generic definition such as `List<>`, not a constructed `List<int>`. |
| `Type.ContainsGenericParameters` | True when the type or declaring type still contains unbound generic parameters. |
| `Type.BaseType` | Immediate base type, or null for types with no base class such as `object`/interfaces. |
| `Type.GetInterfaces()` | Returns implemented/inherited interfaces; order is not a semantic contract. |
| `Type.GetGenericArguments()` | Returns generic parameters for a definition or actual arguments for a constructed type. |
| `Type.GetGenericTypeDefinition()` | Returns the generic definition for a constructed type; throws if the type is not generic. |
| `Type.MakeGenericType(Type[])` | Constructs a closed type from a generic definition and arguments, checking arity and constraints. |
| `Type.GetConstructors()` | Enumerates constructors under default public-instance rules; specify binding flags for other visibility/static cases. |
| `Type.GetConstructor(Type[])` | Looks up a public instance constructor by parameter types; overloads may require binding flags or binder arguments. |
| `Type.GetMethods()` | Enumerates public methods, including inherited public members under default rules. |
| `Type.GetMethod(String)` | Looks up a method by name; overloaded names can be ambiguous. |
| `Type.GetMethod(String,Type[])` | Resolves a method by name and parameter types; generic, optional, and binder cases may require fuller overloads. |
| `Type.GetProperties()` | Enumerates properties using default public binding behavior; properties are metadata accessors, not fields. |
| `Type.GetProperty(String)` | Looks up a property by name; overloaded indexers or hidden members can be ambiguous. |
| `Type.GetFields()` | Enumerates fields under default binding behavior; private fields require `NonPublic`. |
| `Type.GetField(String)` | Looks up a field by name and can return null when no matching visible field exists. |
| `Type.GetEvents()` | Enumerates event metadata with default public visibility rules. |
| `Type.GetEvent(String)` | Looks up one event by name; event metadata exposes add/remove accessors, not a public backing delegate necessarily. |
| `Type.GetMembers()` | Enumerates several member kinds; filter by `MemberTypes` or use specific APIs for clarity. |
| `Type.GetNestedTypes()` | Enumerates nested types; visibility flags determine which are returned. |
| `Type.GetCustomAttributes(Boolean)` | Creates/returns attribute instances with inheritance behavior selected by the Boolean; instantiation can execute attribute constructors. |
| `Type.GetCustomAttributesData()` | Returns encoded custom-attribute metadata without constructing attribute instances. |
| `Type.CustomAttributes` | Enumerates `CustomAttributeData` for the type. |
| `Type.GetElementType()` | Returns element type for arrays, pointers, or by-ref types; otherwise null. |
| `Type.MakeArrayType()` | Constructs a single-dimensional, zero-based array type. |
| `Type.MakeArrayType(Int32)` | Constructs an array type with the specified rank; rank one here represents a non-SZ rank-one array, distinct from `MakeArrayType()`. |
| `Type.MakeByRefType()` | Constructs a by-reference type descriptor; it does not create a variable or permit arbitrary ref emission. |
| `Type.MakePointerType()` | Constructs an unsafe pointer type descriptor; use requires unsafe-compatible code/runtime context. |
| `Type.GetFunctionPointerReturnType()` | Returns function-pointer return type for a function-pointer `Type`; other types are invalid for this query. |
| `MemberInfo` | Base reflection abstraction for members such as types, methods, properties, and events. |
| `MethodInfo` | Reflection representation of a method, including signature and invocation. |
| `ConstructorInfo` | Reflection representation of a constructor; invocation creates an instance and can throw wrapped target exceptions. |
| `PropertyInfo` | Describes a property and its accessors; it may be read-only, write-only, or indexed. |
| `FieldInfo` | Describes a field; changing private/static fields through reflection is fragile and may be restricted by runtime/AOT rules. |
| `EventInfo` | Describes event accessors and handler type; it does not imply a public backing field. |
| `ParameterInfo` | Describes a parameter's type, position, name, defaults, and attributes. |
| `MethodBase.GetParameters()` | Returns parameter descriptors in signature order. |
| `MethodBase.IsGenericMethod` | Indicates whether a method is generic, including constructed generic methods. |
| `MethodInfo.MakeGenericMethod(Type[])` | Constructs a generic method with specified type arguments, enforcing arity and constraints. |
| `MethodInfo.Invoke(Object,Object[])` | Invokes a method on a target with arguments; static methods use null target, parameter/ref-out values use the array, and target exceptions are wrapped in `TargetInvocationException`. |
| `ConstructorInfo.Invoke(Object[])` | Invokes a constructor with arguments and returns the new object; constructor exceptions are wrapped. |
| `PropertyInfo.GetValue(Object)` | Gets property value from an instance (or null target for static); indexer properties need index arguments through an overload. |
| `PropertyInfo.SetValue(Object,Object)` | Sets property value; read-only properties or incompatible values fail, and indexers require index arguments. |
| `FieldInfo.GetValue(Object)` | Reads an instance field or static field (null target for static). |
| `FieldInfo.SetValue(Object,Object)` | Writes a field subject to access, readonly, type conversion, and runtime restrictions. |
| `EventInfo.AddEventHandler(Object,Delegate)` | Calls the event add accessor with a compatible delegate; target is null for static events. |
| `EventInfo.RemoveEventHandler(Object,Delegate)` | Removes the matching delegate through the event remove accessor. |
| `BindingFlags.Public` | Selects public members when passed to relevant reflection APIs. |
| `BindingFlags.NonPublic` | Selects nonpublic members; access may be restricted and reliance on private implementation details is brittle. |
| `BindingFlags.Instance` | Selects instance members. |
| `BindingFlags.Static` | Selects static members. |
| `BindingFlags.DeclaredOnly` | Restricts search to members declared on the type, excluding inherited members. |
| `BindingFlags.FlattenHierarchy` | Includes selected inherited public/protected static members; it does not flatten private static members. |
| `BindingFlags.IgnoreCase` | Requests case-insensitive name matching for APIs that honor it. |
| `BindingFlags.InvokeMethod` | Invocation flag used with `Type.InvokeMember` to invoke a method by name. |
| `BindingFlags.GetField` | `InvokeMember` operation flag for field reads. |
| `BindingFlags.SetField` | `InvokeMember` operation flag for field writes. |
| `BindingFlags.GetProperty` | `InvokeMember` operation flag for property reads. |
| `BindingFlags.SetProperty` | `InvokeMember` operation flag for property writes. |
| `CustomAttributeData` | Metadata representation of an attribute constructor and arguments without instantiating the attribute. |
| `CustomAttributeData.GetCustomAttributes(MemberInfo)` | Gets custom-attribute metadata attached to a member, including constructor and named arguments. |
| `CustomAttributeData.AttributeType` | Type descriptor for the declared attribute type. |
| `CustomAttributeData.ConstructorArguments` | Encoded positional arguments supplied to the attribute constructor. |
| `CustomAttributeData.NamedArguments` | Encoded named property/field assignments from the attribute declaration. |
| `MetadataLoadContext` | Loads assemblies for metadata inspection without executing their code; disposal releases the metadata context. |
| `MetadataAssemblyResolver` | Abstract resolver that supplies assembly paths/assemblies needed by a metadata context. |
| `PathAssemblyResolver` | Resolver implementation that searches supplied paths for requested metadata assemblies. |
| `MetadataLoadContext.LoadFromAssemblyPath(String)` | Loads an assembly into the metadata-only context from a path. |
| `MetadataLoadContext.LoadFromAssemblyName(AssemblyName)` | Loads a metadata assembly by identity through the configured resolver. |
| `MetadataLoadContext.GetAssemblies()` | Enumerates assemblies loaded into the metadata context. |
| `MetadataLoadContext.CoreAssembly` | The metadata assembly designated as the core library for type identity/resolution in that context. |
| `MetadataLoadContext.Dispose()` | Releases the metadata-only context and associated resources. |
| `ReflectionTypeLoadException.Types` | Array containing successfully loaded types and null entries where loading failed. |
| `ReflectionTypeLoadException.LoaderExceptions` | Errors associated with failed type loads; inspect each to diagnose missing or incompatible dependencies. |
| `TargetInvocationException.InnerException` | The exception thrown by the invoked target, wrapped by reflection invocation. |
| `Reflection invocation overhead` | Dynamic lookup, argument checks, boxing, and dispatch can cost more than direct calls; measure hot paths. |
| `Reflection member cache design` | Cache stable metadata such as `MethodInfo` when repeated lookup is costly, but account for type/load-context lifetime to avoid rooting unloadable plugins. |
| `Reflection versus source-generated registration` | Reflection is flexible for unknown types; generated/explicit registration is visible to trimming/AOT and often easier to validate. |
| `Reflection metadata inspection versus code execution` | Inspecting metadata does not require invoking members; separate the two to avoid executing untrusted or side-effecting code. |

# Cross-item comparison

| Need | Preferred surface |
|---|---|
| Inspect loaded type identity and invoke runtime code | `System.Type` and `MemberInfo` family. |
| Inspect an assembly without executing it | `MetadataLoadContext` and `CustomAttributeData`. |
| Resolve one exact overload | Name plus parameter types and, if needed, binding flags/binder. |
| Preserve known members for trim/AOT | Annotations, explicit registration, or source generation rather than hidden string discovery. |

# Examples

```csharp
using System;
using System.Linq;
using System.Reflection;

MethodInfo method = typeof(string).GetMethod(
    nameof(string.StartsWith),
    new[] { typeof(string), typeof(StringComparison) })
    ?? throw new MissingMethodException();

object? result = method.Invoke("hello", new object?[] { "he", StringComparison.Ordinal });
if (result is not true)
    throw new InvalidOperationException("Unexpected reflection result.");

foreach (CustomAttributeData attribute in typeof(string).CustomAttributes)
    Console.WriteLine(attribute.AttributeType.FullName);
```

For repeated hot-path calls, compare cached delegates or direct calls. Reflection member caching must not keep an otherwise unloadable collectible context alive.

# Common mistakes

- Looking up overloaded methods by name only and assuming a unique result.
- Confusing `IsGenericType` with `IsGenericTypeDefinition` or ignoring open generic parameters.
- Assuming metadata-context `Type` can be cast to an executing runtime `Type`.
- Instantiating custom attributes merely to inspect their declared values.
- Treating `NonPublic` reflection as stable API or a security bypass.
- Swallowing `ReflectionTypeLoadException` without inspecting `LoaderExceptions`.
- Retaining `MethodInfo`/`Type` in a global cache and preventing plugin unload.
- Assuming reflection-only code survives trimming or Native AOT without annotations and analysis.

# Knowledge checks with answers

1. **How do you avoid an ambiguous overload lookup?** Supply parameter types or use a fuller lookup overload with explicit binding rules.
2. **Does `MetadataLoadContext` execute static constructors?** No; it loads metadata for inspection rather than executing the inspected assembly.
3. **Where is the actual target exception from `Invoke`?** In `TargetInvocationException.InnerException`.
4. **Why can cached `Type` objects block plugin unloading?** They reference assemblies/load contexts and therefore keep them reachable.
5. **When is `CustomAttributeData` useful?** When tooling must inspect declarations without instantiating attribute classes.
