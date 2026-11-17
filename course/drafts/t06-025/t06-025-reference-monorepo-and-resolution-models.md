# JavaScript package managers, dependency graphs, and lockfiles — Reference: Workspace layouts, linking, and resolution strategies

## Scope and version

This lesson explains all supplied workspace, linker, store, and range names. The layout is a manager's implementation choice, not an ECMAScript feature. The cited official docs were checked 2026-11-17. [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces/) · [pnpm workspace](https://pnpm.io/workspaces) · [Yarn linkers](https://yarnpkg.com/features/linkers) · [Deno workspaces](https://docs.deno.com/runtime/fundamentals/workspaces/)

## How this group fits the mental model

The manifest and lockfile describe a dependency graph; the linker/materializer determines how that graph becomes paths or loader data at runtime. Workspaces add local package nodes and edges. Range syntax controls the set of compatible versions; a lockfile selects a resolution within that set.

## Supplied names explained

- `npm workspaces` — Root `package.json` patterns identify workspace packages. npm links these local packages during installation and can run scripts for one or more selected workspaces. A selected workspace's dependencies remain declared in its own manifest. npm's common workspace dependency declaration uses a version range and workspace linking behavior; do not assume npm gives every manager's `workspace:` protocol the same semantics. [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces/)
- `pnpm workspaces` — A pnpm monorepo is rooted by `pnpm-workspace.yaml`, whose `packages` patterns select member directories. Installs normally operate recursively across workspace projects. The `workspace:` protocol can require an actual local package instead of falling back to the registry; ordinary range linking can have different fallback behavior. [pnpm workspaces](https://pnpm.io/workspaces)
- `Yarn workspaces` — Root manifest globs select member packages, each with its own `package.json`. Yarn Berry adds workspace-focused commands and supports workspace protocols; Classic's command set and implementation differ. Workspaces make dependency boundaries explicit but don't mean each workspace has a physically isolated complete copy of every package. [Yarn workspaces](https://yarnpkg.com/features/workspaces)
- `Bun workspaces` — Bun reads workspace patterns from root `package.json`; matched packages need names to be linked. It supports glob patterns and local workspace specifiers such as `workspace:*`. Workspace settings influence linking and hoisting; a package matched without a valid named manifest may be skipped. [Bun workspaces](https://bun.sh/docs/pm/workspaces)
- `Deno workspaces` — A root `deno.json` can list workspace members; members may use `deno.json`, `package.json`, or both. Deno also supports npm-style workspaces and `workspace:` specifiers in package.json. Deno-first projects use import maps/config and cache semantics alongside npm compatibility. [Deno workspaces](https://docs.deno.com/runtime/fundamentals/workspaces/)
- `node_modules linker` — A strategy that materializes packages into a `node_modules` directory tree familiar to Node.js tooling. “node_modules linker” is a category, not one exact layout: npm, Yarn, Bun, pnpm, and Deno can arrange links/hoists differently, and Yarn Berry has configurable linkers. Legacy tools that walk the filesystem often expect this shape, but hoisting can expose undeclared packages accidentally.
- `Plug'n'Play linker` — Yarn Berry's PnP strategy generates a project loader/map that tells Node-compatible tooling which package may access which dependency. It does not create a conventional `node_modules` tree. This catches undeclared/ghost dependencies and avoids filesystem hoisting, but path-inspecting tools may need SDKs or compatibility configuration. [Yarn PnP](https://yarnpkg.com/features/pnp)
- `Content-addressable package store` — A store keyed by content identity so identical package files can be reused. pnpm links or clones files from its store into project installations; Yarn Berry also has cache/store-backed modes. It can reduce repeated storage/fetch work, but the store is not the project lockfile and may be machine-local or require cleanup/configuration. [pnpm motivation](https://pnpm.io/motivation)
- `Symlinked dependency layout` — A graph represented partly through symlinks/junctions between package directories. pnpm's default Node layout exposes direct dependencies via links into a virtual store. Tools using `realpath`, watchers, packagers, or custom filesystem traversal can behave differently around symlinks; Node module resolution normally accounts for links according to runtime flags and package layout. [pnpm layout](https://pnpm.io/symlinked-node-modules-structure)
- `Hoisted dependency layout` — Dependencies are moved toward a shared ancestor directory to deduplicate installations and match conventional lookup. Hoisting improves compatibility with tools expecting a flat tree but can make undeclared dependencies accidentally resolvable. Hoisting is not proof that the package declaring the dependency owns the relationship.
- `Workspace protocol dependency` — A manager-specific version specifier that requests a local workspace package, often written `workspace:*`, `workspace:^`, or `workspace:~`. pnpm can refuse registry fallback for this protocol; Yarn, Bun, and Deno support documented forms. npm workspaces link matching local packages but do not share every other manager's syntax semantics. Some managers rewrite workspace ranges during publishing. [pnpm workspace protocol](https://pnpm.io/workspaces) · [Bun workspaces](https://bun.sh/docs/pm/workspaces) · [Deno workspaces](https://docs.deno.com/runtime/fundamentals/workspaces/)
- `Semantic version range` — A constraint that matches one or more Semantic Versioning values. A range can be a comparator, wildcard/partial, caret/tilde form, or a compound range depending on the parser. A range says what the resolver may choose, not what it did choose; inspect the lock.
- `Caret range` — In npm's node-semver, permits changes that do not alter the left-most nonzero component. For example `^1.2.3` means at least 1.2.3 and below 2.0.0; `^0.2.3` means below 0.3.0; `^0.0.3` means below 0.0.4. This is why caret does not mean “any release before the next major” for all 0.x versions. Prereleases have additional matching rules. [node-semver](https://github.com/npm/node-semver)
- `Tilde range` — With a full version, usually allows patch-level changes while keeping the minor line: `~1.2.3` means at least 1.2.3 and below 1.3.0 in node-semver. Partial forms such as `~1.2` have broader semantics than the full three-component example, so don't generalize from one shorthand. [node-semver](https://github.com/npm/node-semver)
- `Exact version pin` — A specifier naming one version, such as `1.2.3`, rather than an update range. It can make direct dependency intent narrow but does not pin the transitive graph, artifact integrity, package manager version, or build environment. Lockfiles and controlled installs still matter.

## Cross-item comparison

Compare Yarn Berry's `node_modules linker` with its `Plug'n'Play linker`. The filesystem mode offers broad ecosystem compatibility but can permit accidental access via hoisting. PnP records dependency access explicitly and avoids `node_modules`, at the cost of tooling that assumes the filesystem layout. Yarn also offers a pnpm-style linker, so Berry isn't a binary choice between just these two. [Yarn linkers](https://yarnpkg.com/features/linkers)

Compare an exact version pin with a range. A pin narrows the direct declaration to a single intended version; a range offers a set of eligible updates. Both still participate in a graph with transitive dependencies and manager-specific resolution. A lockfile lets normal range declarations coexist with a committed concrete resolution, while an intentional update can move that resolution within the permitted range.

## Examples

```text
apps/web/package.json ──workspace dependency──► packages/ui/package.json
       │                                            │
       └──declares web's dependencies               └──declares ui's dependencies
                  │
                  ▼
        root manager resolves one graph
                  │
                  ▼
     lockfile + manager-specific install layout
```

If `web` imports a package that is only declared by `ui`, a hoisted layout may make that import appear to work. A stricter pnpm layout or PnP may fail because `web` has not declared its own dependency. The correct fix is usually to declare the dependency in the package that imports it, not to weaken the linker. [pnpm motivation](https://pnpm.io/motivation) · [Yarn PnP](https://yarnpkg.com/features/pnp)

```json
{
  "name": "web",
  "dependencies": {
    "@academy/ui": "workspace:^",
    "date-fns": "^4.2.0"
  }
}
```

The local protocol and range semantics must be supported by the selected manager. The lockfile then records the exact local and registry resolutions. Publishing may rewrite workspace ranges or reject them depending on manager and package workflow.

## Common mistakes

- Reading a symlinked or hoisted path as the dependency's declared ownership.
- Depending on a transitive package without declaring it directly.
- Assuming workspace globbing automatically orders build/test tasks by dependency graph; task runners may need explicit graph-aware commands.
- Using workspace protocol syntax in a manager that does not implement that exact form.
- Treating a content-addressable store as a lockfile or as an immutable security guarantee.
- Believing `^0.2.3` permits every later `0.x` version.
- Treating `~1.2.3` and `^1.2.3` as equivalent.
- Assuming an exact direct pin fixes all transitive versions.
- Assuming `node_modules` layout is the same across managers or even across a manager's configurable modes.

## Knowledge checks with answers

1. **Why can hoisting hide a missing declaration?** A package may resolve from a parent directory even though its own manifest does not list it.
2. **Does PnP create `node_modules`?** No; Yarn generates a loader/map for dependency resolution.
3. **What protects `^0.2.3` from selecting 0.3.0?** Caret semantics stop at the next left-most nonzero component.
4. **Does an exact direct pin lock transitive dependencies?** No; the lockfile records the complete selected graph.
5. **What does an explicit workspace protocol add?** It asks the manager for a local workspace dependency under that manager's documented rules.
