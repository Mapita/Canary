These [**CanaryTest**](api-introduction.md) methods are needed to write tests that can be run with Canary.

Tests and test groups can optionally be assigned names. It is strongly recommended that test names always be provided, since descriptive names will make it easier to understand where errors occur, when they occur.

There are three different kinds of tests:

- Individual tests, created using the [**test**](api-adding-tests.md#test) method.
- Test groups, created using the [**group**](api-adding-tests.md#group) method.
- Test series, created using the [**series**](api-adding-tests.md#series) method.

An individual test can be synchronous or asynchronous. It represents a single test prodecude, and it is the most basic building block of a test suite.

A test group is essentially a special case of an individual test. It is a test which may contain a list of child or subordinate tests. It may declare callbacks to run at the beginning and end of the test group's execution, and at the beginning and end of each child test's execution. In a test group, the order in which the child tests are run should not affect the outcome, and when any child test fails the rest of the tests will still be attempted.

A test series is a special case of a test group. A test series is distinguished from a test group in that the order of execution of child tests is significant, and that if one child test fails the following tests should not be attempted.

**Use a test group when:** It contains tests without side effects, or whose side effects are certain not to affect each other.

**Use a test series when:** It contains tests that have side effects that may impact the other tests in the series, such as when testing a stateful API.

Using these structures, a test tree, or hierarchy, is created. The individual tests are the leaves on this test tree and the test groups and series represent their own subtrees. Normally, the global [**canary**](api-introduction.md) instance will always be at the root of the test tree.

# test

Add an individual test to a test group or series, such as the global [**canary**](api-introduction.md) instance.

**Arguments:** `({string} name, {function} body)` _or_ `({function} body)`

If the body function returns a [**Promise**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), then when the test is run Canary will wait to see if the promise is resolved or rejected before completing the test and progressing to the next one. (A resolved promise indicates that this part of the test ran without errors and a rejected promise is treated the same as an unhandled thrown error.)

When the body function is called, both [**this**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) and the first argument will refer to the test to which the function belongs.

**Returns:** The newly-created [**CanaryTest**](api-introduction.md) instance.

**Examples:**

``` js
canary.test("Example test", function(){
    assert(2 + 2 === 4);
});
```

``` js
canary.test("Example asynchronous test", async function(){
    const result = await someAsyncFunction();
    assert(result === 10);
});
```

``` js
canary.group("Example test group", function(){
    this.test("Example test", function(){
        assert(1 < 3);
    });
});
```

# group

Add a test group to a parent test or series. A test group is a special kind of test that may have child tests and callbacks such as [**onBegin**](api-group-callbacks.md#onbegin) and [**onEnd**](api-group-callbacks.md#onend), but must not itself contain test logic.

Unlike a test series, the children of a test group are not guaranteed to run in the order that they were added to the group. This means that the tests added to a group should be fully independent of one another. If they are not independent, then a series should be used instead.

**Arguments:** `({string} name, {function} body)` _or_ `({function} body)`

The body function should be synchronous. If it happens to return a [**Promise**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) then, unlike a test instantiated with the [**test**](api-adding-tests.md#test) method, Canary will not wait for that promise to be resolved or rejected.

When the body function is called, both [**this**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) and the first argument will refer to the test to which the function belongs.

**Returns:** The newly-created [**CanaryTest**](api-introduction.md) instance.

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

# Group (static)

Create a new test group without any parent group. Where the [**group**](api-adding-tests.md#group) method adds a new test group as a child of another group, this static method of the [**CanaryTest**](api-introduction.md) class can be used to create a detached test group.

Normally, you will want to acquire a shared root [**CanaryTest**](api-introduction.md) instance by invoking this method upon importing the package.

``` js
const canary = require("canary-test").Group("My Test Group");
```

**Arguments:** `({string} name, {function} body)` _or_ `({function} body)`

The body function should be synchronous. If it happens to return a [**Promise**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) then, unlike a test instantiated with the [**test**](api-adding-tests.md#test) method, Canary will not wait for that promise to be resolved or rejected.

When the body function is called, both [**this**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) and the first argument will refer to the test to which the function belongs.

**Returns:** The newly-created [**CanaryTest**](api-introduction.md) instance.

**Examples:**

``` js
const Canary = require("canary-test");
const testGroup = Canary.Group("My Test Group");
```

# series

Add a test series to a parent test or series. A test series is a special kind of test group that will always run its child tests in the order they were added, and that will abort at the first failure of any child test.

Like a normal test group, a test series should have a synchronous body function without itself containing any test logic, and it may use callbacks like [**onBegin**](api-group-callbacks.md#onbegin) and [**onEnd**](api-group-callbacks.md#onend).

**Arguments:** `({string} name, {function} body)` _or_ `({function} body)`

The body function should be synchronous. If it happens to return a [**Promise**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) then, unlike a test instantiated with the [**test**](api-adding-tests.md#test) method, Canary will not wait for that promise to be resolved or rejected.

When the body function is called, both [**this**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) and the first argument will refer to the test to which the function belongs.

**Returns:** The newly-created [**CanaryTest**](api-introduction.md) instance.

**Examples:**

``` js
canary.series("Example test series", function(){
    this.test("First example test", function(){
        assert("hello" === "hello");
    });
    this.test("Second example test", function(){
        assert("world" === "world");
    });
});
```

# Series (static)

Create a new test series without any parent group. Where the [**series**](api-adding-tests.md#series) method adds a new test series as a child of another group, this static method of the [**CanaryTest**](api-introduction.md) class can be used to create a detached test series.

This function is similar to [**CanaryTest.Group**](api-adding-tests.md#group-static). The difference is that the tests belonging to the test group returned by this function will run in series, and execution of the test group will terminate as soon as any test fails.

**Arguments:** `({string} name, {function} body)` _or_ `({function} body)`

The body function should be synchronous. If it happens to return a [**Promise**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) then, unlike a test instantiated with the [**test**](api-adding-tests.md#test) method, Canary will not wait for that promise to be resolved or rejected.

When the body function is called, both [**this**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) and the first argument will refer to the test to which the function belongs.

**Returns:** The newly-created [**CanaryTest**](api-introduction.md) instance.

**Examples:**

``` js
const Canary = require("canary-test");
const testSeries = Canary.Series("My Test Series");
```
