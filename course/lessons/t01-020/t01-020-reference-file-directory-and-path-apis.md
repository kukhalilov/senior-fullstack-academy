
# streams file system serialization sockets and HTTP clients — Reference: File, Directory, FileInfo, DirectoryInfo, Path, globbing, filesystem metadata, and safety

# Scope and version

This lesson covers the full `file-directory-and-path-apis` inventory for .NET 11. Filesystem behavior varies by OS and filesystem; path normalization is not authorization. Sources: [.NET I/O](https://learn.microsoft.com/en-us/dotnet/standard/io/), [`File`](https://learn.microsoft.com/en-us/dotnet/api/system.io.file), [`Directory`](https://learn.microsoft.com/en-us/dotnet/api/system.io.directory), and [`Path`](https://learn.microsoft.com/en-us/dotnet/api/system.io.path).

# How this group fits the mental model

Convenience APIs offer whole-file operations; streams support bounded/incremental I/O. `FileInfo`/`DirectoryInfo` wrap paths and cache some observations, while static APIs operate directly. `Path` manipulates path strings but does not prove containment, existence, permissions, or safe resolution through links. Authorization should be based on the actual resource opened under the platform's filesystem semantics.

# Supplied names explained

| Supplied name | Meaning and safety boundary |
|---|---|
| `File` | Static file operations for open/read/write/copy/move/metadata; errors can arise from permissions, races, sharing, and device state. |
| `File.Exists(String)` | Momentary existence check that can return false for invalid/inaccessible paths; never use it as authorization before a later open. |
| `File.Open(String,FileMode,FileAccess,FileShare)` | Opens/creates according to explicit mode, access, and sharing; validate each because `Create`/`Truncate` can destroy data. |
| `File.OpenRead(String)` | Opens an existing file read-only with read sharing defaults. |
| `File.OpenWrite(String)` | Opens or creates for writing at position zero but does not necessarily truncate existing trailing bytes. |
| `File.Create(String)` | Creates or truncates a file and returns a writable stream; existing data can be lost. |
| `File.CreateText(String)` | Creates/truncates a text file and returns a UTF-8 `StreamWriter`. |
| `File.AppendText(String)` | Opens/creates a text writer positioned to append; concurrent append semantics depend on OS/file sharing. |
| `File.ReadAllText(String)` | Reads entire file and decodes it into one string; use only for bounded files. |
| `File.ReadAllTextAsync(String,CancellationToken)` | Async whole-file text read with cancellation; still allocates entire content. |
| `File.WriteAllText(String,String,CancellationToken)` | Creates/truncates and writes text with default encoding behavior; define encoding/data safety for external contracts. |
| `File.ReadAllBytes(String)` | Reads entire file into a new array; unbounded input can exhaust memory. |
| `File.ReadAllBytesAsync(String,CancellationToken)` | Async whole-file byte read; cancellation does not make the size bounded. |
| `File.WriteAllBytes(String,Byte[])` | Creates/truncates and writes the entire byte array. |
| `File.WriteAllBytesAsync(String,ReadOnlyMemory<Byte>,CancellationToken)` | Async write from memory; do not mutate/release backing memory before completion. |
| `File.ReadLines(String)` | Lazily enumerates decoded lines, avoiding one full-file string; dispose enumeration promptly. |
| `File.ReadLinesAsync(String,CancellationToken)` | Async line enumeration with cancellation; process incrementally and stop/dispose on early exit. |
| `File.WriteAllLines(String,IEnumerable<String>)` | Writes each string with line separators; enumeration and output are not transactional. |
| `File.WriteAllLinesAsync(String,IEnumerable<String>,CancellationToken)` | Async line write; cancellation can leave a partial file. |
| `File.Copy(String,String,Boolean)` | Copies file to destination, optional overwrite; destination permission and race behavior matter. |
| `File.Move(String,String,Boolean)` | Renames/moves file; overwrite behavior and atomicity depend on same-volume/platform filesystem semantics. |
| `File.Replace(String,String,String,Boolean)` | Replaces destination with source and optionally creates a backup; platform/filesystem constraints apply. |
| `File.Delete(String)` | Deletes a file if present; errors and link behavior depend on path and OS. |
| `File.GetAttributes(String)` | Reads attribute flags; path may change or disappear after observation. |
| `File.SetAttributes(String,FileAttributes)` | Changes attribute flags such as read-only; does not set ACLs or authorization. |
| `File.GetCreationTimeUtc(String)` | Reads creation-time metadata in UTC where supported; filesystems may not preserve meaningful creation times. |
| `File.GetLastWriteTimeUtc(String)` | Reads last-write metadata in UTC; cached/precision/update behavior varies. |
| `File.GetUnixFileMode(String)` | Reads Unix permission bits where supported; not a portable Windows ACL API. |
| `File.SetUnixFileMode(String,UnixFileMode)` | Sets Unix permission bits where supported; account for ownership, umask, and directory permissions. |
| `Directory` | Static directory creation, deletion, enumeration, and metadata APIs. |
| `Directory.Exists(String)` | Momentary check that can return false for inaccessible/invalid paths; not authorization. |
| `Directory.CreateDirectory(String)` | Creates missing path components and returns directory info; existing directory is not an error. |
| `Directory.Delete(String,Boolean)` | Deletes a directory, optionally recursively; recursive deletion is destructive and can race with tree changes. |
| `Directory.Move(String,String)` | Moves/renames directory; cross-volume and overwrite behavior vary. |
| `Directory.EnumerateFiles(String)` | Lazily enumerates files in one directory. |
| `Directory.EnumerateFiles(String,String,SearchOption)` | Lazily enumerates files matching pattern and recursion option; unbounded recursion can be expensive. |
| `Directory.EnumerateDirectories(String)` | Lazily enumerates immediate subdirectories. |
| `Directory.EnumerateFileSystemEntries(String)` | Lazily enumerates immediate files and directories. |
| `Directory.GetFiles(String,String,SearchOption)` | Materializes all matching paths into an array; memory grows with result count. |
| `Directory.GetDirectories(String,String,SearchOption)` | Materializes matching directories; prefer enumerate for large trees. |
| `Directory.GetFileSystemEntries(String,String,EnumerationOptions)` | Enumerates/materializes entries using explicit depth, pattern, and inaccessible-item policy. |
| `DirectoryInfo` | Instance wrapper for a directory path and filesystem operations. |
| `DirectoryInfo.EnumerateFiles(String,EnumerationOptions)` | Lazily enumerates matching files with custom enumeration settings. |
| `DirectoryInfo.EnumerateDirectories(String,EnumerationOptions)` | Lazily enumerates matching directories. |
| `DirectoryInfo.EnumerateFileSystemInfos(String,EnumerationOptions)` | Lazily enumerates both file and directory metadata objects. |
| `FileInfo` | Instance wrapper for a file path and metadata/operations; refresh when cached metadata may be stale. |
| `FileInfo.Length` | Current/cached file length in bytes; may be stale or throw if file is absent/inaccessible. |
| `FileInfo.IsReadOnly` | Convenience view of read-only attribute, not a complete permission check. |
| `FileInfo.CopyTo(String,Boolean)` | Copies to a destination with optional overwrite. |
| `FileInfo.MoveTo(String,Boolean)` | Moves/renames with optional overwrite where supported. |
| `FileInfo.Delete()` | Deletes the represented file; object metadata may need refresh afterward. |
| `FileSystemInfo.Attributes` | Attribute flags for a file/directory info object. |
| `FileSystemInfo.LinkTarget` | Returns link target text for a symbolic link where available; it does not itself prove safe resolution. |
| `FileSystemInfo.ResolveLinkTarget(Boolean)` | Resolves a symbolic link optionally through final target; target can change concurrently. |
| `EnumerationOptions` | Configures recursive enumeration, attributes, pattern matching, depth, and special entries. |
| `EnumerationOptions.RecurseSubdirectories` | Enables recursive traversal; limit scope/depth for untrusted or large trees. |
| `EnumerationOptions.IgnoreInaccessible` | Skips inaccessible entries rather than throwing for them; skipped content may make results incomplete. |
| `EnumerationOptions.AttributesToSkip` | Skips entries with selected attributes, such as hidden/system/reparse-point defaults depending on options. |
| `EnumerationOptions.MatchType` | Chooses wildcard matching semantics (simple or Win32-style). |
| `EnumerationOptions.MatchCasing` | Controls pattern case comparison; platform defaults can differ. |
| `EnumerationOptions.MaxRecursionDepth` | Bounds recursion depth for safer/resource-limited traversal. |
| `EnumerationOptions.ReturnSpecialDirectories` | Controls whether `.` and `..` special directory entries are returned where applicable. |
| `Path` | Static string/path utility class; it does not open files or authorize access. |
| `Path.GetFileName(String)` | Returns final path component after the last directory separator. |
| `Path.GetFileNameWithoutExtension(String)` | Returns filename without its final extension. |
| `Path.GetExtension(String)` | Returns final extension including leading period, or empty when absent. |
| `Path.GetDirectoryName(String)` | Returns directory portion, which can be null for a root/filename-only path. |
| `Path.GetFullPath(String)` | Produces an absolute normalized path using current directory/base rules; does not resolve symlinks or authorize containment. |
| `Path.GetRelativePath(String,String)` | Computes a lexical relative path between paths; does not prove the result stays within a secure root after link traversal. |
| `Path.Combine(String,String)` | Combines path strings; a later rooted component can replace earlier components. It is not safe path containment. |
| `Path.Join(String,String)` | Joins path text without the rooted-component replacement behavior of `Combine`; still does not validate/traverse/authorize. |
| `Path.GetRandomFileName()` | Produces a random-looking filename string but does not create or securely reserve a file. |
| `Path.GetTempPath()` | Returns the configured temporary directory path; permissions and trust vary by user/environment. |
| `Path.GetTempFileName()` | Creates a uniquely named zero-byte temp file and returns its path; clean it up and use safe permissions. |
| `Path.GetInvalidFileNameChars()` | Returns characters disallowed in filenames on the current platform; filtering them is not a full security policy. |
| `Path.GetInvalidPathChars()` | Returns characters disallowed in paths on the current platform; does not reject traversal or links. |
| `Path.TrimEndingDirectorySeparator(String)` | Removes a trailing directory separator while preserving root semantics. |
| `Path.EndsInDirectorySeparator(String)` | Checks whether path ends with a platform-recognized directory separator. |
| `Path.DirectorySeparatorChar` | Primary platform directory separator character. |
| `Path.AltDirectorySeparatorChar` | Alternate recognized directory separator where supported. |
| `Path.PathSeparator` | Separator used between path-list entries in environment variables, not between path components. |
| `Path.VolumeSeparatorChar` | Platform-specific volume separator character. |
| `Path.IsPathRooted(String)` | Tests whether a path has a root component; on Windows a drive-relative path can be rooted but not fully qualified. |
| `Path.IsPathFullyQualified(String)` | Tests whether path is absolute without dependence on current directory. |
| `Path.GetPathRoot(String)` | Returns the root portion such as drive/root separator; platform semantics apply. |
| `FileMode.CreateNew` | Creates only if destination does not exist; fails rather than overwrite, useful for race-resistant create semantics. |
| `FileMode.Create` | Creates or truncates existing file. |
| `FileMode.Open` | Opens existing file; fails if absent. |
| `FileMode.OpenOrCreate` | Opens existing or creates missing file without truncating existing content. |
| `FileMode.Truncate` | Opens existing and truncates to zero length. |
| `FileMode.Append` | Opens or creates and positions writes at end; write-only restrictions apply. |
| `FileAccess.Read` | Requests read access. |
| `FileAccess.Write` | Requests write access. |
| `FileAccess.ReadWrite` | Requests both read and write access. |
| `FileShare.Read` | Allows subsequent opens to request read access while the handle is open. |
| `FileShare.Write` | Allows subsequent opens to request write access. |
| `FileShare.Delete` | Allows subsequent delete/rename access while open, subject to OS semantics. |
| `FileOptions.Asynchronous` | Requests asynchronous file handle behavior. |
| `FileOptions.SequentialScan` | Hints sequential access pattern to the OS. |
| `FileOptions.RandomAccess` | Hints random access pattern to the OS. |
| `FileOptions.WriteThrough` | Requests writes bypass/flush intermediate caches as defined by platform; performance cost can be substantial. |
| `FileOptions.DeleteOnClose` | Requests deletion when handle closes; behavior depends on sharing/platform. |
| `Path traversal` | Attacker-controlled `..`, rooted components, alternate separators, or encoded paths escape an intended directory unless containment is enforced. |
| `Path canonicalization before authorization` | Normalize/resolve according to platform and compare against an authorized root, but account for links and TOCTOU; lexical normalization alone is insufficient. |
| `Symbolic link traversal` | A path component can redirect access outside the lexical directory tree; inspect/resolve under a threat-appropriate handle-based policy. |
| `TOCTOU race in File.Exists followed by open` | File state or link target can change after check; open the intended resource safely and handle errors rather than trust a prior check. |
| `Atomic file replacement pattern` | Write a complete temp file, flush/close, then replace/rename on the same filesystem where supported; durability and atomicity guarantees are platform-specific. |
| `Temporary file permissions` | Create temp files with restrictive access, avoid predictable names, and clean up on all paths. |
| `Cross-platform path comparison` | Comparison rules differ by filesystem; avoid assuming case sensitivity or separator behavior from one OS. |
| `Filesystem case sensitivity differences` | Some filesystems are case-sensitive and others not; normalize/compare according to actual target semantics. |
| `FileSystemWatcher event coalescing and overflow` | Events can be combined or lost when buffers overflow; use notifications as hints and rescan authoritative state. |

# Cross-item comparison

| Need | Prefer | Tradeoff |
|---|---|---|
| Small bounded file | `ReadAllTextAsync`/`ReadAllBytesAsync` | Simple; whole content is allocated. |
| Large or unbounded file | `FileStream`/`ReadLinesAsync` | Bounded memory; more lifecycle/error handling. |
| Lazy tree traversal | `EnumerateFiles`/`EnumerationOptions` | Streams results; traversal can still be large/incomplete. |
| Lexical path composition | `Path.Join` or `Combine` | Neither provides authorization or link-safe containment. |
| Atomic create-if-absent | `FileMode.CreateNew` | Fails if present and reduces check-then-create races. |

# Examples

```csharp
using System;
using System.IO;

static FileStream OpenAuthorizedFile(string authorizedRoot, string userSuppliedName)
{
    string root = Path.GetFullPath(authorizedRoot);
    string candidate = Path.GetFullPath(Path.Combine(root, userSuppliedName));
    string relative = Path.GetRelativePath(root, candidate);
    if (Path.IsPathRooted(relative) || relative == ".." ||
        relative.StartsWith(".." + Path.DirectorySeparatorChar, StringComparison.Ordinal))
        throw new UnauthorizedAccessException("Path escapes the authorized root.");

    // This lexical check still does not resolve symbolic-link races.
    return new FileStream(candidate, FileMode.Open, FileAccess.Read, FileShare.Read);
}
```

This pattern illustrates lexical traversal defense, not a complete defense against symbolic links or concurrent path replacement. High-risk systems should use OS-supported handle-relative/open policies and test on the target filesystem.

# Common mistakes

- Treating `Path.Combine` or `GetFullPath` as proof of authorization.
- Using `File.Exists` to decide whether access is allowed or to avoid handling open errors.
- Using `OpenWrite` when truncation is required, or `Create` when existing data must be preserved.
- Loading an entire attacker-controlled file into memory without a size cap.
- Assuming enumeration events form a complete audit log.
- Comparing paths with universal case-insensitive rules.
- Assuming atomic rename/replace and durability semantics are identical across filesystems.

# Knowledge checks with answers

1. **Does `GetFullPath` resolve symbolic links?** No; it normalizes to an absolute lexical path.
2. **What is safer than `Exists` then `Create`?** Open with `FileMode.CreateNew` and handle the already-exists failure.
3. **Does `IgnoreInaccessible` guarantee complete enumeration?** No; inaccessible entries are skipped, so results may be incomplete.
4. **Why can a temp file be risky?** Predictable names/permissions can expose or replace data; create securely and clean up.
5. **Are `FileSystemWatcher` events authoritative?** No; coalescing/overflow can lose events, so reconcile with a rescan.
