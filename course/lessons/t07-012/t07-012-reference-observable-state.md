
# MobX observables computeds actions reactions and React integration — Reference: Observable creation and annotations

# Scope and version

This reference covers MobX 7.1.7's observable creation APIs. MobX 7 requires native `Proxy` support and removes the MobX 6 ES5 fallback and `configure({ useProxies })`. It also replaces namespaced annotation properties with named exports: use `observableRef`, `observableShallow`, and `observableStruct` in current code. See [Observable state](https://mobx.js.org/observable-state.html), [MobX 6-to-7 migration](https://mobx.js.org/migrating-from-6-to-7.html), [Configuration](https://mobx.js.org/configuration.html), and [Decorators](https://mobx.js.org/enabling-decorators.html).

# How this group fits the mental model

Observable state is the reactive input to computeds, reactions, and observed UI. The choice of API controls which properties are observable, how nested values are enhanced, whether object identity is preserved, and whether later-added keys are tracked.

# Supplied names explained

- `observable annotation` — Annotation used to mark a property as observable in `makeObservable`, `makeAutoObservable` overrides, or decorator syntax. Deep enhancement is the usual behavior for convertible plain data; class instances and primitives are not recursively converted as ordinary objects.
- `observable(value)` — Creates an observable from a plain object, array, Map, or Set by cloning and enhancing it. Its modern documented signature also accepts overrides and options. It does not make a class instance's fields observable automatically.
- `observable.object(value, annotations?, options?)` — Creates an observable plain object. It uses Proxy-backed behavior, allowing later property additions to be observed; avoid using a plain object as an unbounded key map with arbitrary keys, for which `observable.map` is designed.
- `observable.array(initialValues?, options?)` — Creates an observable array. Array reads and mutations can be tracked; its items are deeply enhanced when supported unless options specify otherwise. Observable arrays have some helper methods, but normal array methods remain the usual interface.
- `observable.map(initialValues?, options?)` — Creates an observable Map with tracked key/value changes, appropriate for collections indexed by dynamic keys. Prefer it to an object when the key set grows unpredictably.
- `observable.set(initialValues?, options?)` — Creates an observable Set whose membership additions/removals can be tracked; values appear at most once, and unlike Map keys, Set values are not tracked individually. Use `{ deep: false }` to leave members unconverted.
- `makeObservable(target, annotations, options?)` — Annotates selected members on the target in place, commonly from a class constructor. Only declared/available members can be annotated; inheritance has specific override rules. Its options are sticky and may only be provided once. For class instances, annotated fields are non-configurable and action/flow members non-writable under safe descriptors; each class must annotate members it declares and supported overrides use `override`. ECMAScript `#private` fields are not supported by make-observable annotation APIs; TypeScript `private` or Stage 3 private auto-accessors are alternatives.
- `makeAutoObservable(target, overrides?, options?)` — Infers annotations for an object/class: own properties observable, getters computed, setters actions, functions auto-actions, and generator functions flows. Use `false` overrides to exclude members. It cannot be used with classes that have a superclass or are subclassed. Generator inference can fail under transpilers that obscure generator syntax, so annotate flow explicitly if needed.
- `extendObservable(target, properties, overrides?, options?)` — Introduces new properties on an existing object and makes those new properties observable. Existing properties are not changed, and adding a property this way is not itself a fact observers can react to. It is mainly useful for legacy constructor patterns; explicit `makeObservable` or observable factories are often clearer.
- `extendObservable existing fields` — The API leaves properties already on the target untouched; it annotates only newly introduced properties. Adding the property itself is not an observable event that MobX reactions can track.
- `makeObservable class and inheritance limitations` — Annotated class fields are non-configurable and action/flow members non-writable under safe descriptors. Each class annotates its own declared fields; supported inherited annotations need `override`. ECMAScript `#private` fields are unsupported by make-observable annotation APIs; TypeScript `private` or Stage 3 private auto-accessors are alternatives.
- `observableRef annotation` — Named MobX 7 annotation tracking assignment/replacement of a field without deep-converting the assigned value. Useful for immutable external objects or values whose internals MobX should not observe. MobX 6's `observable.ref` spelling was removed.
- `observableShallow annotation` — Named annotation that makes a collection observable while leaving its contents unconverted. Collection membership/index operations react, but nested object fields do not become observables through that annotation. MobX 6's `observable.shallow` spelling was removed.
- `observableStruct annotation` — Named annotation that compares assigned values structurally and suppresses updates when the new value is structurally equal. Structural comparison has cost and should be chosen deliberately. MobX 6's `observable.struct` spelling was removed.
- `MobX 6-to-7 replacement of namespaced annotation exports` — MobX 7 uses standalone named exports for modifier annotations to improve tree-shaking. Migrate `observable.ref`, `.shallow`, and `.struct` to `observableRef`, `observableShallow`, and `observableStruct` respectively.
- `observable.box(value, options?)` — Wraps a primitive or other standalone value in an observable box with `.get()` and `.set()`. Primitive values cannot themselves be proxied; boxes are mainly useful in low-level/library use cases.
- `isObservable(value)` — Runtime predicate indicating whether a value is an observable object/collection or other observable MobX value. Use for diagnostics or interop rather than branching core app logic on implementation details.
- `isObservableProp(value, property)` — Checks whether a particular property on a target is observable. Useful for debugging annotation mistakes.
- `toJS(value)` — Recursively converts observable structures into plain JavaScript structures. It is not a universal serialization format: cycles, class semantics, functions, and domain serialization still need explicit handling. For class instances, an intentional `toJSON` contract is often clearer.
- `@observable accessor property decorator` — Modern Stage 3 decorator form for observable fields, using the required `accessor` keyword: `@observable accessor title = ''`. MobX 7 requires modern decorator semantics; accessor-backed fields are non-enumerable and non-own, which can affect `Object.keys`, spreads, and implicit JSON serialization.
- `observable.array.clear()` — Removes every item from an observable array reactively and returns the removed items. Use it when the intent is to empty the array while retaining its observable identity.
- `observable.array.replace(newItems)` — Replaces the array contents in place with the supplied iterable/array values, preserving the observable array object.
- `observable.array.remove(value)` — Removes a single matching item and returns `true` if it was found and removed.
- `observable.map.toJSON()` — Produces a shallow plain-object representation of this Map; use `toJS` when a recursive observable-to-plain conversion is needed. Plain-object conversion cannot preserve arbitrary Map key identity, so choose an explicit serialization format where that matters.
- `observable.map.merge(values)` — Copies entries from a plain object, array of entries, or string-keyed ES6 Map into this Map without replacing unrelated existing keys.
- `observable.map.replace(values)` — Replaces the map's contents with entries from the supplied input, removing keys not present there while retaining the observable map identity.
- `observableDeep annotation alias` — `observableDeep` is a named alias for the default deep `observable` annotation, provided alongside the other MobX 7 named annotation exports. Deep enhancement recursively converts supported plain objects, arrays, Maps/Sets and functions as documented, but not primitives or class instances.
- `observableDeep named annotation current export` — The current MobX 7 named export is `observableDeep`; MobX 6's `observable.deep` namespace property is removed. This alias means the default deep observable annotation.

