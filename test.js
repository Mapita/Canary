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
            console.log(`Running test "${test.name}"...`);
            canary.removeAllTests();
            canary.reset();
            canary.silent();
            await test();
        }catch(error){
            console.log(`Error while running test "${test.name}":`);
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
        assert(canary.getStatusString() === "failed");
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
        assert(canary.getStatusString() === "failed");
    }
);

addTest(
    async function allPassingTests(){
        // Set up the test
        const syncPassingTest = canary.test("Synchronous passing test", function(){
            // do nothing
        });
        const asyncPassingTest = canary.test("Asynchronous passing test", async function(){
            // do nothing
        });
        let nestedSyncPassingTest;
        let nestedAsyncPassingTest;
        const passingTestGroup = canary.group("Example test group", function(){
            nestedSyncPassingTest = canary.test("Nested synchronous passing test", function(){
                // do nothing
            });
            nestedAsyncPassingTest = canary.test("Nested asynchronous passing test", async function(){
                // do nothing
            });
        });
        // Run canary
        await canary.run();
        // Verify correct results
        assert(syncPassingTest.success);
        assert(asyncPassingTest.success);
        assert(passingTestGroup.success);
        assert(nestedSyncPassingTest.success);
        assert(nestedAsyncPassingTest.success);
        assert(canary.success);
    }
);

addTest(
    async function verifyTestsRunInOrder(){
        // Set up the test
        let counter = 0;
        const firstTest = canary.test("First test (synchronous)", function(){
            assert(counter === 0);
            counter++;
        });
        const secondTest = canary.test("Second test (asynchronous)", async function(){
            assert(counter === 1);
            counter++;
        });
        const thirdTest = canary.test("Third test (synchronous)", function(){
            assert(counter === 2);
            counter++;
        });
        const fourthTest = canary.test("Fourth test (asynchronous)", async function(){
            assert(counter === 3);
            counter++;
        });
        // Run canary
        await canary.run();
        // Verify correct results
        assert(firstTest.success);
        assert(secondTest.success);
        assert(thirdTest.success);
        assert(fourthTest.success);
        assert(canary.success);
        assert(counter === 4);
    }
);

addTest(
    async function testGroupVsTestSeriesBehavior(){
        // Set up the test
        let counter = 0;
        const testGroup = canary.group("Failing test group", function(){
            this.test("First test (passing)", function(){
                // do nothing
            });
            this.test("Second test (failing)", function(){
                throw new Error("Example test failure");
            });
            this.test("Third test (should not be skipped)", function(){
                throw new Error("Test should not be skipped");
            });
        });
        const testSeries = canary.series("Failing test series", function(){
            this.test("First test (passing)", function(){
                // do nothing
            });
            this.test("Second test (failing)", function(){
                throw new Error("Example test failure");
            });
            this.test("Third test (should be skipped)", function(){
                throw new Error("Test should be skipped");
            });
        });
        // Run canary
        await canary.run();
        // Verify correct results
        // All tests in the test group ran
        assert(testGroup.failed);
        assert(!testGroup.aborted);
        assert(testGroup.getChildren().length === 3);
        assert(testGroup.getChildren()[0].success);
        assert(testGroup.getChildren()[1].aborted);
        assert(testGroup.getChildren()[2].aborted);
        assert(testGroup.getFailedChildren().length === 2);
        // Tests after the first failing test in a series were not attempted
        assert(testSeries.aborted);
        assert(testSeries.getChildren().length === 3);
        assert(testSeries.getChildren()[0].success);
        assert(testSeries.getChildren()[1].aborted);
        assert(!testSeries.getChildren()[2].attempted);
        assert(testSeries.getFailedChildren().length === 1);
        // Root test group is marked as failed (but not as aborted)
        assert(canary.failed);
        assert(!canary.aborted);
    }
);

runTests();
