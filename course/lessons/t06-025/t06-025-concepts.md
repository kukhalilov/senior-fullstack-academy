# JavaScript package managers, dependency graphs, and lockfiles — Core concepts and how they fit together

## Learning objectives

After this lesson, you should be able to distinguish a manifest from a lockfile, explain how direct and transitive dependencies form a graph, choose a dependency category, predict when installs update or reject a lockfile, and explain why manager and layout choices matter in a workspace.

## Prerequisites

You should be comfortable reading JSON, running terminal commands, and using Git. A package is a versioned unit of reusable code. A dependency is a package another package needs. A transitive dependency is required indirectly through another dependency. A registry is a service from which package managers can fetch published package artifacts.

## Core concepts

### Manifest intent and resolved graph

`package.json` is a manifest. It records package metadata, scripts, workspace patterns, and dependency specifiers. A specifier such as `^3.4.1` is a constraint. It does not identify the one release to install. The resolver combines constraints from the whole graph, manager policy, peer requirements, overrides, platform conditions, and lockfile data. Two packages can require incompatible ranges; the resolver must either find a graph satisfying the constraints, report a conflict, or apply a manager-specific policy.

The graph starts at the root's direct dependencies. If A requires B and B requires C, then B and C are transitive from the application's perspective. A graph can contain multiple versions of a package when constraints differ. A peer dependency adds a relationship to a host package; it is common for plugins that must share the host's instance. Do not assume the tree is always a single flat version per name.

### Dependency categories express different ownership

- `dependencies` are packages the published/runtime product needs.
- `devDependencies` support development, tests, linting, or building. Production-only install modes often omit them.
- `peerDependencies` state compatibility with a host supplied by a consumer or surrounding application. npm v7+ installs peers by default, but conflicting peer requirements can still make resolution fail or produce warnings.
- `optionalDependencies` may be skipped or fail on some systems. Code using one must handle it being absent. An optional peer is a peer marked optional using `peerDependenciesMeta`; npm does not automatically install that optional peer.

