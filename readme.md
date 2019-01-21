# Canary

[![Build Status](https://travis-ci.org/Mapita/Canary.svg?branch=master)](https://travis-ci.org/Mapita/Canary) [![Documentation Status](https://readthedocs.org/projects/canary/badge/?version=latest)](http://canary.readthedocs.io/en/latest/?badge=latest)

Canary is a tool for writing and running automated tests in JavaScript code. It was written with tests and implementation sharing the same file foremost in mind. When tests and implementation are close together, it's more difficult to forget or ignore tests when making changes to the implementation.

Check out Canary's documentation at [canary.readthedocs.io](http://canary.readthedocs.io/en/stable/).

Install Canary using [npm](https://www.npmjs.com/get-npm): `npm install canary-test`

Canary lets you control where and how you write your tests, how they are run, and how their results are reported. In case you aren't worried about the specifics of your how your test runner functions and reports results, just as long as it works, Canary can also run tests and report results with one function call for sensible default behavior.

Canary works best when used in combination with an assertion library such as [chai](http://www.chaijs.com/) or node's [assert](https://nodejs.org/api/assert.html) module.

Here's a simple example of JavaScript code tested using Canary:

``` js
// This library
const canary = require("canary-test").Group("leftPad package");
// Node's built-in assertion library
const assert = require("assert");

// A function that ought to be tested
function leftPad(value, length){
    let text = String(value);
    while(text.length < length){
        text = " " + text;
    }
    return text;
}

// Tests written using Canary
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
canary.doReport();
```

And this would output to the console...

``` text
sophie:canary pineapple$ node testLeftPad.js
Running tests via Canary...
Completed test "leftPad => returns the input when it's as long as or longer than the input length". (0.000s)
Completed test "leftPad => pads shorter inputs with spaces to match the desired length". (0.000s)
Completed test group "leftPad". (0.001s)
Completed test group "leftPad package". (0.002s)
Finished running 4 tests.
✓ leftPad package
  ✓ leftPad
    ✓ returns the input when it's as long as or longer than the input length
    ✓ pads shorter inputs with spaces to match the desired length
4 of 4 tests passed.
Status: OK
```
