
# dates times globalization formatting and regular expressions — Reference: DateOnly, TimeOnly, DateTime, DateTimeOffset, TimeSpan, TimeProvider, calendars, and zones

# Scope and version

This reference explains all 99 names in `date-time-and-time-zone-types` for .NET 11. The choice of type is semantic; conversions cannot reconstruct information that was never stored. See Microsoft's [date/time type guide](https://learn.microsoft.com/en-us/dotnet/standard/datetime/choosing-between-datetime), [DateOnly/TimeOnly guide](https://learn.microsoft.com/en-us/dotnet/standard/datetime/how-to-use-dateonly-timeonly), [`TimeProvider`](https://learn.microsoft.com/en-us/dotnet/api/system.timeprovider), and [`TimeZoneInfo`](https://learn.microsoft.com/en-us/dotnet/api/system.timezoneinfo).

# How this group fits the mental model

Use date-only and time-only values for civil concepts without a zone. Use `DateTimeOffset` for an unambiguous instant plus observed offset, and preserve a named zone ID separately for future local schedules. `DateTime.Kind` is a conversion hint, not a zone database. `TimeSpan` is a duration/offset quantity. Use wall-clock APIs for instants and monotonic timestamps for elapsed measurement.

# Supplied names explained

| Supplied name | Meaning and edge case |
|---|---|
| `DateOnly` | Calendar date without time or zone; ideal for birthdays and business dates. |
| `DateOnly.MinValue` | Earliest representable date, 0001-01-01. |
| `DateOnly.MaxValue` | Latest representable date, 9999-12-31. |
| `DateOnly.FromDateTime(DateTime)` | Copies the calendar date fields and discards time/kind. |
| `DateOnly.FromDayNumber(Int32)` | Constructs from days since 0001-01-01; out-of-range values fail. |
| `DateOnly.ToDateTime(TimeOnly)` | Combines date and time into a `DateTime` with `Kind.Unspecified`. |
| `DateOnly.ToDateTime(TimeOnly,DateTimeKind)` | Combines date/time with supplied kind metadata; it does not convert time zones. |
| `DateOnly.ToDayNumber()` | Returns zero-based day number from 0001-01-01. |
| `DateOnly.DayNumber` | Property equivalent exposing the day number. |
| `DateOnly.AddDays(Int32)` | Adds calendar days, throwing if result exceeds representable range. |
| `DateOnly.AddMonths(Int32)` | Adds calendar months and clamps to the final valid day of the target month when needed. |
| `DateOnly.AddYears(Int32)` | Adds years, clamping leap-day dates when the target year lacks that date. |
| `DateOnly.DayOfWeek` | Day-of-week enumeration for the date; culture-specific week start is separate. |
| `DateOnly.DayOfYear` | Ordinal day within the year, starting at 1. |
| `DateOnly.Day` | Day of month. |
| `DateOnly.Month` | Month number. |
| `DateOnly.Year` | Calendar year in the type's calendar representation. |
| `DateOnly.DaysInMonth(Int32,Int32)` | Number of days for a Gregorian year/month pair. |
| `DateOnly.IsLeapYear(Int32)` | Tests the Gregorian leap-year rule. |
| `TimeOnly` | Clock time within a 24-hour day, without date or time zone. |
| `TimeOnly.MinValue` | Midnight, 00:00. |
| `TimeOnly.MaxValue` | Last representable tick before the next midnight. |
| `TimeOnly.FromDateTime(DateTime)` | Extracts the time-of-day fields and discards date/kind. |
| `TimeOnly.FromTimeSpan(TimeSpan)` | Constructs from a duration within one day; out-of-range values fail. |
| `TimeOnly.ToTimeSpan()` | Returns elapsed ticks since midnight, not a time-zone offset. |
| `TimeOnly.ToDateTime(DateOnly)` | Combines with a date and returns an unspecified-kind `DateTime`. |
| `TimeOnly.Add(TimeSpan)` | Adds duration with wraparound at midnight and returns day-offset information only in the overload that exposes it. |
| `TimeOnly.Add(TimeSpan,Int32)` | Adds duration and reports whole-day wrap through the `Int32` out parameter. |
| `TimeOnly.IsBetween(TimeOnly,TimeOnly)` | Tests a half-open time interval; supports an interval that crosses midnight when start is later than end. |
| `TimeOnly.IsBetween start-at-midnight boundary` | Midnight is an ordinary inclusive start boundary; interval endpoint rules still apply and equal endpoints do not mean a full day. |
| `DateTime` | Date and clock fields plus `Kind` metadata; by itself it does not store a named zone. |
| `DateTime.Now` | Current local wall-clock time; subject to clock adjustment and machine zone. |
| `DateTime.UtcNow` | Current UTC wall-clock reading; suitable for an instant but not monotonic elapsed timing. |
| `DateTime.Today` | Local date at midnight with local kind; not a date-only semantic type. |
| `DateTime.Kind` | `Utc`, `Local`, or `Unspecified` conversion hint. |
| `DateTime.ToUniversalTime()` | Converts using `Kind`; `Unspecified` is treated as local time, so it can be wrong when the source zone was different. |
| `DateTime.ToLocalTime()` | Converts to machine-local time; `Unspecified` is treated as UTC by this method's semantics. |
| `DateTime.SpecifyKind(DateTime,DateTimeKind)` | Changes the kind label without changing ticks; it does not convert the represented clock fields. |
| `DateTime.Unspecified` | Kind value meaning no local/UTC interpretation is attached. |
| `DateTime.Local` | Kind marking machine-local time. |
| `DateTime.Utc` | Kind marking UTC time. |
| `DateTimeOffset` | Date/time plus offset that identifies an instant; it does not retain a named time zone. |
| `DateTimeOffset.Now` | Current local instant with local offset. |
| `DateTimeOffset.UtcNow` | Current instant represented with zero offset. |
| `DateTimeOffset.Offset` | Numeric difference from UTC for this value. |
| `DateTimeOffset.UtcDateTime` | UTC `DateTime` representing the same instant. |
| `DateTimeOffset.ToUniversalTime()` | Returns same instant with zero offset. |
| `DateTimeOffset.ToOffset(TimeSpan)` | Returns same instant represented with a different numeric offset; it does not apply named-zone rules. |
| `DateTimeOffset.ToLocalTime()` | Converts the same instant to machine-local offset. |
| `DateTimeOffset.EqualsExact(DateTimeOffset)` | Requires same clock components and offset; ordinary equality compares instants after offset normalization. |
| `DateTimeOffset.UtcTicks` | Tick count of the UTC instant; distinct from local clock ticks. |
| `TimeSpan` | Signed duration or offset quantity; its fields do not represent a calendar date/time zone. |
| `TimeSpan.FromSeconds(Double)` | Creates duration from fractional seconds with runtime rounding/range behavior. |
| `TimeSpan.FromMilliseconds(Double)` | Creates duration from fractional milliseconds. |
| `TimeSpan.FromMinutes(Double)` | Creates duration from fractional minutes. |
| `TimeSpan.FromHours(Double)` | Creates duration from fractional hours. |
| `TimeSpan.FromDays(Double)` | Creates duration from fractional days. |
| `TimeSpan.TotalSeconds` | Total duration expressed as fractional seconds, including days. |
| `TimeSpan.TotalMilliseconds` | Total duration expressed as fractional milliseconds. |
| `Stopwatch elapsed duration versus wall-clock time` | Stopwatch uses a monotonic counter for elapsed measurement; wall clocks can jump and should not measure precise intervals. |
| `TimeProvider` | Abstraction for UTC/local time, timestamps, and timers to make time-dependent logic injectable. |
| `TimeProvider.System` | Provider backed by system clocks/timers. |
| `TimeProvider.GetUtcNow()` | Gets current UTC instant as `DateTimeOffset`. |
| `TimeProvider.GetLocalNow()` | Gets current time in provider's local zone. |
| `TimeProvider.GetTimestamp()` | Returns a high-frequency timestamp suitable for measuring elapsed time, not a UTC timestamp. |
| `TimeProvider.GetElapsedTime(Int64)` | Computes elapsed duration from a timestamp captured by the same provider. |
| `TimeProvider.CreateTimer(TimerCallback,Object,TimeSpan,TimeSpan)` | Creates a provider-controlled timer with due time and period. |
| `TimeProvider.TimestampFrequency` | Frequency of provider timestamp ticks; use provider conversion methods rather than assuming units. |
| `TimeProvider.LocalTimeZone` | Local zone associated with the provider. |
| `FakeTimeProvider from Microsoft.Extensions.TimeProvider.Testing` | Test package provider whose clock/timers can be advanced deterministically; install/use package explicitly. |
| `TimeZoneInfo` | Represents a named or custom zone with adjustment rules. |
| `TimeZoneInfo.Local` | Machine's configured local zone; environment dependent. |
| `TimeZoneInfo.Utc` | UTC zone with zero offset and no daylight-saving adjustment. |
| `TimeZoneInfo.FindSystemTimeZoneById(String)` | Resolves a platform zone ID; IDs and available zones differ across systems. |
| `TimeZoneInfo.GetSystemTimeZones()` | Lists zones available to the runtime/OS. |
| `TimeZoneInfo.ConvertTime(DateTime,TimeZoneInfo)` | Converts a `DateTime` to destination zone using kind/source-zone semantics; ambiguous/invalid local cases require care. |
| `TimeZoneInfo.ConvertTime(DateTimeOffset,TimeZoneInfo)` | Converts an unambiguous instant into destination zone and its applicable offset. |
| `TimeZoneInfo.ConvertTimeToUtc(DateTime)` | Converts according to `DateTime.Kind`; unspecified is assumed local, and invalid local times can throw. |
| `TimeZoneInfo.ConvertTimeFromUtc(DateTime,TimeZoneInfo)` | Converts a UTC time to a destination zone's local fields. |
| `TimeZoneInfo.IsInvalidTime(DateTime)` | Tests whether local wall time falls in a forward-transition gap for the zone. |
| `TimeZoneInfo.IsAmbiguousTime(DateTime)` | Tests whether local wall time maps to multiple instants during a backward transition. |
| `TimeZoneInfo.GetAmbiguousTimeOffsets(DateTime)` | Returns the possible offsets for an ambiguous local time; choose a policy explicitly. |
| `TimeZoneInfo.GetUtcOffset(DateTime)` | Gets the zone offset for a date/time according to its kind and zone rules. |
| `TimeZoneInfo.AdjustmentRules` | Exposes rule periods and daylight transitions; rules can be updated by OS data. |
| `TimeZoneInfo.AdjustmentRule` | Describes a date range and adjustment/transition data for a zone. |
| `TimeZoneInfo.CreateCustomTimeZone` | Creates a custom fixed or rule-based zone; rules must accurately represent intended policy. |
| `TimeZoneInfo.ClearCachedData()` | Clears cached zone data; previously stored `Local`/zone references may no longer represent refreshed system data. |
| `TimeZoneInfo.ConvertTimeBySystemTimeZoneId` | Converts using a zone identified by system ID; platform IDs/availability matter. |
| `UTC instant versus local wall-clock time` | An instant is one global timeline point; local wall time is calendar/clock fields interpreted through a zone's rules. |
| `DateTimeOffset offset versus time-zone identity` | Offset identifies relationship to UTC at one time; zone ID stores the rules needed for other dates. |
| `Ambiguous local time during daylight-saving transition` | A repeated clock interval maps to two instants; require earlier/later offset or another policy. |
| `Invalid local time during daylight-saving transition` | A skipped clock interval maps to no instant; reject or apply a documented shift policy. |
| `Daylight-saving rule update and future scheduling` | Political rules can change; preserve local schedule plus zone ID and decide whether future occurrences follow updated rules. |
| `Unix time epoch` | Seconds/milliseconds counted from 1970-01-01T00:00:00Z. |
| `DateTimeOffset.ToUnixTimeSeconds()` | Converts instant to whole Unix seconds, truncating subsecond precision. |
| `DateTimeOffset.ToUnixTimeMilliseconds()` | Converts instant to Unix milliseconds, truncating finer precision. |
| `DateTimeOffset.FromUnixTimeSeconds(Int64)` | Constructs UTC offset-zero instant from Unix seconds; out-of-range values fail. |
| `DateTimeOffset.FromUnixTimeMilliseconds(Int64)` | Constructs UTC instant from Unix milliseconds. |
| `TimeProvider and deterministic time-dependent tests` | Inject provider and advance fake clock/timers to test expiration, retries, and schedules without sleeping on real time. |

