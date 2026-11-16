<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# React Redux Toolkit store slices selectors middleware and async workflows — Exercises and worked solutions

# Goals

Practice designing canonical state, composing slices into a store, deriving values through selectors, and representing async work through lifecycle actions. The scenario uses a small reading list; use RTK and React-Redux concepts from the supplied topic inventory.

# Worked example

Build a `books` feature with normalized entities and a `readingList` feature with book IDs. The total number of pages should be derived from entities and IDs. The canonical facts are each book's page count and which IDs are in the list; do not store a redundant `totalPages` field.

```ts
import { configureStore, createEntityAdapter, createSlice, createSelector } from '@reduxjs/toolkit'
import { useDispatch, useSelector, Provider } from 'react-redux'

type Book = { id: string; title: string; pages: number }
const booksAdapter = createEntityAdapter<Book>()
const booksSlice = createSlice({
  name: 'books',
  initialState: booksAdapter.getInitialState(),
  reducers: { booksReceived: booksAdapter.setAll },
})
const readingListSlice = createSlice({
  name: 'readingList',
  initialState: { ids: [] as string[] },
  reducers: {
    bookAdded(state, action: { payload: string }) {
      if (!state.ids.includes(action.payload)) state.ids.push(action.payload)
    },
    bookRemoved(state, action: { payload: string }) {
      state.ids = state.ids.filter(id => id !== action.payload)
    },
  },
})
const store = configureStore({ reducer: { books: booksSlice.reducer, readingList: readingListSlice.reducer } })
type RootState = ReturnType<typeof store.getState>
const selectListIds = (state: RootState) => state.readingList.ids
const selectBookEntities = (state: RootState) => state.books.entities
const selectPages = createSelector([selectListIds, selectBookEntities], (ids, entities) =>
  ids.reduce((sum, id) => sum + (entities[id]?.pages ?? 0), 0),
)
const useAppDispatch = useDispatch.withTypes<typeof store.dispatch>()
const useAppSelector = useSelector.withTypes<RootState>()

function PageTotal() {
  const pages = useAppSelector(selectPages)
  const dispatch = useAppDispatch()
  return <button onClick={() => dispatch(readingListSlice.actions.bookAdded('b1'))}>{pages} pages</button>
}
```

`Provider` would wrap the app root as `<Provider store={store}><PageTotal /></Provider>`. This example assumes IDs are valid; production input should be validated and the UI should define what to do when a referenced book is absent.

# Exercises

1. **State design:** Add a `status` value for initial book loading. Decide whether total pages should be stored or derived, and justify the choice.
2. **Selector stability:** Change `selectPages` to return `{ total, count }`. Explain why the current selector remains stable when inputs do not change and what would happen if the object were built directly in a `useSelector` inline callback.
3. **Async lifecycle:** Define a `createAsyncThunk` that loads books from `/api/books`, passes `thunkAPI.signal` to `fetch`, rejects on non-success, and handles pending/fulfilled/rejected in `extraReducers`.
4. **Workflow selection:** The user edits a search query rapidly and only the latest query should be processed after a short pause. Choose between a thunk and listener middleware; explain cancellation limits.
5. **Integration:** Explain the render/update path after `bookAdded` is dispatched and the selector's numeric total changes.

# Progressive hints

1. Keep entity data in the entity slice, IDs in the reading-list slice, and derive totals from both.
2. A memoized selector's result reference is reused while memoized inputs remain unchanged; an inline object selector allocates on each call.
3. The payload creator receives `{ signal }`; `extraReducers` builder handles the generated lifecycle action creators.
4. Listener middleware is designed for action/state reactions and cancellable workflows. Aborting a client request cannot undo server work already accepted.
5. Middleware passes dispatch onward, reducers create new immutable state, then subscriptions run and `useSelector` compares the prior/new selection.

# Complete solutions

1. Add `status: 'idle' | 'loading' | 'failed'` to the books adapter's extra initial state. Update it in lifecycle reducers. Derive pages because it is fully determined by IDs and page counts; storing it would create a second source of truth.
2. A `createSelector` result function can return `{ total, count }`, and Reselect reuses its prior result while its inputs are unchanged. An inline `useSelector(state => ({ total: ..., count: ... }))` returns a new object whenever evaluated; default `===` sees a new reference and schedules an update. Either use a memoized selector or a suitable equality function.
3. One valid implementation:

   ```ts
   const loadBooks = createAsyncThunk<Book[], void, { rejectValue: string }>(
     'books/load', async (_arg, { signal, rejectWithValue }) => {
       const response = await fetch('/api/books', { signal })
       if (!response.ok) return rejectWithValue(`HTTP ${response.status}`)
       return response.json()
     },
   )
   ```

   In `extraReducers`, `addCase(loadBooks.pending, state => { state.status = 'loading' })`; fulfilled should call `booksAdapter.setAll(state, action.payload)` and set status to idle; rejected should set failure status and handle `action.payload` when present, otherwise `action.error`. A real implementation also types and validates the server response.
4. Listener middleware is a natural fit because the workflow reacts to a changing action stream and wants latest-only behavior. Cancel prior instances and use an abort-aware wait/request. Cancellation stops cooperative client work; it cannot guarantee rollback of server processing.
5. Dispatch enters middleware; reducers calculate next state; subscribers are notified. React-Redux runs the selector and compares its result with the previous one. If the numeric total differs, the component rerenders; if unchanged, it can skip the update.

# Tests and edge cases

- Adding an ID twice should preserve one list entry.
- Removing an unknown ID should leave list content unchanged.
- A missing entity should not crash the derived total if the selected fallback is intentional.
- Zero and negative page counts need domain validation; silently summing them may conceal malformed server data.
- Replacing the book entity with the same object reference should not invalidate the selector; replacing relevant data should.
- A rejected request can be a server validation rejection, thrown network error, abort, or condition cancellation; the UI should distinguish cases when the user experience requires it.
- Two concurrent requests can finish out of order. Use request IDs or a policy that prevents stale results from overwriting newer state.

# Reflection questions

1. Which facts are canonical, and which values are derived?
2. When would this list be better as component-local state?
3. When would RTK Query be a better choice than a handwritten `createAsyncThunk` request?
4. What observable behavior would prove your selector is recomputing too often?
5. Which side effects could not be reversed if a listener task is cancelled?

Sources: [createEntityAdapter](https://redux.js.org/toolkit/api/createEntityAdapter), [createSlice](https://redux.js.org/toolkit/api/createSlice), [createSelector](https://redux.js.org/toolkit/api/createSelector), [createAsyncThunk](https://redux.js.org/toolkit/api/createAsyncThunk), [createListenerMiddleware](https://redux.js.org/toolkit/api/createListenerMiddleware), [React-Redux Hooks](https://redux.js.org/react-redux/api/hooks).
