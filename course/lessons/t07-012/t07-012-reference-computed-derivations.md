
# MobX observables computeds actions reactions and React integration — Reference: Computed values and derivation annotations

# Scope and version

This reference covers MobX 7.1.7 computed derivations and their lifecycle. MobX 7 replaces the old `computed.struct` property with the named `computedStruct` export. See [Computeds](https://mobx.js.org/computeds.html), [Observable state](https://mobx.js.org/observable-state.html), and [MobX 6-to-7 migration](https://mobx.js.org/migrating-from-6-to-7.html).

# How this group fits the mental model

Computed values are spreadsheet formulas over observables. MobX tracks their inputs, evaluates lazily when read, caches while observed, and invalidates them when inputs change. They are the preferred home for derivable values, rather than duplicated stored state or reactions that write one observable from another.

# Supplied names explained

- `computed annotation` — Annotation that marks a getter as a computed derivation in `makeObservable`, overrides, or decorator syntax. Computed getters are non-enumerable. It must represent a pure value and should not update observables or perform effects.
- `computed(options)` — Annotation factory with options such as custom equality behavior and lifecycle/debug settings supported by the installed MobX version. The annotation is applied to a getter; it is not the same as calling a function to create a standalone computed box.
- `computed(fn, options?)` — Creates a standalone computed value from a derivation function, returning a computed observable that can be read via `.get()` or observed by a reaction. Use this low-level form when a class getter is not appropriate.
- `@computed getter` — Modern decorator form for a getter. It requires Stage 3 decorator configuration; no `accessor` keyword is used for getters. Legacy decorator configurations are not supported by MobX 7. A modern `@computed` getter does not automatically make its setter an action; wrap a call that mutates through such a setter in an action.
- `computedStruct annotation` — MobX 7 named computed annotation that compares the newly derived output structurally with the previous result and suppresses downstream notification when structurally equal. It can save reactions when a computed creates equivalent objects, but structural comparison itself costs work. MobX 6's `computed.struct` spelling was removed.
- `MobX 6-to-7 replacement of namespaced annotation exports` — Modifier annotations became named exports; import `computedStruct` from `mobx` instead of accessing `computed.struct`.
- `computed options equals` — Supplies the equality comparer used for successive derivation results; when outputs compare equal, downstream observers need not be notified. MobX's migration guide shows using `equals: compareStructural` for structural comparison, whose cost should be justified.
- `computed options keepAlive` — Keeps a computed value alive while unobserved. This bypasses normal suspension and can retain dependencies, so use sparingly and ensure the lifetime is bounded.
- `computed options requiresReaction` — When enabled for an expensive computed, warns in development if it is read outside a reactive context, where it is not cached; the value is still returned and production builds do not warn. It overrides the global `computedRequiresReaction` setting for that computed.
- `computed options name` — Sets a diagnostic name used in MobX tooling and debug output; it does not affect derivation semantics.
- `computedStruct annotation current named export` — The current MobX 7 export is `computedStruct`; the former `computed.struct` namespaced property was removed during the 6-to-7 cleanup.
- `Computed getter caching` — While a computed is observed and its dependencies remain unchanged, MobX reuses its cached result. This is dependency-driven caching, not an eternal cache keyed by arbitrary function arguments.
- `Computed value suspends when unobserved` — When nobody observes a computed, MobX normally suspends it and drops its cached value; reading it later can recompute. Use `keepAlive` only for a demonstrated need because retaining unobserved computed graphs can leak memory.
- `Computed values cannot have side effects` — A computed should not mutate observables, dispatch external requests, write storage, or otherwise cause effects. Side effects can make evaluation order and cache reuse incorrect; model external synchronization with reactions or explicit event handlers.
- `Keep derivable values out of stored state` — Store canonical facts and expose calculations as computed values. Duplicating a total/count/filter result into mutable state creates synchronization obligations and inconsistent states.

# Cross-item comparison

A computed getter belongs to a model and reads its observable properties; standalone `computed(fn, options?)` represents a derivation without needing a getter. `computedStruct` changes equality-based propagation, not purity. Ordinary computed caching depends on observation and input changes; it is not a general-purpose cache for parameterized methods. For an argument-taking calculation, use a normal method or an explicit memoization strategy rather than pretending it is a property computed.

# Examples

```ts
import { makeAutoObservable, computed } from 'mobx'

class Invoice {
  lines: Array<{ price: number; quantity: number }> = []

  constructor() { makeAutoObservable(this) }

  get total() {
    return this.lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
  }
}

const invoice = new Invoice()
const totalBox = computed(() => invoice.total)
console.log(totalBox.get())
```

`makeAutoObservable` infers the getter as computed, so the standalone box here is illustrative of the API form and would usually be redundant. Use either the inferred getter or the box when a standalone derivation is actually needed.

# Common mistakes

- Putting a side effect in a computed getter.
- Assuming a computed remains cached after it becomes unobserved.
- Applying `computedStruct` without considering the cost of structural comparison.
- Using a computed getter with parameters; getters cannot model a parameterized memoization cache.
- Storing both canonical facts and a computed total in observable state.
- Expecting a standalone computed to expose its result as a normal property rather than through `.get()`.

# Knowledge checks with answers

1. When is a computed cached? **While observed and until its dependencies change.**
2. What happens when no one observes it? **It normally suspends and may recompute on a later read.**
3. When is `computedStruct` useful? **When a derivation creates structurally equivalent values and suppressing downstream notifications is worth the comparison cost.**
4. Where should an HTTP request go? **An explicit event handler, async flow/action, or reaction when synchronization is truly state-driven—not a computed.**

Sources: [Computeds](https://mobx.js.org/computeds.html), [Observable state](https://mobx.js.org/observable-state.html), [MobX 6-to-7 migration](https://mobx.js.org/migrating-from-6-to-7.html).
