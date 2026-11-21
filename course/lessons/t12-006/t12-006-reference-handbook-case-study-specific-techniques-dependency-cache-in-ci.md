# end-to-end system design case studies — Reference: Dependency cache in CI

Sources: [HLD Handbook](https://hld.handbook.academy/), [GitHub Actions dependency caching](https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching), [GitHub Actions dependency caching reference](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching), [GitHub Actions secure use](https://docs.github.com/en/actions/reference/security/secure-use).

## Scope and version

This lesson covers caching downloaded dependencies and reproducible build intermediates to reduce CI time. GitHub Actions is used as an example; cache scoping and security behavior are platform-specific and may change. Consult the current platform reference before designing trust boundaries.

## How this group fits the mental model

A cache is disposable optimization state: the build must still succeed by downloading or regenerating files after a cache miss or eviction. An artifact is an output to preserve or transfer, such as a tested binary or build log. Mixing these purposes creates integrity and retention problems.

Cache keys should identify the inputs that determine the cached contents: operating system/architecture, runtime/compiler, lockfiles, relevant build configuration, and sometimes source revision. A broad restore key can improve hits but may restore stale or unsafe data. Treat restored files as untrusted input and validate them through normal dependency/build checks.

## Supplied names explained

- **Cache key:** exact lookup identity derived from relevant inputs; incomplete keys can reuse incompatible or stale files.
- **Restore key/prefix:** fallback match when an exact key is absent; useful for reuse, but contents may not match current inputs.
- **Cache scope:** boundary controlling which branch/workflow can save or restore entries. In GitHub Actions, caches are scoped by branch/tag rules, not by workflow identity alone.
- **Cache poisoning:** untrusted workflow writes crafted cache content later restored by a more privileged workflow, potentially influencing execution.
- **Dependency lockfile:** records dependency resolution so cache hits and clean downloads use known versions/integrity checks according to the package manager.
- **Artifact:** output retained or transferred between jobs/runs; unlike a cache, it is not merely disposable speed state and may need provenance/retention controls.

## Cross-item comparison

| Mechanism | Intended use | Trust/integrity rule |
| --- | --- | --- |
| Dependency cache | Reuse package downloads or expensive intermediate computation | Must be rebuildable; never store secrets; validate restored contents and isolate untrusted writers |
| Build artifact | Preserve or hand off a specific produced output | Bind to run/source/digest and control access/retention; do not assume artifact is safe merely because it is downloadable |
| Package registry | Authoritative distribution of versioned dependencies | Verify package source, lockfile/integrity metadata, credentials, and supply-chain policy |
| Workspace reuse | Share files between steps in one job | Same job’s earlier step may have modified files; treat untrusted code output accordingly |

## Examples

A trusted push workflow creates a NuGet cache keyed by OS, .NET SDK version, and hashes of project lock/config files. A fork pull request restores compatible cache data but has no write access to the default branch’s trusted cache under GitHub’s low-trust cache restrictions. The build still runs package integrity checks and can recover from a miss. Never place API keys, signing certificates, or private package credentials in the cache directory.

If a cache is restored from a broader prefix, verify package manager behavior and rebuild generated outputs affected by changed inputs. Do not share a writable cache between untrusted PR execution and a privileged deployment workflow without a strong isolation design. For release, upload the tested package as an artifact with digest and provenance rather than treating a cache entry as the release source.

## Common mistakes

- Treating a cache hit as proof dependencies are authentic or current.
- Assuming cache isolation follows workflow/job identity when the platform scopes by branch/ref.
- Letting low-trust pull-request code write a cache later restored by a privileged workflow.
- Caching secrets or private credential files.
- Omitting SDK, lockfile, architecture, or build flags from a key and reusing incompatible outputs.
- Using a permissive restore prefix without considering that its contents may be stale or poisoned.
- Using caches for release artifact retention or job-to-job handoff when artifacts are the intended mechanism.
- Making a build depend on a cache existing instead of being able to regenerate dependencies.
- Failing to clear/rotate caches after a suspected compromised package or runner.

## Knowledge checks with answers

1. **Should a build fail when the cache is empty?** No; the cache is an optimization and the build should be able to regenerate/download inputs.
2. **Why can a fork PR’s cache access matter to a release workflow?** Shared scopes and trust triggers can allow restored data to cross workflow boundaries; a poisoned cache can influence trusted execution.
3. **Where should a tested binary be handed to a deployment job?** As a run-specific artifact with integrity/provenance checks, not as an opportunistic dependency cache.
4. **Does a lockfile make restored cache contents automatically safe?** No. It helps constrain dependency resolution; runner/cache trust, package integrity, and workflow permissions still matter.

## Review status

Cache semantics and poisoning cautions are checked against current GitHub Actions documentation. This lesson remains pending full claim-by-claim audit and manifest omission check.
