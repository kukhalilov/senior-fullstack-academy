# Linux shell permissions processes networking systemd and logs — Reference: Journald, journalctl selectors, kernel/system logs, rotation, and evidence handling

Sources: [journalctl manual](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html), [systemd-journald manual](https://www.freedesktop.org/software/systemd/man/latest/systemd-journald.service.html), [Linux man-pages project](https://man7.org/linux/man-pages/), and [systemd unit manual](https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html).

## Scope and version

This lesson covers systemd journal plus common syslog/file-log arrangements. Storage settings, persistence, forwarding, rotation, and conventional paths vary by distribution and configuration. Confirm local `journald.conf`, syslog daemon, logrotate policy, permissions, and retention before assuming records exist.

## How this group fits the mental model

Logs are observations emitted by components and collected by one or more systems. A journal entry can carry structured fields and service metadata; a text file may carry only formatted text. Neither source is automatically complete, correctly synchronized, retained forever, or safe to disclose. Build a timeline from several independent observations.

## Supplied names explained

### Journal and selectors

- **systemd-journald** — System service collecting logs from the kernel, service stdout/stderr, syslog protocol, and native journal API depending on configuration.
- **systemd journal** — Structured log store indexed by fields and boot/time; records can be volatile, persistent, rate-limited, forwarded, vacuumed, or inaccessible to a user.
- **Structured journal field** — Key/value metadata such as unit, PID, priority, transport, and message. Field names/values permit filtering without parsing only rendered text.
- **Journal cursor** — Opaque position identifying a journal entry; useful for pagination/continuation, not a wall-clock timestamp or globally stable event ID.
- **`journalctl`** — Queries and renders journal records; output options and privileges affect visible data.
- **`journalctl -u unit`** — Filters entries associated with a unit, e.g. `-u example.service`; include related units separately if needed.
- **`journalctl -b`** — Selects current boot; `-b 0` is explicit. Boot IDs help separate restarts/reboots.
- **`journalctl -b -1`** — Selects previous boot when retained; does not work if volatile storage lost it or boot index differs.
- **`journalctl --since`** — Sets lower time bound, e.g. `--since '2026-11-16 10:00:00'`; clarify time zone and clock source.
- **`journalctl --until`** — Sets upper time bound; use explicit date/time for reproducible incident windows.
- **`journalctl -p priority`** — Filters by syslog severity threshold (e.g. `-p warning`); numeric priorities run from 0 emerg to 7 debug. A threshold includes more severe levels.
- **`journalctl -f`** — Follows new entries similar to tail; remember to stop it and capture a bounded incident window when needed.
- **`journalctl -o json`** — Emits JSON including fields; protect output since it may contain tokens, user data, or environment details.
- **`journalctl --list-boots`** — Lists known boot IDs/time ranges available in journal storage.
- **systemd unit log metadata** — Fields such as `_SYSTEMD_UNIT`, `_PID`, `_BOOT_ID`, and invocation metadata can associate messages to a service; trusted underscore-prefixed fields are journal-added, unlike arbitrary message text.
- **Journal persistent storage** — Journal data stored under `/var/log/journal`; configuration and directory existence determine persistence and retention.
- **Journal volatile storage** — Journal data stored under `/run/log/journal`, generally cleared at reboot; `/run` is runtime storage.
- **`/run/log/journal`** — Typical volatile journal location. Its presence does not prove all logs are here or persistent.
- **`/var/log/journal`** — Typical persistent journal location; permissions, disk space, quotas, and vacuum settings affect availability.
- **Rate-limited log message** — Journald may suppress bursts and report suppression summaries. Absence of each repeated message is not evidence it did not occur.
- **Journal vacuuming** — Removes archived journal files to meet age/size/free-space limits; it does not necessarily affect active journal files immediately.
- **Journal storage quota** — Limits/thresholds in journald configuration constrain journal disk use; check effective settings and actual filesystem capacity.

### Syslog, kernel logs, rotation, and evidence

- **Journal forwarding to syslog** — Journald can forward records to a syslog daemon/socket; forwarding settings and syslog rate/retention can cause duplicate or differently formatted records.
- **`rsyslog`** — Common syslog implementation routing messages to files/remote destinations by rules; not installed on every distribution.
- **syslog facility** — Category such as auth, daemon, kern, or local0 used in syslog routing; facility is metadata, not a guaranteed component identity.
- **syslog severity** — Priority level from emergency through debug; threshold configuration can discard lower-priority messages.
- **`/var/log/syslog`** — Common Debian/Ubuntu-style general log path, not universal.
- **`/var/log/messages`** — Common RHEL/Fedora-style general log path, not universal.
- **`/var/log/auth.log`** — Common Debian-style authentication log path; access is sensitive and location varies.
- **`/var/log/kern.log`** — Common Debian-style kernel log path; kernel records may instead be accessed through journal or `dmesg`.
- **`dmesg`** — Reads kernel ring buffer; buffer is finite and messages can be restricted or overwritten. It is not a full historical system log.
- **Kernel ring buffer** — In-memory recent kernel messages, not necessarily durable across reboot; journal may collect a persistent copy.
- **`logrotate`** — Rotates/compresses/deletes log files according to policy. Applications may need reopen signals/reopen behavior after rotation.
- **Log retention** — Policy describing how long/large logs are kept; comply with privacy/security obligations and preserve adequate incident evidence.
- **UTC timestamp normalization** — Convert event times to a common zone (usually UTC) while retaining original zone/offset and source clock. NTP drift and clock jumps can distort ordering.
- **Sensitive-data log exposure** — Logs may contain credentials, tokens, query strings, personal data, or secrets. Minimize collection, redact carefully, restrict access, and follow retention policy.
- **Application stdout/stderr capture** — systemd commonly connects service streams to journal; buffering, structured logging, and explicit file logging alter what appears.
- **systemd unit invocation ID** — Identifier distinguishing a specific service invocation; useful to group logs from one run across restarts if emitted/captured.
- **Service restart timeline reconstruction** — Correlate unit state transitions, invocation IDs, process start/exit times, deployment events, health checks, kernel events, and client symptoms. A restart message alone does not identify root cause.

## Reproducible incident query

```sh
sudo journalctl -u example.service --since '2026-11-16 09:00:00 UTC' \
  --until '2026-11-16 09:20:00 UTC' -o short-iso-precise
sudo journalctl -u example.service -b --no-pager
sudo journalctl --list-boots
sudo journalctl -k --since '2026-11-16 09:00:00 UTC'
```

Use the incident's actual time and unit. Record the host clock/time zone, boot ID, command and access time. Exporting structured output may disclose sensitive fields; store it in a restricted incident location and redact copies used for teaching.

## Cross-item comparison

| Source | Strength | Limitation |
|---|---|---|
| Journal | Structured metadata, boot and unit selectors | Retention, rate limits, volatile storage |
| Syslog/file logs | Existing routing and long-term integrations | Paths/format differ; rotation may split timelines |
| Kernel ring buffer | Recent kernel diagnostics | Finite and not inherently durable |
| Metrics/client probes | Independent symptom and resource evidence | Sampling and vantage can miss short events |

## Examples

Use `journalctl -u example.service --since '2026-11-16 09:00:00 UTC' --until '2026-11-16 09:10:00 UTC' -o json` when structured fields are needed, then restrict and redact the output. Compare it with proxy logs, deploy records, and a client probe. Do not assume `/var/log/syslog` exists; inspect the configured collector.

## Common mistakes

- Treating a missing log record as proof that an event did not occur.
- Mixing local time and UTC without recording the offset or host clock status.
- Assuming `journalctl -b -1` is available after volatile storage/reboot.
- Exporting JSON logs to an unrestricted directory or copying secrets into a ticket.
- Clearing failed state or restarting before collecting useful transient details.

## Knowledge checks with answers

1. What does a journal cursor represent? **A position in the journal, not a timestamp or globally stable event ID.**
2. Can a service log be incomplete? **Yes, because of rate limiting, buffering, retention, forwarding, or collector/storage failures.**
3. Why retain boot and invocation IDs? **They distinguish separate startup epochs and service executions when building a timeline.**
4. What does `dmesg` provide? **Recent kernel ring-buffer records, not necessarily a durable historical log.**

## Build a timeline, not a pile of lines

Normalize timestamps to UTC, but retain original timestamps and host offsets. Align service restart/exit records with deploy events, resource pressure, kernel/OOM events, DNS/TLS/network probes, and customer-facing symptoms. Check for dropped/rate-limited messages, reboot boundaries, rotated files, and clock skew. State which sources were unavailable so the timeline does not imply completeness.

## Summary

Journal and syslog are useful evidence sources with different metadata, retention, and failure modes. Query narrowly, preserve provenance and time context, protect sensitive data, and corroborate logs with process, service, and network observations.
