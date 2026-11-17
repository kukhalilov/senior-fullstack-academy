# JavaScript package managers, dependency graphs, and lockfiles — Exercises and worked solutions

## Goals

Practice reading a dependency change as a graph change, selecting strict CI installs, and diagnosing workspace visibility. Commands target the manager noted in each exercise; do not mix lockfiles or package-manager behavior. [npm ci](https://docs.npmjs.com/cli/v12/commands/npm-ci/) · [pnpm install](https://pnpm.io/cli/install) · [Deno ci](https://docs.deno.com/runtime/reference/cli/ci/)

## Worked example

A team changes `"date-fns": "^4.1.0"` to `"date-fns": "^4.2.0"`, runs a normal install, and commits only `package.json`. CI runs `npm ci` and fails because the lock no longer agrees with the manifest. The fix is not to replace CI with a permissive install. Run npm's update/reconciliation step intentionally, inspect the manifest and lockfile diff, run tests, and commit both. CI then verifies that exact reviewed state. The failure provides a review boundary, not proof that the chosen package version is safe.

## Exercises

1. **Choose the declaration.** An application imports `express` in production, runs `vitest` only for tests, exposes a plugin that must share the consumer's React instance, and optionally uses a platform-specific image accelerator. Put each in the most fitting dependency category and state one caveat.
2. **Diagnose npm CI.** A pull request edits a dependency range and runs `npm install`, but commits only the manifest. Explain why `npm ci` fails and give the safe correction.
3. **Compare frozen commands.** Give strict CI installs for npm, pnpm, Yarn Classic, Yarn Berry, Bun, and Deno. Explain why one flag cannot simply be copied to all six.
4. **Workspace ghost dependency.** `apps/web` imports `date-fns`, but only `packages/ui` declares it. It works on a flat hoisted install and fails under pnpm/PnP. Diagnose and fix the package graph.
5. **Caret range edge case.** For each of `^1.2.3`, `^0.2.3`, and `^0.0.3`, state the upper boundary in npm `node-semver`. Explain why the phrase “caret means next major” is misleading.
6. **Lockfile migration.** A project upgrades to npm 12 and still has `npm-shrinkwrap.json`. What happens, what should the project do, and what should a package author reconsider if they relied on publishing shrinkwrap?
7. **Manager migration.** A team wants to switch from Yarn Berry PnP to npm. List the artifacts/configuration to inspect and the checks to run before removing old files.
8. **Deno command selection.** A Deno project needs to add an npm package during development, then CI must reproduce dependencies without changing the lock. Choose commands and state where the dependency could be written.
9. **Install script risk.** A clean frozen install succeeds but a native package's setup script behaves differently on Windows and Linux. Explain why the lockfile did not prevent this and how to validate builds.
10. **Override review.** A vulnerable transitive package is forced to a patched major with npm `overrides`. What compatibility questions should be answered before merging?
11. **Install-script approval.** A native package installs but fails at runtime on npm 12 and Deno. Explain the default lifecycle-script policies, how to inspect/approve the required scripts, and why approving every package is a poor shortcut.

## Progressive hints

1. Ask what the shipped code imports, what tools run only in development, which package supplies the host, and which package may be missing.
2. npm's ordinary install can update a lock; `npm ci` expects the committed pair to match.
3. Check each manager's current CI command: they use different names and defaults.
4. Every package should declare what its own source imports.
5. Find the left-most nonzero component; 0.x examples have narrower compatibility boundaries.
6. npm 12 no longer reads or writes `npm-shrinkwrap.json`; before v12 it was publishable and took precedence. The npm 12 project should rename the root lock to `package-lock.json`. A package author should reassess whether bundleDependencies or another distribution design meets the old goal.
7. Inspect `packageManager`, Yarn config, linker mode, cache/PnP artifacts, scripts, lockfile, and tools that assume node_modules.
8. `deno install`/`deno add` changes config; `deno ci` is the strict CI install.
9. Locking pins package resolution, not every native binary/build output or script environment.
10. Check the parent package's supported API range, patch behavior, peer contexts, and test coverage.

## Complete solutions

1. Put `express` in `dependencies`, `vitest` in `devDependencies`, React in the library's `peerDependencies` (often also a development dependency for its own tests), and the optional accelerator in `optionalDependencies` if the implementation genuinely tolerates its absence. Declare optional host integration as an optional peer through manager metadata rather than assuming a normal optional dependency has that contract. Ensure production code handles a missing accelerator. [npm package.json](https://docs.npmjs.com/cli/v12/configuring-npm/package-json/)
2. `npm install` reconciles the changed constraint with `package-lock.json`, but only `package.json` was committed. `npm ci` refuses to resolve a new tree and does not rewrite files. Run `npm install` in the branch, review the lockfile's exact transitive changes, run checks, and commit both files. Do not make CI silently update source control. [npm install](https://docs.npmjs.com/cli/v12/commands/npm-install/) · [npm ci](https://docs.npmjs.com/cli/v12/commands/npm-ci/)
3. npm: `npm ci`; pnpm: `pnpm install --frozen-lockfile`; Yarn Classic: `yarn install --frozen-lockfile`; Yarn Berry: `yarn install --immutable`; Bun: `bun ci` (or `bun install --frozen-lockfile`); Deno: `deno ci`. Their flags/defaults differ; for example Yarn Berry defaults immutable on CI, while Bun's `bun install` does not automatically freeze in CI. [Yarn install](https://yarnpkg.com/cli/install/) · [Bun install](https://bun.sh/docs/pm/cli/install) · [Deno ci](https://docs.deno.com/runtime/reference/cli/ci/)
4. `apps/web` has an undeclared direct import. Hoisting exposes a package by accident, while strict graph-aware layouts can refuse it. Add the dependency to `apps/web/package.json`, regenerate the chosen manager's lockfile, and test both workspace and production installs. Do not add it only to the repository root unless web actually inherits it through a deliberate supported configuration. [pnpm motivation](https://pnpm.io/motivation) · [Yarn PnP](https://yarnpkg.com/features/pnp)
5. `^1.2.3` admits versions below 2.0.0; `^0.2.3` admits below 0.3.0; `^0.0.3` admits below 0.0.4. Caret protects the left-most nonzero component, not always the major field. The precise range also has lower-bound and prerelease rules. [node-semver](https://github.com/npm/node-semver)
6. In npm 12, `npm-shrinkwrap.json` is ignored; rename a root project shrinkwrap to `package-lock.json` before relying on npm 12 installs. In older npm, shrinkwrap could be published and override package-lock resolution, which constrained downstream consumers. npm 12's changelog recommends considering `bundleDependencies` when a package needs to ship a locked dependency tree. Check the actual tarball and current npm publishing documentation before adopting that design. [npm lockfile migration](https://docs.npmjs.com/files/package-lock.json.html) · [npm changelog](https://docs.npmjs.com/cli/using-npm/changelog/)
7. Inspect the manager/version selection (`packageManager`), `.yarnrc.yml`, `nodeLinker`, `yarn.lock`, PnP loader/cache/SDK files, workspace declarations, lifecycle scripts, and dependencies that access undeclared packages. Create npm configuration and lock from the manifest intentionally, remove Yarn artifacts only after checking resolution, run clean installs on supported platforms, type-check/test/build, and test commands that execute binaries or inspect node_modules. PnP's strictness can expose undeclared dependencies that npm's hoisting had hidden. [Yarn linkers](https://yarnpkg.com/features/linkers) · [Yarn PnP migration](https://yarnpkg.com/migration/pnp)
8. Use `deno add npm:<name>` or `deno install <name>` to add the dependency; Deno 2.8 treats an unprefixed CLI name as npm by default. Depending on nearby config/preferences, it can write to `deno.json` or `package.json`; `--package-json` forces package.json. Commit the resulting manifest and `deno.lock`; run `deno ci` in CI to require and install the frozen lock. [Deno install](https://docs.deno.com/runtime/reference/cli/install/) · [Deno ci](https://docs.deno.com/runtime/reference/cli/ci/)
9. The lock fixes dependency resolutions/integrity but doesn't make a native build script produce identical artifacts for every OS, CPU, libc, compiler, or environment. Test each supported target in its own CI matrix; inspect script permissions/trust policies; record runtime/toolchain versions; and verify the installed native module actually loads. Do not assume lockfile success proves binary correctness.
10. Check whether the patched major still satisfies the caller's API assumptions; whether the dependency is involved in a peer relationship or singleton; whether npm's override scope is correct and root-level; whether direct dependency override restrictions apply; whether tests cover the affected behavior; and whether upstream has a patch/minor route. Run the full suite and inspect `npm ls`/explanation output. An override makes resolution possible but does not make an incompatible major safe. [npm overrides](https://docs.npmjs.com/cli/v12/configuring-npm/package-json/)
11. npm 12 skips dependency lifecycle scripts without a reviewed `allowScripts` approval; inspect pending scripts with `npm install-scripts ls`, approve only the needed package/version, and use `strict-allow-scripts` to fail on remaining unreviewed hooks if appropriate. Deno also blocks npm scripts by default; `deno approve-scripts` reviews pending hooks, and execution requires a `node_modules` directory. A required native build can be missing even though package resolution succeeded. Review script source and scope, approve narrowly, then verify the addon loads on each target OS/architecture. [npm install-scripts](https://docs.npmjs.com/cli/commands/npm-install-scripts/) · [Deno approve-scripts](https://docs.deno.com/runtime/reference/cli/approve_scripts/)

## Tests and edge cases

- Deliberately make the lock stale and confirm the selected strict CI command fails.
- Test a clean checkout, not only the developer's incrementally modified `node_modules`.
- Check optional dependency absence and unsupported OS/CPU paths.
- Verify every workspace has the declarations for imports it performs.
- Test workspace scripts from root and package scope; verify command selectors include the intended packages.
- Compare package-manager and runtime versions in CI with the committed project policy.
- Review lockfile changes for unexpected registry URLs, package sources, peer resolutions, or major transitive movement.
- Test native packages and install scripts on each deployment platform.
- During manager migration, preserve the old branch/lock until the new graph and builds are validated.

## Reflection questions

- Which packages in your current app are runtime dependencies, build tools, peers, or optional integrations?
- Which exact command in your CI rejects a stale lockfile, and which manifest/manager does it read?
- Has a hoisted dependency ever hidden an undeclared import in your project?
- What parts of your installation may vary by operating system or install scripts even with a committed lock?
- What review evidence would convince you that a manager migration preserved workspace boundaries?
