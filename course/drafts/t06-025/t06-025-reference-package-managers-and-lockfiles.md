# JavaScript package managers, dependency graphs, and lockfiles — Reference: Mainstream package managers and their lockfiles

## Scope and version

This reference covers exactly the supplied manager and lockfile names. Documentation snapshot: 2026-11-17. npm 12.2.2, pnpm 12.19.0, current Yarn Berry and Classic documentation, Bun's current text lockfile, and Deno 2.8+ documentation are distinguished. The version is part of the answer: do not infer current flags from an old tutorial. [npm](https://docs.npmjs.com/cli/v12/commands/npm-install/) · [npm changelog](https://docs.npmjs.com/cli/using-npm/changelog/) · [pnpm 12.19.0](https://pnpm.io/blog/releases/12.19.0) · [Bun lockfile](https://bun.sh/docs/pm/lockfile) · [Deno dependency management](https://docs.deno.com/runtime/packages/)

## How this group fits the mental model

All six tools help declare, resolve, fetch, and install dependencies, but they vary in runtime integration and materialized layout. Their lockfiles preserve manager-specific resolution details. Choose and standardize one manager for a project; migration is an explicit conversion, not a rename of the lockfile.

## Supplied names explained

- `npm` — Node.js's widely used JavaScript package manager and CLI. It reads `package.json`, resolves registry and other package sources, writes `package-lock.json` by default, and installs into a Node-style dependency tree. Use `npm install` for ordinary resolution and `npm ci` for a strict clean install. It also supplies scripts and executable commands. Workspaces are a supported root-manifest feature. [npm install](https://docs.npmjs.com/cli/v12/commands/npm-install/) · [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces/)
- **npm 12 install-script safety:** dependency lifecycle hooks are default-denied unless approved via `allowScripts`; `npm install-scripts` can list, approve, deny, or prune approvals. `strict-allow-scripts` turns unreviewed scripts into failures. This change from older npm defaults can leave a native package installed without its setup step, so review approvals and verify native modules load. [npm install-scripts](https://docs.npmjs.com/cli/commands/npm-install-scripts/) · [npm config](https://docs.npmjs.com/cli/using-npm/config/)
- `pnpm` — A package manager emphasizing shared content-addressable storage and a linked virtual-store layout. A workspace is rooted in `pnpm-workspace.yaml`; its default dependency visibility is more constrained than a flat hoisted tree, helping reveal undeclared dependencies. It is still Node package tooling and supports an npm-compatible ecosystem, though packages that assume accidental hoists or mutate installed files can need configuration. [pnpm motivation](https://pnpm.io/motivation) · [pnpm workspace](https://pnpm.io/workspaces)
- `Yarn Classic (v1)` — The original Yarn major line, using `yarn.lock` and conventional `node_modules` installs. Its CI guard is `yarn install --frozen-lockfile`. Do not apply Berry-only `.yarnrc.yml` linker descriptions or Berry command options as if they were Classic defaults. [Yarn Classic install](https://classic.yarnpkg.com/lang/en/docs/cli/install/)
- `Yarn Berry (v2+)` — Yarn's modern major line (including current Yarn 4). It keeps the `yarn` executable and `yarn.lock` filename, but has a different lock format and configurable install modes. Berry defaults to Plug'n'Play; it also supports `node-modules` and pnpm-style linkers. Berry CI uses `--immutable` (enabled by default on CI); `--frozen-lockfile` remains a compatibility alias slated for removal. [Yarn linkers](https://yarnpkg.com/features/linkers) · [Yarn install](https://yarnpkg.com/cli/install/)
- `Bun package manager` — Bun includes a package manager that can work in existing Node projects as well as Bun projects. It understands package manifests and workspaces and writes Bun's own lockfile. Runtime and manager are separate roles even though they ship together: installing with Bun does not mean the app must necessarily execute under Bun. Account for Bun-specific resolution, lifecycle-script trust, native package, and lockfile migration behavior. [Bun install](https://bun.sh/docs/pm/cli/install)
- `Deno package manager` — The Deno CLI manages dependencies used by Deno and can work with `package.json` npm projects. It supports JSR and npm sources, and configuration determines whether added dependencies go into `deno.json` or `package.json`. Its cache/runtime integration differs from the conventional Node package-manager model. Current Deno docs position `deno ci` as the strict CI install. [Deno package management](https://docs.deno.com/runtime/packages/) · [Deno install](https://docs.deno.com/runtime/reference/cli/install/)
- **Install scripts differ by manager:** Deno blocks npm lifecycle scripts until approved with `deno approve-scripts`. Bun requires packages to be trusted for dependency scripts. npm 12 uses `allowScripts`. These are supply-chain controls, not interchangeable flags, and a migration may change whether native setup runs. [Deno approve-scripts](https://docs.deno.com/runtime/reference/cli/approve_scripts/) · [Bun install](https://bun.sh/docs/pm/cli/install)
- `package.json` — The JSON package manifest used in npm projects and interoperably read by several other tools. It contains dependency declarations, scripts, package identity, and potentially workspaces. It expresses dependency intent and ranges; it is not the resolved transitive graph. Different managers may interpret manager-specific fields differently. [npm package.json](https://docs.npmjs.com/cli/v12/configuring-npm/package-json/)
- `package-lock.json` — npm's lockfile for the root project. It stores concrete resolution data so npm can reproduce the graph. Commit it for an application and use npm's corresponding clean install. It is normally not published as part of a package. [npm lockfiles](https://docs.npmjs.com/cli/v12/configuring-npm/package-lock-json/)
- `npm-shrinkwrap.json` — A historical publishable npm lockfile with the package-lock format. Before npm 12, it could be published and took precedence over `package-lock.json`. npm 12 removed `npm shrinkwrap` support and ignores this file; rename a root-project shrinkwrap to `package-lock.json` when upgrading. Package authors previously relying on shrinkwrap to ship a locked tree need to reassess packaging and `bundleDependencies`. [npm lockfile migration](https://docs.npmjs.com/files/package-lock.json.html) · [npm changelog](https://docs.npmjs.com/cli/using-npm/changelog/)
- `pnpm-lock.yaml` — pnpm's YAML lockfile for resolved package versions and workspace imports. Commit the lock and validate it with `pnpm install --frozen-lockfile`; in detected CI pnpm also freezes when an update would be required. The lock depends on pnpm's resolution/configuration behavior, so pin the manager and review upgrades. [pnpm install](https://pnpm.io/cli/install)
- `yarn.lock` — The lockfile name used by Yarn Classic and Berry. Its shared name does not make the formats or their options identical. Treat a major migration as a tooling/lockfile migration and validate with the selected Yarn major version. [Classic install](https://classic.yarnpkg.com/lang/en/docs/cli/install/) · [Berry install](https://yarnpkg.com/cli/install/)
- `bun.lock` — Bun's text-based lockfile, the default since Bun 1.2. Bun recommends committing it. The manager can migrate some supported npm/Yarn/pnpm lockfiles if `bun.lock` is absent; frozen migration may happen in memory and not write the new lockfile. Finish a manager migration intentionally and inspect the written diff. [Bun lockfile](https://bun.sh/docs/pm/lockfile)
- `deno.lock` — Deno's lockfile recording exact versions and integrity hashes for supported dependencies. Deno maintains it by default unless configured otherwise. `deno ci` requires it and refuses stale resolution instead of generating a replacement. [Deno lockfile](https://docs.deno.com/examples/dependency_lockfile_tutorial/) · [Deno ci](https://docs.deno.com/runtime/reference/cli/ci/)

## Cross-item comparison

For a regular Node application using npm, npm's `package-lock.json` pairs with `npm ci`. With pnpm, the analogous file is `pnpm-lock.yaml` and a clear strict command is `pnpm install --frozen-lockfile`. Yarn Classic uses `yarn.lock` plus `--frozen-lockfile`; Berry uses `yarn.lock` plus `--immutable`. Bun pairs `bun.lock` with `bun ci` or `bun install --frozen-lockfile`. Deno pairs `deno.lock` with `deno ci`. These are analogous policies, not interchangeable commands. [npm ci](https://docs.npmjs.com/cli/v12/commands/npm-ci/) · [pnpm install](https://pnpm.io/cli/install) · [Yarn install](https://yarnpkg.com/cli/install/) · [Bun install](https://bun.sh/docs/pm/cli/install) · [Deno ci](https://docs.deno.com/runtime/reference/cli/ci/)

Compare `npm` with `pnpm`: npm's conventional installation is broadly compatible with tools expecting flat `node_modules`; pnpm's linked virtual store can use less disk across projects and more faithfully enforce declared dependencies. pnpm is not simply “npm, only faster”: module visibility, workspace configuration, and path assumptions can differ. [pnpm motivation](https://pnpm.io/motivation)

Compare Yarn Berry's `node-modules` and PnP modes: the first creates a conventional dependency directory; PnP creates a loader map and does not create `node_modules`. PnP can reject undeclared/ghost dependencies and improve strictness, but tools that inspect paths or assume `node_modules` may require adaptation. [Yarn linkers](https://yarnpkg.com/features/linkers) · [Yarn PnP](https://yarnpkg.com/features/pnp)

## Examples

```sh
# npm project
npm ci

# pnpm project
pnpm install --frozen-lockfile

# Yarn Berry project
yarn install --immutable

# Bun project
bun ci

# Deno project
deno ci
```

These commands assume the matching manager and committed lockfile are present. They are not a migration procedure. In a team repository, also standardize the manager version and operating-system/runtime matrix. A strict lock install helps detect drift but does not make native builds or dependency scripts deterministic. [npm ci](https://docs.npmjs.com/cli/v12/commands/npm-ci/) · [pnpm install](https://pnpm.io/cli/install) · [Yarn install](https://yarnpkg.com/cli/install/) · [Bun install](https://bun.sh/docs/pm/cli/install) · [Deno ci](https://docs.deno.com/runtime/reference/cli/ci/)

## Common mistakes

- Committing two competing manager lockfiles and letting contributors choose independently.
- Assuming `yarn.lock` proves whether a project uses Classic or Berry; inspect `packageManager` and `.yarnrc.yml` too.
- Deleting the old lockfile during migration before confirming the new manager reproduces the expected graph.
- Treating `npm-shrinkwrap.json` as just another local-only `package-lock.json`.
- Assuming lockfiles prevent malicious lifecycle scripts or compromised packages.
- Assuming install results are identical across OS/architecture when optional or native dependencies exist.
- Using a current command from one manager in a project locked to a different manager major version.

## Knowledge checks with answers

1. **Why does `yarn.lock` need manager-major context?** Classic and Berry share the filename but differ in format, features, and flags.
2. **What happens to `npm-shrinkwrap.json` under current npm 12?** It is ignored; rename a root project file to `package-lock.json` when upgrading. Historical npm versions read it and allowed publication.
3. **What does PnP generate instead of `node_modules`?** A loader/map that records package resolution for the project.
4. **Does Bun require a Bun runtime for every package it installs?** No. Its package manager can operate in existing Node projects, though runtime-specific behavior should be tested.
5. **What is Deno's current strict CI command?** `deno ci`, which installs from a required frozen lockfile.
