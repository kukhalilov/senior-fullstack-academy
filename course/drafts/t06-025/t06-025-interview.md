# JavaScript package managers, dependency graphs, and lockfiles — Interview questions and reasoning

## Core questions

1. What is the difference between a package manifest and a lockfile?
2. Explain direct and transitive dependencies and why a package may appear multiple times in a dependency graph.
3. When would you use `dependencies`, `devDependencies`, `peerDependencies`, and `optionalDependencies`?
4. Why should an application commit a lockfile and use a strict install in CI?
5. How do workspaces help a monorepo, and what remains separate between workspace packages?
6. What is the difference between a version range and the exact version selected for an install?
7. How does a dependency layout affect undeclared imports and tooling compatibility?
8. What should you inspect when a lockfile changes unexpectedly?
9. How do npm 12 and Deno control dependency lifecycle scripts, and what can fail if a native package's script is skipped?

## Concise interview answers

1. A manifest declares package intent, scripts, and acceptable dependency constraints. A lockfile records a concrete manager-specific resolution for the full dependency graph.
2. Direct dependencies are listed by the application; transitive dependencies are required by another dependency. Several versions can coexist when constraints or peer contexts require them.
3. Runtime imports belong in dependencies, development/build/test tools in devDependencies, host integrations in peerDependencies, and genuinely optional capabilities in optionalDependencies with code that tolerates absence.
4. A lockfile makes resolution changes reviewable and lets CI reject missing or stale updates rather than silently selecting a different graph.
5. Workspaces compose packages in one repository and can link local packages. Each workspace still needs its own manifest and should declare its own dependencies; manager-specific root configuration determines membership.
6. A range defines versions the resolver may select. The lockfile records the actual selected versions and associated resolution data.
7. Hoisting can accidentally expose undeclared packages. pnpm's linked layout and Yarn PnP can reveal missing declarations, while PnP may require tools to support its loader/map.
8. Review direct/transitive versions, source URLs, integrity data, peer changes, platform conditions, workspace links, manager version, and whether the manifest intentionally changed.
9. npm 12 defaults dependency install scripts to denied unless covered by `allowScripts`; Deno does not run npm scripts by default and offers `deno approve-scripts`. Approve only reviewed packages. If a required native build hook is skipped, the package can resolve and install while its runtime binding remains unavailable.

## Deep follow-up answers

### Why isn't a lockfile a complete reproducibility guarantee?

It constrains dependency resolution for a particular manager and format, but installed output may still vary by operating system, CPU, libc, optional dependencies, native compilation, lifecycle scripts, registry access, environment, and manager version. Strong reproducibility also requires controlled toolchains, reviewed script policy, supported platform tests, and stable build inputs. A frozen install protects one important boundary: it prevents unreviewed dependency resolution changes.

### What is the practical difference between npm install and npm ci?

`npm install` reconciles package declarations with lock data and may write the lock. `npm ci` is an automated clean install: it requires a supported lockfile, rejects manifest/lock mismatch, deletes existing `node_modules`, installs the whole project, and does not edit the manifest or lock. CI should use the latter when the repo commits npm's lock. Flags that shaped lock resolution must be consistently configured in CI. [npm install](https://docs.npmjs.com/cli/v12/commands/npm-install/) · [npm ci](https://docs.npmjs.com/cli/v12/commands/npm-ci/)

### How do other managers express strict installation?

