These [**CanaryTest**](api-introduction.md) methods can be used to add callbacks in test groups and series. This becomes useful if a certain setup action must be done before running the tests in the group and a corresponding tear-down action after, or if such actions must be performed before and after every test in a group.

Test callbacks can optionally be assigned names. Descriptive callback names will make it easier to understand where errors occur, when they occur.

These methods return [**CanaryTestCallback**](api-callback-class.md) instances, which wrap the given callbacks and names together with some other relevant data. It should rarely if ever be necessary to store or handle the return values of these methods.

# onBegin

Add a callback that is run when a test group is begun. More than one callback can be added in this way. The callbacks are run in the order they were added.

[**onBegin**](api-group-callbacks.md#onbegin) callbacks run after [**onEachBegin**](api-group-callbacks.md#oneachbegin) callbacks and before running child tests. They after evaluating a test group's body function. (Normally, the body function is responsible for adding the callback in the first place.)

If any [**onBegin**](api-group-callbacks.md#onbegin) callback produces an error or otherwise aborts the test, any remaining [**onBegin**](api-group-callbacks.md#onbegin) callbacks will be ignored.

**Arguments:** `({string} name, {function} callback)` _or_ `({function} callback)`

If the callback function returns a [**Promise**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), then when the test is run Canary will wait to see if the promise is resolved or rejected before progressing with the test. (A resolved promise indicates that the callback ran without errors and a rejected promise is treated the same as an unhandled thrown error.)

The callback function is invoked with both [**this**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) and the first argument referring to the just-begun test group.

**Returns:** The new [**CanaryTestCallback**](api-callback-class.md) instance that was added to the test group.

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

[**onEnd**](api-group-callbacks.md#onend) callbacks are run before [**onEachEnd**](api-group-callbacks.md#oneachend) callbacks and after running child tests.

If any [**onEnd**](api-group-callbacks.md#onend) callback produces an error or otherwise aborts the test, any remaining [**onEnd**](api-group-callbacks.md#onend) and [**onEachEnd**](api-group-callbacks.md#oneachend) callbacks will still be attempted.

**Arguments:** `({string} name, {function} callback)` _or_ `({function} callback)`

If the callback function returns a [**Promise**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), then when the test is run Canary will wait to see if the promise is resolved or rejected before progressing with the test. (A resolved promise indicates that the callback ran without errors and a rejected promise is treated the same as an unhandled thrown error.)

The callback function is invoked with both [**this**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) and the first argument referring to the ended test group.

**Returns:** The new [**CanaryTestCallback**](api-callback-class.md) instance that was added to the test group.

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

# onEachBegin

Add a callback that is run once as every test belonging to a group is begun. More than one callback can be added in this way. The callbacks are run in the order they were added. The callbacks apply only to immediate child tests and test groups; they are not applied recursively.

[**onEachBegin**](api-group-callbacks.md#oneachbegin) callbacks run before all other callbacks, including [**onBegin**](api-group-callbacks.md#onbegin) callbacks. They run before child tests but after evaluating a test group's body function. (Normally, the body function is responsible for adding the callback in the first place.)

If any [**onEachBegin**](api-group-callbacks.md#oneachbegin) callback produces an error or otherwise aborts the test, any remaining [**onEachBegin**](api-group-callbacks.md#oneachbegin) and [**onBegin**](api-group-callbacks.md#onbegin) callbacks will be ignored.

**Arguments:** `({string} name, {function} callback)` _or_ `({function} callback)`

If the callback function returns a [**Promise**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), then when the test is run Canary will wait to see if the promise is resolved or rejected before progressing with the test. (A resolved promise indicates that the callback ran without errors and a rejected promise is treated the same as an unhandled thrown error.)

The callback function is invoked with both [**this**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) and the first argument referring to the begun test, _not_ the test group to which the callback was added. A reference to the test group to which the callback was added (and of which the just-begun test is a child) can be acquired using the [**getParent**](api-advanced-usage#getparent) method.

**Returns:** The new [**CanaryTestCallback**](api-callback-class.md) instance that was added to the test group.

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

[**onEachEnd**](api-group-callbacks.md#oneachend) callbacks run after all other callbacks, including [**onEnd**](api-group-callbacks.md#onend) callbacks.

If any [**onEachEnd**](api-group-callbacks.md#oneachend) callback produces an error or otherwise aborts the test, any remaining [**onEachEnd**](api-group-callbacks.md#oneachend) callbacks will still be attempted.

**Arguments:** `({string} name, {function} callback)` _or_ `({function} callback)`

If the callback function returns a [**Promise**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), then when the test is run Canary will wait to see if the promise is resolved or rejected before progressing with the test. (A resolved promise indicates that the callback ran without errors and a rejected promise is treated the same as an unhandled thrown error.)

The callback function is invoked with both [**this**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) and the first argument referring to the ended test, _not_ the test group to which the callback was added. A reference to the test group to which the callback was added (and of which the just-begun test is a child) can be acquired using the [**getParent**](api-advanced-usage#getparent) method.

**Returns:** The new [**CanaryTestCallback**](api-callback-class.md) instance that was added to the test group.

**Examples:**

``` js
canary.group("Example test group", function(){
    this.onEachEnd("Clean up after each test", function(){
        doCleanUpStuff();
    });
    this.test("First example test", function(){
        assert("hello" === "hello");
    });
    this.test("Second example test", function(){
        assert("world" === "world");
    });
});
```
