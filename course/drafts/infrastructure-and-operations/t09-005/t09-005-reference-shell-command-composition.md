# Linux shell permissions processes networking systemd and logs — Reference: Bash execution, quoting, expansion, redirection, pipelines, and scripting safety

Sources: [GNU Bash Reference Manual](https://www.gnu.org/software/bash/manual/bash.html), [Bash 5.3 release announcement](https://lists.gnu.org/archive/html/bug-bash/2025-07/msg00005.html), and [sudo manual](https://man7.org/linux/man-pages/man1/sudo.8.html).

## Scope and version

This lesson uses Bash 5.3 syntax where marked. Interactive-shell conveniences are not necessarily appropriate in scripts, and Bash-only forms are not portable to POSIX `sh`. Verify the interpreter with `bash --version` and the script shebang; distribution defaults may be older.

## How this group fits the mental model

Bash parses source text into commands, expands words, applies redirections, and invokes a builtin, function, or external program. A command is therefore not “a string sent to Linux”: it becomes an argument vector plus inherited environment and file descriptors. Most shell bugs arise when a programmer assumes expansion, quoting, status, or redirection works differently from its defined order.

## Supplied names explained

### Shell, command lookup, and process result

- **Bash** — GNU command interpreter. It can read commands interactively or execute a script; it is not the kernel and its syntax is not identical to every shell.
- **Login shell** — A shell started in login mode, typically reading login startup files. Login status is independent of whether a terminal is attached.
- **Interactive shell** — A shell reading user commands interactively; history, prompt, and completion behavior are common. A shell can be interactive without being a login shell, or vice versa.
- **Shell builtin** — An operation implemented inside Bash, such as `cd`, `read`, and `export`. Running it in a child process cannot change the parent shell's directory or variables.
- **External command** — An executable launched as a process (often after `fork`/`exec` implementation details). Its changes to its own environment do not flow back into the calling shell.
- **PATH lookup** — Search of colon-separated directory names for an executable name without a slash. Empty components can mean the current directory in some contexts; avoid unsafe PATH values in privileged scripts.
- **Shell function** — A named block evaluated by the current shell context. It can use local variables and return an integer status, but `return` is not a general way to return arbitrary data.
- **Command argument vector** — The ordered `argv` words passed to a program. The shell's quote characters control parsing and are removed; they are not included as argument data.
- **Exit status** — Integer result conventionally in range 0–255; zero conventionally means success. It is a program-defined contract, not a universal explanation of failure.
- **`$?`** — Status of the most recently completed pipeline/command context. Capture it immediately (`status=$?`) before running another command.
- **Command hash cache** — Bash's remembered executable path for a command name. `hash -r` clears cached paths after a PATH change; `command -v` reports shell lookup without executing the target.
- **which versus command -v** — `which` is commonly an external utility with implementation-dependent behavior. Prefer Bash `command -v name` to query the shell's own resolution of alias/function/builtin/path.
- **sudo command scope** — `sudo command args` authorizes and runs that command under policy; it does not elevate later shell commands. `sudo cd` cannot change the caller's directory because `cd` must run in that shell.
- **sudoers policy** — Rules configured by sudoers files determine who may run what, as which user, and under which constraints. Use `visudo` to edit because it validates syntax; avoid broad `NOPASSWD: ALL` grants.

### Streams, redirection, and composition

- **Standard input (stdin)** — File descriptor 0, commonly keyboard input or a pipe/file.
- **Standard output (stdout)** — File descriptor 1, conventionally normal results.
- **Standard error (stderr)** — File descriptor 2, conventionally diagnostics; programs can use streams differently, so inspect the actual command contract.
- **File descriptor** — Small per-process integer naming an open file, pipe, socket, or other kernel object. Descriptors are inherited unless closed or marked close-on-exec.
- Redirection > — Open/truncate a file for stdout; `>out` is equivalent to `1>out` in ordinary shell syntax. A typo in the target can destroy a file.
- Redirection >> — Open/create and append stdout; concurrent writers can still interleave records depending on writes and filesystem semantics.
- Redirection 2> — Redirect stderr, e.g. `cmd 2>error.log`.
- Redirection 2>&1 — Duplicate stderr to the destination currently used by stdout. Order matters: `cmd >all.log 2>&1` sends both streams to the file; `cmd 2>&1 >out.log` sends stderr to the original stdout and stdout to the file.
- **Here document** — `<<WORD` supplies following lines as stdin until a delimiter. The delimiter's quoting controls parameter/command expansion; use a quoted delimiter for literal text.
- **Here string** — Bash `<<<word` supplies the expanded word plus a newline as stdin. It is convenient for small values, not a substitute for streaming large data.
- Pipeline | — Connects left stdout to right stdin. Each side normally runs in a subshell/process context, with Bash options affecting some last-command behavior.
- **`pipefail`** — Bash `set -o pipefail` makes a pipeline's status the rightmost nonzero status, or zero if all succeed. It does not stop output or automatically identify every failing stage; inspect `PIPESTATUS` immediately when needed.

### Expansion and quoting

- Command substitution $(...) — Run commands and substitute stdout, removing trailing newline characters. It is easier to nest than backticks. Do not use it when trailing newlines are significant.
- Process substitution <(...) — Bash exposes a command's output through a filename-like pipe/FIFO, e.g. `diff <(sort a) <(sort b)`. It is not POSIX and process status may need separate handling.
- **Variable expansion** — `$name` or `${name}` inserts a variable's value into a word; quote it when it must remain one argument.
- **Parameter expansion** — `${var:-default}`, `${var%pattern}`, `${#var}`, `${var/pattern/replacement}`, and related forms transform or inspect shell variables without an external process. Consult the manual for exact pattern and unset/null distinctions.
- **Single quoting** — `'...'` preserves every character literally except that a single quote cannot appear inside a single-quoted segment. Concatenate quoted/unquoted segments to include one.
- **Double quoting** — `"..."` preserves most characters while allowing parameter/command/arithmetic expansion; `$`, backticks, and selected backslashes retain meaning.
- **Escape character** — Backslash protects the next character in unquoted text, with special newline behavior; inside double quotes only selected characters are escaped.
- **Word splitting** — After eligible unquoted expansions, split on `IFS`. This is a frequent source of broken paths and argument injection. Quote expansions; use arrays for argument lists.
- **Filename globbing** — Unquoted patterns such as `*.log` expand to matching filenames, or remain literal depending on shell options and match result. Quote data that is not intended to be a pattern.
- **Brace expansion** — Text generation such as `file{1,2}.txt` occurs before parameter expansion and does not inspect the filesystem. It is Bash syntax, not a general list or range parser.

### Variables, scripts, and failure behavior

- **Environment variable** — A name/value exported to child processes. Shell-local variables are not automatically environment entries.
- **`export`** — Mark variables/functions for child environments; values are strings and do not provide typed configuration.
- **`unset`** — Remove a shell variable or function (subject to restrictions); distinguish unset from set-to-empty.
- **`source (.)`** — Read and execute a file in the current shell. This permits it to change current variables/options/directory and means the file is executable code; only source trusted files.
- **Shell startup files** — Bash reads different files depending on login, interactive, and invocation mode (including `BASH_ENV` for noninteractive cases). Do not assume `.bashrc` is always read by a service or script.
- Bash builtin set — Changes shell options/positional parameters. `set -- ...` safely replaces positional parameters; `set -o` reports options.
- **`set -e`** — `errexit` exits for many unhandled nonzero statuses but has exceptions in tests, `&&`/`||`, loops, and pipeline/subshell contexts. It is not a complete exception system; check critical commands explicitly.
- **`set -u`** — Treat expansion of unset variables as an error (with context-specific exceptions). It does not reject empty strings and can expose assumptions about optional variables.
- **`set -o pipefail`** — Makes failures before the final pipeline stage affect pipeline status; combine with deliberate status handling.
- **`trap`** — Install handlers for signals or shell events such as `EXIT`. Cleanup must be idempotent; traps do not run after uncatchable SIGKILL or necessarily in every termination mode.
- **Shell script shebang** — First-line `#!` selects an interpreter when invoked as a program (for example `#!/usr/bin/env bash`). Directly invoking `bash script` instead uses that explicit Bash and does not rely on executable bit/shebang lookup.
- **ShellCheck** — Static analyzer that detects common shell quoting, portability, and logic mistakes. A clean run is valuable but cannot prove the script's operational safety.

### Bash 5.3 specific additions

- Current-shell command substitution ${ command; } — Bash 5.3 executes the command group in the current shell environment and substitutes stdout with trailing newlines removed. Unlike `$(...)`, side effects such as variable assignments can persist; this makes scope and error handling especially important.
- REPLY command substitution ${| command; } — Bash 5.3 expands to the value assigned to `REPLY` by the command group, without capturing/removing stdout; command stdout remains on the current stdout. `REPLY` is restored after expansion. It is specialized Bash syntax, not portable shell code.
- **`GLOBSORT`** — Bash 5.3 variable controlling filename-glob result sorting, including documented sort modifiers. Its behavior is Bash-specific; set it deliberately rather than assuming filesystem enumeration order.
- **`compgen -V variable`** — Bash 5.3 `compgen` option writes completion candidates into the named variable instead of printing them, useful for avoiding command-substitution text handling. It remains a completion-oriented builtin.
- **`read -E`** — Bash 5.3 option uses Readline for input even when not interactive, subject to Readline configuration. It is not suitable for unattended protocols requiring exact raw bytes.
- **`source -p PATH`** — Bash 5.3 `source` option searches the supplied PATH value for the file. It does not make untrusted sourced code safe; verify the selected file and use controlled search paths.
- **`bash_source_fullpath shopt option`** — Bash 5.3 `shopt -s bash_source_fullpath` makes source path entries use full paths when available. Scripts relying on path identity should still account for symlinks and invocation context.
- **`BASH_MONOSECONDS`** — Bash 5.3 read-only variable providing an integer monotonic-seconds clock suitable for elapsed durations; use a monotonic clock rather than wall time for measuring intervals.
- **`BASH_TRAPSIG`** — Bash 5.3 variable available while executing a signal trap, indicating the signal number that caused that trap; do not confuse it with a complete asynchronous event queue.

## Safe script pattern

```bash
#!/usr/bin/env bash
set -u
set -o pipefail

input=${1:?usage: script INPUT}
if [[ ! -r $input ]]; then
  printf 'cannot read input: %s\n' "$input" >&2
  exit 1
fi

if output=$(some_command -- "$input"); then
  printf '%s\n' "$output"
else
  status=$?
  printf 'some_command failed with status %d\n' "$status" >&2
  exit "$status"
fi
```

This illustrates explicit input validation, quoting, `--` end-of-options protection, stderr diagnostics, and status capture. The exact option support of `some_command` must be checked. Avoid turning on `set -e` as a substitute for designing the control flow.

## Cross-item comparison

Quoting/arrays preserve argument boundaries; redirection routes file descriptors; pipelines connect streams but can hide an upstream status; command substitution turns stdout into shell text and strips trailing newlines. Bash 5.3 current-shell substitution can preserve side effects, which is a meaningful tradeoff compared with ordinary `$(...)`.

## Examples

An array such as `args=(--name "$value")` followed by `command "${args[@]}"` preserves each argument boundary. `producer 2>errors.log | consumer >results.log` sends producer diagnostics to one file and the consumer result to another; enable pipefail and handle status when producer failure matters.

## Common mistakes

Use arrays (`args=(--name "$value")`; `command "${args[@]}"`) rather than building a command string and calling `eval`. Remember that `printf` is safer than `echo` for arbitrary strings. A pipeline may hide an early stage's status without `pipefail`; with it, an expected early `grep` status 1 may cause the whole pipeline to be considered failure. Command substitution removes trailing newlines, while Bash 5.3 REPLY substitution provides different semantics. Test scripts with spaces, glob characters, empty values, unset variables, failed middle pipeline commands, and signals in a disposable environment.

## Knowledge checks with answers

1. Why quote `"$path"`? **To preserve it as one argument and prevent word splitting and glob expansion.**
2. Why is `2>&1` order-sensitive? **It duplicates the current stdout destination at that point in the redirection sequence.**
3. Does `set -e` guarantee all errors stop a script? **No; control-flow and pipeline contexts have exceptions.**
4. What can Bash 5.3 `${ command; }` preserve that `$(command)` does not? **Side effects in the current shell context.**

## Summary

Shell correctness depends on controlling parsing, arguments, streams, environment, and status. Quote data, use arrays, check important statuses explicitly, and distinguish current-shell operations from child processes. Bash 5.3 forms can be useful but should be isolated behind an explicit Bash version requirement.