Use manager-specific guidance: pnpm `install --frozen-lockfile`; Yarn Classic `install --frozen-lockfile`; Yarn Berry `install --immutable`; Bun `bun ci` or `install --frozen-lockfile`; Deno `deno ci`. pnpm freezes in detected CI when an existing lock needs updating; Berry immutable mode defaults on CI; Bun install does not automatically freeze just because CI is detected. These commands protect different manager lock semantics and should not be swapped mechanically. [pnpm](https://pnpm.io/cli/install) · [Yarn](https://yarnpkg.com/cli/install/) · [Bun](https://bun.sh/docs/pm/cli/install) · [Deno](https://docs.deno.com/runtime/reference/cli/ci/)

### Why can strict layouts break code that worked after npm install?

Traditional hoisting may place a dependency at an ancestor `node_modules`, making it resolvable even though the importing workspace did not declare it. A more constrained linked tree or PnP map can make the missing edge visible. Fix the manifest where the import occurs; don't treat the incidental path as an API. This also improves package independence and publishing correctness. [pnpm motivation](https://pnpm.io/motivation) · [Yarn PnP](https://yarnpkg.com/features/pnp)

### What should a manager migration validate?

Identify the exact old/new manager versions; translate workspace patterns, protocol specifiers, overrides/resolutions, peer policies, and install-script trust; regenerate the new lock from reviewed manifest intent; check the linker/layout; then run clean installs and all scripts on supported operating systems. Inspect the entire lock diff and test packaging/publishing. Do not commit both managers as if contributors could choose without changing project semantics.

## Scenario questions

1. CI fails at `npm ci` immediately after a contributor adds a dependency. What evidence do you ask for and what correction do you expect?
2. A library's React plugin has two copies of React at runtime. Which dependency declaration and graph properties do you inspect?
3. A monorepo passes with Yarn `node_modules` but fails under PnP due to a missing package. How do you decide whether to declare the dependency or adapt tooling?
4. A Deno project has a `package.json` and `deno.json`; a contributor says `deno install` changed the wrong file. How would you make the target explicit and verify the lock?
5. A team wants exact pins everywhere to avoid surprise updates. What does that address, and what does it leave unresolved?
6. A published CLI must retain an exact dependency graph for its consumers. Which npm lockfile mechanism might be relevant, and what is its tradeoff?
7. A native optional dependency is missing on one CI platform. Is that necessarily a lockfile failure? How should behavior be tested?

## Scenario answer outlines

1. **`npm ci` fails after a dependency edit.** Ask whether `package.json` and `package-lock.json` were both committed and whether CI uses the same tree-shaping npm configuration. Expect the contributor to run `npm install` intentionally, inspect the full lockfile diff, run project checks, and commit the updated manifest and lock together; do not replace the CI clean install with a lock-mutating command.
2. **A React plugin loads two React copies.** Confirm React is a `peerDependency` of the plugin (often also a `devDependency` for plugin tests), inspect the application and plugin lock resolution, workspace links, aliases, and bundler deduplication. Check that peer ranges overlap and that only the host supplies the runtime singleton. A peer declaration communicates compatibility but does not itself guarantee one physical copy.
3. **PnP exposes an undeclared package.** Check whether source imports the package directly. If so, declare it in the importing workspace; if a tool internally expects undeclared filesystem paths, use a supported Yarn SDK/compatibility configuration or select a linker the tool supports. Do not add accidental dependencies just to silence a resolution error.
4. **Deno wrote dependencies to the wrong manifest.** Use `deno install --package-json <package>` (or the corresponding `deno add --package-json`) to force `package.json`; otherwise Deno chooses based on nearby configuration and preference settings. Review the changed manifest and `deno.lock`, then run `deno ci` to confirm the checked-in lock can be installed without changes.
5. **Exact pins everywhere.** Exact direct pins narrow the allowed direct version but do not pin transitive dependencies, manager/runtime/compiler versions, platform-specific optional packages, lifecycle-script effects, or build inputs. Keep a lockfile and controlled update/CI workflow.
6. **A published CLI needs a locked dependency tree.** Historically `npm-shrinkwrap.json` could be published and took precedence, but npm 12 no longer loads it. For current npm, reassess whether `bundleDependencies` or another packaging/distribution design meets the need; this bundles selected packages and increases artifact size/maintenance, and must be verified against the actual published archive.
7. **An optional native package is missing on one CI platform.** Not necessarily: optional dependencies may be skipped or fail on unsupported OS/CPU/libc, and a lockfile does not make native builds identical. Confirm platform metadata, install logs, script approval, and fallback behavior; test each supported platform and ensure missing optional functionality is handled deliberately.

## Tradeoffs and alternatives

- **npm versus pnpm:** npm's conventional layout is widely expected; pnpm emphasizes store reuse and declared dependency visibility. Decide based on ecosystem/tool compatibility and team policy, not a universal speed claim.
- **Yarn Berry node_modules versus PnP:** choose filesystem compatibility or explicit dependency boundaries/tooling requirements. Berry also offers a pnpm-style linker.
- **Ranges versus exact pins:** ranges make policy and updates concise; pins narrow direct selection. The lockfile still matters for transitive resolution, and an update workflow must review security and compatibility.
- **Workspace versus independent repositories:** workspaces ease coordinated local changes and shared tooling, but increase root orchestration and graph complexity. Separate repositories provide stronger isolation at the cost of cross-package coordination.
- **Optional dependency versus required dependency:** optional installation improves platform reach only if application logic has a meaningful fallback.

## Common weak answers

- “A lockfile makes builds perfectly reproducible.” It makes resolution more reproducible for a manager; platform/scripts/toolchain effects remain.
- “Peer dependencies are optional dependencies.” Peers express host compatibility; optional is a separate install/failure policy.
- “Caret means update to any version below the next major.” That fails for 0.x ranges; the left-most nonzero component rule matters.
- “npm ci and pnpm install --frozen-lockfile are identical.” Their intent is analogous, while manager behavior and flags differ.
- “The dependency works, so it must be declared.” Hoisting may make undeclared imports appear to work.
- “Workspace packages all share the root dependencies.” Each workspace has its own package boundary; root dependency inheritance is manager-specific and should not be assumed.
- “The lockfile is safe because it is committed.” It is reviewable resolution data, not a security audit or script sandbox.
- “Deno install is just npm install with a different executable.” Deno has runtime/cache integration, config-target behavior, and its own strict `deno ci` workflow.

## Self-check rubric

Score each answer from 0 to 2: 0 = inaccurate or missing, 1 = partly correct but missing a boundary, 2 = precise and gives a practical consequence.

- I distinguish manifest constraints, resolved graph, lockfile, and installed layout.
- I can explain the role and absence behavior for each dependency category.
- I name the correct strict-install command for a specified manager and major version.
- I know why CI lock mismatch should fail and how to update it intentionally.
- I explain how hoisting, symlinks, PnP, and workspaces affect resolution.
- I do not overstate lockfiles, exact pins, or version ranges as complete reproducibility/security guarantees.
- I can review a migration by naming manager-specific manifests, lockfiles, protocols, scripts, and platform tests.

Sources: [npm package.json](https://docs.npmjs.com/cli/v12/configuring-npm/package-json/) · [npm ci](https://docs.npmjs.com/cli/v12/commands/npm-ci/) · [pnpm workspaces](https://pnpm.io/workspaces) · [Yarn linkers](https://yarnpkg.com/features/linkers) · [Bun lockfile](https://bun.sh/docs/pm/lockfile) · [Deno dependency management](https://docs.deno.com/runtime/packages/)
