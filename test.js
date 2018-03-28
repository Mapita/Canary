const canary = require("./canary");
const assert = require("assert");

// Extremely basic test runner to test the test runner
const allTests = [];
function addTest(test){
    allTests.push(test);
}
async function runTests(){
    console.log(`Running ${allTests.length} tests...`);
    for(let test of allTests){
        try{
            canary.removeAllTests();
            canary.reset();
            canary.silent();
            await test();
        }catch(error){
            console.log("Error while running test:");
            console.log(error);
            process.exit(1);
        }
    }
    console.log("All tests ran successfully!");
    process.exit(0);
}

addTest(
    async function simpleSynchronousTests(){
        // Set up the test
        const simplePassingTest = canary.test("Example passing test", function(){
            // do nothing
        });
        const simpleSkippedTest = canary.test("Example skipped test", function(){
            this.ignore();
        });
        const simpleFailingTest = canary.test("Example failing test", function(){
            throw new Error("Simple test failure");
        });
        // Run canary
        await canary.run();
        // Verify correct results
        assert(simplePassingTest.success);
        assert(simpleSkippedTest.skipped);
        assert(simpleFailingTest.aborted);
        assert(simpleFailingTest.getErrors().length === 1);
        assert(simpleFailingTest.getErrors()[0] instanceof canary.Error);
        assert(simpleFailingTest.getErrors()[0].message === "Simple test failure");
    }
);

addTest(
    async function simpleAsynchronousTests(){
        // Set up the test
        const simplePassingTest = canary.test("Example passing test", async function(){
            // do nothing
        });
        const simpleSkippedTest = canary.test("Example skipped test", async function(){
            this.ignore();
        });
        const simpleFailingTest = canary.test("Example failing test", async function(){
            throw new Error("Simple test failure");
        });
        // Run canary
        await canary.run();
        // Verify correct results
        assert(simplePassingTest.success);
        assert(simpleSkippedTest.skipped);
        assert(simpleFailingTest.aborted);
        assert(simpleFailingTest.getErrors().length === 1);
        assert(simpleFailingTest.getErrors()[0] instanceof canary.Error);
        assert(simpleFailingTest.getErrors()[0].message === "Simple test failure");
    }
);

runTests();
