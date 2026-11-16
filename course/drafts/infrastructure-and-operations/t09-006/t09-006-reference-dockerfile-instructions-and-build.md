# Docker images Dockerfiles compose networks volumes and security — Reference: Dockerfile grammar, all current instructions, build context, and stage reuse

Sources: [Dockerfile reference](https://docs.docker.com/reference/dockerfile/), [Docker build contexts](https://docs.docker.com/build/building/contexts/), [Docker build best practices](https://docs.docker.com/build/building/best-practices/), [Build secrets](https://docs.docker.com/build/building/secrets/), [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/), [Build cache](https://docs.docker.com/build/building/cache/), and [Docker Engine 29 release notes](https://docs.docker.com/engine/release-notes/).

## Scope and version

The stable instruction set and BuildKit-specific extensions are distinguished below. The docs page includes `docker/dockerfile:1-labs` features that are explicitly experimental; do not use them without accepting syntax instability. Buildx, BuildKit, Docker Engine, and Dockerfile frontend versions are independent. The latest Engine checked is 29.10.0 on 2026-11-16; inspect the selected builder and frontend before relying on a feature.

## How this group fits the mental model

A Dockerfile is a recipe interpreted by a frontend into a build graph. `FROM` creates stages; instructions consume source/context and prior state; BuildKit can mount external inputs at one step without committing those inputs. Cache reuse follows the declared dependency graph and content. The final target determines what becomes the runtime image. A build is reproducible only to the extent that every input—base digest, package repository, remote source, arguments, platform, and toolchain—is controlled.

## Supplied names explained

### Grammar and stage structure

- Dockerfile — Text recipe for building an image. Instructions are processed in order within stages; case is insensitive by syntax but uppercase is conventional.
- Dockerfile parser directive — Special comment at the very beginning that configures syntax/escaping/checks. A normal comment or blank line can end parser-directive recognition.
- Dockerfile syntax directive — `# syntax=docker/dockerfile:1` selects a Dockerfile frontend; pin a version when strict build-check behavior matters.
- Parser directive #escape — Chooses the escape character used for line continuation/escaping; important for Windows paths and must precede ordinary comments/instructions.
- Parser directive #check — Configures build checks, e.g. skip named checks or treat warnings as errors. Checks depend on frontend version and evolve.
- Dockerfile build context — Files available to the build, usually the final `.` path or a remote/local source. It is not the container's filesystem.
- `.dockerignore` — Excludes context paths from transfer/build access. Put VCS metadata, local build outputs, secrets, and irrelevant large trees here, but verify negation patterns and required files.
- Dockerfile build stage — A section beginning with `FROM` whose filesystem/config evolves through later instructions.
- Named build stage — `FROM ... AS build` gives a stage a stable name for later references.
- Multi-stage build — Uses multiple `FROM` stages and copies only selected artifacts to the final stage, reducing runtime size and tool exposure.
- Build target stage — `--target` selects a named stage to build/debug; the final stage by default is the last stage.
- Build argument scope — Global ARG before first FROM can parameterize FROM but must be redeclared inside a stage to use it there. Stage ARG values persist after declaration and may affect cache/metadata.
- Build context minimization — Send only necessary files; reduces accidental secret inclusion, transfer, and cache invalidation.
- Build context named context — Additional named source supplied with `--build-context` and consumed by FROM/COPY or BuildKit mount; identify its exact trust and revision.
- Dockerfile frontend version — Frontend syntax is separately versioned from Engine/BuildKit. A floating stable `docker/dockerfile:1` tracks current stable syntax; pin a specific version for controlled builds.
- Dockerfile labs syntax stability — `docker/dockerfile:1-labs` exposes experimental features that may change; not a compatibility promise.
- Dockerfile heredoc — `RUN <<EOF` supplies a multiline script; `COPY <<EOF file` creates inline file content. Quoting the delimiter controls shell expansion for RUN; COPY heredocs use Dockerfile parsing semantics.

### Every Dockerfile instruction

- `FROM` — Starts a stage from an image or previous stage. `AS name` names it; `--platform` selects target/base platform. A global `ARG` can parameterize the reference.
- FROM --platform — Selects the platform for a stage/base; `BUILDPLATFORM` and `TARGETPLATFORM` can support cross-compilation. The selected builder must support the requested platform or emulation.
- FROM --reset (labs syntax) — Experimental field reset that clears selected inherited image config such as cmd, entrypoint, env, labels, user, volume, or all; stable syntax is not yet guaranteed.
- `RUN` — Executes a build-time command and commits filesystem changes to the stage; shell form uses configured shell, exec form avoids shell parsing. Combine related package operations when layer/cache semantics favor it, and remove package caches in the same step if they would otherwise persist.
- `CMD` — Runtime default command/arguments, not executed during build. Only the last CMD is effective. Exec-form CMD can provide default arguments to exec-form ENTRYPOINT.
- `LABEL` — Adds image metadata as key/value pairs; labels from bases can be inherited and later values override identical keys.
- LABEL --unset (labs syntax) — Experimental configuration modifier that removes inherited labels; verify frontend supports it.
- `EXPOSE` — Documents intended container listening port/protocol; it does not publish a host port or configure the application listener.
- `ENV` — Adds persistent default environment to image config and later build instructions; avoid credentials because values appear in inspect/config and may propagate into child images.
- ENV --unset (labs syntax) — Experimental modifier removing inherited environment names from image config; do not assume stable availability.
- `ADD` — Copies context files and supports Git/HTTP sources and archive extraction; extra behavior can make inputs less obvious, so prefer COPY unless ADD's behavior is needed.
- `COPY` — Copies files from context, stage, image, or named context. JSON form is needed for paths containing spaces; multiple sources require a directory destination.
- `ENTRYPOINT` — Configures the executable for container start. Exec form is preferred for signal delivery; shell form inserts a shell and can prevent the app from being PID 1.
- `VOLUME` — Declares a mount point in image metadata; it does not choose a host directory. Runtime volume mounting controls persistence.
- VOLUME --unset (labs syntax) — Experimental removal of inherited volume declarations; verify syntax support before use.
- `USER` — Sets default user/group for subsequent RUN and runtime CMD/ENTRYPOINT; numeric UID/GID avoids name lookup but must align with mounted file ownership.
- `WORKDIR` — Sets working directory for subsequent RUN/CMD/ENTRYPOINT/COPY/ADD; creates it if absent. Relative values build on prior WORKDIR, so prefer an explicit absolute base.
- `ARG` — Build-time parameter. It can be overridden at build time and may be visible in provenance/cache/history; never use it as secret storage.
- `ONBUILD` — Stores a trigger instruction for a future child build using this image. It creates surprising inherited build behavior, so document and inspect base-image triggers.
- `STOPSIGNAL` — Selects signal sent by default stop behavior. The application must handle it; a shell wrapper can prevent delivery to the actual server.
- `HEALTHCHECK` — Defines a command and timing to set container health state. Only one instruction takes effect; health does not itself trigger restart under basic Engine restart policy.
- `SHELL` — Changes the default shell for shell-form RUN/CMD/ENTRYPOINT; use it to select PowerShell or a non-default shell deliberately.
- `MAINTAINER (deprecated)` — Historical author metadata instruction; deprecated in favor of LABEL. It remains recognized for compatibility but should not be chosen for new files.
- Exec form — JSON-array instruction syntax such as `RUN ["tool","arg"]`; avoids implicit shell expansion and quoting rules, but does not perform `$VAR`, pipes, or globs automatically.
- Shell form — Command text passed through configured shell; enables shell syntax but adds shell process/signal semantics and quoting/security concerns.

### ADD and COPY modifiers

- ADD --keep-git-dir — Retains `.git` when ADD uses a Git repository source; increases image content and may reveal repository metadata.
- ADD --checksum — Verifies remote source by supplied hash/commit checksum, making mutable URL inputs safer; use the expected digest from a trusted channel.
- ADD --chown — Sets copied ownership on Linux; names resolve via `/etc/passwd` and `/etc/group` in the stage, so numeric IDs work when those databases are absent.
- ADD --chmod — Sets copied mode; supports octal and documented variable forms by syntax version.
- ADD --link — Applies layer-link behavior so copied content can be reused/rebased independently; it imposes destination/previous-state constraints.
- ADD --unpack — Controls automatic tar extraction, especially remote archives; local recognized tar archives are ordinarily unpacked by default.
- ADD --exclude — Excludes matching paths from that instruction, in addition to global context filtering.
- COPY --chown — Sets ownership while copying in Linux stages; not supported for Windows containers.
- COPY --chmod — Sets copied permission mode; avoids a later layer for common mode adjustments.
- COPY --link — Stores copied files in an independent layer that can be reused across preceding-layer changes; check destination symlink and lower-layer assumptions.
- COPY --parents — Preserves source parent paths; requires a compatible Dockerfile frontend and affects output directory structure.
- COPY --exclude — Excludes matching source paths for one COPY; can be repeated and uses documented path matching behavior.
- COPY --from / COPY --from named context — Copies from a stage, named context, or image. The source path is resolved from that source's filesystem root, not the current stage.

### BuildKit RUN features and mount options

- RUN --mount=type=bind — Temporarily mounts context/stage/image files read-only by default; writable changes are discarded when the RUN ends unless they affect another output.
- Build bind mount — Build-time mount used to read large inputs without committing them as a layer; set `target`, `source`, and `from` deliberately.
- RUN --mount bind target/source/from/rw options — `target` (aliases `dst`/`destination`) is mount path; `source` is subpath; `from` names stage/context/image; `rw` permits writes that are discarded after the instruction.
- RUN --mount=type=cache — Persistent builder-managed cache directory for package/compiler caches; it speeds builds but is not a correctness source of truth.
- Build cache mount — Cache mount with `id`, `target`, `sharing`, `from`, `source`, `mode`, `uid`, `gid`, or readonly controls. `locked` serializes concurrent writers; `private` separates concurrent use.
- RUN --mount cache id/sharing/ro options — `id` separates caches; `sharing` is shared/private/locked; `ro`/`readonly` prevents writes; ownership/mode only set up the cache directory.
- RUN --mount=type=tmpfs — Temporary in-memory mount for one build instruction; size and availability depend on builder.
- RUN --mount=type=secret — Makes a secret available to one build step without adding it automatically to image layers. The build command can still copy or print it.
- Build secret mount — Supply with Buildx `--secret` and consume via RUN mount; scope only to instructions needing the credential.
- RUN --mount secret id/target/required/uid/gid/mode/env options — `id` identifies secret; `target` or `env` chooses file/environment exposure; `required` fails if missing; uid/gid/mode control file exposure. Avoid logging the value.
- RUN --mount=type=ssh — Exposes an SSH agent/socket for one step to fetch private dependencies; it should not bake the private key into an image.
- Build SSH mount — Agent-forwarding mount; restrict host keys, repositories, and instruction scope.
- RUN --network=default — Uses the builder's normal network for that instruction; repository responses can be mutable build inputs.
- RUN --network=none — Disables network for a step, improving isolation/reproducibility when all dependencies are already available.
- RUN --network=host — Uses host networking only with builder entitlement/configuration; it is a privileged build capability and weakens isolation.
- RUN --security=sandbox — Default sandbox mode. Setting it explicitly is generally a no-op.
- RUN --security=insecure — Runs with elevated unsandboxed security and requires an insecure entitlement at builder and request; avoid unless necessary.
- RUN --device (CDI entitlement) — BuildKit 0.20+ feature requesting CDI devices for a step; requires device entitlement and configured devices, so is experimental/sensitive infrastructure.

### Health checks, checks, cache, and Buildx

- HEALTHCHECK --interval — Time between probes after startup (default 30s in current reference).
- HEALTHCHECK --timeout — Maximum duration for a probe before it is killed/failed (default 30s).
- HEALTHCHECK --start-period — Grace window for startup failures; a successful probe during it starts counting later failures normally.
- HEALTHCHECK --start-interval — Probe interval during start period (default 5s); requires Docker Engine 25.0+.
- HEALTHCHECK --retries — Consecutive failures before unhealthy (default 3). Probe should be cheap, bounded, and representative.
- HEALTHCHECK exit status 0/1/2 — 0 healthy, 1 unhealthy, 2 reserved and must not be used.
- Layer cache — Reuses prior build step output when its inputs match. Cache availability affects speed, not intended artifact semantics.
- Cache invalidation — A changed instruction/input invalidates dependent steps; secrets mounted as secrets do not automatically act as cache key values, so changing a credential may not rerun a step unless modeled deliberately.
- BuildKit — Modern build engine supporting graph execution, mounts, cache exporters, secrets, attestations, and frontends; may be local or remote.
- Buildx — Docker CLI plugin managing BuildKit builders and advanced builds; version and selected builder matter.
- `docker build` — Standard build command. Modern Docker commonly uses BuildKit, but explicitly inspect builder/backend and platform.
- `docker buildx build` — Buildx build command with multi-platform, remote/cache/export and attestation controls.
- `docker build --check` — Runs Dockerfile static build checks without performing a normal image build; available in current CLI and frontend combinations.
- Dockerfile build check --check — Build-check mode that diagnoses practices such as casing, undefined variables, or JSON-argument recommendations. Check set depends on frontend; warnings can be configured to fail.
- Build check — Static analysis of build recipe, not proof that a build succeeds or an image is secure.
- Build checks and check names — Names are frontend-versioned; skipping checks should be deliberate and documented, not used to silence unknown warnings.
- Build platform — Platform where the builder executes a build step; distinct from target image platform.
- Target platform — Platform requested for the resulting stage/image. Cross-compilation often runs tools on build platform and emits target artifacts.
- Automatic platform ARGs — `BUILDPLATFORM`, `BUILDOS`, `BUILDARCH`, `BUILDVARIANT`, and corresponding `TARGET*` values are predefined global args; redeclare them in a stage to use there.
- docker buildx build --platform — Requests one or multiple target platform outputs; multi-platform push/export support depends on builder driver.
- docker buildx build --push — Exports result to a registry; unlike local load, this is appropriate for multiple platforms.
- docker buildx build --load — Loads a single-platform result into local image store; classic local stores may not load a multi-platform index.
- docker buildx build --cache-from — Imports cache from configured sources; an untrusted cache is a build input and must be handled accordingly.
- docker buildx build --cache-to — Exports cache to a backend; cache can contain intermediate source/artifacts and needs access control.
- docker buildx build --secret — Supplies a build secret to declared secret mounts; do not put the value in the Dockerfile or command logs.
- docker buildx build --ssh — Forwards selected SSH agent(s) to declared SSH mounts.
- docker buildx build --provenance — Requests provenance attestation; inspect content and verification policy rather than assuming provenance implies a trusted builder.
- docker buildx build --sbom — Requests SBOM attestation/generation; examine format, scanner coverage, and subject digest.
- docker buildx build --attest — Configures attestation types/options; syntax evolves with Buildx and BuildKit versions.
- docker buildx build --metadata-file — Writes build result metadata to a file; protect it and use it to record digest/results in automation.
- docker buildx build --output — Selects export destination/format such as local, tar, OCI, or registry; driver and format combinations vary.
- docker buildx build --target — Builds a selected named stage, useful for test/debug outputs.
- docker buildx build --pull — Attempts to fetch newer base references; with mutable tags this can change inputs.
- docker buildx build --no-cache — Disables normal cache reuse; it does not pin package repositories or guarantee byte-identical output.
- docker buildx build --build-arg — Supplies build arguments. Values can be visible in metadata; never use for secrets.
- Buildx builder instance — Named builder endpoint/driver configuration. `docker buildx inspect --bootstrap` reveals nodes/platforms and selected builder capabilities.
- Docker build provenance — Attestation describing build inputs/process; trust depends on builder identity, signing, verification, and policy.

## Cross-item comparison

| Choice | Use | Important limitation |
|---|---|---|
| `COPY` | Explicit local/stage files | No URL download or archive extraction |
| `ADD` | Intentional remote/Git/archive semantics | More implicit behavior and mutable-source risk |
| `ARG` | Build-time configuration | Not a secret; can affect cache/metadata |
| Secret/SSH mount | Temporary credential access | Command can still disclose/use it improperly |
| Cache mount | Performance | Must not be required for correctness |
| `CMD` | Overridable runtime defaults | Does not run at build time |
| Exec `ENTRYPOINT` | Stable PID/signal behavior | Must handle signals and child processes correctly |

## Examples

A common pattern is an SDK build stage followed by a small runtime stage: restore/build/publish in the first stage, then `COPY --from=build /out/ ./` into a non-root final stage. Add `.dockerignore`, pin base images appropriately, and place secret access only on a build command that needs it. Verify `docker buildx inspect`, target platforms, and output destination before trusting that a successful build actually pushed or loaded the intended artifact.

## Common mistakes

- Putting a secret in ARG/ENV then deleting it in a later layer.
- Assuming shell form forwards SIGTERM directly to the application.
- Assuming `EXPOSE` publishes ports or `HEALTHCHECK` restarts an unhealthy container.
- Using `--no-cache` as a substitute for pinning mutable dependencies.
- Assuming target platform and builder platform are identical.
- Enabling host network, insecure security, or device entitlements without treating them as elevated trust.
- Using labs syntax because it appears in current docs without recognizing its experimental status.

## Knowledge checks with answers

1. Which stage is shipped by a multi-stage build? **The selected final target; intermediate stages contribute only artifacts explicitly copied/used.**
2. Why can a build secret still leak? **The command receiving the mount can print/copy the credential into output or logs.**
3. What does `COPY --link` change? **It allows copied content to be represented/reused as an independent layer, aiding cache reuse/rebase.**
4. Does `HEALTHCHECK` restart the container? **No; it updates health state. A separate supervisor/policy must react.**
5. Why should the Dockerfile frontend be pinned with strict checks? **New frontend versions can add checks and make warnings become failures.**

