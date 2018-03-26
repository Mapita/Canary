# Canary

Canary is a tool for writing and running automated tests in JavaScript code. It was written primarily to support keeping tests and implementation in close proximity; it is the belief of this developer that it should not be possible to view or work on tests and implementation in isolation from one another.

Canary lets you control where and how you write your tests, how they are run, and how their results are reported. In case you aren't worried about the specifics of your how your test runner functions and reports results, just as long as it works, Canary can also run tests and report results with one function call for sensible default behavior.

Canary works best when used in combination with an assertion library such as [chai](http://www.chaijs.com/) or node's [assert](https://nodejs.org/api/assert.html) module.

Here's a simple example of JavaScript code tested using Canary:

``` js
const canary = require("canary-test"); // This library
const assert = require("assert"); // Node's built-in assertion library

function leftPad(value, length){
    if(value.length >= length){
        return String(value);
    }
    let text = String(value);
    while(text.length < length){
        text = " " + text;
    }
    return text;
}

canary.group("leftPad", function(){
    this.test("returns the input when it's as long as or longer than the input length", () => {
        assert.equal(leftPad("hello", 3), "hello");
        assert.equal(leftPad("world", 5), "world");
    });
    this.test("pads shorter inputs with spaces to match the desired length", () => {
        assert.equal(leftPad("hi", 4), "  hi");
        assert.equal(leftPad("123", 6), "   123");
    });
});
```

These tests could then be run with a single function call. This call might be placed in its own JavaScript file that runs when when you `npm run test`, or it might be placed in your main application code behind a command-line arugment switch, or any way that works best for you.

``` js
require("canary-test").doReport();
```

And this would output to the console...

``` text
sophie:shorter pineapple$ node testLeftPad.js
Running tests via Canary...
Completed test "leftPad => returns the input when it's as long as or longer than the input length". (0.000s)
Completed test "leftPad => pads shorter inputs with spaces to match the desired length". (0.000s)
Completed test group "leftPad". (0.001s)
Completed test group "Canary". (0.003s)
Finished running 4 tests.
✓ Canary (0.003s)
  ✓ leftPad (0.001s)
    ✓ returns the input when it's as long as or longer than the input length (0.000s)
    ✓ pads shorter inputs with spaces to match the desired length (0.000s)
4 of 4 tests passed.
Status: OK
```


