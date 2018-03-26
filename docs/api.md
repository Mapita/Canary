# API Documentation

Canary's API is the interface used to write and read automated JavaScript tests. It is built on the `CanaryTest` class, and the global instance of this class acquired by importing the Canary package. By convention, this global instance should be referred to as `canary`.

``` js
const canary = require("canary-test");
```

The library also utilizes `CanaryTestCallback` and `CanaryTestError` classes. These classes can be referred to with `canary.Callback` and `canary.Error`, respectively. These classes are mainly for internal use and, normally, it will not be necessary to work with them.

## Adding Tests

These `CanaryTest` methods are needed to write tests that can be run with Canary.

Tests and test groups can optionally be assigned names. It is strongly recommended that test names always be provided, since descriptive names will make it easier to understand where errors occur, when they occur.

### test

Add a test. Tests are added to test groups. This results in a test hierarchy, where the created test is a child of the test group it was added to.

It is possible to add a test as a child of another test, instead of a test group; however, this is not a recommended practice.

**Arguments:** `({string} name, {function} body)` _or_ `({function} body)`

**Returns:** The newly-created `CanaryTest` instance.

**Examples:**

``` js
canary.test("Example test", function(){
    assert(2 + 2 === 4);
});
```

``` js
canary.group("Example test group", function(){
    this.test("Example test", function(){
        assert(1 < 3);
    });
});
```

### group

Add a test group. A test group is a special kind of test that may have child tests and callbacks such as `onBegin` and `onEnd`, but must not itself contain test logic.

**Arguments:** `({string} name, {function} body)` _or_ `({function} body)`

**Returns:** The newly-created `CanaryTest` instance.

**Examples:**

``` js
canary.group("Example test group", function(){
    this.group("First child group", function(){
        this.test("First example test", function(){
            assert("hello" === "hello");
        });
    });
    this.group("Second child group", function(){
        this.test("Second example test", function(){
            assert("world" === "world");
        });
    });
});
```

## Test Group Callbacks

These `CanaryTest` methods can be used to add callbacks in test groups. This becomes useful if a certain setup action must be done before running the tests in the group and corresponding tear-down action after, or if such actions must be performed before and after every test in a group.

Test callbacks can optionally be assigned names. Descriptive callback names will make it easier to understand where errors occur, when they occur.

These methods return `CanaryTestCallback` instances, which wrap the given callbacks and names in a simple class instance along with some other data.

### onBegin

Add a callback that is run when a test group is begun. More than one callback can be added in this way. The callbacks are run in the order they were added.

`onBegin` callbacks run after `onEachBegin` callbacks and before all others. They run before child tests but after evaluating a test group's body function. (Normally, the body function is resposible for adding the callback in the first place.)

If any `onBegin` callback produces an error or otherwise aborts the test, any remaining `onBegin` callbacks will be ignored.

**Arguments:** `({string} name, {function} callback)` _or_ `({function} callback)`

**Returns:** The new `CanaryTestCallback` instance that was added to the test group.

### onEnd

Add a callback that is run when a test group is ended, regardless of whether the test group was successful or not. More than one callback can be added in this way. The callbacks are run in the order they were added.

`onEnd` callbacks are run before `onEachEnd` callbacks and after child tests and all other callbacks.

If any `onEnd` callback produces an error or otherwise aborts the test, any remaining `onEnd` and `onEachEnd` callbacks will still be attempted.

**Arguments:** `({string} name, {function} callback)` _or_ `({function} callback)`

**Returns:** The new `CanaryTestCallback` instance that was added to the test group.

### onSuccess

Add a callback that is run when a test group is completed without errors. More than one callback can be added in this way. The callbacks are run in the order they were added.

`onSuccess` callbacks are run before `onEachSuccess`, `onEnd`, and `onEachEnd` callbacks. They run after child tests and `onEachBegin` and `onBegin` callbacks.

In the case that an `onSuccess` or `onEachSuccess` callback produces an error that causes the test to fail as its completion is being handled, `onFailure` and `onEachFailure` callbacks will run after the failing `onSuccess` or `onEachSuccess` callback and the test will be marked as unsuccessful.

If any `onSuccess` callback produces an error or otherwise aborts the test, any remaining `onSuccess` and `onEachSuccess` callbacks will be ignored.

**Arguments:** `({string} name, {function} callback)` _or_ `({function} callback)`

**Returns:** The new `CanaryTestCallback` instance that was added to the test group.

### onFailure

