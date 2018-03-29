These [**CanaryTest**](api-introduction.md) class methods may not be needed by users who are writing tests for smaller projects, but will prove valuable when writing tests for larger projects.

# todo

Mark a test as "todo". Tests with this flag will be skipped and their "todo" status accordingly reported in the test results.

**Examples:**

``` js
canary.test("An incomplete test that will not be reported as a failure", function(){
    this.todo();
    assert(false);
});
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

# tags

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

# log

Log a message, except for if this test has been set to run silently.

**Arguments:** `({object} message)`

**Examples:**

``` js
canary.test("Example test", function(){
    this.log("Running a test! The test's name is", this.name);
});
```

# logVerbose

Log a message, but only if this test has been set to run verbosely.

**Arguments:** `({object} message)`

**Examples:**

``` js
canary.test("Example test", function(){
    this.logVerbose("Running a test! The test's name is", this.name);
});
```

# getLogFunction

Get the logging function that is being used by this test. By default, Canary uses [**console.log**](https://developer.mozilla.org/en-US/docs/Web/API/Console/log) when logging messages.

**Returns:** The function which is invoked to log messages.

**Examples:**

``` js
const logFunction = canary.getLogFunction();
assert(logFunction === console.log);
```

# setLogFunction

Set the logging function that is being used by this test and all children tests. By default, Canary uses [**console.log**](https://developer.mozilla.org/en-US/docs/Web/API/Console/log) when logging messages.

**Arguments:** `({function} logFunction)`

**Examples:**

``` js
// Add a timestamp in front of every message that Canary outputs
canary.setLogFunction(message => {
    return console.log((new Date()).toISOString() + ": " + message);
});
```
