<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# MobX observables computeds actions reactions and React integration — Reference: Computed values and derivation annotations

# Scope and version

This reference covers MobX 7.1.7 computed derivations and their lifecycle. Computed behavior is stable across the MobX 6-to-7 transition; MobX 7's major changes concern removed compatibility paths such as ES5 fallback and legacy decorators. See [Computeds](https://mobx.js.org/computeds.html), [Observable state](https://mobx.js.org/observable-state.html), and [MobX package metadata](https://www.npmjs.com/package/mobx).

# How this group fits the mental model

Computed values are spreadsheet formulas over observables. MobX tracks their inputs, evaluates lazily when read, caches while observed, and invalidates them when inputs change. They are the preferred home for derivable values, rather than duplicated stored state or reactions that write one observable from another.

# Supplied names explained

- `computed annotation` — Annotation that marks a getter as a computed derivation in `makeObservable`, an override, or a decorator. It must represent a pure value and does not accept arbitrary effectful computation.
- `computed(options)` — Annotation factory with options such as custom equality behavior and lifecycle/debug settings supported by the installed MobX version. The annotation is applied to a getter; it is not the same as calling a function to create a standalone computed box.
- `computed(fn, options?)` — Creates a standalone computed value from a derivation function, returning a computed observable that can be read via `.get()` or observed by a reaction. Use this low-level form when a class getter is not appropriate.
- `@computed getter` — Modern decorator form for a getter. It requires Stage 3 decorator configuration; no `accessor` keyword is used for getters. Legacy decorator configurations are not supported by MobX 7.
- `computed.struct` — Computed annotation that compares the newly derived output structurally with the previous result and suppresses downstream notification when structurally equal. It can save reactions when a computed creates equivalent objects, but structural comparison itself costs work.
- `Computed getter caching` — While a computed is observed and its dependencies remain unchanged, MobX reuses its cached result. This is dependency-driven caching, not an eternal cache keyed by arbitrary function arguments.
- `Computed value suspends when unobserved` — When nobody observes a computed, MobX normally suspends it and drops its cached value; reading it later can recompute. Use `keepAlive` only for a demonstrated need because retaining unobserved computed graphs can leak memory.
- `Computed values cannot have side effects` — A computed should not mutate observables, dispatch external requests, write storage, or otherwise cause effects. Side effects can make evaluation order and cache reuse incorrect; model external synchronization with reactions or explicit event handlers.
- `Keep derivable values out of stored state` — Store canonical facts and expose calculations as computed values. Duplicating a total/count/filter result into mutable state creates synchronization obligations and inconsistent states.

# Cross-item comparison

A computed getter belongs to a model and reads its observable properties; standalone `computed(fn, options?)` represents a derivation without needing a getter. `computed.struct` changes equality-based propagation, not purity. Ordinary computed caching depends on observation and input changes; it is not a general-purpose cache for parameterized methods. For an argument-taking calculation, use a normal method or an explicit memoization strategy rather than pretending it is a property computed.

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
- Applying `computed.struct` without considering the cost of structural comparison.
- Using a computed getter with parameters; getters cannot model a parameterized memoization cache.
- Storing both canonical facts and a computed total in observable state.
- Expecting a standalone computed to expose its result as a normal property rather than through `.get()`.

# Knowledge checks with answers

1. When is a computed cached? **While observed and until its dependencies change.**
2. What happens when no one observes it? **It normally suspends and may recompute on a later read.**
3. When is `computed.struct` useful? **When a derivation creates structurally equivalent values and suppressing downstream notifications is worth the comparison cost.**
4. Where should an HTTP request go? **An explicit event handler, async flow/action, or reaction when synchronization is truly state-driven—not a computed.**

Sources: [Computeds](https://mobx.js.org/computeds.html), [Observable state](https://mobx.js.org/observable-state.html), [MobX package metadata](https://www.npmjs.com/package/mobx).
