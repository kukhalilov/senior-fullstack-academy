# creational structural and behavioral design patterns — Reference: The seven canonical GoF structural patterns

Sources: [Design Patterns: Elements of Reusable Object-Oriented Software](https://www.oreilly.com/library/view/design-patterns-elements/0201633612/) and [design pattern catalog](https://refactoring.guru/design-patterns/catalog).

## Scope and version

This lesson covers the seven canonical structural patterns. Wrappers can resemble each other structurally; distinguish them by intent.

## How this group fits the mental model

Structural patterns organize collaborators and provide boundaries so clients can use a larger system or object graph through a useful shape.

## Supplied names explained

### Adapter

Converts one interface to another expected by a client. It preserves the underlying service’s role while translating calls/data. Use it at a compatibility boundary; do not spread provider-specific translation across callers.

### Bridge

Separates an abstraction from its implementation so both can vary independently. It addresses two dimensions of variation that otherwise create a subclass cross-product. It is more than placing any interface between two classes.

### Composite

Composes objects into tree structures and lets clients work with leaves and groups through a shared contract. It suits hierarchies such as folders or UI elements. Keep operations meaningful for leaves; avoid forcing unsupported operations onto every node.

### Decorator

Wraps an object with the same compatible interface to add responsibilities dynamically. Multiple decorators can be composed. Wrapping order may change behavior, and long chains can complicate debugging.

### Facade

Provides a simpler entry point to a subsystem. It coordinates existing components without necessarily hiding every advanced capability. Avoid turning a facade into a large god object that owns all policies.

### Flyweight

Shares reusable intrinsic state across many logical objects while keeping variable extrinsic state outside the shared object. It trades memory savings for indirection and state-management complexity; measure before applying.

### Proxy

Provides a stand-in that controls access to another object/resource, for example lazy access, remote access, or protection. A proxy may preserve the subject contract but adds timing, failure, and identity considerations.

## Cross-item comparison

Adapter changes the contract; Decorator preserves the contract while adding behavior; Proxy controls access; Facade simplifies a subsystem. Bridge separates independent dimensions, while Composite models part-whole trees; Flyweight shares repeated intrinsic state.

## Examples

Wrap a legacy payment client in an Adapter to match the application’s payment contract. Wrap the adapted client in a Decorator to add bounded metrics. A Proxy could defer a costly remote connection until first use. The same wrapper syntax does not make these intents interchangeable.

## Common mistakes

- Calling every wrapper a Decorator.
- Applying Flyweight without many repeated objects or measured memory pressure.
- Letting a Facade accumulate unrelated business responsibilities.
- Assuming Bridge is just any interface or dependency injection is enough.
- Hiding new failure modes behind a Proxy without modeling them.

## Knowledge checks with answers

1. **Adapter versus Decorator?** Translate the contract versus add behavior behind a compatible contract.
2. **What does Composite represent?** A part-whole tree with uniform client treatment.
3. **What does Flyweight share?** Intrinsic state common to many objects.

### Exact terms covered

- `Adapter`
- `Bridge`
- `Composite`
- `Decorator`
- `Facade`
- `Flyweight`
- `Proxy`

### Exact terms covered

- `Adapter`
- `Bridge`
- `Composite`
- `Decorator`
- `Facade`
- `Flyweight`
- `Proxy`