# Cross-item comparison

`makeObservable` is explicit and preserves the target object identity. `makeAutoObservable` reduces annotation work but infers behavior and does not support inheritance. `observable(value)` returns an enhanced observable value. For dynamic keyed collections, use `observable.map`; for a fixed-shape object, use an object/factory or class model. `observableRef` observes replacement only, while `observableShallow` observes collection changes but not deep contents; `observableStruct` uses structural equality to avoid equivalent assignments.

Modern decorators are optional. With TypeScript 5+, do not enable the legacy `experimentalDecorators` flag for Stage 3 decorators. If a codebase needs the old decorator proposal or a no-Proxy runtime, MobX 6 is the documented compatibility choice.

# Examples

```ts
import { makeObservable, observable, observableRef } from 'mobx'

class SessionStore {
  user = { id: 'u1', name: 'Amina' }
  selectedIds = new Set<string>()
  immutableSnapshot: Readonly<Record<string, unknown>> | null = null

  constructor() {
    makeObservable(this, {
      user: observable,
      selectedIds: observable,
      immutableSnapshot: observableRef,
    })
  }
}

const byId = observable.map<string, SessionStore>()
```

The `observableRef` example is a named annotation in `makeObservable`; it tracks replacement of `immutableSnapshot` without converting the assigned value.

# Common mistakes

- Expecting nested class instances or primitives to become observable automatically.
- Replacing `makeAutoObservable` with inheritance-heavy models; that API explicitly does not support subclassing.
- Using `observable.object` for a high-cardinality, unpredictable key registry instead of a Map.
- Forgetting that `observable(value)` returns an enhanced clone, while `makeObservable` modifies the target.
- Assuming shallow/ref annotations recursively observe nested object properties.
- Assuming `toJS` preserves class prototypes or constitutes safe JSON serialization.
- Applying legacy decorators under MobX 7 or omitting `accessor` from modern `@observable` properties.

# Knowledge checks with answers

1. Which API annotates a target in place? **`makeObservable` (and `makeAutoObservable` for inferred annotations).**
2. Which observable constructor is best for dynamic keys? **`observable.map`.**
3. What does `observableRef` track? **Replacement of the field value, not the assigned object's internal properties.**
4. Why is `accessor` required in modern MobX decorators? **It is part of Stage 3 decorator syntax and makes the property an accessor; MobX 7 requires this modern form.**
5. What runtime requirement does MobX 7 impose? **Native Proxy support for observable plain objects and arrays.**

Sources: [Observable state](https://mobx.js.org/observable-state.html), [MobX 6-to-7 migration](https://mobx.js.org/migrating-from-6-to-7.html), [Configuration](https://mobx.js.org/configuration.html), [Decorators](https://mobx.js.org/enabling-decorators.html).
