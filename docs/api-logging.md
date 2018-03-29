These [**CanaryTest**](api-introduction.md) class methods are for changing the way that Canary logs information, and for allowing tests to output information to logs in a way that respects Canary's logging settings.

# log

Log a message, except for if this test has been set to run [silently](api-logging.md#silent).

**Arguments:** `({object} message)`

**Examples:**

``` js
canary.test("Example test", function(){
    this.log("Running a test! The test's name is", this.name);
});
```

# logVerbose

Log a message, but only if this test has been set to run [verbosely](api-logging.md#verbose).

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

The log function should accept a single argument, normally a string, and then output it somewhere.

**Examples:**

``` js
// Add a timestamp in front of every message that Canary outputs
canary.setLogFunction(message => {
    return console.log((new Date()).toISOString() + ": " + message);
});
```

# silent

Recursively set a test and all its children to run silently. This means that they will not output any log messages.

The [**log**](api-logging.md#log) method of a [**CanaryTest**](api-introduction.md) instance can be used to log a message only if the test has not been set to run silently.

Note that when the **concise** flag of the [**doReport**](api-running-tests.md#doreport) function is set, it will cause all tests to run silently.

**Examples:**

``` js
canary.test("Example silent test", function(){
    this.silent();
});
```

# notSilent

Recursively set a test and all its children to not run [silently](api-logging.md#silent). (This is the default behavior.)

The [**log**](api-logging.md#log) method of a [**CanaryTest**](api-introduction.md) instance can be used to log a message only if the test has not been set to run silently.

# verbose

Set a test and all its children to run verbosely. This means they will output even more detailed logs than usual.

The [**logVerbose**](api-logging.md#logverbose) method of a [**CanaryTest**](api-introduction.md) instance can be used to log a message only when the test is set to run verbosely.

Note that when the **verbose** flag of the [**doReport**](api-running-tests.md#doreport) function is set, it will cause all tests to run verbosely that were not otherwise set to run silently.

Marking a test as verbose will also mark it as not silent, overriding any previous calls to [**silent**](api-logging.md#silent).

**Examples:**

``` js
canary.test("Example verbose test", function(){
    this.verbose();
});
```

# notVerbose

Recursively set a test and all its children to not run [verbosely](api-advanced-usage.md#verbose). (This is the default behavior.)

The [**logVerbose**](api-logging.md#logverbose) method of a [**CanaryTest**](api-introduction.md) instance can be used to log a message only when the test is set to run verbosely.
