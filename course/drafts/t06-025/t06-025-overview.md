# JavaScript package managers, dependency graphs, and lockfiles — Big-picture orientation and mental model

## Problem and purpose

An application is rarely one file. It depends on packages that may themselves depend on other packages. A package manager reads project declarations, resolves a compatible graph, downloads package contents, lays them out for the runtime, and can run project scripts. A lockfile records a chosen resolution so another install can reproduce that dependency graph more reliably.

As of 2026-11-18, this lesson covers npm, pnpm, Yarn Classic and Berry, Bun, and Deno. Their commands and lockfiles are related but not interchangeable. npm's current documented CLI is v12.2.2, pnpm 12.20.0 is the current release snapshot, Bun uses text `bun.lock` by default since v1.2, and Deno 2.8+ documents `deno ci` for strict CI installs. npm 12 removed the historical `npm-shrinkwrap.json` mechanism and restricts URL dependency installation by default; older tutorials need a version boundary. These version-specific claims come from the linked project documentation. [npm install](https://docs.npmjs.com/cli/v12/commands/npm-install/) · [npm changelog](https://docs.npmjs.com/cli/using-npm/changelog/) · [pnpm 12.20.0](https://pnpm.io/blog/releases/12.20.0) · [Bun lockfile](https://bun.sh/docs/pm/lockfile) · [Deno CI](https://docs.deno.com/runtime/reference/cli/ci/)

## Plain-language mental model

Think of a package as a labeled box. A manifest is the shopping list and the rules for which box versions are acceptable. A dependency graph is the full chain of boxes required, including indirect dependencies. A lockfile is the receipt that records the concrete choices made for that graph. The installed layout is how the chosen manager presents the boxes to the runtime and tools.

These are separate artifacts. A manifest range such as `^4.2.0` expresses an allowed set; it is not a promise that every machine will select the same release. The lockfile narrows that choice for installs using that lockfile. The package manager then materializes files and links, which may vary by manager, settings, operating system, optional native packages, and scripts. [npm package.json](https://docs.npmjs.com/cli/v12/configuring-npm/package-json/) · [npm lockfiles](https://docs.npmjs.com/cli/v12/configuring-npm/package-lock-json/)

## How the parts fit together

1. The root manifest identifies the project, declares scripts, dependency categories, workspaces, and sometimes the selected package manager.
2. Each declared version specifier gives the resolver a constraint. Direct dependencies can introduce transitive dependencies and peer requirements.
3. The manager resolves a graph and records concrete versions and integrity or source information in its manager-specific lockfile.
4. An install links, copies, hard-links, clones, caches, or loads packages according to that manager's install model.
5. A clean/frozen install checks that the manifest and lockfile agree. Its exact command and guarantees depend on the manager.
6. Scripts, native build steps, platform filters, registries, and runtime versions can still affect the resulting application.

```text
manifest ranges + workspace packages + manager configuration
                         │
                         ▼
              resolve dependency graph
                         │
           ┌─────────────┴──────────────┐
           ▼                            ▼
  manager lockfile             install/link layout
           │                            │
           └──────── clean CI install ──┘
                         │
                         ▼
             scripts, build, and runtime
```

## Concept map

- The **manifest** declares intent: direct dependencies, scripts, package metadata, and workspace membership.
- The **dependency graph** includes direct and transitive packages plus constraints such as peer compatibility.
- The **lockfile** stores a particular resolution for a specific package manager and format.
- The **installer** materializes the graph: a conventional `node_modules` tree, a linked/virtual store, a Plug'n'Play loader map, or runtime-specific cache plus project integration.
- The **workspace model** lets several packages share a repository while retaining separate manifests and dependency boundaries.
- The **range** limits possible versions; the **pin/lock** selects versions. Neither proves the installed package is safe or that build scripts are deterministic.

## End-to-end walkthrough

Suppose `apps/web` needs a UI library and the monorepo contains `packages/ui`.

```json
{
  "name": "web",
  "dependencies": { "@academy/ui": "workspace:^" },
  "devDependencies": { "typescript": "~5.8.0" },
  "scripts": { "check": "tsc --noEmit", "build": "vite build" }
}
```

The exact local dependency syntax is manager-specific; this snippet illustrates the workspace protocol used by several managers, not a portable npm declaration. The workspace root tells the manager where packages live. The manager confirms a matching local package, resolves TypeScript and its transitive graph, writes its own lockfile, then creates its install layout. In CI, choose the matching strict command: `npm ci`, `pnpm install --frozen-lockfile`, Berry `yarn install --immutable`, `bun ci`, or Deno `deno ci`. Do not copy one manager's command to another. [pnpm workspace protocol](https://pnpm.io/workspaces) · [Yarn install](https://yarnpkg.com/cli/install/) · [Bun workspaces](https://bun.sh/docs/pm/workspaces) · [Deno workspaces](https://docs.deno.com/runtime/fundamentals/workspaces/)

If a developer changes the TypeScript range, a normal install may update the lockfile to a newly selected version. CI's strict install should fail until the reviewed lockfile change is committed. That failure is useful: it turns an unreviewed dependency change into a visible source-control diff. For npm 12, also inspect URL dependency changes: the current default blocks URL sources unless the project explicitly allows them. [npm install](https://docs.npmjs.com/cli/v12/commands/npm-install/)

## When to use it and tradeoffs

Use the manager already required by the project unless there is a concrete reason to migrate. npm has broad conventional `node_modules` compatibility. pnpm emphasizes store reuse and a dependency layout that can expose undeclared dependencies. Yarn offers Berry's Plug'n'Play and `node_modules` modes. Bun integrates package management with its runtime but can also manage Node projects. Deno integrates package resolution and lockfiles with its runtime and can consume npm projects. These choices affect compatibility, manager configuration, scripts, native packages, editor support, and CI; benchmark slogans do not decide the fit.

Commit the manifest and the lockfile your team actually uses. Pin or otherwise standardize the package-manager version, use its strict CI install, and review lockfile changes. A lockfile is not a universal cross-manager format, and it does not promise bit-for-bit identical builds across every platform or lifecycle script. [Yarn linkers](https://yarnpkg.com/features/linkers) · [pnpm motivation](https://pnpm.io/motivation) · [Deno dependency management](https://docs.deno.com/runtime/packages/)

## What later lessons cover

The concepts lesson explains graph resolution, ranges, peer dependencies, lockfile updates, and reproducibility. Reference lessons compare the named managers and lockfiles, then dependency/install commands, then workspaces and layouts. Practice asks you to diagnose CI lock drift and design a small workspace. Interview preparation tests tradeoffs, migration, and reproducibility reasoning.
