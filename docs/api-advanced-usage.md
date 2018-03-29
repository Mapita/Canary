These [**CanaryTest**](api-introduction.md) class methods are for those who need more complex or customized behavior from Canary. They are not relevant to the majority of users.

# constructor

The [**CanaryTest**](api-introduction.md) class constructor can be used to instantiate a test object with a given name and body function. Usually, test objects should be instantiated indirectly using the [**test**](api-adding-tests.md#test), [**group**](api-adding-tests.md#group), and [**series**](api-adding-tests.md#series) methods.

**Arguments:** `({string} name, {function} body)`

**Returns:** The new [**CanaryTest**](api-introduction.md) instance.

**Examples:**

``` js
const test = new canary.Test("Example test", function(){
    assert(true);
});
```

# silent

Set a test and all its children to run silently. This means that they will not output any log messages.

The [**log**](api-intermediate-usage.md#log) method of a [**CanaryTest**](api-introduction.md) instance can be used to log a message only if the test has not been set to run silently.

Note that when the **concise** flag of the [**doReport**](api-running-tests.md#doreport) function is set, it will cause all tests to run silently.

**Examples:**

``` js
canary.test("Example silent test", function(){
    this.silent();
});
```

# verbose

Set a test and all its children to run verbosely. This means they will output even more detailed logs than usual.

The [**logVerbose**](api-intermediate-usage.md#logverbose) method of a [**CanaryTest**](api-introduction.md) instance can be used to log a message only when the test is set to run verbosely.

Note that when the **verbose** flag of the [**doReport**](api-running-tests.md#doreport) function is set, it will cause all tests to run verbosely that were not otherwise set to run silently.

Marking a test as verbose will also mark it as not silent, overriding any previous calls to [**silent**](api-advanced-usage.md#silent).

**Examples:**

``` js
canary.test("Example verbose test", function(){
    this.verbose();
});
```

# unignore

Un-ignore a test that was previously marked as being ignored.

**Examples:**

``` js
const someTest = canary.test("Example test", function(){
    this.ignore();
});
someTest.unignore(); // Nevermind!
```

# shouldSkip

Check whether any flags have been set that will cause this test to be skipped, such as by using the [**todo**](api-intermediate-usage.md#todo) or [**ignore**](api-intermediate-usage.md#ignore) methods.

**Returns:** **true** is marked to be skipped **false** when it is not so marked.

**Examples:**

``` js
const someTest = canary.test("Example test", function(){
    assert(1 === 1);
});
// Test is currently normal and isn't marked to be skipped
assert(!someTest.shouldSkip());
// Mark it as ignored
someTest.ignore();
// Now the test should in fact be skipped
assert(someTest.shouldSkip());
```

# getTitle

Get an identifying title for this test. A test's title is its name, preceded by the name of its parent test, preceded by its parent's name, and so on.

**Returns:** A string, representing a title that can be used to identify this test.

# getName

Get the name provided for this test.

**Returns:** The test's name as a string.

# hasTag

Determine whether this test has a certain tag or not.

**Arguments:** `({string} tag)`

**Returns:** **true** when the test has the tag and **false** when it does not.

**Examples:**

``` js
const someTest = canary.test("Example test", function(){
    assert(1 === 1);
});
// Add some tags to the test
someTest.tags("hello", "world");
// Check for the presence of tags
assert(someTest.hasTag("hello"));
assert(!someTest.hasTag("not an actual tag"));
```

# getTags

Get a list of tags that have been added to this test.

**Returns:** An array of tags.

# getStatusString

Get a string representing the status of this test.

**Returns:** `"skipped"` if the test was marked as skipped or was never attempted, `"passed"` if the test completed successfully, or `"failed"` if the test was unsuccessful.

# durationSeconds

Get the length of time taken to run this test, in seconds.

**Returns:** The number of seconds it took to run the test, or **undefined** if the test has not yet been completed.

# durationMilliseconds

Get the length of time taken to run this test, in milliseconds.

**Returns:** The number of milliseconds it took to run the test, or **undefined** if the test has not yet been completed.

# addError

Add an error to the test's list of recorded errors.

The method requires an [**Error**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) object and optionally accepts another argument indicating the test or callback where the error occurred.

**Arguments:** `({Error} error, {CanaryTest|CanaryTestCalback} location)`

**Returns:** The newly-created [**CanaryTestError**](api-error-class.md) instance.

# abort

Abort the test and mark it as failed.

[**onEnd**](api-group-callbacks.md#onend), and [**onEachEnd**](api-group-callbacks.md#oneachend) callbacks will be executed upon calling this method.

The method optionally accepts information about the error that resulted in the test being aborted. The first argument, if provided, must be an [**Error**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) object, and the second argument can be used to indicate the test or callback where the error occured. (This is the same as with the [addError**](api-advanced-usage.md#adderror) method.)

**Arguments:** `({Error} error, {CanaryTest|CanaryTestCalback} location)`

# fail

Abort the test as failed, though not as aborted.

This method should only be called as the test is completed, since it immediately executes any [**onEnd**](api-group-callbacks.md#onend), and [**onEachEnd**](api-group-callbacks.md#oneachend) callbacks.

The method optionally accepts information about the error that caused the test to fail. The first argument, if provided, must be an [**Error**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) object, and the second argument can be used to indicate the test or callback where the error occured. (This is the same as with the [addError**](api-advanced-usage.md#adderror) method.)

**Arguments:** `({Error} error, {CanaryTest|CanaryTestCalback} location)`

# anyErrors

Get whether any errors were encountered while running this test.

**Returns:** **true** when the test has recorded any errors and **false** when it has not.

# noErrors

Get whether this test was run without encountering any errors.

**Returns:** **false** when the test has recorded any errors and **true** when it has not.

# getErrors

Get a list of errors that were encountered while attempting this test, if any.

**Returns:** An array of [**CanaryTestError**](api-error-class.md) objects encountered while running this test.

# anyFailedChildren

Get whether any child tests of a test group or series failed.

**Returns:** **true** when any child tests have failed and **false** otherwise.

If this method is called for an individual test rather than for a test group, then the return value will always be **false**.

# noFailedChildren

Get whether none of the child tests of a test group or series have been marked as failed.

**Returns:** **true** when no child tests have failed and **false** when any have failed.

If this method is called for an individual test rather than for a test group, then the return value will always be **true**.

# getFailedChildren

Get a list of child tests that have failed, if any.

**Returns:** An array of [**CanaryTest**](api-introduction.md) objects representing the failed child tests.

If this method is called for an individual test rather than for a test group, then the returned array will always be empty.

# addTest

Add a child test to a test group.

Note that if the test was previously added to another test group, it will be removed from that group as it is added to the new group.

**Arguments:** `({CanaryTest} test)`

# removeTest

Remove a child test from a parent group.

**Arguments:** `({CanaryTest} test)`

**Returns:** **true** if the test was in fact a child and was removed and **false** if it was not.

# removeAllTests

Remove all child tests from a parent group.

**Arguments:** `({CanaryTest} test)`

**Examples:**

``` js
const someGroup = canary.group("Example test group", function(){
    this.test("Example test", function(){
        assert(true);
    });
});
assert(someGroup.getChildren().length === 1);
someGroup.removeAllTests();
assert(someGroup.getChildren().length === 0);
```

# orphan

Remove a test from its parent group.

**Returns:** **true** if the test did in fact have a parent and was orphaned and **false** if it did not.

# getParent

Get the [**CanaryTest**](api-introduction.md) instance which is the parent of this one.

**Returns:** The [**CanaryTest**](api-introduction.md) instance to which this test has been added, or **undefined** if the test does not have a parent.

# getChildren

Get a list of the tests that are children of this test group.

Note that if this method is called for a test group or series, and the group has not already been expanded, then this method will cause it to be expanded. (As though the [**expandGroups**](api-advanced-usage.md#expandgroups) method was called.)

**Returns:** An array of [**CanaryTest**](api-introduction.md) instances which are children of this test group.

# applyFilter

Applies a filter function recursively to a test group and all of its children. Tests for which no ancestors or descendants satisfy the filter will be marked, then skipped when tests are run.

Note that if this method is called for a test group or series, and the group has not already been expanded, then this method will cause it to be expanded. (As though the [**expandGroups**](api-advanced-usage.md#expandgroups) method was called.)

This method is leveraged by [**doReport**](api-running-tests.md#doreport) in order to enforce the filtering criteria that are passed to it.

**Arguments:** `({function} filter)`

**Returns:** **true** if this test or any of its descendants satisfied the filter and **false** if not.

# resetFilter

Reset filtered state that may have been set by the [**applyFilter**](api-advanced-usage.md#resetfilter) method. Any tests that were previously set as filtered out will be restored to their normal state.

# expandGroups

Recursively run all the body functions assigned to test groups, but not to ordinary tests. This has the effect of elaborating the structure of the test tree without actually running tests.

Group expansion is put off until tests are actually needed in order to make the startup performance impact of including tests in an application source file close to nonexistent, even in the case of testing code errors that could potentially cause hangups, since extremely little work is done at the time of declaration.

**Examples:**

``` js
const someGroup = canary.group("Example test group", function(){
    canary.test("Example test", function(){
        assert("hello" === "hello");
    });
});
// Test groups are not expanded upon declaration, meaning that Canary
// doesn't know about someGroup's children yet.
assert(someGroup.getChildren().length === 0);
// After a call to expandGroups, Canary will have knowledge of the
// structure of the test tree.
canary.expandGroups();
assert(someGroup.getChildren().length === 1);
```

# reset

Resets the test's state so that it is safe to run it again. This method resets tests recursively, so all tests that belong to a group will also be reset.

**Examples:**

``` js
const someTest = canary.test("Example test", function(){
    assert(1 + 1 === 2);
});
// Run the test once
canary.run().then(() => {
    // Verify its success state
    assert(someTest.attempted);
    assert(someTest.success);
    // Reset it
    someTest.reset();
    assert(!someTest.attempted);
    assert(!someTest.success);
    // Run it again
    canary.run().then(() => {
        assert(someTest.attempted);
        assert(someTest.success);
    });
});
```
