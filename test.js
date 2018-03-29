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
            canary.setLogFunction(console.log);
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
    async function testReferencesToCanaryClasses(){
        // Check CanaryTest class
        assert(canary instanceof canary.Test);
        // Check CanaryTestCallback class
        const callback = canary.onBegin(() => {});
        assert(callback instanceof canary.Callback);
        // Check CanaryTestError class
        const error = canary.addError(new Error("!!"));
        assert(error instanceof canary.Error);
    }
);

addTest(
    async function testSimpleSynchronousTests(){
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
    async function testSimpleAsynchronousTests(){
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
    async function testWithPassingSyncAndAsyncTests(){
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
    async function testExecutionOrderOfTests(){
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

addTest(
    async function testGettingNamesAndTitles(){
        // Set up the test
        let test;
        let callback;
        const group = canary.group("Example test group", function(){
            test = this.test("Example test", function(){
                // do nothing
            });
            callback = this.onEnd("Example callback", function(){
                // do nothing
            });
        });
        // Run canary
        await canary.run();
        // Verify correct results
        assert(group.getName() === "Example test group");
        assert(group.getTitle() === "Example test group");
        assert(test.getName() === "Example test");
        assert(test.getTitle() === "Example test group => Example test");
        assert(callback.getName() === "Example test group => onEnd (Example callback)");
        assert(callback.getTitle() === "Example test group => onEnd (Example callback)");
    }
)

addTest(
    async function testDoReportFilteringBehavior(){
        // Set up the test
        const passingTest = canary.test("Passing test", function(){
            // do nothing
        });
        const taggedTestGroup = canary.group("Tagged test group", function(){
            this.tags("exampleTag");
        });
        const untaggedTestGroup = canary.group("Untagged test group", function(){
            // do nothing
        });
        const failingTest = canary.test("Failing test", function(){
            // Incidentally, if doReport erroneously terminates the process
            // this test should cause it to still exit with a nonzero status code
            // and let CI or whatever know that something went wrong
            throw new Error("Test failed");
        });
        // Apply tag to failingTest test
        failingTest.tags("exampleTag");
        // Run canary, filtering by tags
        await canary.doReport({
            keepAlive: true,
            silent: true,
            tags: ["exampleTag"],
        });
        assert(!passingTest.attempted);
        assert(taggedTestGroup.success);
        assert(!untaggedTestGroup.attempted);
        assert(failingTest.failed);
        canary.reset();
        canary.resetFilter();
        // Run again, filtering by name
        await canary.doReport({
            keepAlive: true,
            silent: true,
            names: ["Passing test", "Untagged test group", "Failing test"],
        });
        assert(passingTest.success);
        assert(!taggedTestGroup.attempted);
        assert(untaggedTestGroup.success);
        assert(failingTest.failed);
        canary.reset();
        canary.resetFilter();
        // Run again, filtering by file path
        // Since all these tests are in the same file, all should run!
        await canary.doReport({
            keepAlive: true,
            silent: true,
            paths: [__dirname],
        });
        assert(passingTest.success);
        assert(taggedTestGroup.success);
        assert(untaggedTestGroup.success);
        assert(failingTest.failed);
        canary.reset();
        canary.resetFilter();
        // Run again, filtering by a different file path
        // Since none of the tests are in this file path, none should run.
        await canary.doReport({
            keepAlive: true,
            silent: true,
            paths: ["/not/a/valid/file:path@$!?"],
        });
        assert(!passingTest.attempted);
        assert(!taggedTestGroup.attempted);
        assert(!untaggedTestGroup.attempted);
        assert(!failingTest.attempted);
        canary.reset();
        canary.resetFilter();
        // Run again, filtering using a given predicate function
        await canary.doReport({
            keepAlive: true,
            silent: true,
            filter: test => test === untaggedTestGroup || test === failingTest,
        });
        assert(!passingTest.attempted);
        assert(!taggedTestGroup.attempted);
        assert(untaggedTestGroup.success);
        assert(failingTest.failed);
        canary.reset();
        canary.resetFilter();
        // And once more, using all the filters
        // They should be combined like an OR operation to run all tests
        await canary.doReport({
            keepAlive: true,
            silent: true,
            tags: ["exampleTag"],
            names: ["Passing test"],
            paths: ["/not/a/valid/file:path@$!?"],
            filter: test => test === untaggedTestGroup,
        });
        assert(passingTest.success);
        assert(taggedTestGroup.success);
        assert(untaggedTestGroup.success);
        assert(failingTest.failed);
        canary.reset();
        canary.resetFilter();
    }
);

addTest(
    async function testSuccessfulGroupCallbackOrder(){
        // Set up the test
        let counter = 0;
        const testGroup = canary.group("Example test group", function(){
            this.onBegin(function(){
                assert(counter === 0);
                counter++;
            });
            this.test("First example test", function(){
                assert(counter === 1);
                counter++;
            });
            this.test("Second example test", function(){
                assert(counter === 2);
                counter++;
            });
            this.onEnd(function(){
                assert(counter === 3);
                counter++;
            });
        });
        // Run canary
        await canary.run();
        // Verify correct results
        assert(canary.success);
        assert(counter === 4);
    }
);

addTest(
    async function testSuccessfulGroupEachCallbackOrder(){
        // Set up the test
        // The order of events should go like this:
        // 0: Parent => onBegin
        // 1: Parent => onEachBegin (First child)
        // 2: First child => onBegin
        // 3: First child => onEnd
        // 4: Parent => onEachEnd (First child)
        // 5: Parent => onEachBegin (Second child)
        // 6: Second child => onBegin
        // 7: Second child => onEnd
        // 8: Parent => onEachEnd (Second child)
        // 9: Parent => onEnd
        let counter = 0;
        const testGroup = canary.group("Parent test group", function(){
            this.onBegin(function(){
                assert(counter === 0);
                counter++;
            });
            this.onEachBegin(function(){
                if(this.getName() === "First child test group"){
                    assert(counter === 1);
                }else{
                    assert(counter === 5);
                }
                counter++;
            });
            this.onEachEnd(function(){
                if(this.getName() === "First child test group"){
                    assert(counter === 4);
                }else{
                    assert(counter === 8);
                }
                counter++;
            });
            this.group("First child test group", function(){
                this.onBegin(function(){
                    assert(counter === 2);
                    counter++;
                });
                this.onEnd(function(){
                    assert(counter === 3);
                    counter++;
                });
            });
            this.group("Second child test group", function(){
                this.onBegin(function(){
                    assert(counter === 6);
                    counter++;
                });
                this.onEnd(function(){
                    assert(counter === 7);
                    counter++;
                });
            });
            this.onEnd(function(){
                assert(counter === 9);
                counter++;
            });
        });
        // Run canary
        await canary.run();
        // Verify correct results
        assert(canary.success);
        assert(counter === 10);
    }
);

addTest(
    async function testAddingAndCheckingTags(){
        const test = canary.test("Example test", function(){
            // do nothing
        });
        // Check before adding any tags
        assert(test.getTags().length === 0);
        assert(!test.hasTag("hello"));
        assert(!test.hasTag("world"));
        assert(!test.hasTag("nope"));
        // Add some tags
        test.tags("hello", "world");
        // Check results
        assert(test.getTags().length === 2);
        assert(test.hasTag("hello"));
        assert(test.hasTag("world"));
        assert(!test.hasTag("nope"));
    }
);

addTest(
    async function testGroupFailedChildren(){
        // Set up the test
        const failingGroup = canary.group("Example test group", function(){
            this.test("First test (passing)", function(){
                // do nothing
            });
            this.test("Second test (failing)", function(){
                throw new Error("Example test failure #1");
            });
            this.test("Third test (failing)", function(){
                throw new Error("Example test failure #2");
            });
        });
        const passingGroup = canary.group("Example test group", function(){
            this.test("First test (passing)", function(){
                // do nothing
            });
            this.test("Second test (passing)", function(){
                // do nothing
            });
        });
        // Run canary
        await canary.run();
        // Verify correct results for failing group
        assert(failingGroup.failed);
        assert(failingGroup.anyFailedChildren());
        assert(!failingGroup.noFailedChildren());
        const failedChildren = failingGroup.getFailedChildren();
        assert(failedChildren.length === 2);
        assert(failedChildren[0].getName() === "Second test (failing)");
        assert(failedChildren[1].getName() === "Third test (failing)");
        // Verify correct results for passing group
        assert(passingGroup.success);
        assert(passingGroup.noFailedChildren());
        assert(!passingGroup.anyFailedChildren());
        assert(passingGroup.getFailedChildren().length === 0);
    }
);

addTest(
    async function testTodoFlag(){
        const someTest = canary.test("Example test", () => {});
        assert(!someTest.isTodo);
        assert(!someTest.shouldSkip());
        someTest.todo();
        assert(someTest.isTodo);
        assert(someTest.shouldSkip());
    }
);

addTest(
    async function testIgnoreAndUnignore(){
        const someTest = canary.test("Example test", () => {});
        assert(!someTest.isIgnored);
        assert(!someTest.shouldSkip());
        someTest.ignore();
        assert(someTest.isIgnored);
        assert(someTest.shouldSkip());
        someTest.unignore();
        assert(!someTest.isIgnored);
        assert(!someTest.shouldSkip());
    }
);

addTest(
    async function testApplyFilterAndResetFilter(){
        // Set up tests
        const firstTest = canary.test("Test #1", () => {});
        const secondTest = canary.test("Test #2", () => {});
        const thirdTest = canary.test("Test #3", () => {});
        const fourthTest = canary.test("Test #4", () => {});
        // Apply a filter and check results
        canary.applyFilter(test => {
            return test.getName().endsWith("1") || test.getName().endsWith("4");
        });
        assert(!firstTest.filtered);
        assert(!firstTest.shouldSkip());
        assert(secondTest.filtered);
        assert(secondTest.shouldSkip());
        assert(thirdTest.filtered);
        assert(thirdTest.shouldSkip());
        assert(!fourthTest.filtered);
        assert(!fourthTest.shouldSkip());
        // Revert the filter and check results
        canary.resetFilter();
        assert(!firstTest.filtered);
        assert(!firstTest.shouldSkip());
        assert(!secondTest.filtered);
        assert(!secondTest.shouldSkip());
        assert(!thirdTest.filtered);
        assert(!thirdTest.shouldSkip());
        assert(!fourthTest.filtered);
        assert(!fourthTest.shouldSkip());
    }
);

addTest(
    async function testParentsAndChildren(){
        // Set up the test
        let firstTest;
        let secondTest;
        const testGroup = canary.group("Example test group", function(){
            firstTest = this.test("First test (passing)", function(){
                // do nothing
            });
            secondTest = this.test("Second test (passing)", function(){
                // do nothing
            });
        });
        const isolatedTest = new canary.Test("Some test outside the test tree",
            () => {}
        );
        // Run canary
        await canary.run();
        // Check test tree structure
        assert(canary.getChildren().length === 1);
        assert(canary.getChildren()[0] === testGroup);
        assert(testGroup.getChildren().length === 2);
        assert(testGroup.getChildren()[0] === firstTest);
        assert(testGroup.getChildren()[1] === secondTest);
        assert(testGroup.getParent() === canary);
        assert(firstTest.getParent() === testGroup);
        assert(secondTest.getParent() === testGroup);
        assert(isolatedTest.getParent() === undefined);
        // Can't remove a test that isn't in the tree
        assert(!canary.removeTest(isolatedTest));
        assert(!testGroup.removeTest(testGroup));
        // Make changes to the test tree
        assert(canary.removeTest(firstTest));
        assert(canary.getChildren().length === 1);
        assert(testGroup.getChildren().length === 1);
        assert(secondTest.orphan());
        assert(canary.getChildren().length === 1);
        assert(testGroup.getChildren().length === 0);
    }
);

addTest(
    async function testDuration(){
        // Set up the test
        const someTest = canary.test("Example test", function(){
            return new Promise((resolve, reject) => {
                setTimeout(resolve, 100);
            });
        });
        // Run canary
        await canary.run();
        // Verify correct results
        const milliseconds = someTest.getDurationMilliseconds();
        assert(Math.abs(100 - milliseconds) < 50);
        assert(someTest.getDurationSeconds() === milliseconds * 0.001);
    }
);

addTest(
    async function testLogFunction(){
        // Check initial conditions
        canary.silent();
        canary.notVerbose();
        assert(canary.getLogFunction() === console.log);
        // Define a log function for testing
        let counter = 0;
        const logFunction = message => counter++;
        canary.setLogFunction(logFunction);
        // Check that child tests will also use the same log function
        const someTest = canary.test("Example test", () => {});
        assert(someTest.getLogFunction() === logFunction);
        // Check logging behavior when silent
        canary.log("Not logged because Canary is set to run silently.");
        canary.logVerbose("Also not logged");
        assert(counter === 0);
        // Check logging behavior when not silent
        canary.notSilent();
        canary.log("Logged!");
        canary.logVerbose("Not logged.");
        assert(counter === 1);
        // Check logging behavior when verbose, and not silent
        canary.verbose();
        canary.log("Logged!");
        canary.logVerbose("Also logged");
        assert(counter === 3);
        // Un-set verbose logging
        canary.notVerbose();
        canary.log("Logged!");
        canary.logVerbose("Not logged.");
        assert(counter === 4);
        // Return to silenced logs
        canary.silent();
        canary.log("Not logged because Canary is set to run silently.");
        canary.logVerbose("Also not logged");
        assert(counter === 4);
    }
);

addTest(
    async function testGetReport(){
        // Set up the test
        let firstTest;
        let secondTest;
        let thirdTest;
        let fourthTest;
        let fifthTest;
        const failingGroup = canary.series("First example test series", function(){
            firstTest = this.test("First test (passing)", function(){
                // do nothing
            });
            secondTest = this.test("Second test (failing)", function(){
                throw new Error("Example test failure");
            });
            thirdTest = this.test("Third test (skipped)", function(){
                // test is skipped
            });
        });
        const passingGroup = canary.series("Second example test series", function(){
            fourthTest = this.test("Fourth test (passing)", function(){
                // do nothing
            });
            fifthTest = this.test("Fifth test (skipped)", function(){
                this.ignore();
            });
        });
        // Run canary
        await canary.run();
        // Verify correct report results
        const report = canary.getReport();
        assert(report.passed);
        assert(report.failed);
        assert(report.skipped);
        assert(report.errors);
        assert(report.passed.length === 3);
        assert(report.passed.indexOf(firstTest) >= 0);
        assert(report.passed.indexOf(fourthTest) >= 0);
        assert(report.passed.indexOf(passingGroup) >= 0);
        assert(report.failed.length === 3);
        assert(report.failed.indexOf(secondTest) >= 0);
        assert(report.failed.indexOf(failingGroup) >= 0);
        assert(report.failed.indexOf(canary) >= 0);
        assert(report.skipped.length === 2);
        assert(report.skipped.indexOf(thirdTest) >= 0);
        assert(report.skipped.indexOf(fifthTest) >= 0);
        assert(report.errors.length === 1);
        assert(report.errors[0].message = "Example test failure");
        assert(report.errors[0].getLocation() === secondTest);
    }
);

runTests();