# Cross-item comparison

| Need | Type | Reason |
|---|---|---|
| Calendar date only | `DateOnly` | No accidental midnight/zone semantics. |
| Time of day | `TimeOnly` | No implied date or offset. |
| Elapsed duration | `TimeSpan` | Measures an amount of time. |
| Global instant | `DateTimeOffset`/UTC `DateTime` | Unambiguous timeline value. |
| Future civil schedule | Local date/time + zone ID | Preserves rule-based intent. |
| Measure elapsed runtime | `Stopwatch`/`TimeProvider` timestamp | Monotonic source avoids wall-clock jumps. |

# Examples

```csharp
using System;

static DateTimeOffset ResolveAppointment(DateOnly date, TimeOnly time, TimeZoneInfo zone)
{
    DateTime local = date.ToDateTime(time, DateTimeKind.Unspecified);
    if (zone.IsInvalidTime(local))
        throw new ArgumentException("The local time does not exist in this time zone.");
    if (zone.IsAmbiguousTime(local))
        throw new ArgumentException("The local time occurs twice; caller must choose an offset.");
    return new DateTimeOffset(TimeZoneInfo.ConvertTimeToUtc(local, zone), TimeSpan.Zero);
}
```

The method rejects ambiguity rather than choosing silently. An application could instead require a selected offset and verify it against `GetAmbiguousTimeOffsets`.

# Common mistakes

- Treating `DateTime.Kind` as a named zone or assuming `Unspecified` has universal meaning.
- Storing only `DateTimeOffset.Offset` for a recurring future local schedule.
- Using `DateTime.Now` or UTC wall clock to measure elapsed timeout duration.
- Assuming every local time maps to exactly one instant.
- Treating a Unix timestamp as a local timestamp.
- Hard-coding a daylight-saving rule instead of using maintained zone data.

# Knowledge checks with answers

1. **Does `DateTimeOffset` retain the originating zone ID?** No; preserve the ID separately if rule identity matters.
2. **What is returned by `DateOnly.ToDateTime(TimeOnly)` kind?** `Unspecified`.
3. **What should happen for an ambiguous meeting time?** Apply a documented choice/rejection policy using the possible offsets.
4. **Which clock should measure elapsed time?** A monotonic timestamp source such as `Stopwatch`/`TimeProvider.GetTimestamp`.
5. **What does `DateTime.SpecifyKind` do?** Changes metadata only; it does not convert the clock fields.