Add a callback that is run when a test group is aborted. More than one callback can be added in this way. The callbacks are run in the order they were added.

`onFailure` callbacks are run before `onEachFailure`, `onEnd`, and `onEachEnd` callbacks. They run after child tests and `onEachBegin` and `onBegin` callbacks.

In the case that an `onSuccess` or `onEachSuccess` callback produces an error that causes the test to fail as its completion is being handled, `onFailure` and `onEachFailure` callbacks will run after the failing `onSuccess` or `onEachSuccess` callback and the test will be marked as unsuccessful.

If any `onFailure` callback produces an error or otherwise aborts the test, any remaining `onFailure` and `onEachFailure` callbacks will still be attempted.

**Arguments:** `({string} name, {function} callback)` _or_ `({function} callback)`

**Returns:** The new `CanaryTestCallback` instance that was added to the test group.

### onEachBegin

Add a callback that is run once as every test belonging to a group is begun. More than one callback can be added in this way. The callbacks are run in the order they were added. The callbacks apply only to immediate child tests and test groups; they are not applied recursively.

`onEachBegin` callbacks run before all other callbacks. They run before child tests but after evaluating a test group's body function. (Normally, the body function is resposible for adding the callback in the first place.)

If any `onEachBegin` callback produces an error or otherwise aborts the test, any remaining `onEachBegin` and `onBegin` callbacks will be ignored.

**Arguments:** `({string} name, {function} callback)` _or_ `({function} callback)`

**Returns:** The new `CanaryTestCallback` instance that was added to the test group.

### onEachEnd

Add a callback that is run once as every test belonging to a group is ended, regardless of whether the test group was successful or not. More than one callback can be added in this way. The callbacks are run in the order they were added. The callbacks apply only to immediate child tests and test groups; they are not applied recursively.

`onEachEnd` callbacks run after all other callbacks.

If any `onEachEnd` callback produces an error or otherwise aborts the test, any remaining `onEachEnd` callbacks will still be attempted.

**Arguments:** `({string} name, {function} callback)` _or_ `({function} callback)`

**Returns:** The new `CanaryTestCallback` instance that was added to the test group.

### onEachSuccess

Add a callback that is run once as every test belonging to a group is completed without errors. More than one callback can be added in this way. The callbacks are run in the order they were added. The callbacks apply only to immediate child tests and test groups; they are not applied recursively.

`onSuccess` callbacks are run before `onEachSuccess`, `onEnd`, and `onEachEnd` callbacks. They run after child tests and `onEachBegin` and `onBegin` callbacks.

In the case that an `onSuccess` or `onEachSuccess` callback produces an error that causes the test to fail as its completion is being handled, `onFailure` and `onEachFailure` callbacks will run after the failing `onSuccess` or `onEachSuccess` callback and the test will be marked as unsuccessful.

If any `onEachSuccess` callback produces an error or otherwise aborts the test, any remaining `onEachSuccess` callbacks will be ignored.

**Arguments:** `({string} name, {function} callback)` _or_ `({function} callback)`

**Returns:** The new `CanaryTestCallback` instance that was added to the test group.

### onEachFailure

Add a callback that is run once as any test belonging to a group is aborted. More than one callback can be added in this way. The callbacks are run in the order they were added. The callbacks apply only to immediate child tests and test groups; they are not applied recursively.

`onEachFailure` are run before `onEnd`, and `onEachEnd` callbacks. They run after child tests and `onEachBegin`, `onBegin`, and `onFailure` callbacks.

In the case that an `onSuccess` or `onEachSuccess` callback produces an error that causes the test to fail as its completion is being handled, `onFailure` and `onEachFailure` callbacks will run after the failing `onSuccess` or `onEachSuccess` callback and the test will be marked as unsuccessful.

If any `onEachFailure` callback produces an error or otherwise aborts the test, any remaining `onEachFailure` callbacks will still be attempted.

**Arguments:** `({string} name, {function} callback)` _or_ `({function} callback)`

**Returns:** The new `CanaryTestCallback` instance that was added to the test group.

## Running Tests

### run

Run the test asynchronously.

**Returns:** A `Promise` which is resolved when the test is completed. This promise should not be rejected, even in the case of a test failure.

### getSummary

Get a summary string describing the status of every test that was attempted.

Example of a string returned by a call to `getSummary` after running tests:

``` text
✓ Canary (0.003s)
  ✓ leftPad (0.001s)
    ✓ returns the input when it's as long as or longer than the input length (0.000s)
    ✓ pads shorter inputs with spaces to match the desired length (0.000s)
```

