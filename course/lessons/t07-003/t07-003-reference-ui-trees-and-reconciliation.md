# React elements render purity reconciliation identity and keys — Reference: React UI trees and matching rendered children

Sources: React 19.3 [Understanding Your UI as a Tree](https://react.dev/learn/understanding-your-ui-as-a-tree), [Render and Commit](https://react.dev/learn/render-and-commit), and [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state).

## Scope and version

This reference compares React's conceptual render tree to host and module trees and introduces child matching. Detailed state/key rules are in the following lesson.

## Three different trees

The render tree models which components are rendered under other components for a particular output. The host DOM tree is the browser's actual elements/text nodes after React DOM commits. A component can disappear as a component boundary in the host tree, while a fragment can group render children without a DOM wrapper. The module dependency tree models JavaScript/TypeScript imports; it helps reason about bundles and code organization, not component parentage.

The tree's shape can change with conditions, data, and component output. Reconciliation compares the next rendered children with previous children to determine matching and updates. It is not a general deep equality comparison of arbitrary element objects. Child matching uses structural position and type, with keys identifying siblings when list positions change. Type changes typically replace the subtree; stable type/position/key can preserve identity. Host identity follows renderer semantics; it should not be inferred solely from module import relationships.

## Why trees are useful

The render tree helps explain state ownership and propagation. The host DOM tree helps diagnose actual markup/layout/accessibility. The module tree helps detect import cycles, bundle boundaries, and application dependencies. Conflating these graphs leads to wrong assumptions, such as expecting a component name in the DOM or assuming changing an import necessarily resets UI state.

## Example

`App → ProductList → ProductRow` is a render-tree relationship. The host tree might be `div → ul → li → button`, with no DOM node named ProductList/ProductRow. The module dependency tree might show `App.tsx` importing ProductList and ProductRow importing a formatter; the formatter import does not create a parent UI node.

## How this group fits the mental model

Reconciliation uses the render tree to decide which component and host identities continue and what host changes must be committed.

## Cross-item comparison

| Tree | Represents | Primary use |
|---|---|---|
| Render tree | Rendered component relationships | State, reconciliation, data flow |
| Host DOM tree | Browser elements/text | DOM behavior and browser rendering |
| Module dependency tree | Imports | Build/bundle/code architecture |

## Common mistakes

Assuming every component corresponds to a DOM element; treating React trees as module graphs; expecting object deep equality to drive reconciliation; and ignoring sibling keys when list children reorder.

## Knowledge checks with answers

1. **Which tree contains component boundaries?** The render tree.
2. **Which tree is inspected by browser DOM tools?** The host DOM tree.
3. **Does module import parent equal UI parent?** No.
4. **What guides reconciliation of list children?** Sibling identity including keys, type, and structural position.

## Supplied names explained

The exact index below covers the three tree models and the matching/identity concepts declared for this group.

## Examples

The ProductList example above shows how one render component can emit host nodes while importing modules unrelated to visual parentage.

## Exact terms covered

- `Render tree`
- `Host DOM tree`
- `Module dependency tree`
- `Reconciliation`
- `Child matching`
- `Component identity`
- `Host element identity`
- `Sibling identity`
