# HTTP gRPC GraphQL and messaging comparisons — Reference: GraphQL operations, executable language, and type system

Sources: [GraphQL September 2026 Specification](https://spec.graphql.org/September2026/) and [GraphQL Learn](https://graphql.org/learn/).

## Scope and version

This lesson covers the September 2026 GraphQL language/schema/validation/execution concepts frozen in the inventory. HTTP transport, pagination practice, federation, and N+1 mitigation are separate scopes.

## How this group fits the mental model

A schema defines available types and root operations. A document supplies operations and selections. Validation checks the document against the schema before execution; resolvers produce values, and execution returns data and possible errors.

## Supplied names explained

### GraphQL schema

The typed description of queryable/mutable capabilities, object relationships, arguments, and scalar/enum types. It is a contract clients can validate operations against; schema design and resolver authorization both matter.

### Query root operation type

The schema type for read operations. Query fields should be designed as reads; implementations may execute independent selections concurrently.

### Mutation root operation type

The schema type for writes. Top-level mutation fields execute serially in document order, but this does not create a transaction across fields or guarantee rollback after partial failure.

### Subscription root operation type

The schema type for subscription operations. A subscription source produces events, and each event is executed to create a response; transport and lifecycle are external concerns.

### Query operation

An executable request selecting data from the query root. It is intended to read; validation and resolver policy still determine allowed work.

### Mutation operation

An executable request invoking mutation root fields. Treat retries and partial effects carefully; operation naming alone does not define idempotency.

### Subscription operation

An operation that establishes a source stream and generates response results as source events arrive. Define authorization, filtering, cancellation, and backpressure in the implementation/transport.

### Named operation

An operation with an explicit name, useful when a document contains several operations and the request selects one by name, and for logs/allowlists.

### Anonymous operation

An operation without a name. A document with multiple operations requires a name to select one; anonymous operations are convenient only for a single operation.

### Selection set

A brace-delimited collection of fields, fragments, or inline fragments describing the requested shape. Fields returning composite types normally require nested selections. The September 2026 specification permits empty selection sets in specified cases.

### Empty selection set

An empty set of selections, valid under the September 2026 specification, including the empty query form `{}`. Implementations and tooling need to follow the current specification rather than assume older validation rules.

### Field

A named schema item selected for a result, possibly with arguments and nested selections. Field collection/merging rules affect execution when fragments repeat compatible fields.

### Field alias

Renames a selected field in the response key without changing the schema field invoked. It also lets a document request the same field multiple times with different arguments under different response names.

### Field argument

A named input supplied to a field, validated against its declared type. Defaults and nullability influence whether it may be omitted or explicitly null.

### Variable definition

Declares a typed operation variable and optional default, allowing reusable parameterized documents. Variable types must be compatible with field argument types.

### Variable value

A runtime value supplied for a declared variable. It is coerced according to the type system; invalid values fail request validation/coercion before normal execution.

### Default variable value

A fallback in the operation definition when a variable is omitted. Explicit null is distinct from omission for nullable inputs.

### Fragment definition

A reusable selection set with a type condition. It helps share fields and can be composed through fragment spreads.

### Fragment spread

References a named fragment within a selection set. The fragment must exist, apply to a compatible type, and avoid forbidden cycles.

### Inline fragment

Embeds a selection set directly, optionally with a type condition or directives, often for interface/union-specific fields.

### Type condition

Restricts fragment selections to a compatible object/interface/union type condition. It allows querying fields available only on a possible runtime type.

### Directive

A schema-defined executable annotation that can affect validation or execution. Directives have locations, arguments, and repeatability rules.

### Repeatable directive

A directive definition marked to appear multiple times at the same location when allowed. Non-repeatable directives cannot be repeated there.

### Built-in directive `@skip`

Conditionally excludes a field/fragment when its `if` argument is true. It affects execution selection, not authorization.

### Built-in directive `@include`

Includes a field/fragment when its `if` argument is true. Clients can use it for conditional response shapes.

### Built-in directive `@deprecated`

Marks a schema element as deprecated with an optional reason, helping consumers migrate. It does not itself remove the field or enforce migration.

### Built-in directive `@specifiedBy`

Associates a custom scalar with a specification URL describing its serialization/meaning. The URL is documentation metadata, not a validator implementation.

### Built-in directive `@oneOf`

Marks an input object as a OneOf input object: exactly one field must be supplied and non-null. The 2026 edition clarifies inhabitability rules; the directive itself predates this edition.

### Scalar type

A leaf type representing a serialized primitive/domain value. Custom scalar coercion must define input and output behavior consistently; built-ins have specified meanings.

### Built-in scalar `Int`

Signed 32-bit integer value in GraphQL’s specified range. Do not assume arbitrary database-sized integers fit.

### Built-in scalar `Float`

GraphQL floating-point scalar, represented as a double-precision value according to the specification. Monetary precision usually needs a custom representation.

### Built-in scalar `String`

Text value serialized as a string.

### Built-in scalar `Boolean`

True/false value.

### Built-in scalar `ID`

Identifier scalar serialized as a string; its opacity/uniqueness are application contract concerns.

### Enum type

A finite set of named values. It helps make allowed choices explicit, but adding/removing values can affect exhaustive client code.

### Object type

A composite schema type with fields. It can implement interfaces and participate in unions; field resolvers determine runtime values.

### Interface type

A set of fields that implementing object types must provide. Clients can select common fields and use inline fragments for concrete-specific fields.

### Union type

A type whose result may be one of specified object types but shares no declared common fields except meta-level fields such as `__typename`. Use fragments to select concrete fields.

### Input Object type

A structured input type for arguments/variables. It is distinct from output object types and cannot contain output-only fields.

### OneOf Input Object

An input object constrained to exactly one non-null supplied member. It models an exclusive choice; recursively impossible OneOf structures are constrained by current inhabitability rules.

### List type modifier

Wraps a type in list syntax, allowing a sequence of values. Nullability of the list and each item is independently controlled by `!`.

### Non-Null type modifier

Wraps a type so null is not an acceptable value at that position. For output, a null from a resolver can propagate to a nullable parent and produce execution errors; input omission/null rules differ by context.

### Schema extension

Adds definitions such as root operation mappings or directives to an existing schema under extension validation rules.

### Type extension

Adds fields/interfaces/directives to an existing type where allowed, commonly for modular schema composition. Conflicting definitions are invalid.

### Field deprecation

Schema metadata indicating a field should no longer be used and may be removed in a future breaking change. Track usage before removal and provide migration guidance.

### Schema description

Human-readable descriptive text attached to schema elements using description syntax. It supports generated documentation but does not change execution semantics.

### Introspection system

Schema-level fields/types that let clients/tools inspect the schema. Production exposure and policy can be configured by implementations; introspection does not provide authorization for business fields.

### `__schema`

Introspection field returning metadata about the schema, including types and root operation types, subject to server policy.

### `__type(name:)`

Introspection field retrieving metadata for a named schema type. It can support tooling and validation workflows.

### `__typename`

Meta-field returning the runtime object type name, helpful for polymorphic results and client caches.

### GraphQL document validation

Checks operation structure, field existence, argument/type compatibility, fragment validity, and other static rules before execution. Validation does not replace resolver authorization or query cost control.

### Field collection and merging

Execution groups fields with the same response key according to the specification and validates conflicts. Aliases create different response keys; repeated compatible fields may be merged.

### Resolver

Implementation that returns a field value, often using parent/source, arguments, context, and execution metadata. It should enforce access controls and avoid uncontrolled database fan-out.

### Serial mutation execution

Top-level mutation fields execute serially in the order written. Nested selections still resolve as part of each field; serial ordering does not imply one database transaction for the full operation.

### Subscription source stream

The async/event source created from a subscription operation after validation and authorization. It emits source events consumed during the subscription lifetime.

### Subscription response stream

The sequence of GraphQL execution results produced from subscription source events. A transport carries these results and must support lifecycle/cancellation.

### Partial data with execution errors

An execution result may contain both `data` and `errors` when some fields fail while others resolve. Non-null propagation can null parent portions; clients should inspect both.

### GraphQL response errors

Errors describing request/validation/coercion or execution problems, often with locations/path/extensions as applicable. Do not expose sensitive internals in messages.

### GraphQL response extensions

Optional implementation-defined metadata in the response, often for tracing/cost or other protocol integrations. Clients should not rely on unspecified extension keys.

## Cross-item comparison

Query reads; mutation changes state; subscription yields repeated results. Input objects and output objects are different type categories. Interface and union represent polymorphism differently: interfaces share fields; unions enumerate object alternatives. Nullable/non-null and list wrappers compose independently.

## Examples

```graphql
query OrderCard($id: ID!) {
  order(id: $id) {
    __typename
    number
    status
    customer { displayName }
  }
}
```

The operation selects a response shape; `$id` is a required variable, `Order` is a composite type, and resolvers supply fields. Validation checks the document before execution. Field-level authorization and query-cost limits remain necessary.

## Common mistakes

- Assuming GraphQL validation guarantees authorization.
- Using `Int` for values outside its specified range.
- Treating `ID` as authorization or secret-bearing.
- Assuming mutation serial execution is a transaction.
- Ignoring partial data and execution errors.
- Assuming `@deprecated` removes a field or that every server exposes introspection identically.

## Knowledge checks with answers

1. **When does validation occur?** Before execution, after parsing/coercion steps as defined by the implementation pipeline.
2. **What does mutation serial execution guarantee?** Top-level fields run in order, not atomic rollback.
3. **Can response data and errors coexist?** Yes, for partial execution failures.
4. **What does `__typename` reveal?** Runtime object type name.

### Exact terms covered

- `GraphQL schema`
- `Query root operation type`
- `Mutation root operation type`
- `Subscription root operation type`
- `Query operation`
- `Mutation operation`
- `Subscription operation`
- `Named operation`
- `Anonymous operation`
- `Selection set`
- `Empty selection set`
- `Field`
- `Field alias`
- `Field argument`
- `Variable definition`
- `Variable value`
- `Default variable value`
- `Fragment definition`
- `Fragment spread`
- `Inline fragment`
- `Type condition`
- `Directive`
- `Repeatable directive`
- `Built-in directive @skip`
- `Built-in directive @include`
- `Built-in directive @deprecated`
- `Built-in directive @specifiedBy`
- `Built-in directive @oneOf`
- `Scalar type`
- `Built-in scalar Int`
- `Built-in scalar Float`
- `Built-in scalar String`
- `Built-in scalar Boolean`
- `Built-in scalar ID`
- `Enum type`
- `Object type`
- `Interface type`
- `Union type`
- `Input Object type`
- `OneOf Input Object`
- `List type modifier`
- `Non-Null type modifier`
- `Schema extension`
- `Type extension`
- `Field deprecation`
- `Schema description`
- `Introspection system`
- `__schema`
- `__type(name:)`
- `__typename`
- `GraphQL document validation`
- `Field collection and merging`
- `Resolver`
- `Serial mutation execution`
- `Subscription source stream`
- `Subscription response stream`
- `Partial data with execution errors`
- `GraphQL response errors`
- `GraphQL response extensions`