**Returns:** A string showing all the tests that were run using Canary and their status.

### getReport

Get an object containing a list of passed tests, a list of failed tests, a list of skipped tests, and a list of errors.

The lists of tests are arrays of `CanaryTest` instances. The list of errors is an array of `CanaryTestError` instances.

**Returns:** An object with `passed`, `failed`, `skipped`, and `errors` attributes.

### doReport

A single, one-size-fits-most call to run tests, output a report to the console, then terminate the process with an appropriate status code.

**Arguments:** `({object} options)`

These are the attributes of the options object which the `doReport` function will consider:

- `{boolean} concise`: Log only a small of information regarding testing and the results.
- `{boolean} verbose`: Log a great deal of information while running tests.
- `{boolean} keepAlive`: Normally, the process is terminated with a zero status code after running all tests successfully or a nonzero status code after running tests with any errors. When this flag is specified, `doReport` will not terminate the process.
- `{function} filter`: A function which accepts a `CanaryTest` instance and returns a truthy value when the test should be run and a falsey value when the test should be skipped.
- `{array} names`: An array of names to filter tests by; only tests with one of these names or belonging to a group with one of these names will be run.
- `{array} tags`: An array of tags to filter tests by; only tests with one of these tags or belonging to a group with one of these tags will be run.
- `{array} paths`: An array of file paths to filter tests by; only tests declared in a file whose path begins with this string, or belonging to a group with a matching file path, will be run.

When a filter applies positively to a test, that test's containing group, and its containing group, and so on will be run (though not necessarily their other child tests), and all children of the matching test will be run.

Note that when more than one filter is specified using e.g. the `filter`, `names`, or `tags` attributes, tests which match _any_ of the specified criteria will be run.

**Returns:** The same as `getReport`, if the `keepAlive` flag was given in the options. (Otherwise, the function will terminate the program.)

**Examples:**

``` js
require("leftPad.js");
require("canary-test").doReport();
```

## Intermediate Usage

These `CanaryTest` class methods may not be needed by users who are writing tests for smaller projects, but will prove valuable when writing tests for larger projects.

### todo

Mark a test as "todo". Tests with this flag will be skipped and their "todo" status accordingly reported in the test results.

**Examples:**

``` js
canary.test("An incomplete test that will not be reported as a failure", function(){
    this.todo();
    assert(false);
});
```

### ignore

Mark a test as ignored. Tests with this flag will be skipped and their ignored status accordingly reported in the test results.

**Examples:**

``` js
canary.test("A failing test that should be ignored for now", function(){
    this.ignore();
    let something = 0;
    assert(something === 1);
});
```

### tags

Add a tag or tags to a test group. Tags are one way to filter and run only a subset of all available tests.

It may be desireable to, for example, tag all tests related to a certain feature with a certain string so that all tests related to the feature can be run when making changes to that feature, without also running other unneeded, potentially slower tests.

**Arguments:** `(...{string} tag)`

**Examples:**

``` js
canary.group("Example test group", function(){
    this.tags("firstTag", "secondTag");
    this.test("Example test", function(){
        assert(100 === 100);
    });
});
```

Note that individual tests, not only test groups, are able to have tags, but if the tags are added in the test body then those tags will not be visible until after running the test. (This defeats the idea of running only the tests with a certain tag!)

Tags can be added to an individual test like this, if it is necessary to be so granular:

``` js
canary.group("Example test group", function(){
    this.test("Example test with tags", function(){
        assert(100 === 100);
    }).tags("tagOnlyThisTest");
});
```

### log

Log a message to the console, except for if this test has been set to run silently.

**Arguments:** `(...{anything} message)`

The arguments to the function are stringified and concatenated into a single string, with the different parts separated by spaces. (Just like `console.log`.)

**Examples:**

``` js
canary.test("Example test", function(){
    this.log("Running a test! The test's name is", this.name);
});
```

### logVerbose

Log a message to the console, but only if this test has been set to run verbosely.

**Arguments:** `(...{anything} message)`

The arguments to the function are stringified and concatenated into a single string, with the different parts separated by spaces. (Just like `console.log`.)

**Examples:**

``` js
canary.test("Example test", function(){
    this.logVerbose("Running a test! The test's name is", this.name);
});
```


## Status Attributes

