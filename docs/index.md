# Canary

Canary is a tool for writing and running automated tests in JavaScript code.

https://github.com/mapita/canary

## Installation

Canary can be installed and added to a JavaScript project with `npm install canary-test --save`.

## Example Usage

A simple example of JavaScript code tested using Canary:

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



