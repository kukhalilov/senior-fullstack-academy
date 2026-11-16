# JavaScript package managers, dependency graphs, and lockfiles — Reference: Dependency declaration and reproducible install commands

## Scope and version

This reference explains all 19 supplied declarations and commands, using current manager docs checked 2026-11-16. Commands are manager-specific. Examples use the ordinary shell; when passing flags through a package script, argument separator rules can differ. [npm package.json](https://docs.npmjs.com/cli/v12/configuring-npm/package-json/) · [npm run](https://docs.npmjs.com/cli/v12/commands/npm-run/) · [Deno dependency management](https://docs.deno.com/runtime/packages/)

## How this group fits the mental model

Dependency fields express which role an edge plays in the graph. Commands then edit those declarations, install the graph, run project scripts, or execute a binary. A reproducible workflow separates “intentionally change dependency resolution” from “install the committed resolution.”

## Supplied names explained

- `dependencies` — Direct packages needed by the deployed package at runtime. If application code imports a dependency in production, placing it only in development dependencies can break production-only installation. Avoid declaring transitive packages as direct dependencies only because they happen to be hoisted; declare what your code imports. [npm dependency categories](https://docs.npmjs.com/specifying-dependencies-and-devdependencies-in-a-package-json-file/)
- `devDependencies` — Tooling needed for development, tests, linting, type checking, or builds. Production install flags typically omit this category, but the exact install result is manager/configuration-specific. If deployment compiles source, its build stage still needs the development toolchain before pruning.
- `peerDependencies` — A compatibility requirement on a host package, commonly a plugin/library pair that should share the host's instance. npm v7+ installs peers by default; conflicts may still require choosing compatible versions. A library should express a support range broad enough for versions it really tests. [npm peer dependencies](https://docs.npmjs.com/cli/v12/configuring-npm/package-json/)
- `optionalDependencies` — Packages whose absence or supported install failure should not abort installation. The application must branch around unavailable functionality. Platform-specific native implementations often use this model. An optional peer is separately represented by peer metadata; npm does not automatically install optional peers. [npm optional dependencies](https://docs.npmjs.com/cli/v12/configuring-npm/package-json/)
- `overrides` — npm root-manifest policy for replacing selected transitive resolutions, such as forcing a patched transitive version or a fork. It does not act as a universal field for every package manager. npm restricts mismatched overrides of direct dependencies. [npm overrides](https://docs.npmjs.com/cli/v12/configuring-npm/package-json/)
- `resolutions` — Yarn's root-level mechanism for forcing selected dependency resolutions. It may constrain nested paths and is not a drop-in syntax alias for npm `overrides`; translate intent and validate the resulting graph during migration. [Yarn manifest](https://yarnpkg.com/configuration/manifest)
- `npm install` — Installs packages and reconciles `package.json` with npm lock data. Compatible locked resolutions are reused; when constraints no longer match, npm can resolve and update the lock. With package arguments, it can add dependencies and edit the manifest. In npm 12, `package-lock.json` precedes a supported `yarn.lock`; npm-shrinkwrap is no longer loaded. npm 12 also restricts URL dependency installation by default, so external tarball/Git/file sources need deliberate policy/configuration. [npm install](https://docs.npmjs.com/cli/v12/commands/npm-install/) · [npm changelog](https://docs.npmjs.com/cli/using-npm/changelog/)
- `npm ci` — Clean project install for CI/deployment: requires an npm lockfile, rejects manifest/lock mismatches, removes current `node_modules`, installs the whole project, and does not write the manifest or lockfile. If tree-shaping flags were required to generate the lock (for example, legacy peer resolution), retain those project settings for CI. [npm ci](https://docs.npmjs.com/cli/v12/commands/npm-ci/)
- `npm run` — Runs a named entry from `scripts`; no command lists them. It adds local executable binaries to `PATH`, runs from the package root, supports workspace targeting, and uses a platform-dependent shell. Put `--` before flags meant for the script, for example `npm run test -- --watch`. [npm run](https://docs.npmjs.com/cli/v12/commands/npm-run/)
- `npm exec` — Runs a local or fetched package executable in a project-like environment. `--package` can supply one or more packages; the `--` separator prevents npm from parsing the executed command's flags. A requested package absent locally may be fetched into npm's cache, so review the name/version and avoid surprising prompt/install behavior in scripts. [npm exec](https://docs.npmjs.com/cli/v12/commands/npm-exec/)
- `pnpm install` — Installs project dependencies, or all workspace projects by default in a workspace. In CI, it fails if an existing lock needs updating. Use `--frozen-lockfile` explicitly to communicate that policy; `--no-frozen-lockfile` permits lock changes. Filters/production flags affect selected or materialized packages but do not erase the graph from a newly created lock. [pnpm install](https://pnpm.io/cli/install)
- `pnpm add` — Adds a package and saves it to `dependencies` by default. Options select development, optional, peer, exact, workspace-only, or other dependency intent. Adding at the workspace root may require an explicit root flag; running from a package directory is often clearer. [pnpm add](https://pnpm.io/cli/add)
- `pnpm --filter` — Selects workspace package(s) for a command. A selector can match a package name/path, changed packages, or include dependency/dependent sets via ellipsis forms. The selector syntax is pnpm-specific; quote glob-like patterns so the shell does not expand them unexpectedly. [pnpm filtering](https://pnpm.io/filtering)
- `yarn install` — Installs the whole Yarn project. For Classic v1, `--frozen-lockfile` rejects a needed lock change. For Berry, use `--immutable`; Yarn sets it true by default on CI and the older flag is a compatibility alias. Berry may also freeze cache changes or check cached checksums with separate options. [Classic](https://classic.yarnpkg.com/lang/en/docs/cli/install/) · [Berry](https://yarnpkg.com/cli/install/)
- `yarn workspaces` — The workspace feature groups named packages in one project; Berry also has workspace-specific commands for listing members, focusing an install, and running a command across workspaces. This inventory item names the feature family, not one standalone command. Classic and Berry command availability differs, so check the project's major version. Each workspace has its own manifest and declared dependency boundary. [Yarn workspaces](https://yarnpkg.com/features/workspaces) · [Yarn commands](https://yarnpkg.com/cli/workspaces/list) · [Yarn foreach](https://yarnpkg.com/cli/workspaces/foreach)
- `bun install` — Installs dependencies from a Bun/Node-style project manifest and writes `bun.lock`. Bun defaults differ from npm: dependency lifecycle scripts are not run for arbitrary packages unless trusted, while the project's own scripts follow Bun's documented behavior. Frozen installs are not automatically enabled just because CI is detected; use `bun ci` or the frozen flag. [Bun install](https://bun.sh/docs/pm/cli/install)
- `bun add` — Adds and records a dependency through Bun. Placement flags choose dependency category; inspect the manifest and lock diff, especially in a monorepo where workspace linking or catalog configuration applies. [Bun add](https://bun.sh/docs/pm/cli/add)
- `deno install` — Installs project dependencies and can add named packages. Deno selects a nearby `deno.json` or `package.json` based on project configuration; current Deno 2.8 supports `--package-json` to force that destination. With npm packages and a package.json, Deno can create `node_modules`; Deno-first projects can use its cache and import map model. It is not the strict CI command. [Deno install](https://docs.deno.com/runtime/reference/cli/install/)
- `Frozen lockfile install` — A policy: install the committed graph and fail if resolution would change the lock. Select the manager's implementation: npm `ci`; pnpm `install --frozen-lockfile`; Yarn Classic `install --frozen-lockfile`; Yarn Berry `install --immutable`; Bun `ci` or `install --frozen-lockfile`; Deno `ci`. The policy does not eliminate platform-specific outputs, script effects, or the need to pin the manager version. [Deno ci](https://docs.deno.com/runtime/reference/cli/ci/)

## Cross-item comparison

`npm install` is the dependency-edit/reconciliation path; `npm ci` is the clean strict-install path. Running `npm install` in a developer branch may legitimately change a lockfile; running `npm ci` in CI should reveal that an update has not been committed. `npm run` invokes a declared script; `npm exec` places a package executable on the command path and may fetch it if absent. In a workspace, both can be scoped with npm's workspace flags. [npm install](https://docs.npmjs.com/cli/v12/commands/npm-install/) · [npm ci](https://docs.npmjs.com/cli/v12/commands/npm-ci/) · [npm exec](https://docs.npmjs.com/cli/v12/commands/npm-exec/)

`overrides` and `resolutions` address transitive resolution but encode manager-specific policy. During migration, translate the intended package/path/version constraints rather than mechanically renaming the key. Test the graph and inspect the new lockfile. [npm overrides](https://docs.npmjs.com/cli/v12/configuring-npm/package-json/) · [Yarn resolutions](https://yarnpkg.com/configuration/manifest)

## Examples

### Add a dev tool and verify the lock

```sh
npm install --save-dev eslint
git diff -- package.json package-lock.json
npm ci
```

The first command records the dependency and resolution. Inspect both files; the clean install confirms the repository contains a consistent lock. It does not prove lint rules or the package itself are safe.

### Choose one pnpm workspace and its dependencies

```sh
pnpm --filter @academy/web test
pnpm --filter "...@academy/web" test
```

The second form selects the package and its dependency closure. If your goal is to include dependents instead, the selector changes; use pnpm's selector reference, not guesswork. [pnpm filtering](https://pnpm.io/filtering)

### Run a one-off CLI without losing option boundaries

```sh
npm exec --package=typescript -- tsc --version
```

The `--` makes the boundary clear: npm handles `--package`, and `tsc` receives `--version`. For repeatable team builds, declaring the CLI as a project dependency is usually easier to review than fetching an unconstrained tool ad hoc.

## Common mistakes

- Using a clean CI command to update a lockfile; the intended response to drift is to resolve/update deliberately and commit.
- Expecting npm commands to understand `pnpm-workspace.yaml` or Yarn's linker config.
- Passing script flags before npm's `--` and having the package manager consume them.
- Treating optional packages as always present in code.
- Declaring a plugin host as an ordinary dependency when consumers must supply a shared instance.
- Forcing a transitive version without checking whether it remains API-compatible with its parent.
- Using `npm exec package` in automation without controlling version, prompting, and network policy.
- Treating `deno install` and `deno ci` as synonyms.

## Knowledge checks with answers

1. **When should `npm ci` fail?** When the required lock is missing or the manifest and lock do not agree; it should not repair the lock.
2. **What does `npm exec --` protect?** It separates npm's options from the command and flags passed to the executable.
3. **Does `pnpm --filter` syntax work in Yarn?** No; it is pnpm's workspace selector feature.
4. **Which command is appropriate for Deno CI?** `deno ci` for a clean frozen install; `deno install` is the general project install/add command.
5. **Why keep manager-specific override syntax in mind?** A field name or value accepted by one manager may be ignored or interpreted differently by another.
