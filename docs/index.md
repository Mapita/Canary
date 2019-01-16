Canary is a tool for writing and running automated tests in JavaScript code.

It can be found on GitHub at [github.com/mapita/canary](https://github.com/mapita/canary).

## Installation

Canary can be installed and added to a JavaScript project using [npm](https://www.npmjs.com/get-npm).

``` bash
npm install canary-test
```

## Example Usage

A simple example of JavaScript code tested using Canary:

``` js
// This library
const canary = require("canary-test").Group("leftPad");
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

These tests could then be run with a single function call. This call might be placed in its own JavaScript file that runs when when you use [**npm test**](https://docs.npmjs.com/cli/test), or it might be placed in your main application code behind a command-line arugment switch, or any other way that works best for you.

``` js
canary.doReport();
```

And this would output to the console...

```
sophie:canary pineapple$ node testLeftPad.js
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
