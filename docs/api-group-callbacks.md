These [`CanaryTest`](api-introduction.md) methods can be used to add callbacks in test groups and series. This becomes useful if a certain setup action must be done before running the tests in the group and a corresponding tear-down action after, or if such actions must be performed before and after every test in a group.

Test callbacks can optionally be assigned names. Descriptive callback names will make it easier to understand where errors occur, when they occur.

These methods return [[`CanaryTestCallback`](api-callback-class.md)](api-callback-class.md) instances, which wrap the given callbacks and names together with some other relevant data. It should rarely if ever be necessary to store or handle the return values of these methods.

# onBegin

Add a callback that is run when a test group is begun. More than one callback can be added in this way. The callbacks are run in the order they were added.

[`onBegin`](api-group-callbacks.md#onbegin) callbacks run after [`onEachBegin`](api-group-callbacks.md#oneachbegin) callbacks and before all others. They run before child tests but after evaluating a test group's body function. (Normally, the body function is responsible for adding the callback in the first place.)

If any [`onBegin`](api-group-callbacks.md#onbegin) callback produces an error or otherwise aborts the test, any remaining [`onBegin`](api-group-callbacks.md#onbegin) callbacks will be ignored.

**Arguments:** `({string} name, {function} callback)` _or_ `({function} callback)`

If the callback function returns a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), then when the test is run Canary will wait to see if the promise is resolved or rejected before progressing with the test. (A resolved promise indicates that the callback ran without errors and a rejected promise is treated the same as an unhandled thrown error.)

The callback function is invoked with both `this` and the first argument referring to the just-begun test group.

**Returns:** The new [`CanaryTestCallback`](api-callback-class.md) instance that was added to the test group.

**Examples:**

``` js
canary.group("Example test group", function(){
    this.onBegin("Set up the tests", function(){
        doSetupStuff();
    });
    this.test("First example test", function(){
        assert("hello" === "hello");
    });
    this.test("Second example test", function(){
        assert("world" === "world");
    });
});
```

# onEnd

Add a callback that is run when a test group is ended, regardless of whether the test group was successful or not. More than one callback can be added in this way. The callbacks are run in the order they were added.

[`onEnd`](api-group-callbacks.md#onend) callbacks are run before [`onEachEnd`](api-group-callbacks.md#oneachend) callbacks and after child tests and all other callbacks.

If any [`onEnd`](api-group-callbacks.md#onend) callback produces an error or otherwise aborts the test, any remaining [`onEnd`](api-group-callbacks.md#onend) and [`onEachEnd`](api-group-callbacks.md#oneachend) callbacks will still be attempted.

**Arguments:** `({string} name, {function} callback)` _or_ `({function} callback)`

If the callback function returns a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), then when the test is run Canary will wait to see if the promise is resolved or rejected before progressing with the test. (A resolved promise indicates that the callback ran without errors and a rejected promise is treated the same as an unhandled thrown error.)

The callback function is invoked with both `this` and the first argument referring to the ended test group.

**Returns:** The new [`CanaryTestCallback`](api-callback-class.md) instance that was added to the test group.

**Examples:**

``` js
canary.group("Example test group", function(){
    this.test("First example test", function(){
        assert("hello" === "hello");
    });
    this.test("Second example test", function(){
        assert("world" === "world");
    });
    this.onEnd("Clean up after the tests", function(){
        doCleanUpStuff();
    });
});
```

# onSuccess

Add a callback that is run when a test group is completed without errors. More than one callback can be added in this way. The callbacks are run in the order they were added.

[`onSuccess`](api-group-callbacks.md#onsuccess) callbacks are run before [`onEachSuccess`](api-group-callbacks.md#oneachsuccess), [`onEnd`](api-group-callbacks.md#onend), and [`onEachEnd`](api-group-callbacks.md#oneachend) callbacks. They run after child tests and [`onEachBegin`](api-group-callbacks.md#oneachbegin) and [`onBegin`](api-group-callbacks.md#onbegin) callbacks.

In the case that an [`onSuccess`](api-group-callbacks.md#onsuccess) or [`onEachSuccess`](api-group-callbacks.md#oneachsuccess) callback produces an error that causes the test to fail as its completion is being handled, [`onFailure`](api-group-callbacks.md#onfailure) and [`onEachFailure`](api-group-callbacks.md#oneachfailure) callbacks will run after the failing [`onSuccess`](api-group-callbacks.md#onsuccess) or [`onEachSuccess`](api-group-callbacks.md#oneachsuccess) callback and the test will be marked as unsuccessful.

If any [`onSuccess`](api-group-callbacks.md#onsuccess) callback produces an error or otherwise aborts the test, any remaining [`onSuccess`](api-group-callbacks.md#onsuccess) and [`onEachSuccess`](api-group-callbacks.md#oneachsuccess) callbacks will be ignored.

**Arguments:** `({string} name, {function} callback)` _or_ `({function} callback)`

If the callback function returns a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), then when the test is run Canary will wait to see if the promise is resolved or rejected before progressing with the test. (A resolved promise indicates that the callback ran without errors and a rejected promise is treated the same as an unhandled thrown error.)

The callback function is invoked with both `this` and the first argument referring to the successful test group.

**Returns:** The new [`CanaryTestCallback`](api-callback-class.md) instance that was added to the test group.

**Examples:**

``` js
canary.group("Example test group", function(){
    this.test("First example test", function(){
        assert("hello" === "hello");
    });
    this.test("Second example test", function(){
        assert("world" === "world");
    });
    this.onSuccess("Run after all tests passed", function(){
        doSuccessStuff();
    });
});
```

# onFailure

Add a callback that is run when a test group is aborted. More than one callback can be added in this way. The callbacks are run in the order they were added.

[`onFailure`](api-group-callbacks.md#onfailure) callbacks are run before [`onEachFailure`](api-group-callbacks.md#oneachfailure), [`onEnd`](api-group-callbacks.md#onend), and [`onEachEnd`](api-group-callbacks.md#oneachend) callbacks. They run after child tests and [`onEachBegin`](api-group-callbacks.md#oneachbegin) and [`onBegin`](api-group-callbacks.md#onbegin) callbacks.

In the case that an [`onSuccess`](api-group-callbacks.md#onsuccess) or [`onEachSuccess`](api-group-callbacks.md#oneachsuccess) callback produces an error that causes the test to fail as its completion is being handled, [`onFailure`](api-group-callbacks.md#onfailure) and [`onEachFailure`](api-group-callbacks.md#oneachfailure) callbacks will run after the failing [`onSuccess`](api-group-callbacks.md#onsuccess) or [`onEachSuccess`](api-group-callbacks.md#oneachsuccess) callback and the test will be marked as unsuccessful.

If any [`onFailure`](api-group-callbacks.md#onfailure) callback produces an error or otherwise aborts the test, any remaining [`onFailure`](api-group-callbacks.md#onfailure) and [`onEachFailure`](api-group-callbacks.md#oneachfailure) callbacks will still be attempted.

**Arguments:** `({string} name, {function} callback)` _or_ `({function} callback)`

If the callback function returns a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), then when the test is run Canary will wait to see if the promise is resolved or rejected before progressing with the test. (A resolved promise indicates that the callback ran without errors and a rejected promise is treated the same as an unhandled thrown error.)

The callback function is invoked with both `this` and the first argument referring to the failed test group.

**Returns:** The new [`CanaryTestCallback`](api-callback-class.md) instance that was added to the test group.

**Examples:**

``` js
canary.group("Example test group", function(){
    this.test("First example test", function(){
        assert("hello" === "hello");
    });
    this.test("Second example test", function(){
        assert("world" === "world");
    });
    this.onFailure("Run after any tests failed", function(){
        doFailureStuff();
    });
});
```

# onEachBegin

Add a callback that is run once as every test belonging to a group is begun. More than one callback can be added in this way. The callbacks are run in the order they were added. The callbacks apply only to immediate child tests and test groups; they are not applied recursively.

[`onEachBegin`](api-group-callbacks.md#oneachbegin) callbacks run before all other callbacks. They run before child tests but after evaluating a test group's body function. (Normally, the body function is responsible for adding the callback in the first place.)

If any [`onEachBegin`](api-group-callbacks.md#oneachbegin) callback produces an error or otherwise aborts the test, any remaining [`onEachBegin`](api-group-callbacks.md#oneachbegin) and [`onBegin`](api-group-callbacks.md#onbegin) callbacks will be ignored.

**Arguments:** `({string} name, {function} callback)` _or_ `({function} callback)`

If the callback function returns a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), then when the test is run Canary will wait to see if the promise is resolved or rejected before progressing with the test. (A resolved promise indicates that the callback ran without errors and a rejected promise is treated the same as an unhandled thrown error.)

The callback function is invoked with both `this` and the first argument referring to the begun test, _not_ the test group to which the callback was added. The test group to which the callback was added (and of which the just-begun test is a child) can be referred to via the `parent` property. For example, via `this.parent`.

**Returns:** The new [`CanaryTestCallback`](api-callback-class.md) instance that was added to the test group.

**Examples:**

``` js
canary.group("Example test group", function(){
    this.onEachBegin("Set up each test", function(){
        doSetupStuff();
    });
    this.test("First example test", function(){
        assert("hello" === "hello");
    });
    this.test("Second example test", function(){
        assert("world" === "world");
    });
});
```

# onEachEnd

Add a callback that is run once as every test belonging to a group is ended, regardless of whether the test group was successful or not. More than one callback can be added in this way. The callbacks are run in the order they were added. The callbacks apply only to immediate child tests and test groups; they are not applied recursively.

[`onEachEnd`](api-group-callbacks.md#oneachend) callbacks run after all other callbacks.

If any [`onEachEnd`](api-group-callbacks.md#oneachend) callback produces an error or otherwise aborts the test, any remaining [`onEachEnd`](api-group-callbacks.md#oneachend) callbacks will still be attempted.

**Arguments:** `({string} name, {function} callback)` _or_ `({function} callback)`

If the callback function returns a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), then when the test is run Canary will wait to see if the promise is resolved or rejected before progressing with the test. (A resolved promise indicates that the callback ran without errors and a rejected promise is treated the same as an unhandled thrown error.)

The callback function is invoked with both `this` and the first argument referring to the ended test, _not_ the test group to which the callback was added. The test group to which the callback was added (and of which the ended test is a child) can be referred to via the `parent` property. For example, via `this.parent`.

**Returns:** The new [`CanaryTestCallback`](api-callback-class.md) instance that was added to the test group.

**Examples:**

``` js
canary.group("Example test group", function(){
    this.test("First example test", function(){
        assert("hello" === "hello");
    });
    this.test("Second example test", function(){
        assert("world" === "world");
    });
    this.onEachEnd("Clean up after each test", function(){
        doCleanUpStuff();
    });
});
```

# onEachSuccess

Add a callback that is run once as every test belonging to a group is completed without errors. More than one callback can be added in this way. The callbacks are run in the order they were added. The callbacks apply only to immediate child tests and test groups; they are not applied recursively.

[`onSuccess`](api-group-callbacks.md#onsuccess) callbacks are run before [`onEachSuccess`](api-group-callbacks.md#oneachsuccess), [`onEnd`](api-group-callbacks.md#onend), and [`onEachEnd`](api-group-callbacks.md#oneachend) callbacks. They run after child tests and [`onEachBegin`](api-group-callbacks.md#oneachbegin) and [`onBegin`](api-group-callbacks.md#onbegin) callbacks.

In the case that an [`onSuccess`](api-group-callbacks.md#onsuccess) or [`onEachSuccess`](api-group-callbacks.md#oneachsuccess) callback produces an error that causes the test to fail as its completion is being handled, [`onFailure`](api-group-callbacks.md#onfailure) and [`onEachFailure`](api-group-callbacks.md#oneachfailure) callbacks will run after the failing [`onSuccess`](api-group-callbacks.md#onsuccess) or [`onEachSuccess`](api-group-callbacks.md#oneachsuccess) callback and the test will be marked as unsuccessful.

If any [`onEachSuccess`](api-group-callbacks.md#oneachsuccess) callback produces an error or otherwise aborts the test, any remaining [`onEachSuccess`](api-group-callbacks.md#oneachsuccess) callbacks will be ignored.

**Arguments:** `({string} name, {function} callback)` _or_ `({function} callback)`

If the callback function returns a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), then when the test is run Canary will wait to see if the promise is resolved or rejected before progressing with the test. (A resolved promise indicates that the callback ran without errors and a rejected promise is treated the same as an unhandled thrown error.)

The callback function is invoked with both `this` and the first argument referring to the successful test, _not_ the test group to which the callback was added. The test group to which the callback was added (and of which the successful test is a child) can be referred to via the `parent` property. For example, via `this.parent`.

**Returns:** The new [`CanaryTestCallback`](api-callback-class.md) instance that was added to the test group.

**Examples:**

``` js
canary.group("Example test group", function(){
    this.test("First example test", function(){
        assert("hello" === "hello");
    });
    this.test("Second example test", function(){
        assert("world" === "world");
    });
    this.onEachSuccess("Run after every successful test", function(){
        doSuccessStuff();
    });
});
```

# onEachFailure

Add a callback that is run once as any test belonging to a group is aborted. More than one callback can be added in this way. The callbacks are run in the order they were added. The callbacks apply only to immediate child tests and test groups; they are not applied recursively.

[`onEachFailure`](api-group-callbacks.md#oneachfailure) are run before [`onEnd`](api-group-callbacks.md#onend), and [`onEachEnd`](api-group-callbacks.md#oneachend) callbacks. They run after child tests and [`onEachBegin`](api-group-callbacks.md#oneachbegin), [`onBegin`](api-group-callbacks.md#onbegin), and [`onFailure`](api-group-callbacks.md#onfailure) callbacks.

In the case that an [`onSuccess`](api-group-callbacks.md#onsuccess) or [`onEachSuccess`](api-group-callbacks.md#oneachsuccess) callback produces an error that causes the test to fail as its completion is being handled, [`onFailure`](api-group-callbacks.md#onfailure) and [`onEachFailure`](api-group-callbacks.md#oneachfailure) callbacks will run after the failing [`onSuccess`](api-group-callbacks.md#onsuccess) or [`onEachSuccess`](api-group-callbacks.md#oneachsuccess) callback and the test will be marked as unsuccessful.

If any [`onEachFailure`](api-group-callbacks.md#oneachfailure) callback produces an error or otherwise aborts the test, any remaining [`onEachFailure`](api-group-callbacks.md#oneachfailure) callbacks will still be attempted.

**Arguments:** `({string} name, {function} callback)` _or_ `({function} callback)`

If the callback function returns a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), then when the test is run Canary will wait to see if the promise is resolved or rejected before progressing with the test. (A resolved promise indicates that the callback ran without errors and a rejected promise is treated the same as an unhandled thrown error.)

The callback function is invoked with both `this` and the first argument referring to the failed test, _not_ the test group to which the callback was added. The test group to which the callback was added (and of which the failing test is a child) can be referred to via the `parent` property. For example, via `this.parent`.

**Returns:** The new [`CanaryTestCallback`](api-callback-class.md) instance that was added to the test group.

**Examples:**

``` js
canary.group("Example test group", function(){
    this.test("First example test", function(){
        assert("hello" === "hello");
    });
    this.test("Second example test", function(){
        assert("world" === "world");
    });
    this.onEachFailure("Run after any failed test", function(){
        doFailureStuff();
    });
});
```
