// Helpers to set text colors
const red = text => '\u001b[91m' + text + '\u001b[39m';
const green = text => '\u001b[92m' + text + '\u001b[39m';
const yellow = text => '\u001b[93m' + text + '\u001b[39m';

class CanaryTestCallback{
    constructor(type, owner, name, body){
        this.type = type;
        this.owner = owner;
        this.name = name;
        this.body = body;
    }
    // Get the test object to which this callback belongs.
    getOwner(){
        return this.owner;
    }
    // Get a name for this callback.
    getName(){
        return `${this.owner.getName()} => ${this.type} (${this.name})`;
    }
    // Get an identifying title for this callback.
    getTitle(){
        return `${this.owner.getTitle()} => ${this.type} (${this.name})`;
    }
}

class CanaryTestError{
    constructor(test, error, location){
        this.test = test;
        this.error = error;
        this.location = location;
    }
    // Access the error object's stack trace.
    get stack(){
        return this.error ? this.error.stack : undefined;
    }
    // Access the error object's message string.
    get message(){
        return this.error ? this.error.message : undefined;
    }
    // Get a short yet identifying name for the test or callback where
    // this error was encountered, or undefined if the location is unknown.
    getLocationName(){
        if(this.location && this.location.getName){
            return this.location.getName();
        }else{
            return undefined;
        }
    }
    // Get a fully identifying title for the test or callback where
    // this error was encountered, or undefined if the location is unknown.
    getLocationTitle(){
        if(this.location && this.location.getTitle){
            return this.location.getTitle();
        }else{
            return undefined;
        }
    }
    // Get the line where this error occurred.
    getLine(){
        if(this.error && this.error.stack){
            return this.error.stack.split("\n")[1].trim();
        }else{
            return undefined;
        }
    }
}