These are attributes of every `CanaryTest` instance that indicate test status. In general, it should not be necessary to access these attributes explicitly. It is not recommended that these attributes be overwritten.

### aborted

Indicates whether the test has been aborted.

**Value:** `true` when the the test has been aborted and `false` when it has not.

### attempted

Indicates whether the test has been or is being attempted.

**Value:** `true` when the test was or is being attempted and `false` when it was not.

### skipped

Indicates whether the test was skipped or discovered to be marked to be skipped while the test was being initialized to be run. Not all skipped tests will have this flag set, however all tests with this flag set were certainly skipped.

**Value:** `true` when the the test was skipped while running and `false` when it was not.

### success

Indicates whether the test was completed successfully.

**Value:** `true` when the test was completed without errors `false` when it was not.

### startTime

Indicates the time at which the test was run.

**Value:** The number of milliseconds elapsed between January 1, 1970 and the time the test was started.

### endTime

Indicates the time at which the test ended, whether due to success or failure.

**Value:** The number of milliseconds elapsed between January 1, 1970 and the time the test ended.

### filtered

Indicates whether the test and all of its descendants failed to satisfy a test filter. Tests that have been filtered out will be skipped when tests are run.

**Value:** `true` when the test has been filtered out and `false` when it has not been.

### isTodo

Indicates whether the test has been marked as "todo". Tests marked as "todo" are skipped when tests are run, if known ahead of time, and any errors that might be encountered inside them are not recorded as test failures.

**Value:** `true` when the test has been marked as "todo" and `false` when it has not.

### isIgnored

Indicates whether the test is intended to be ignored. Ignored tests are skipped when tests are run, if known ahead of time, and any errors that might be encountered inside them are not recorded as test failures.

**Value:** `true` when the test has been marked as ignored and `false` when it has not.

### isSilent

Indicates whether the test has been marked as silent.

**Value:** `true` when the test has been marked as silent and `false` when it has not.

### isVerbose

Indicates whether the test has been marked as verbose.

**Value:** `true` when the test has been marked as verbose and `false` when it has not.

### isGroup

Indicates whether this is a test group, as opposed to an individual test.

**Value:** `true` when this `CanaryTest` instance represents a test group and `false` when it represents an individual test.

## Advanced Usage

These `CanaryTest` class methods are for those who need more complex or customized behavior from Canary. They are not relevant to the majority of users.

### silent

Set a test and all its children to run silently. This means that they will not output any log messages.

The `log` method of a `CanaryTest` instance can be used to log a message only if the test has not been set to run silently.

Note that when the `concise` flag of the `doReport` function is set, it will cause all tests to run silently.

**Examples:**

``` js
canary.test("Example silent test", function(){
    this.silent();
});
```

### verbose

Set a test and all its children to run verbosely. This means they will output even more detailed logs than usual.

The `logVerbose` method of a `CanaryTest` instance can be used to log a message only when the test is set to run verbosely.

Note that when the `verbose` flag of the `doReport` function is set, it will cause all tests to run verbosely that were not otherwise set to run silently.

**Examples:**

``` js
canary.test("Example verbose test", function(){
    this.verbose();
});
```


### shouldSkip

Check whether any flags have been set that will cause this test to be skipped, such as by using the `todo` or `ignore` methods.

**Returns:** `true` is marked to be skipped `false` when it is not so marked.

### unignore

Un-ignore a test that was previously marked as being ignored.

**Examples:**

``` js
const someTest = canary.test("Example test", function(){
    this.ignore();
});
someTest.unignore(); // Nevermind!
```

### getTitle

Get an identifying title for this test. A test's title is its name, preceded by the name of its parent test, preceded by its parent's name, and so on.

**Returns:** A string, representing a title that can be used to identify this test.

### getName

Get the name provided for this test.

**Returns:** The test's name as a string.

### hasTag

Determine whether this test has a certain tag or not.

**Arguments:** `({string} tag)`

**Returns:** `true` when the test has the tag and `false` when it does not.

### getTags

Get a list of tags that have been added to this test.

**Returns:** An array of tags.

### getTestTotal

Recursively get the number of `CanaryTest` instances in a test tree.

Note that if this method is called for a test group, and the group has not already been expanded, then this method will cause it to be expanded. (As though the `expandGroups` method was called.)

**Returns:** The total number of tests in this test tree.

### getStatusString

Get a string representing the status of this test.

**Returns:** `"skipped"` if the test was marked as skipped or was never attempted, `"passed"` if the test completed successfully, or `"failed"` if the test was unsuccessful.



