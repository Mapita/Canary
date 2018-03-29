These [**CanaryTest**](api-introduction.md) class methods are used to change or inspect the tags assigned to a test.

Tags are useful as a filtering mechanism; the [**doReport**](api-running-tests.md#doreport) method offers the ability to run only the tests that have certain tags using the **tags** attribute of its options object. In larger projects, it may be useful to tag tests that are related to certain features so that, when making changes to a feature, it is possible to run the relevant, tagged tests without also requiring the potentially significant amount of time needed to run the rest of the test suite.

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

**Examples:**

``` js
// Create a test and add a tag to it
const someTest = canary.test("Example test", function(){
    assert("abc" === "abc");
});
someTest.tags("someTag");
// Check the return value for getTags
const tags = someTest.getTags();
assert(tags.length === 1);
assert(tags[0] === "someTag");
```
