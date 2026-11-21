# creational structural and behavioral design patterns — Reference: The five canonical GoF creational patterns

Sources: [Design Patterns: Elements of Reusable Object-Oriented Software](https://www.oreilly.com/library/view/design-patterns-elements/0201633612/) and [design pattern catalog](https://refactoring.guru/design-patterns/catalog).

## Scope and version

This lesson covers the five canonical GoF creational patterns. It explains intent and tradeoffs, not required language-specific class templates.

## How this group fits the mental model

Creational patterns help when the identity, family, configuration steps, or source of objects varies in a way that should not be scattered through clients.

## Supplied names explained

### Factory Method

Defines an operation for creating a product while allowing a subtype or specialized implementation to choose the concrete product. It is useful when a creator’s workflow stays stable but the product varies. A simple factory function may be clearer when inheritance is unnecessary.

### Abstract Factory

Provides an interface for creating a family of related products that must be compatible, such as controls for one platform theme. It centralizes family selection. It can make adding a new product kind across every family expensive, so use it when family consistency is a real invariant.

### Builder

Separates construction of a complex object into explicit steps, often allowing different representations from the same process. It can clarify optional/configurable construction and enforce invariants at completion. Avoid a builder for a trivial object whose constructor is already clear.

### Prototype

Creates new objects by copying a configured prototype. It can help when setup is expensive or runtime-selected shapes vary. Define whether copying is shallow or deep and how identity/resource ownership works; copying live resources can be unsafe.

### Singleton

Restricts creation/access to one instance and exposes a global access path. It may suit a genuinely process-wide immutable service, but often hides dependencies, complicates tests, and creates lifecycle or concurrency risks. Dependency injection can provide one shared instance without making consumers depend on global access.

## Cross-item comparison

Factory Method varies product creation through a creator; Abstract Factory selects a compatible family; Builder controls multi-step construction; Prototype copies an exemplar; Singleton controls cardinality/access. A constructor or function may be simpler than any of these when creation does not vary.

## Examples

For a document editor, Builder may assemble an export package with validated steps. Abstract Factory may create a matched set of platform-specific widgets. If only one parser is selected from configuration, a direct factory function may be enough; naming it Factory Method does not make it a pattern.

## Common mistakes

- Applying Abstract Factory when there is only one product family.
- Hiding complex mutable lifetime in a Singleton.
- Ignoring copy depth and ownership with Prototype.
- Requiring Builder for every object with optional fields.
- Confusing any constructor helper with Factory Method.

## Knowledge checks with answers

1. **What distinguishes Abstract Factory?** It creates compatible families of products.
2. **What does Builder improve?** Clear, controlled multi-step construction.
3. **What is a Singleton risk?** Hidden global dependency and shared lifecycle.

### Exact terms covered

- `Factory Method`
- `Abstract Factory`
- `Builder`
- `Prototype`
- `Singleton`

### Exact terms covered

- `Factory Method`
- `Abstract Factory`
- `Builder`
- `Prototype`
- `Singleton`
