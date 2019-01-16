// This is an example of using Canary to test some code!
// Try it out with `node leftPad.js`

// This library
const canary = require("./canary.js");
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

// Run the tests!
canary.doReport();
