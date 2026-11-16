<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# MobX observables computeds actions reactions and React integration — Reference: Observable creation and annotations

# Scope and version

This reference covers MobX 7.1.7's observable creation APIs. MobX 7 requires native `Proxy` support and removes the MobX 6 ES5 fallback and `configure({ useProxies })`. `makeObservable`/`makeAutoObservable` annotate the supplied target; `observable(value)` generally creates an observable clone or collection. See [Observable state](https://mobx.js.org/observable-state.html), [Configuration](https://mobx.js.org/configuration.html), [Decorators](https://mobx.js.org/enabling-decorators.html), and the [MobX 7 releases](https://github.com/mobxjs/mobx/releases).

# How this group fits the mental model

Observable state is the reactive input to computeds, reactions, and observed UI. The choice of API controls which properties are observable, how nested values are enhanced, whether object identity is preserved, and whether later-added keys are tracked.

# Supplied names explained

- `observable annotation` — Annotation used to mark a property as observable in `makeObservable`, `makeAutoObservable` overrides, or decorator syntax. Deep enhancement is the usual behavior for convertible plain data; class instances and primitives are not recursively converted as ordinary objects.
- `observable(value)` — Creates an observable from a plain object, array, Map, or Set by cloning and enhancing it. Its modern documented signature also accepts overrides and options. It does not make a class instance's fields observable automatically.
- `observable.object(value, annotations?, options?)` — Creates an observable plain object. It uses Proxy-backed behavior, allowing later property additions to be observed; avoid using a plain object as an unbounded key map with arbitrary keys, for which `observable.map` is designed.
- `observable.array(initialValues?, options?)` — Creates an observable array. Array reads and mutations can be tracked; its items are deeply enhanced when supported unless options specify otherwise. Observable arrays have some helper methods, but normal array methods remain the usual interface.
- `observable.map(initialValues?, options?)` — Creates an observable Map with tracked key/value changes, appropriate for collections indexed by dynamic keys. Prefer it to an object when the key set grows unpredictably.
- `observable.set(initialValues?, options?)` — Creates an observable Set. Membership and collection changes can be tracked; in MobX 7, Set operations use native-like semantics, with patch fixes to keep stored observable values reflected consistently in spy/observe events.
- `makeObservable(target, annotations, options?)` — Annotates selected members on the target in place, commonly from a class constructor. Only declared/available members can be annotated; inheritance has specific override rules. Its options are sticky and may only be provided once.
- `makeAutoObservable(target, overrides?, options?)` — Infers annotations for an object/class: own properties observable, getters computed, setters actions, functions auto-actions, and generator functions flows. Use `false` overrides to exclude members. It cannot be used with classes that have a superclass or are subclassed. Generator inference can fail under transpilers that obscure generator syntax, so annotate flow explicitly if needed.
- `extendObservable(target, properties, overrides?, options?)` — Adds properties to an existing object and makes them observable with the supplied overrides/options. It is a legacy-compatible API; for new designs, explicit `makeObservable` or constructing an observable source is often clearer.
- `observable.ref` — Annotation tracking assignment/replacement of a field without deep-converting the assigned value. Useful for immutable external objects or values whose internals MobX should not observe.
- `observable.shallow` — Annotation that makes a collection observable while leaving its contents unconverted. Collection membership/index operations react, but nested object fields do not become observables through that annotation.
- `observable.struct` — Annotation that compares assigned values structurally and suppresses updates when the new value is structurally equal. Structural comparison has cost and should be chosen deliberately.
- `observable.box(value, options?)` — Wraps a primitive or other standalone value in an observable box with `.get()` and `.set()`. Primitive values cannot themselves be proxied; boxes are mainly useful in low-level/library use cases.
- `isObservable(value)` — Runtime predicate indicating whether a value is an observable object/collection or other observable MobX value. Use for diagnostics or interop rather than branching core app logic on implementation details.
- `isObservableProp(value, property)` — Checks whether a particular property on a target is observable. Useful for debugging annotation mistakes.
- `toJS(value)` — Recursively converts observable structures into plain JavaScript structures. It is not a universal serialization format: cycles, class semantics, functions, and domain serialization still need explicit handling. For class instances, an intentional `toJSON` contract is often clearer.
- `@observable accessor property decorator` — Modern Stage 3 decorator form for observable fields, using the required `accessor` keyword: `@observable accessor title = ''`. MobX 7 requires modern decorator semantics; accessor-backed fields are non-enumerable and non-own, which can affect `Object.keys`, spreads, and implicit JSON serialization.

# Cross-item comparison

`makeObservable` is explicit and preserves the target object identity. `makeAutoObservable` reduces annotation work but infers behavior and does not support inheritance. `observable(value)` returns an enhanced clone. For dynamic keyed collections, use `observable.map`; for a fixed-shape object, use an object/factory or class model. `observable.ref` observes replacement only, while `observable.shallow` observes collection changes but not deep contents; `observable.struct` uses structural equality to avoid equivalent assignments.

Modern decorators are optional. With TypeScript 5+, do not enable the legacy `experimentalDecorators` flag for Stage 3 decorators. If a codebase needs the old decorator proposal or a no-Proxy runtime, MobX 6 is the documented compatibility choice.

# Examples

```ts
import { makeObservable, observable } from 'mobx'

class SessionStore {
  user = { id: 'u1', name: 'Amina' }
  selectedIds = new Set<string>()
  immutableSnapshot: Readonly<Record<string, unknown>> | null = null

  constructor() {
    makeObservable(this, {
      user: observable,
      selectedIds: observable,
      immutableSnapshot: observable.ref,
    })
  }
}

const byId = observable.map<string, SessionStore>()
```

The `observable.ref` example is an annotation in `makeObservable`; it tracks replacement of `immutableSnapshot` without converting the assigned value.

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
3. What does `observable.ref` track? **Replacement of the field value, not the assigned object's internal properties.**
4. Why is `accessor` required in modern MobX decorators? **It is part of Stage 3 decorator syntax and makes the property an accessor; MobX 7 requires this modern form.**
5. What runtime requirement does MobX 7 impose? **Native Proxy support for observable plain objects and arrays.**

Sources: [Observable state](https://mobx.js.org/observable-state.html), [Configuration](https://mobx.js.org/configuration.html), [Decorators](https://mobx.js.org/enabling-decorators.html), [MobX 7 releases](https://github.com/mobxjs/mobx/releases).
