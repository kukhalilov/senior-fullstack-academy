<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# MobX observables computeds actions reactions and React integration — Exercises and worked solutions

# Goals

Practice observable model design, computed derivation, action transactions, asynchronous updates, reaction cleanup, and React observation. Use current MobX 7 APIs and distinguish domain state from transient UI state.

# Worked example

Build a product catalog with a search query. The product records and query are observable, while visible products and match count are computed. React observes the list at render time.

```tsx
import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react-lite'

type Product = { id: string; name: string; price: number }

class CatalogStore {
  products: Product[] = []
  query = ''

  constructor() {
    makeAutoObservable(this)
  }

  get visibleProducts() {
    const query = this.query.trim().toLocaleLowerCase()
    return this.products.filter(product => product.name.toLocaleLowerCase().includes(query))
  }

  setQuery(value: string) {
    this.query = value
  }
}

const catalog = new CatalogStore()

const ProductList = observer(function ProductList() {
  return <ul>{catalog.visibleProducts.map(product =>
    <li key={product.id}>{product.name}: {product.price}</li>,
  )}</ul>
})
```

The getter is inferred as computed and the method as an auto-action. The component tracks observable reads made through `visibleProducts`; changing the query invalidates the derivation and updates the list. A production application should define locale/case matching semantics explicitly and keep currency formatting in the presentation layer.

# Exercises

1. **Observable design:** Add `selectedProductId` and a computed `selectedProduct`. Explain why this selection is derived rather than copied product data.
2. **Async boundary:** Add `loadProducts()` using `async`/`await`, set a loading status before the request, and update products/status after the request. Make the post-await writes valid with action enforcement enabled.
3. **Flow alternative:** Rewrite the same method as a generator `flow`; identify the TypeScript return-type issue and the relevant helper.
4. **External synchronization:** Persist `query` to local storage using `reaction`. Make it run initially and dispose it when the owning feature shuts down.
5. **React Compiler:** A project enables React Compiler and MobX. Explain the stale-render risk and the role/order of the build plugin.
6. **Version migration:** A client must run on an old no-Proxy browser and uses legacy TypeScript decorators. Determine whether MobX 7 is a suitable upgrade and list the compatibility options.

# Progressive hints

1. Look up the selected ID against the existing product collection; avoid a duplicate mutable product object.
2. An async method's initial synchronous segment ends at its first await. Wrap later writes in `runInAction` or use another action step.
3. Use `flow`, `yield`, and `flowResult` where TypeScript needs to see the transformed promise type.
4. `reaction` separates its tracked expression from its side effect and returns a disposer. `fireImmediately` controls the initial effect.
5. React Compiler may cache JSX based on static dependencies and object identity, whereas MobX tracks mutable object properties at runtime. The MobX plugin inserts `'use no memo'` and should run before the React Compiler transform.
6. MobX 7 requires Proxy and removes legacy decorator support. MobX 6 remains the documented no-Proxy/legacy-decorator compatibility route.

# Complete solutions

1. `get selectedProduct() { return this.products.find(product => product.id === this.selectedProductId) }`. The ID is the canonical selection fact; the product object already exists in the collection. Returning the canonical instance avoids stale copied fields.
2. One valid implementation:

   ```ts
   async loadProducts() {
     this.status = 'loading'
     try {
       const products = await fetchProducts()
       runInAction(() => {
         this.products = products
         this.status = 'ready'
       })
     } catch {
       runInAction(() => { this.status = 'error' })
     }
   }
   ```

   `makeAutoObservable` marks the method as an auto-action, but that action's synchronous transaction does not remain open across the promise suspension. The callback passed to `runInAction` is a new transaction.
3. Annotate a generator as `flow` (or rely on `makeAutoObservable` inference when supported by the transpiler), then use `yield fetchProducts()`. In TypeScript, `flowResult(store.loadProducts())` communicates the promise return type that the runtime wrapper provides.
4. `const dispose = reaction(() => store.query, query => localStorage.setItem('catalog-query', query), { fireImmediately: true })`. Call `dispose()` on teardown. For startup hydration, read storage once explicitly before installing the reaction so the initial write does not overwrite the value before it is loaded.
5. Compiler memoization can reuse rendered JSX while observable contents mutate without object identity changing. `mobx-react-plugin` can automatically wrap observers and insert `'use no memo'`; configure it before React Compiler as documented, or manually mark/exclude observed components.
6. MobX 7 is unsuitable for a no-Proxy runtime and does not support legacy decorators. Stay on MobX 6 if those constraints remain, or upgrade the runtime and migrate to modern Stage 3 decorators before moving to MobX 7.

# Tests and edge cases

- Verify a query change updates the observed list even when the catalog array identity is unchanged.
- Verify an unobserved computed may recompute on a later read rather than retain an eternal cache.
- Ensure an observable class instance is explicitly annotated; nesting it in an observable array does not automatically annotate its fields.
- Test rejected requests and ensure loading does not remain stuck.
- Test reaction disposal: changing the query after disposal should not write to local storage.
- Ensure a component reading observable fields is wrapped in `observer`; the MobX plugin should not unintentionally wrap a component that is meant to be compiled/memoized normally.
- Check how `toJS`, JSON serialization, and non-enumerable accessor decorators affect persistence.

# Reflection questions

1. Which values are canonical state and which should be computed?
2. Which dependencies are implicit in the MobX version, and how could you inspect them?
3. Where does each async write boundary occur?
4. Which owner is responsible for disposing the reaction?
5. Is MobX's automatic tracking clearer for this domain than Redux's explicit action/selector path?

Sources: [Observable state](https://mobx.js.org/observable-state.html), [Actions](https://mobx.js.org/actions.html), [Computeds](https://mobx.js.org/computeds.html), [Reactions](https://mobx.js.org/reactions.html), [React integration](https://mobx.js.org/react-integration.html), [React Compiler](https://mobx.js.org/react-compiler.html), [Configuration](https://mobx.js.org/configuration.html).