### durationSeconds

Get the length of time taken to run this test, in seconds.

**Returns:** The number of seconds it took to run the test, or `undefined` if the test has not yet been completed.

### durationMilliseconds

Get the length of time taken to run this test, in milliseconds.

**Returns:** The number of milliseconds it took to run the test, or `undefined` if the test has not yet been completed.

### error

Add an error to the test's list of recorded errors.

The method requires an Error object and optionally accepts another argument indicating the test or callback where the error occurred.

**Arguments:** `({Error} error, {CanaryTest|CanaryTestCalback} location)`

**Returns:** The newly-created `CanaryTestError` instance.

### abort

Abort the test and mark it as failed.

The method optionally accepts information about the error that resulted in the test being aborted. The first argument, if provided, must be an Error object, and the second argument can be used to indicate the test or callback where the error occured. (This is the same as with the `error` method.)

**Arguments:** `({Error} error, {CanaryTest|CanaryTestCalback} location)`

### anyErrors

Get whether any errors were encountered while running this test.

**Returns:** `true` when the test has recorded any errors and `false` when it has not.

### noErrors

Get whether this test was run without encountering any errors.

**Returns:** `false` when the test has recorded any errors and `true` when it has not.

### getErrors

Get a list of errors that were encountered while attempting this test, if any.

**Returns:** An array of `CanaryTestError` objects encountered while running this test.


### add

Add a child test to a test group.

Note that if the test was previously added to another test group, it will be removed from that group as it is added to the new group.

**Arguments:** `({CanaryTest} test)`

### remove

Remove a child test from a parent group.

**Arguments:** `({CanaryTest} test)`

**Returns:** `true` if the test was in fact a child and was removed and `false` if it was not.

### orphan

Remove a test from its parent group.

**Returns:** `true` if the test did in fact have a parent and was orphaned and `false` if it did not.

### getParent

Get the `CanaryTest` instance which is the parent of this one.

**Returns:** The `CanaryTest` instance to which this test has been added, or `undefined` if the test does not have a parent.

### getChildren

Get a list of the tests that are children of this test group.

**Returns:** An array of `CanaryTest` instances which are children of this test group.

### applyFilter

Applies a filter function recursively to a test group and all of its children. Tests for which no ancestors or descendants satisfy the filter will be marked, then skipped when tests are run.

This method is leveraged by `doReport` in order to enforce the filtering criteria that are passed to it.

**Arguments:** `({function} filter)`

**Returns:** `true` if this test or any of its descendants satisfied the filter and `false` if not.

### expandGroups

Recursively run all the body functions assigned to test groups, but not to ordinary tests. This has the effect of elaborating the structure of the test tree without actually running tests.

Group expansion is put off until tests are actually needed in order to make the startup performance impact of including tests in an application source file close to nonexistent, even in the case of testing code errors that could potentially cause hangups, since extremely little work is done at the time of declaration.


## Callback Class

The `CanaryTestCallback` class is used to represent callbacks added to a test using methods such as `onBegin` and `onEnd`. It has a constructor and no methods.

### getOwner

Get the test object to which this callback belongs.

**Returns:** The `CanaryTest` instance to which this callback was added.

### getName

Get a string naming this callback.

**Returns:** A string representing the name of this callback.

### getTitle

Get a string containing an identifying title for this callback.

**Returns:** A string representing the title of this callback.

## Error Class

The `CanaryTestError` class is used to record errors encountered while attempting tests using Canary.

### stack

A property to get the stack trace attribute of the error object that this `CanaryTestError` instance was instantiated with, provided such an attribute exists.

**Value:** A stack trace, or `undefined` if none was found.

### message

A property to get the message attribute of the error object that this `CanaryTestError` instance was instantiated with, provided such an attribute exists.

**Value:** An error message, or `undefined` if none was found.

### getLocationName

Get the name of the test or callback where this error was encountered. The name is a short string that can be used to help identify a test or a callback.

**Returns:** A string giving the name of the location where the error occurred, or `undefined` if the location wasn't known.

### getLocationTitle

Get the title of the test or callback where this error was encountered. The title is a long string that can be used to uniquely identify a test or a callback.

**Returns:** A string giving the title of the location where the error occurred, or `undefined` if the location wasn't known.

### getLine

Get the line of the error's stack trace indicating where in the source the error occurred.

**Returns:** A string indicating on what line and in what file the error occurred, or `undefined` if the information couldn't be found.