Do not place a runtime import only in `devDependencies`; a production install may omit it. Conversely, putting every tool in `dependencies` increases the production graph unnecessarily. A category is a declaration of purpose, not a security boundary. [npm package.json](https://docs.npmjs.com/cli/v12/configuring-npm/package-json/)

Install-time lifecycle scripts are a separate security decision from dependency classification. npm 12 default-denies dependency scripts unless the package is approved in `allowScripts`; `npm install-scripts approve|deny|ls|prune` manages those entries, and `strict-allow-scripts` can fail the install when scripts remain unreviewed. This concerns dependency install hooks, not an intentional `npm run build` command. Deno also blocks npm lifecycle scripts by default and exposes `deno approve-scripts`; Bun uses its `trustedDependencies` policy. These controls differ, so a manager migration must re-review which scripts run. [npm install-scripts](https://docs.npmjs.com/cli/commands/npm-install-scripts/) · [Deno approve-scripts](https://docs.deno.com/runtime/reference/cli/approve_scripts/) · [Bun install](https://bun.sh/docs/pm/cli/install)

### Ranges versus exact selections

A semantic version range is a set of versions allowed by a specifier. A lockfile records the selected graph, including concrete resolved versions and integrity metadata where supported. For example, with a full version:

- `^1.2.3` generally permits versions below `2.0.0`, while `^0.2.3` permits below `0.3.0` and `^0.0.3` below `0.0.4` in npm's `node-semver` behavior.
- `~1.2.3` permits patch-level movement below `1.3.0`.
- `1.2.3` as an exact pin does not express a range of later stable versions.

Prerelease matching and partial ranges have additional rules. These operators express accepted updates, not a guarantee that the author's compatibility promises are correct. Always inspect the resolved change. [node-semver](https://github.com/npm/node-semver)

### Lockfile update and strict install are different operations

An ordinary install is for reconciling declared intent and the lock. For npm, compatible locked versions are reused; if a changed manifest makes them incompatible, `npm install` resolves and updates the lock. `npm ci` is intentionally strict: it requires a lock, checks manifest/lock consistency, removes existing `node_modules`, installs the whole project, and writes neither manifest nor lock. If the project created its lock with tree-shaping flags such as legacy peer behavior, CI needs matching configuration.

Other managers have different names and defaults. In detected CI pnpm freezes an existing lock by default; use `--frozen-lockfile` explicitly when the policy should be clear. Yarn Classic v1 uses `--frozen-lockfile`; Berry uses `--immutable`, defaulting on CI. Bun does not enable frozen mode automatically, while `bun ci` is its CI-oriented command. Deno 2.8+ `deno ci` requires a readable lockfile, clears prior `node_modules`, and runs a frozen install. A frozen install catches lock drift; it does not prove that install scripts, registry responses, or platform-specific artifacts are harmless. [npm ci](https://docs.npmjs.com/cli/v12/commands/npm-ci/) · [pnpm install](https://pnpm.io/cli/install) · [Yarn install](https://yarnpkg.com/cli/install/) · [Bun install](https://bun.sh/docs/pm/cli/install) · [Deno ci](https://docs.deno.com/runtime/reference/cli/ci/)

### Manager-specific metadata and layout

`overrides` in npm's root manifest can replace selected transitive resolutions. Yarn's root-level `resolutions` has a similar goal but different syntax and constraints. These fields are not universal package.json standards in the sense of identical semantics across managers; migration requires translating and testing policy.

The lockfile is also manager-specific. npm's `package-lock.json` is the current root-project lock. `npm-shrinkwrap.json` is historical: npm 12 no longer reads or writes it, so projects upgrading from older npm must rename a root shrinkwrap to `package-lock.json`. Before v12, shrinkwrap could be published and took precedence over package-lock. pnpm uses `pnpm-lock.yaml`. Yarn Classic and Berry both use `yarn.lock`, though Berry's format/features differ. Bun uses text `bun.lock` by default since v1.2, with `bun.lockb` as a legacy binary format. Deno uses `deno.lock`, which can cover npm, JSR, and other supported module dependencies. The same filename or migration support does not make formats equivalent. [npm lockfile migration](https://docs.npmjs.com/files/package-lock.json.html) · [npm changelog](https://docs.npmjs.com/cli/using-npm/changelog/) · [Bun lockfile](https://bun.sh/docs/pm/lockfile) · [Deno lockfile](https://docs.deno.com/examples/dependency_lockfile_tutorial/)

### Dependency layout is part of resolution behavior

A conventional `node_modules` directory relies on Node-style ancestor lookup and may expose hoisted packages that a package did not declare. pnpm's typical symlinked virtual-store design exposes direct dependencies while sharing package files from a content-addressable store. Yarn Berry's Plug'n'Play writes a loader/map rather than creating `node_modules`; it can catch undeclared or ghost dependencies early, but some tools need integration. Berry can instead use `nodeLinker: node-modules` or `pnpm`. Layout is not just a disk-space choice: it changes how tools find packages and how undeclared imports fail. [pnpm layout](https://pnpm.io/symlinked-node-modules-structure) · [Yarn linkers](https://yarnpkg.com/features/linkers)

### Workspaces define local package boundaries

Workspaces let a repository contain several packages with their own manifests. npm, Yarn, and Bun read workspace patterns from root `package.json`; pnpm requires a root `pnpm-workspace.yaml` (and documents migration from package.json patterns when one is absent); Deno declares members in root `deno.json` and can also support npm-style workspace projects. A workspace command may target one package, all packages, or a package plus dependencies/dependents. Know which set it selects before running tests or publishing.

The `workspace:` protocol requests a local package explicitly in managers that support it. Exact syntax and publishing conversion differ. npm workspaces may link a local package when a matching name/range is installed, but do not copy `workspace:*` into an npm project and assume it has the same meaning. [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces/) · [pnpm workspaces](https://pnpm.io/workspaces) · [Deno workspaces](https://docs.deno.com/runtime/fundamentals/workspaces/)

## Mechanisms and relationships

Consider a workspace `web → ui → date-library`. The `web` manifest states its direct edge to `ui`; `ui` declares its own edge to `date-library`. The root manager resolves both edges, checks peer constraints, records the graph in one manager's lockfile, and produces a layout. A lockfile can include packages not directly imported by application source because they are transitively required. Removing a dependency from the root does not mean its package can be removed from the lock if another path still reaches it.

The manifest is the human-edited policy; the lockfile is generated resolution state. Review both together. A lock-only diff can represent a legitimate transitive change after a range update, but it can also expose an unexpected registry/source/version change. A manifest-only dependency edit that omits its lock update should fail strict CI.

## Worked examples

### Reproducible npm workflow

```sh
npm install
git diff -- package.json package-lock.json
npm ci
```

The first command adds or reconciles dependencies and may update the lock. Review and commit both files. The final command simulates a clean CI install: if the committed lock does not match the manifest, it fails instead of repairing the repository. [npm install](https://docs.npmjs.com/cli/v12/commands/npm-install/) · [npm ci](https://docs.npmjs.com/cli/v12/commands/npm-ci/)

### Use a filtered pnpm task deliberately

```sh
pnpm --filter @academy/web test
pnpm --filter "...@academy/web" test
```

The first selects the named workspace. The dependency selector form with a leading ellipsis can include its dependency set; exact filter expressions are a pnpm feature, not portable shell syntax. Check pnpm's filtering reference before using selectors in CI. [pnpm filtering](https://pnpm.io/filtering)

## Misconceptions and edge cases

1. **“The manifest is enough for reproducibility.”** A range may resolve differently later; commit the lock and use a strict install.
2. **“A lockfile makes every machine byte-identical.”** Platform filters, native builds, lifecycle scripts, environment, registry policy, and tool versions can differ.
3. **“Frozen means the same across managers.”** It means each manager's own lock-mutation guard, with different defaults and side effects.
4. **“One package name means one installed copy.”** Multiple versions or peer contexts may be necessary.
5. **“All dependencies belong in `dependencies`.”** Tooling generally belongs in `devDependencies`; the runtime deployment mode matters.
6. **“Workspace packages are just folders.”** They are package boundaries with names, manifests, dependency declarations, and manager-specific linking rules.
7. **“The lockfile reveals security.”** It records resolution data; assess provenance, lifecycle scripts, vulnerabilities, permissions, and update policy separately.
8. **“Installing is always a passive download.”** Managers may run lifecycle/build scripts; policies vary. Deno, Bun, and npm have distinct script approval/execution rules.

## Knowledge checks with answers

1. **Why commit a lockfile if the manifest already contains versions?** Because common manifest values are ranges, while the lock records concrete graph choices.
2. **What should CI do when a manifest change makes the lock stale?** Fail clearly. Update the lock intentionally, review it, and commit it.
3. **Why might PnP expose a bug that went unnoticed with hoisted `node_modules`?** It can reject access to an undeclared dependency that happened to be available through hoisting.
4. **Is `workspace:*` portable across all managers?** No. Its support and meaning are manager-specific; consult the selected manager and publish behavior.
5. **Does an exact pin replace a lockfile?** No. Transitive dependencies and integrity/resolution details still need to be recorded.
