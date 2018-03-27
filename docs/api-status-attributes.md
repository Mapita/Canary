These are attributes of every `CanaryTest` instance that indicate test status. In general, it should not be necessary to access these attributes explicitly. It is not recommended that these attributes be overwritten.

# aborted

Indicates whether the test has been aborted.

**Value:** `true` when the the test has been aborted and `false` when it has not.

# attempted

Indicates whether the test has been or is being attempted.

**Value:** `true` when the test was or is being attempted and `false` when it was not.

# skipped

Indicates whether the test was skipped or discovered to be marked to be skipped while the test was being initialized to be run. Not all tests whose status is indicated as "skipped" will have this flag set, however all tests with this flag set were certainly skipped.

To reliably check whether a test's status should qualify as skipped, try `test.skipped || !test.attempted`.

**Value:** `true` when the the test was skipped while running and `false` when it was not.

# success

Indicates whether the test was completed successfully.

**Value:** `true` when the test was completed without errors `false` when it was not.

# startTime

Indicates the time at which the test was run.

**Value:** The number of milliseconds elapsed between January 1, 1970 and the time the test was started.

# endTime

Indicates the time at which the test ended, whether due to success or failure.

**Value:** The number of milliseconds elapsed between January 1, 1970 and the time the test ended.

# filtered

Indicates whether the test and all of its descendants failed to satisfy a test filter. Tests that have been filtered out will be skipped when tests are run.

**Value:** `true` when the test has been filtered out and `false` when it has not been.

# isTodo

Indicates whether the test has been marked as "todo". Tests marked as "todo" are skipped when tests are run, if known ahead of time, and any errors that might be encountered inside them are not recorded as test failures.

**Value:** `true` when the test has been marked as "todo" and `false` when it has not.

# isIgnored

Indicates whether the test is intended to be ignored. Ignored tests are skipped when tests are run, if known ahead of time, and any errors that might be encountered inside them are not recorded as test failures.

**Value:** `true` when the test has been marked as ignored and `false` when it has not.

# isSilent

Indicates whether the test has been marked as silent.

**Value:** `true` when the test has been marked as silent and `false` when it has not.

# isVerbose

Indicates whether the test has been marked as verbose.

**Value:** `true` when the test has been marked as verbose and `false` when it has not.

# isGroup

Indicates whether this is a test group, as opposed to an individual test.

**Value:** `true` when this `CanaryTest` instance represents a test group and `false` when it represents an individual test.

