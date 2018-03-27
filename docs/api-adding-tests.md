These `CanaryTest` methods are needed to write tests that can be run with Canary.

Tests and test groups can optionally be assigned names. It is strongly recommended that test names always be provided, since descriptive names will make it easier to understand where errors occur, when they occur.

# test

Add an individual test. Tests are added to test groups. This results in a test tree, or hierarchy, where the test created in this way is a child of the test group it was added to.

**Arguments:** `({string} name, {function} body)` _or_ `({function} body)`

If the body function returns a `Promise`, then when the test is run Canary will wait to see if the promise is resolved or rejected before completing the test and progressing to the next one. (A resolved promise indicates that this part of the test ran without errors and a rejected promise is treated the same as an unhandled thrown error.)

When the body function is called, both `this` and the first argument will refer to the test to which the function belongs.

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

``` js
canary.test("Example asynchronous test", async function(){
    const result = await someAsyncFunction();
    assert(result === 10);
});
```

# group

Add a test group. A test group is a special kind of test that may have child tests and callbacks such as `onBegin` and `onEnd`, but must not itself contain test logic.

**Arguments:** `({string} name, {function} body)` _or_ `({function} body)`

The body function should be synchronous. If it happens to return a `Promise` then, unlike a test instantiated with the `test` method, Canary will not wait for that promise to be resolved or rejected.

When the body function is called, both `this` and the first argument will refer to the test to which the function belongs.

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