class CanaryTest{
    constructor(name, body){
        // The name of the test.
        this.name = name;
        // A body function for the test. It is run as part of test initialization,
        // or it may simply contain the test's normal code.
        this.body = body;
        // This flag is set to true when the test is initialized (meaning it is
        // about to be attempted). Skipped tests will not have this flag changed
        // from false.
        this.attempted = false;
        // This flag is set to true when part or all of the test was skipped,
        // e.g. because its todo flag or ignore flag was set.
        this.skipped = false;
        // This flag is set to true when the test was completed successfully and
        // to false when the test was aborted.
        this.success = undefined;
        // This flag is set to false when the test was completed successfully and
        // to true when the test was aborted prematurely due to an error.
        this.aborted = undefined;
        // This flag is set to false when the test was completed successfully and
        // to true when the test was found to have failed for any reason.
        this.failed = undefined;
        // This flag is set when the test was skipped due to an unmet filter.
        this.filtered = undefined;
        // This flag can be set using the "todo" method. It indicates that the
        // test should be skipped and marked as TODO in any log output.
        this.isTodo = false;
        // This flag can be set using the "ignore" method. It indicates that
        // the test should be skipped and marked as ignored in any log output.
        this.isIgnored = false;
        // This flag can be set using the "verbose" method. It causes tests to
        // log an exceptional amount of information.
        this.isVerbose = false;
        // This flag can be set using the "silent" method. It causes tests to
        // run silently, not outputting any information to logs.
        this.isSilent = false;
        // This flag indicates whether this is a test group. Test groups do not
        // have any test code running immediately in their body, but instead
        // should only add child tests.
        this.isGroup = false;
        // This flag indicates whether this is a test series. (Which is a
        // special of test groups as far as he implementation is concerned.)
        // A test series aborts at the first failure of a child test.
        this.isSeries = false;
        // This flag is set after a test group was expanded; i.e. its body
        // function was evaluated.
        this.isExpandedGroup = false;
        // The time at which the test was initialized.
        this.startTime = undefined;
        // The time at which the test was totally concluded, whether due to
        // success or failure.
        this.endTime = undefined;
        // The time at which a test group was expanded.
        this.expandTime = undefined;
        // When the test has concluded, this array will contain every error that
        // was encountered over the course of attempting the test, represented
        // as a CanaryTestError instance.
        this.errors = [];
        // This attribute records the return value of the "body" function.
        this.bodyReturnedValue = undefined;
        // When the "body" function returns a promise, this attribute records
        // whatever value that promised resolved with.
        this.bodyReturnedValueResolved = undefined;
        // The parent test, or the CanaryTest instance to which this instance was
        // added. Running a parent test implies running all of its child tests.
        this.parent = undefined;
        // An array of child tests which have been added to this one.
        this.children = [];
        // Will contain references to failed child tests.
        this.failedChildren = [];
        // An array of onBegin callbacks.
        this.onBeginCallbacks = [];
        // An array of onEnd callbacks.
        this.onEndCallbacks = [];
        // An array of onEachBegin callbacks.
        this.onEachBeginCallbacks = [];
        // An array of onEachEnd callbacks.
        this.onEachEndCallbacks = [];
        // A dictionary of tags assigned to this test in particular.
        this.tagDictionary = {};
        // The location where this test was defined.
        const location = this.getCallerLocation();
        if(location){
            const locationParts = location.split(":");
            this.filePath = this.normalizePath(locationParts[0]);
            this.lineInFile = parseInt(locationParts[1]);
            this.columnInLine = parseInt(locationParts[2]);
        }else{
            this.filePath = undefined;
            this.lineInFile = undefined;
            this.columnInLine = undefined;
        }
    }
    // Reset the state of the test and all child tests so that it is safe to
    // run it again.
    reset(){
        this.logVerbose(`Resetting test "${this.name}".`);
        this.attempted = false;
        this.skipped = false;
        this.success = undefined;
        this.aborted = undefined;
        this.failed = undefined;
        this.startTime = undefined;
        this.endTime = undefined;
        this.errors = [];
        this.failedChildren = [];
        for(let child of this.children){
            child.reset();
        }
    }
    // Mark the test and all its children as "TODO". These tests will not be
    // attempted.
    todo(){
        this.logVerbose(`Marking test "${this.name}" as todo.`);
        this.isTodo = true;
        for(let child of this.children){
            child.todo();
        }
    }
    // Mark the test and all its children as ignored. These tests will not be
    // attempted.
    ignore(){
        this.logVerbose(`Marking test "${this.name}" as ignored.`);
        this.isIgnored = true;
        for(let child of this.children){
            child.ignore();
        }
    }
    // Mark the test and all its children as not-ignored.
    unignore(){
        this.logVerbose(`Marking test "${this.name}" as unignored.`);
        this.isIgnored = false;
        for(let child of this.children){
            child.unignore();
        }
    }
    // Mark the test and all its children as silent. They will not output
    // any log information anywhere.
    silent(){
        this.isSilent = true;
        for(let child of this.children){
            child.silent();
        }
    }
    // Mark the test and all its children as verbose. They will log a lot of
    // information about the test process.
    // It also un-silences silenced tests.
    verbose(){
        this.isVerbose = true;
        this.isSilent = false;
        for(let child of this.children){
            child.verbose();
        }
    }
    // Assign some tags to this test, which will be inherited by its children
    // and grandchildren and etc.
    tags(...tags){
        for(let tag of tags){
            this.tagDictionary[tag] = true;
        }
    }
    // Get the parent test.
    getParent(){
        return this.parent;
    }
    // Get a list of child tests.
    // If the group has not been expanded already, it will be expanded now.
    getChildren(){
        if(this.isGroup && !this.isExpandedGroup){
            this.expandGroups();
        }
        return this.children;
    }
    // Get this test's tags as a dictionary object.
    getTags(){
        const tagList = [];
        for(let tag in this.tagDictionary){
            tagList.push(tag);
        }
        return tagList;
    }
    // Get whether this test has a certain tag.
    hasTag(tag){
        return tag in this.tagDictionary[tag];
    }
    // Get whether this test should be skipped, e.g. if its todo or ignore
    // flag has been set.
    shouldSkip(){
        return this.isTodo || this.isIgnored || this.filtered;
    }
    // Get a string identifying this test in particular.
    getTitle(){
        let title = this.name || "";
        let test = this.parent;
        while(test){
            if(test.parent && test.name){
                title = `${test.name} => ${title}`;
            }
            test = test.parent;
        }
        return title;
    }
    // Get the string identifying the name of this test.
    getName(){
        return this.name;
    }
    // Log a message. (Except if the test was marked as silent.)
    log(...message){
        if(!this.isSilent){
            return console.log(...message);
        }
    }
    // Log a verbose message.
    logVerbose(...message){
        if(this.isVerbose && !this.isSilent){
            return console.log(...message);
        }
    }
    // Helper function to retrieve the current time in milliseconds.
    getTime(){
        if(typeof performance === "undefined"){
            return new Date().getTime();
        }else{
            return performance.now();
        }
    }
    // Get how long the test took to run, in seconds
    get durationSeconds(){
        if(this.startTime === undefined || this.endTime === undefined){
            return undefined;
        }else{
            return 0.001 * (this.endTime - this.startTime);
        }
    }
    // Get how long the test took to run, in milliseconds
    get durationMilliseconds(){
        if(this.startTime === undefined || this.endTime === undefined){
            return undefined;
        }else{
            return this.endTime - this.startTime;
        }
    }
    // True when at least one error has been encountered so far in attempting
    // to run the test.
    anyErrors(){
        return this.errors && this.errors.length;
    }
    // True when the test has encountered no errors so far.
    noErrors(){
        return !this.errors || !this.errors.length;
    }
    // Get a list of errors that have been encountered so far while attempting
    // to run this test.
    getErrors(){
        return this.errors;
    }
    // True when any child tests in a group have failed.
    anyFailedChildren(){
        return this.failedChildren && this.failedChildren.length;
    }
    // True when no child tests in a group have failed.
    noFailedChildren(){
        return !this.failedChildren || !this.failedChildren.length;
    }
    // Get a list of failed child tests.
    getFailedChildren(){
        return this.failedChildren;
    }
    // Helper function to get a string like "1st", "2nd", "3rd"...
    // Expects the input to be an integer.
    // This is used to produce helpful names for tests and callbacks that
    // weren't assigned more descriptive names by their developer.
    nthText(number){
        const lastDigit = number % 10;
        if(lastDigit === 1){
            return `${number}st`;
        }else if(lastDigit === 2){
            return `${number}nd`;
        }else if(lastDigit === 3){
            return `${number}rd`;
        }else{
            return `${number}th`;
        }
    }
    // Helper function to normalize a file path for comparison.
    // Makes all slashes forward slashes, removes trailing and redundant
    // slashes, and resolves "." and "..".
    normalizePath(path){
        // Separate the path into parts (delimited by slashes)
        let parts = [""];
        for(let char of path){
            if(char === "/" || char === "\\"){
                if(parts[parts.length - 1].length){
                    parts.push("");
                }
            }else{
                parts[parts.length - 1] += char;
            }
        }
        // Special case for when the entire path was "."
        if(parts.length === 1 && parts[0] === "."){
            return ".";
        }
        // Resolve "." and ".."
        let i = 0;
        while(i < parts.length){
            if(parts[i] === "."){
                parts.splice(i, 1);
            }else if(i > 0 && parts[i] === ".."){
                parts.splice(i - 1, 2);
                i--;
            }else{
                i++;
            }
        }
        // Build the resulting path
        let result = "";
        for(let part of parts){
            if(part && part.length){
                if(result.length){
                    result += "/";
                }
                result += part;
            }
        }
        // Retain a slash at the beginning of the string
        if(path[0] === "/" || path[0] === "\\"){
            result = "/" + result;
        }
        // All done!
        return result;
    }
    // Generalized helper method for implementing onBegin, onEnd, etc. methods.
    addCallback(type, callbackList, name, callback){
        this.logVerbose(`Adding "${type}" callback to test "${this.name}"...`);
        if(!this.isGroup){
            throw new Error("Callbacks can only be added to test groups.");
        }
        // Allow optionally omitting the name and using the callback as the
        // sole argument to onBegin, onEnd, etc. instead.
        if(name && !callback){
            callback = name;
            name = `${this.nthText(callbackList.length + 1)} ${type} callback`;
        }
        // Create a CanaryTestCallback instance and add it to the correct list.
        const testCallback = new CanaryTestCallback(type, this, name, callback);
        callbackList.push(testCallback);
        // All done! Return the produced CanaryTestCallback instance.
        this.logVerbose(`Added "${type}" callback named "${name}" to test "${this.name}".`);
        return testCallback;
    }
    // Add an onBegin callback.
    onBegin(name, callback){
        return this.addCallback("onBegin", this.onBeginCallbacks, name, callback);
    }
    // Add an onEnd callback.
    onEnd(name, callback){
        return this.addCallback("onEnd", this.onEndCallbacks, name, callback);
    }
    // Add an onEachBegin callback.
    onEachBegin(name, callback){
        return this.addCallback("onEachBegin", this.onEachBeginCallbacks, name, callback);
    }
    // Add an onEachEnd callback.
    onEachEnd(name, callback){
        return this.addCallback("onEachEnd", this.onEachEndCallbacks, name, callback);
    }
    // Internal helper method to run a list of callbacks.
    async runCallbacks(exitOnError, callbackList, ...callbackArguments){
        // Bail out if no callback list was actually provided.
        if(!callbackList){
            return;
        }
        // Enumerate and invoke callbacks in order.
        for(let callback of callbackList){
            // Record an error when the callback is missing an implementation.
            if(!callback.body){
                this.addError(new Error("Callback has no implementation."), callback);
            }
            // When the exitOnError flag is set, check that the test has not
            // entered any kind of error or abort state before going through
            // with the next callback.
            if((this.aborted || this.failure || this.anyErrors()) && this.exitOnError){
                return;
            }
            // Actually attempt the callback.
            try{
                const result = callback.body.call(this, this, ...callbackArguments);
                // If the callback returned a promise, then wait for it to resolve.
                if(result instanceof Promise){
                    await result;
                }
            // Record any errors encountered while handling the callback.
            }catch(error){
                this.addError(error, callback);
            }
        }
    }
    // Internal helper method which is run as a test is initialized.
    async initialize(){
        this.logVerbose(`Initializing test "${this.name}...`);
        this.startTime = this.getTime();
        this.attempted = true;
    }
    // Report an error. The first argument is the error object that was thrown
    // and the second argument is an optional location indicating where the
    // error was encountered, such as a CanaryTest instance or a
    // CanaryTestCallback instance.
    addError(error = undefined, location = undefined){
        if(error){
            this.log(red(`Encountered an error while running test "${this.name}":\n  ${error.message}`));
        }else{
            this.log(red(`Encountered an error while running test "${this.name}".`));
        }
        const testError = new CanaryTestError(this, error, location);
        this.errors.push(testError);
        return testError;
    }
    // A failed test is one that was completed, but somehow ended up in an
    // error state anyway. One example is a test group with failing child tests
    // but with no issues with the test group itself.
    async fail(error = undefined, location = undefined){
        this.logVerbose(`Beginning to fail test "${this.name}"...`);
        // If the test was already failed, then skip all of this.
        // This might happen if, for example, an onEnd, or onEachEnd callback
        // attempts to abort the test.
        if(this.failed){
            return;
        }
        // Set failure state.
        this.failed = true;
        this.success = false;
        // If the function arguments included an error and an optional location,
        // then add this information to the list of encountered errors.
        if(error){
            this.addError(error, location);
        }
        // Log a message stating that the test is being aborted.
        this.log(`Failing test "${this.name}".`);
        // Run onEnd and onEachEnd callbacks.
        await this.doEndCallbacks();
        // All done! Mark the time.
        this.endTime = this.getTime();
    }
    async abort(error = undefined, location = undefined){
        this.logVerbose(`Beginning to abort test "${this.name}"...`);
        if(!this.failed){
            this.aborted = true;
            return await this.fail(error, location);
        }
    }
    async exitTestGroup(childTest){
        this.logVerbose(`Beginning to exit test group "${this.name}" due to a failed child test.`);
        if(!this.failed){
            this.failedChildren.push(childTest);
            return await this.abort();
        }
    }
    async complete(){
        this.logVerbose(`Beginning to set success state on test "${this.name}".`);
        // Set completion state.
        this.success = true;
        this.failed = false;
        this.aborted = false;
        // Run onEnd and onEachEnd callbacks.
        await this.doEndCallbacks();
        // Wrapping up! Mark the time.
        this.endTime = this.getTime();
        // Check once again for errors, in this case probably caused by an onEnd
        // or onEachEnd callback, and mark the test as failed if any was
        // encountered.
        if(this.anyErrors()){
            this.failed = true;
            this.success = false;
        // If no errors were encountered during this completion process, log a
        // message explaining that the test was completed.
        }else{
            const duration = this.durationSeconds.toFixed(3);
            if(this.isGroup){
                this.log(`Completed test group "${this.getTitle()}". (${duration}s)`);
            }else{
                this.log(`Completed test "${this.getTitle()}". (${duration}s)`);
            }
        }
    }
    // To be run when the test was skipped.
    skip(){
        this.logVerbose(`Skipping test "${this.name}".`);
        this.skipped = true;
        this.endTime = this.getTime();
    }
    // Invoke onBegin callbacks.
    async doBeginCallbacks(){
        if(this.parent){
            this.logVerbose(
                `Executing parent's ${this.parent.onEachBeginCallbacks.length} ` +
                `onEachBegin callbacks for test "${this.name}".`
            );
            await this.runCallbacks(true, this.parent.onEachBeginCallbacks);
        }
        if(this.noErrors() && !this.failed && !this.aborted){
            this.logVerbose(
                `Executing ${this.onBeginCallbacks.length} onBegin callbacks ` +
                `for test "${this.name}".`
            );
            await this.runCallbacks(true, this.onBeginCallbacks);
        }else if(this.parent){
            this.logVerbose(
                `Skipping onBegin callbacks for test "${this.name}" due to ` +
                `errors encountered while running onEachBegin callbacks.`
            );
        }
    }
    // Invoke onEnd and parent's onEachEnd callbacks.
    async doEndCallbacks(){
        this.logVerbose(
            `Executing ${this.onEndCallbacks.length} onEnd callbacks ` +
            `for test "${this.name}".`
        );
        await this.runCallbacks(false, this.onEndCallbacks);
        if(this.parent){
            this.logVerbose(
                `Executing parent's ${this.parent.onEachEndCallbacks.length} ` +
                `onEachEnd callbacks for test "${this.name}".`
            );
            await this.runCallbacks(false, this.parent.onEachEndCallbacks);
        }
    }
    // Orphan a child test, i.e. remove it from its parent.
    orphan(){
        if(!this.parent){
            return;
        }
        this.logVerbose(
            `Orphaning test "${this.name}" from its parent ` +
            `"${this.parent.name}".`
        );
        if(this.parent.removeTest){
            this.parent.removeTest(this);
            return true;
        }
        this.parent = undefined;
        return false;
    }
    // Remove a child test.
    removeTest(child){
        this.logVerbose(
            `Removing child test "${child.name}" from parent test ` +
            `"${this.name}".`
        );
        const index = this.children.indexOf(child);
        if(index >= 0){
            this.children[index].parent = undefined;
            this.children.splice(index, 1);
            return true;
        }
        return false;
    }
    // Remove all child tests.
    removeAllTests(){
        this.logVerbose(`Removing all child tests from "${this.name}".`);
        for(let child of this.children){
            child.parent = undefined;
        }
        this.children = [];
    }
    // Add a Test instance as a child of this one.
    addTest(child){
        this.logVerbose(
            `Adding test "${child.name}" as a child of parent "${this.name}".`
        );
        if(!this.isGroup){
            throw new Error("Tests can only be added as children to test groups.");
        }
        if(child.parent){
            child.orphan();
        }
        child.parent = this;
        this.children.push(child);
    }
    // Create a Test instance with the given attributes, then assign it as a
    // child of this test.
    test(name, body){
        // Handle the case where a body function is given but a name is not
        if(name && !body){
            body = name;
            name = `${this.nthText(this.children.length + 1)} child test`;
        }
        // Instantiate the CanaryTest object.
        const test = new CanaryTest(name, body);
        // Add it as a child of this test.
        this.addTest(test);
        // Set some properties of the child test to match properties of this test.
        test.isTodo = this.isTodo;
        test.isIgnored = this.isIgnored;
        test.isSilent = this.isSilent;
        test.isVerbose = this.isVerbose;
        // All done! Return the produced CanaryTest instance.
        return test;
    }
    // Create a CanaryTest instance that is marked as a test group.
    // Test groups should not have any test code that runs immediately in their
    // body functions; instead they should rely only on adding callbacks and
    // child tests. Their body functions should also be synchronous.
    group(name, body){
        const testGroup = this.test(name, body);
        testGroup.isGroup = true;
        return testGroup;
    }
    // Create a CanaryTest instance that is marked as a test series.
    // Test groups should not have any test code that runs immediately in their
    // body functions; instead they should rely only on adding callbacks and
    // child tests. Their body functions should also be synchronous.
    series(name, body){
        const testSeries = this.group(name, body);
        testSeries.isSeries = true;
        return testSeries;
    }
    // Helper function to get the path to the file where a test was defined.
    getCallerLocation(){
        const error = new Error();
        if(error.stack){
            const lines = error.stack.split("\n");
            for(let i = 2; i < lines.length; i++){
                if(i > 0 && lines[i] === "    at <anonymous>"){
                    const paren = lines[i - 1].indexOf("(");
                    if(paren >= 0){
                        return lines[i - 1].slice(paren + 1, lines[i - 1].length - 1);
                    }else{
                        return undefined;
                    }
                }else if(
                    !lines[i].startsWith("    at CanaryTest.") &&
                    !lines[i].startsWith("    at new CanaryTest")
                ){
                    const paren = lines[i].indexOf("(");
                    if(paren >= 0){
                        return lines[i].slice(paren + 1, lines[i].length - 1);
                    }else{
                        return lines[i].slice(7, lines[i].length);
                    }
                }
            }
        }else{
            return undefined;
        }
    }
    // Evaluate all tests marked as groups to create a workably complete tree
    // structure of tests. This should only be a necessary step when attempting
    // to filter tests, and even then not in all cases.
    expandGroups(){
        this.logVerbose(`Expanding test groups belonging to test "${this.name}"...`);
        try{
            if(this.isGroup && !this.isExpandedGroup && this.body){
                this.expandTime = this.getTime();
                this.isExpandedGroup = true;
                this.bodyReturnedValue = this.body(this);
                this.logVerbose(
                    `Test group "${this.name}" has ${this.children.length} ` +
                    `child tests after expansion.`
                );
            }
            for(let child of this.children){
                child.expandGroups();
            }
        }catch(error){
            this.addError(error, this);
            this.attempted = true;
            this.aborted = true;
            this.startTime = this.getTime();
            this.endTime = this.startTime;
        }
    }
    // Apply a filter function. This means marking tests that did not satisfy
    // the filter, and where none of their direct ancestors or descendents
    // satisfied the filter, so that they will be skipped instead of run.
    applyFilter(filter){
        this.logVerbose(`Applying a filter function to test "${this.name}"...`);
        // Expand groups if not already expanded
        if(this.isGroup && !this.isExpandedGroup){
            this.expandGroups();
        }
        if(filter(this)){
            this.logVerbose(`Test "${this.name}" satisfied the filter.`);
            return true;
        }else{
            let anyChildSatisfies = false;
            for(let child of this.children){
                this.logVerbose("Checking child: ", child.name);
                if(child.applyFilter(filter)){
                    anyChildSatisfies = true;
                }
            }
            if(anyChildSatisfies){
                this.logVerbose(`Test "${this.name}" satisfied the filter via a child.`);
                return true;
            }else{
                this.filtered = filter;
                this.logVerbose(`Test "${this.name}" did not satisfy the filter.`);
                return false;
            }
        }
    }
    // Reset filtering done via applyFilter.
    resetFilter(){
        this.logVerbose(`Resetting filtered state for test "${this.name}".`);
        this.filtered = undefined;
        for(let child of this.children){
            child.resetFilter();
        }
    }
    // Run the test!
    async run(){
        try{
            this.logVerbose(`Beginning to run test "${this.name}".`);
            // Check if the test is supposed to be skipped, or if it has already
            // been marked as aborted or failed.
            if(this.shouldSkip()){
                this.logVerbose("The test was marked to be skipped.");
                return this.skip();
            }else if(this.aborted || this.failed){
                this.logVerbose("The test was already marked as failed.");
                return;
            }
            // Check if this is a test group that hasn't been expanded yet.
            // If not, then expand it now.
            if(this.isGroup && !this.isExpandedGroup){
                this.expandGroups();
            }
            // Prepare to run the test.
            await this.initialize();
            // Handle onBegin and onEachBegin callbacks
            await this.doBeginCallbacks();
            // Check for errors produced by onBegin/onEachBegin
            if(this.aborted || this.failed || this.anyErrors()){
                this.logVerbose(
                    "Aborting due to errors found after executing onBegin " +
                    "and onEachBegin callbacks"
                );
                return await this.abort();
            }
            // If the test has a body function, then evaluate it.
            // (But not in the case of a group that was already expanded.)
            if(this.body && !this.isExpandedGroup){
                // Run the body callback.
                this.bodyReturnedValue = this.body(this);
                // The body function may have explicitly aborted the test or
                // added errors.
                if(this.aborted || this.failed || this.anyErrors()){
                    this.logVerbose(
                        "Aborting due to errors found after evaluating " +
                        "the test's body function."
                    );
                    return await this.abort();
                }
                // Handle the case where the function returned a promise
                // But not for test groups!
                if(this.bodyReturnedValue instanceof Promise && !this.isGroup){
                    // Wait for the promise to resolve
                    this.bodyReturnedValueResolved = await this.bodyReturnedValue;
                    // The promise may have explicitly aborted the test
                    if(this.aborted || this.failed || this.anyErrors()){
                        this.logVerbose(
                            "Aborting due to errors found after waiting " +
                            "for the promise returned by the test's body " +
                            "function to resolve."
                        );
                        return await this.abort();
                    }
                // Log a warning for test groups that returned a promise, since
                // this is probably a mistake.
                }if(this.bodyReturnedValue instanceof Promise && this.isGroup){
                    this.logVerbose(
                        `The body function of test group "${this.name}" ` +
                        `returned a promise. This might be a mistake!`
                    );
                }
                // Check if the test body set a flag indicating that this test
                // and its children should be skipped.
                if(this.shouldSkip()){
                    this.logVerbose(
                        "The test was found to be marked for skipping after " +
                        "evaluating its body function."
                    );
                    return this.skip();
                }
            }
            // Run child tests, if any.
            if(this.isGroup && this.children && this.children.length){
                // Run the child tests in order, from first to last, waiting
                // for each test to complete before attempting the next.
                for(let child of this.children){
                    // Run the child test.
                    try{
                        await child.run();
                    }catch(error){
                        this.logVerbose(
                            `Aborting due to errors encountered while attempting ` +
                            `to run the child test "${child.name}".`
                        );
                        return await this.abort(error, child);
                    }
                    // Handle a failed child test
                    if((child.aborted || child.failed) && !child.shouldSkip()){
                        if(this.isSeries){
                            this.logVerbose(
                                `Skipping remaining child tests because the ` +
                                `child test "${child.name}" was aborted.`
                            );
                            return await this.exitTestGroup(child);
                        }else{
                            this.failedChildren.push(child);
                        }
                    // The child may have explicitly aborted the parent test
                    // without having been itself aborted.
                    }else if(this.aborted || this.failed || this.anyErrors()){
                        this.logVerbose(
                            `Aborting due to errors found after running the ` +
                            `child test "${child.name}".`
                        );
                        return await this.abort();
                    }
                }
            }
            // If there were any failures, mark the test group as
            // failed, too. A test series should have exited before now if
            // a failed child test was the cause!
            if(this.anyErrors() || this.anyFailedChildren()){
                return await this.fail();
            // Otherwise mark the test as complete and run onEnd callbacks
            }else if(!this.aborted && !this.failed){
                return await this.complete();
            }
        }catch(error){
            // Mark the test as failed and run onEnd callbacks
            this.logVerbose(
                `Aborting due to an unhandled error encountered while ` +
                `running test "${this.name}".`
            );
            try{
                return await this.abort(error, this);
            }catch(abortError){
                try{
                    this.addError(abortError, this);
                    this.success = false;
                    this.failed = true;
                    this.aborted = true;
                    this.endTime = this.getTime();
                }catch(addErrorError){
                    // Pretty much hopeless at this point
                }
                return;
            }
        }
    }
    // Get a hierarchical summary string listing every test, its status, and
    // very brief information about any errors that were encountered.
    getSummary(indent = "  ", prefix = ""){
        this.logVerbose(`Generating a summary string for test "${this.name}"...`);
        let text = prefix;
        // The test was skipped because it didn't satisfy a filter.
        if(this.filtered){
            text += yellow(`- ${this.name} (filtered)`);
        // The test was skipped because it was set to be ignored.
        }else if(this.isIgnored){
            text += yellow(`- ${this.name} (ignored)`);
        // The test was skipped because it was marked as TODO.
        }else if(this.isTodo){
            text += yellow(`- ${this.name} (TODO)`);
        // The test ran successfully.
        }else if(this.success){
            if(this.durationSeconds === undefined){
                text += green(`✓ ${this.name}`);
            }else{
                text += green(`✓ ${this.name} (${this.durationSeconds.toFixed(3)}s)`);
            }
        // The test encountered an error or errors.
        }else if(this.anyErrors()){
            const error = this.errors.length === 1 ? "error" : "errors";
            text += red(`X ${this.name} (${this.errors.length} ${error})`);
        // The test was aborted for some other reason
        }else if(this.aborted){
            text += red(`X ${this.name} (aborted)`);
        // The test was failed for some other reason
        }else if(this.failed){
            text += red(`X ${this.name} (failed)`);
        // The test has failed children but for some reason wasn't itself marked
        // as failed. (This shouldn't happen!)
        }else if(this.anyFailedChildren()){
            text += red(`X ${this.name} (failed child test)`);
        // The test was skipped or ignored for some other reason, e.g. a failed
        // sibling test.
        }else if(this.skipped || !this.attempted){
            text += yellow(`- ${this.name} (skipped)`);
        // The test terminated abnormally.
        }else{
            text += red(`X ${this.name} (terminated unexpectedly)`);
        }
        // List one-line error summaries, if any errors were encountered.
        for(let error of this.errors){
            text += red(`\n${prefix}${indent}Error: ${error.message}`);
            text += red(`\n${prefix}${indent}${indent}${error.getLine()}`);
        }
        // List status of child tests.
        for(let child of this.children){
            text += '\n' + child.getSummary(indent, prefix + indent);
        }
        // All done! Return the built string.
        return text;
    }
    // Get a string describing the test status, either "passed", "skipped",
    // or "failed".
    getStatusString(){
        if(this.shouldSkip() || !this.attempted){
            return "skipped";
        }else if(this.success){
            return "passed";
        }else{
            return "failed";
        }
    }
    // Get an object breaking down tests by their termination status.
    // The returned object has passed, failed, and skipped attributes. Each
    // attribute refers to an array of all the tests in this tree that fit
    // the given status.
    // The object also has an errors attribute containing all the
    // CanaryTestError objects recorded by this test and every child test.
    getReport(){
        this.logVerbose(`Generating a report object for test "${this.name}"...`);
        const status = this.getStatusString();
        const passed = status === "passed" ? [this] : [];
        const failed = status === "failed" ? [this] : [];
        const skipped = status === "skipped" ? [this] : [];
        const errors = this.errors.slice();
        for(let child of this.children){
            const results = child.getReport();
            passed.push(...results.passed);
            failed.push(...results.failed);
            skipped.push(...results.skipped);
            errors.push(...results.errors);
        }
        return {
            passed: passed,
            failed: failed,
            skipped: skipped,
            errors: errors,
        };
    }
    // A one-line, one-size-fits-most way to run the test and all child tests,
    // log the results, then terminate the process with an appropriate status
    // code.
    // Optional attributes for the optional options argument:
    // concise: Report only a small amount of information regarding the test
    //   process and its results, and set all tests to run silently.
    // silent: Report no information at all regarding the test process.
    //   When keepAlive is not set, the process exit status code can be used
    //   to see whether the test was successful or not.
    // verbose: Report a great deal of information regarding the test process
    //   and set all tests to run verbosely.
    // keepAlive: Don't terminate the process after running tests and reporting
    //   the results.
    // filter: A filter function to be applied to tests. Only tests which
    //   satisfy the filter function, or that have a direct ancestor or
    //   descendant satisfying the filter function, will be run.
    // names: Run only those tests with a name in this list, or with a direct
    //   ancestor or descendant with such a name.
    // tags: Run only those tests with a tag in this list, or with a direct
    //   ancestor or descendant having such a tag.
    // paths: Run only those tests implemented in a file path that begins with
    //   a string in this list, or with a direct ancestor or descendant having
    //   such a file path. Note that file paths are normalized before comparison.
    async doReport(options = undefined){
        let report = undefined;
        try{
            // Set a default empty options object when none was specified.
            options = options || {};
            function log(...message){
                if(!options.silent){
                    console.log(...message);
                }
            }
            // Indicate that tests are about to be run!
            log(`Running tests via Canary...`);
            // When "concise" is set, instruct tests to run silently.
            if(options.concise){
                this.silent();
            }else if(options.verbose){
                this.verbose();
            }
            // Expand test groups
            this.expandGroups();
            // Construct a list of filter functions. Only run tests which
            // satisfy at least one of these filters, or whose parent satisifies
            // a filter, or parent's parent, etc.
            const filters = [];
            // Heed an explicitly defined filter function
            if(options.filter){
                log("Filtering tests by a provided filter function.");
                filters.push(options.filter);
            }
            // When "names" is set, run tests with a fitting name, or that are
            // a child of a test with such a name.
            if(options.names){
                log(`Filtering tests by name: "${options.names.join(`", "`)}"`),
                filters.push(test => options.names.indexOf(test.name) >= 0);
            }
            // When "tags" is set, run tests with one of the given tags, or
            // that are a descendant of such a test.
            if(options.tags){
                log(`Filtering tests by tags: "${options.tags.join(`", "`)}"`);
                filters.push(test => {
                    for(let tag of options.tags){
                        if(test.tagDictionary[tag]){
                            return true;
                        }
                    }
                    return false;
                });
            }
            // When "paths" is set, run tests that are in any of the provided
            // files or directories.
            if(options.paths){
                const paths = options.paths.map(
                    path => this.normalizePath(path)
                );
                log(`Filtering tests by file paths: "${paths.join(`", "`)}"`);
                filters.push(test => {
                    for(let path of paths){
                        log(test.filePath);
                        if(test.filePath && test.filePath.startsWith(path)){
                            return true;
                        }
                    }
                    return false;
                });
            }
            // Apply filters, if any were provided.
            if(filters && filters.length){
                this.applyFilter(test => {
                    for(let filter of filters){
                        if(filter(test)){
                            return true;
                        }
                    }
                    return false;
                });
            }
            // Actually run tests!
            await this.run();
            // Get a report of which tests passed, were skipped, were aborted, etc.
            this.logVerbose("Getting a report...");
            report = this.getReport();
            // Sum up the total number of tests that were run.
            const totalTests = (
                report.passed.length + report.failed.length + report.skipped.length
            );
            // Log information about test status.
            log(`Finished running ${totalTests} tests.`);
            if(report.errors.length === 1){
                log(red("Encountered 1 error."));
            }else if(report.errors.length){
                log(red(`Encountered ${report.errors.length} errors.`));
            }
            if(!options.concise){
                this.logVerbose("Getting a text summary...");
                log(this.getSummary());
                this.logVerbose("Showing all errors...");
                for(let error of report.errors){
                    const title = error.getLocationTitle();
                    if(title){
                        log(red(`Error at "${title}": ${error.stack}`));
                    }else{
                        log(red(`Error: ${error.stack}`));
                    }
                }
            }
            if(report.passed.length === totalTests){
                log(green(`${totalTests} of ${totalTests} tests passed.`));
            }else{
                log(`${report.passed.length} of ${totalTests} tests ${green("passed")}.`);
            }
            if(report.skipped.length){
                log(`${report.skipped.length} of ${totalTests} tests ${yellow("skipped")}.`);
            }
            if(report.failed.length){
                log(`${report.failed.length} of ${totalTests} tests ${red("failed")}.`);
                log(red("Status: Failed"));
                if(!options.keepAlive){
                    // Since there were any failed tests, exit with a nonzero status code.
                    this.logVerbose("Some tests failed: Exiting with a nonzero status code.");
                    process.exit(1);
                }
            }else{
                log(green("Status: OK"));
                if(!options.keepAlive){
                    // Since there were no failed tests, exit with a zero status code.
                    this.logVerbose("Tests ran without errors: Exiting with a zero status code.");
                    process.exit(0);
                }
            }
        }catch(error){
            // Report an unhandled error and exit with a nonzero status code.
            log(red("Encountered an unhandled error while running tests."));
            log(red(error.stack));
            log(red("Status: Failed"));
            if(!options.keepAlive){
                this.logVerbose("Test runner failed: Exiting with a nonzero status code.");
                process.exit(1);
            }
        }
        return report;
    }
}

CanaryTest.Callback = CanaryTestCallback;
CanaryTest.Error = CanaryTestError;

const canary = new CanaryTest("Canary");
canary.isGroup = true;

canary.Callback = CanaryTestCallback;
canary.Error = CanaryTestError;
canary.Test = CanaryTest;

module.exports = canary;

// canary.group("Test a thing", function(){
//     // this.onBegin("reset the database", canary.resetDatabase);
//     // this.onBegin("register and login", canary.registerAndLogin);
    
//     this.logVerbose("Doing the stuff");
//     this.tags("someTag");
//     this.onBegin("stuff", () => this.logVerbose("begin"));
//     this.onEnd("other stuff", () => this.logVerbose("end"));
//     this.onEachBegin("more stuff", () => this.logVerbose("begin each"));
//     this.onEachEnd("additional stuff", () => this.logVerbose("end each"));
//     this.test("Test another thing", function(){
//         this.logVerbose("first thing");
//     });
//     this.test("Only test if the last thing passed", function(){
//         this.logVerbose("second thing");
//     });
// });

// (async function(){await canary.doReport();})();

// (async function(){
//     await canary.doReport({
//         // verbose: true,
//         paths: ["/Users/pineapple"]
//     });
// })();

// canary.doReport();
