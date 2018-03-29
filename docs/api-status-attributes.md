These are attributes of every [**CanaryTest**](api-introduction.md) instance that indicate test status. In general, it should not be necessary to access these attributes explicitly. It is not recommended that these attributes be overwritten.

# aborted

Indicates whether the test has been aborted. All aborted tests were also failed, but not all failed tests were aborted. When a test is marked as aborted, it implies that the failure cause the test to be terminated before it was fully completed.

**Value:** **true** when the the test has been aborted and **false** when it has not.

# attempted

Indicates whether the test has been or is being attempted.

**Value:** **true** when the test was or is being attempted and **false** when it was not.

# failed

Indicates whether the test was failed. This could be because of an error encountered while running the test's body function, an error encountered while attempting to execute a callback, or due to a failed child test.

**Value:** **true** when the the test was failed and **false** when it was not.

# skipped

Indicates whether the test was skipped or discovered to be marked to be skipped while the test was being initialized to be run. Not all tests whose status is indicated as "skipped" will have this flag set, however all tests with this flag set were certainly skipped.

To reliably check whether a test's status should qualify as skipped, try checking if a test's [**skipped**](api-status-attributes.md#skipped) attribute is truthy _or_ its [**attempted**](api-status-attributes.md#attempted) attribute is falsey.

**Value:** **true** when the the test was skipped while running and **false** when it was not.

# success

Indicates whether the test was completed successfully.

**Value:** **true** when the test was completed without errors **false** when it was not.

# startTime

Indicates the time at which the test was run.

**Value:** The number of milliseconds elapsed between January 1, 1970 and the time the test was started.

# endTime

Indicates the time at which the test ended, whether due to success or failure.

**Value:** The number of milliseconds elapsed between January 1, 1970 and the time the test ended.

# filtered

Indicates whether the test and all of its descendants failed to satisfy a test filter. Tests that have been filtered out will be skipped when tests are run.

**Value:** **true** when the test has been filtered out and **false** when it has not been.

# isTodo

Indicates whether the test has been marked as "todo". Tests marked as "todo" are skipped when tests are run, if known ahead of time, and any errors that might be encountered inside them are not recorded as test failures.

**Value:** **true** when the test has been marked as "todo" and **false** when it has not.

# isIgnored

Indicates whether the test is intended to be ignored. Ignored tests are skipped when tests are run, if known ahead of time, and any errors that might be encountered inside them are not recorded as test failures.

**Value:** **true** when the test has been marked as ignored and **false** when it has not.

# isSilent

Indicates whether the test has been marked as silent.

**Value:** **true** when the test has been marked as silent and **false** when it has not.

# isVerbose

Indicates whether the test has been marked as verbose.

**Value:** **true** when the test has been marked as verbose and **false** when it has not.

# isGroup

Indicates whether this is a test group, as opposed to an individual test. This flag is set for both test series and normal test groups.

**Value:** **true** when this [**CanaryTest**](api-introduction.md) instance represents a test group and **false** when it represents an individual test.

# isSeries

Indicates whether this is a test series, as opposed to an individual test or a normal test group.

**Value:** **true** when this [**CanaryTest**](api-introduction.md) instance represents a test series and **false** when it does not.

**Examples:**

``` js
const someTest = canary.test("Example test", function(){
    assert(1 + 1 === 2);
});
// Not a test series
assert(!someTest.isSeries);
```

``` js
const someGroup = canary.group("Example test group", function(){
    canary.test("Example test", function(){
        assert(2 + 2 === 4);
    });
});
// Not a test series
assert(!someGroup.isSeries);
```

``` js
const someSeries = canary.series("Example test series", function(){
    canary.test("Example test", function(){
        assert(2 + 2 === 4);
    });
});
// This is in fact a test series
assert(someGroup.isSeries);
```

