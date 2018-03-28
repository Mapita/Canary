These [`CanaryTest`](api-introduction.md) class methods are for running tests written with Canary and then reporting the results. The `doReport` method should be a fitting solution for almost all cases.

# doReport

A single, one-size-fits-most call to run tests, output a report to the console, then terminate the process with an appropriate status code. Except for when significant customization of the testing process or report output is needed, this method alone should be fully sufficient to run tests.

**Arguments:** `({object} options)`

These are the attributes of the options object which the `doReport` function will consider:

- `{boolean} concise`: Log only a small of information regarding testing and the results.
- `{boolean} silent`: Log no information whatsoever about tests or their results. If the `keepAlive` flag was not set, the process will still exit with an appropriate status code to indicate success or failure.
- `{boolean} verbose`: Log a great deal of information while running tests.
- `{boolean} keepAlive`: Normally, the process is terminated with a zero status code after running all tests successfully or a nonzero status code after running tests with any errors. When this flag is specified, `doReport` will not terminate the process.
- `{function} filter`: A function which accepts a [`CanaryTest`](api-introduction.md) instance and returns a truthy value when the test should be run and a falsey value when the test should be skipped.
- `{array} names`: An array of names to filter tests by; only tests with one of these names or belonging to a group with one of these names will be run.
- `{array} tags`: An array of tags to filter tests by; only tests with one of these tags or belonging to a group with one of these tags will be run.
- `{array} paths`: An array of file paths to filter tests by; only tests declared in a file whose path begins with this string, or belonging to a group with a matching file path, will be run.

When a filter applies positively to a test, that test's containing group, and its containing group, and so on will be run (though not necessarily their other child tests), and all children of the matching test will be run.

Note that when more than one filter is specified using e.g. the `filter`, `names`, or `tags` attributes, tests which match _any_ of the specified criteria will be run.

**Returns:** An object with `passed`, `failed`, `skipped`, and `errors` attributes.

Note that the returned object is exactly the same as if `getReport` was called after running tests. This is only meaningful, however, if the `keepAlive` flag was given in the options object. (Otherwise, the function will terminate the program.)

**Examples:**

``` js
// A module containing a leftPad implementation and unit tests
require("leftPad.js");
// Run tests, output a report, then terminate with an appropriate status code
require("canary-test").doReport();
```

# getReport

Get an object containing a list of passed tests, a list of failed tests, a list of skipped tests, and a list of errors.

The lists of tests are arrays of [`CanaryTest`](api-introduction.md) instances. The list of errors is an array of [`CanaryTestError`](api-error-class.md) instances.

Note that the list of errors includes even those errors encountered while running tests that were later found to be marked as ignored or to be otherwise skipped. Due to this, the presence of errors in the list does not necessarily indicate a test suite failure.


**Returns:** An object with `passed`, `failed`, `skipped`, and `errors` attributes.

# getSummary

Get a summary string describing the status of every test that was attempted.

Example of a string returned by a call to `getSummary` after running tests:

```
✓ Canary (0.003s)
  ✓ leftPad (0.001s)
    ✓ returns the input when it's as long as or longer than the input length (0.000s)
    ✓ pads shorter inputs with spaces to match the desired length (0.000s)
```

**Returns:** A string showing all the tests that were run using Canary and their status.

# run

Run the test asynchronously.

**Returns:** A [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) which is resolved when the test is completed. This promise should not ever be rejected, even in the case of a test failure.

**Examples:**

``` js
canary.test("Example test", function(){
    assert(123 < 456);
});
canary.run().then(() => {
    console.log("Finished running tests!");
});
```
