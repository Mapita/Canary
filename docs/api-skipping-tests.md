These [**CanaryTest**](api-introduction.md) class methods are related to marking tests so that they will be skipped.

If a test is known to be skipped before it's run, it won't be attempted at all. Sometimes Canary might not see that a test is meant to be skipped until after that test is started. In this case, the test will still be attempted, but any errors encountered while running the test will not count as failures.

# todo

Mark a test as "todo". Tests with this flag will be skipped and their "todo" status accordingly reported in the test results.

**Examples:**

``` js
canary.test("Incomplete tests are not reported as failures", function(){
    this.todo();
    assert(false);
});
```

# removeTodo

Recursively remove "todo" flags from a test and all of its children that were previously set using the [**todo**](api-skipping-tests.md#todo) method.

**Examples:**

``` js
const someTest = canary.test("Example test", function(){
    assert(123 === 123);
});
someTest.todo(); // Set as todo
someTest.removeTodo(); // Nevermind!
```

# ignore

Mark a test as ignored. Tests with this flag will be skipped and their ignored status accordingly reported in the test results.

**Examples:**

``` js
canary.test("A failing test that should be ignored for now", function(){
    this.ignore();
    let something = 0;
    assert(something === 1);
});
```

# unignore

Un-ignore a test that was previously marked as being ignored using the [**ignore**](api-skipping-tests.md#ignore) method.

**Examples:**

``` js
const someTest = canary.test("Example test", function(){
    assert(123 === 123);
});
someTest.ignore(); // Set as ignored
someTest.unignore(); // Nevermind!
```

# shouldSkip

Check whether any flags have been set that will cause this test to be skipped, such as by using the [**todo**](api-skipping-tests.md#todo) or [**ignore**](api-skipping-tests.md#ignore) methods.

**Returns:** **true** if the test is marked to be skipped and **false** when it is not so marked.

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
