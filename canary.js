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
        // to true when the test was aborted.
        this.aborted = undefined;
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
        // An array of onBegin callbacks.
        this.onBeginCallbacks = [];
        // An array of onEnd callbacks.
        this.onEndCallbacks = [];
        // An array of onSuccess callbacks.
        this.onSuccessCallbacks = [];
        // An array of onFailure callbacks.
        this.onFailureCallbacks = [];
        // An array of onEachBegin callbacks.
        this.onEachBeginCallbacks = [];
        // An array of onEachEnd callbacks.
        this.onEachEndCallbacks = [];
        // An array of onEachSuccess callbacks.
        this.onEachSuccessCallbacks = [];
        // An array of onEachFailure callbacks.
        this.onEachFailureCallbacks = [];
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
    // Mark the test and all its children as "TODO". These tests will not be
    // attempted.
    todo(){
        this.isTodo = true;
        for(let child of this.children){
            child.todo();
        }
    }
    // Mark the test and all its children as ignored. These tests will not be
    // attempted.
    ignore(){
        this.isIgnored = true;
        for(let child of this.children){
            child.ignore();
        }
    }
    // Mark the test and all its children as not-ignored.
    unignore(){
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
    verbose(){
        this.isVerbose = true;
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
    getChildren(){
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
    // Get the number of tests in this tree; i.e. this test, more the number of
    // children, more the number of grandchildren, etc.
    getTestTotal(){
        if(!this.isExpandedGroup){
            this.expandGroups();
        }
        let count = 1;
        for(let child of this.children){
            count += child.getTestTotal(testFilter);
        }
        return count;
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
    // These callbacks are applied to the test which assigned them.
    // These callbacks are invoked when a before running
    // child tests, but after evaluating a test's body. (Normally, the body
    // function is responsible for adding the callback in the first place.)
    // They run after onEachBegin callbacks but before all other callbacks.
    // If any onBegin callback produces an error or otherwise aborts the test,
    // any remaining such callbacks will be ignored.
    onBegin(name, callback){
        return this.addCallback("onBegin", this.onBeginCallbacks, name, callback);
    }
    // Add an onEnd callback.
    // These callbacks are applied to the test which assigned them.
    // These callbacks are invoked after the test is either aborted due to a
    // failure or completed successfully.
    // Applicable onEnd callbacks and onEachEnd callbacks always execute
    // together; first the onEnd callbacks and then the onEachEnd callbacks.
    // They run after all other callbacks.
    // If any onEnd or onEachEnd callback produces an error or otherwise aborts
    // the test, any remaining such callbacks will still be attempted.
    onEnd(name, callback){
        return this.addCallback("onEnd", this.onEndCallbacks, name, callback);
    }
    // Add an onSuccess callback.
    // These callbacks are applied to the test which assigned them.
    // These callbacks are invoked after a test's body, and all of its
    // children are evaluated without producing any errors or otherwise aborting
    // the test.
    // Applicable onSuccess callbacks and onEachSuccess callbacks always
    // execute together; first the onSuccess callbacks and then the
    // onEachSuccess callbacks.
    // They run after onBegin and onEachBegin.
    // They run before onEnd and onEachEnd callbacks. They will also run before
    // onFailure and onEachFailure callbacks in the case that an onSuccess or
    // onEachSuccess callback produces an error or otherwise aborts the test
    // after what would otherwise have been a success.
    // If any onSuccess or onEachSuccess callback produces an error or otherwise
    // aborts the test, any remaining such callbacks will be ignored.
    onSuccess(name, callback){
        return this.addCallback("onSuccess", this.onSuccessCallbacks, name, callback);
    }
    // Add an onFailure callback.
    // These callbacks are applied to the test which assigned them.
    // These callbacks are invoked after a test is aborted. Typically this will
    // be due to an error thrown while running the test, but it may happen
    // because a child test was aborted, or because somewhere this test's
    // abort method was explicitly called.
    // Applicable onFailure callbacks and onEachFailure callbacks always
    // execute together; first the onFailure callbacks and then the
    // onEachFailure callbacks.
    // They run after onBegin and onEachBegin. They will
    // also run after onSuccess and onEachSuccess callbacks in the case that an
    // onSuccess or onEachSuccess callback produces an error or otherwise aborts
    // the test after what would otherwise have been a success.
    // They run before onEnd and onEachEnd callbacks.
    // If any onFailure or onEachFailure callback produces an error or otherwise
    // aborts the test, any remaining such callbacks will still be attempted.
    onFailure(name, callback){
        return this.addCallback("onFailure", this.onFailureCallbacks, name, callback);
    }
    // Add an onEachBegin callback.
    // These callbacks are applied to every immediate child test, but not to
    // the parent test which assigned the onEachBegin callbacks.
    // These callbacks are invoked immediately after initializing each immediate
    // child test, before evaluating their bodies, or other callbacks.
    // They run before all other callbacks.
    // If any onEachBegin callback produces an error or otherwise aborts the
    // test, any remaining such callbacks will be ignored.
    onEachBegin(name, callback){
        return this.addCallback("onEachBegin", this.onEachBeginCallbacks, name, callback);
    }
    // Add an onEachEnd callback.
    // These callbacks are applied to every immediate child test, but not to
    // the parent test which assigned the onEachEnd callbacks.
    // These callbacks are invoked after each immediate child test is either
    // aborted due to a failure or completed successfully.
    // Applicable onEnd callbacks and onEachEnd callbacks always execute
    // together; first the onEnd callbacks and then the onEachEnd callbacks.
    // They run after all other callbacks.
    // If any onEnd or onEachEnd callback produces an error or otherwise aborts
    // the test, any remaining such callbacks will still be attempted.
    onEachEnd(name, callback){
        return this.addCallback("onEachEnd", this.onEachEndCallbacks, name, callback);
    }
    // Add an onEachSuccess callback.
    // These callbacks are applied to every immediate child test, but not to
    // the parent test which assigned the onEachSuccess callbacks.
    // These callbacks are invoked after every immediate child test's body
    // and all of its own children are evaluated without producing any
    // errors or otherwise aborting the child test.
    // Applicable onSuccess callbacks and onEachSuccess callbacks always
    // execute together; first the onSuccess callbacks and then the
    // onEachSuccess callbacks.
    // They run after onBegin and onEachBegin callbacks.
    // They run before onEnd and onEachEnd callbacks. They will also run before
    // onFailure and onEachFailure callbacks in the case that an onSuccess or
    // onEachSuccess callback produces an error or otherwise aborts the test
    // after what would otherwise have been a success.
    // If any onSuccess or onEachSuccess callback produces an error or otherwise
    // aborts the test, any remaining such callbacks will be ignored.
    onEachSuccess(name, callback){
        return this.addCallback("onEachSuccess", this.onEachSuccessCallbacks, name, callback);
    }
    // Add an onEachFailure callback.
    // These callbacks are applied to every immediate child test, but not to
    // the parent test which assigned the onEachFailure callbacks.
    // These callbacks are invoked after a child test is aborted. Typically this
    // will be due to an error thrown while running the test, but it may happen
    // because one if the child's own child tests were aborted, or because
    // somewhere the child test's abort method was explicitly called.
    // Applicable onFailure callbacks and onEachFailure callbacks always
    // execute together; first the onFailure callbacks and then the
    // onEachFailure callbacks.
    // They run after onBegin and onEachBegin callbacks. They will
    // also run after onSuccess and onEachSuccess callbacks in the case that an
    // onSuccess or onEachSuccess callback produces an error or otherwise aborts
    // the test after what would otherwise have been a success.
    // They run before onEnd and onEachEnd callbacks.
    // If any onFailure or onEachFailure callback produces an error or otherwise
    // aborts the test, any remaining such callbacks will still be attempted.
    onEachFailure(name, callback){
        return this.addCallback("onEachFailure", this.onEachFailureCallbacks, name, callback);
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
                this.error(new Error("Callback has no implementation."), callback);
            }
            // When the exitOnError flag is set, check that the test has not
            // entered any kind of error or abort state before going through
            // with the next callback.
            if((this.aborted || this.anyErrors()) && this.exitOnError){
                return;
            }
            // Actually attempt the callback.
            try{
                const result = callback.body.call(callback.owner, ...callbackArguments);
                // If the callback returned a promise, then wait for it to resolve.
                if(result instanceof Promise){
                    await result;
                }
            // Record any errors encountered while handling the callback.
            }catch(error){
                this.error(error, callback);
            }
        }
    }
    // Internal helper method which is run as a test is initialized.
    async initialize(){
        this.logVerbose(`Initializing test "${this.name}...`);
        this.startTime = this.getTime();
        this.endTime = undefined;
        this.attempted = true;
        this.success = undefined;
        this.aborted =  undefined;
        this.errors = [];
    }
    // Report an error. The first argument is the error object that was thrown
    // and the second argument is an optional location indicating where the
    // error was encountered, such as a CanaryTest instance or a
    // CanaryTestCallback instance.
    error(error = undefined, location = undefined){
        if(error){
            this.log(red(`Encountered an error while running test "${this.name}":\n  ${error.message}`));
        }else{
            this.log(red(`Encountered an error while running test "${this.name}".`));
        }
        const testError = new CanaryTestError(this, error, location);
        this.errors.push(testError);
        this.success = false;
        return testError;
    }
    async abort(error = undefined, location = undefined){
        this.logVerbose(`Beginning to abort test "${this.name}".`);
        // If the test was already aborted, then skip all of this.
        // This might happen if, for example, an onFailure, onEachFailure,
        // onEnd, or onEachEnd callback attempts to abort the test.
        if(this.aborted){
            return;
        }
        // Set aborted state.
        this.aborted = true;
        this.success = false;
        // If the function arguments included an error and an optional location,
        // then add this information to the list of encountered errors.
        if(error){
            this.error(error, location);
        }
        // Log a message stating that the test is being aborted.
        this.log(`Aborting test "${this.name}".`);
        // Run onFailure and onEachFailure callbacks.
        await this.doFailureCallbacks();
        // Run onEnd and onEachEnd callbacks.
        await this.doEndCallbacks();
        // All done! Mark the time.
        this.endTime = this.getTime();
    }
    async complete(){
        this.logVerbose(`Beginning to set success state on test "${this.name}".`);
        // Set completion state.
        this.success = true;
        this.aborted = false;
        // Run onSuccess and onEachSuccess callbacks.
        if(this.noErrors()){
            this.doSuccessCallbacks();
        }
        // If there were any errors (probably caused by an onSuccess or
        // onEachSuccess callback if encountered at this point) fail the test.
        if(this.anyErrors()){
            return await this.abort();
        }
        // Otherwise, if everything still looks good, run onEnd and onEachEnd
        // callbacks. Note that if the test was aborted above, these callbacks
        // will instead be run by the abort process.
        await this.doEndCallbacks();
        // Wrapping up! Mark the time.
        this.endTime = this.getTime();
        // Check once again for errors, in this case probably caused by an onEnd
        // or onEachEnd callback, and mark the test as aborted if any was
        // encountered.
        if(this.anyErrors()){
            this.aborted = true;
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
        this.startTime = this.startTime || this.endTime;
    }
    // Invoke onBegin callbacks.
    async doBeginCallbacks(){
        this.logVerbose(`Executing onBegin callbacks for test "${this.name}".`);
        await this.runCallbacks(true, this.onBeginCallbacks);
    }
    // Invoke parent's onEachBegin callbacks.
    async doEachBeginCallbacks(){
        this.logVerbose(`Executing parent's onEachBegin callbacks for test "${this.name}".`);
        await this.runCallbacks(true, this.parent.onEachBeginCallbacks);
    }
    // Invoke onEnd and parent's onEachEnd callbacks.
    async doEndCallbacks(){
        this.logVerbose(`Executing onEnd callbacks for test "${this.name}".`);
        await this.runCallbacks(false, this.onEndCallbacks);
        if(this.parent){
            this.logVerbose(`Executing parent's onEachEnd callbacks for test "${this.name}".`);
            await this.runCallbacks(false, this.parent.onEachEndCallbacks);
        }
    }
    // Invoke onSuccess and parent's onEachSuccess callbacks.
    async doSuccessCallbacks(){
        this.logVerbose(`Executing onSuccess callbacks for test "${this.name}".`);
        await this.runCallbacks(true, this.onSuccessCallbacks);
        if(this.parent && this.noErrors() && !this.aborted){
            this.logVerbose(`Executing parent's onEachSuccess callbacks for test "${this.name}".`);
            await this.runCallbacks(true, this.parent.onEachSuccessCallbacks);
        }
    }
    // Invoke onFailure and parent's onEachFailure callbacks.
    async doFailureCallbacks(){
        this.logVerbose(`Executing onFailure callbacks for test "${this.name}".`);
        await this.runCallbacks(false, this.onFailureCallbacks);
        if(this.parent){
            this.logVerbose(`Executing parent's onEachFailure callbacks for test "${this.name}".`);
            await this.runCallbacks(false, this.parent.onEachFailureCallbacks);
        }
    }
    // Orphan a child test, i.e. remove it from its parent.
    orphan(){
        if(this.parent && this.parent.remove){
            this.parent.remove(this);
            return true;
        }
        this.parent = undefined;
        return false;
    }
    // Remove a child test.
    remove(child){
        this.logVerbose(`Removing child test "${child.name}" from parent test "${this.name}".`);
        const index = this.children.indexOf(child);
        if(index >= 0){
            this.children.splice(index, 1);
            return true;
        }
        return false;
    }
    // Add a Test instance as a child of this one.
    add(child){
        this.logVerbose(`Adding a child test "${child.name}" to parent "${this.name}".`);
        if(!this.isGroup){
            throw new Error("Tests can only be added as children to test groups.");
        }
        if(child.parent){
            child.orphan();
        }
        child.parent = this;
        child.isTodo = child.isTodo || this.isTodo;
        child.isIgnored = child.isIgnored || this.isIgnored;
        child.isSilent = child.isSilent || this.isSilent;
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
        this.add(test);
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
            this.error(error, this);
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
    // Run the test!
    async run(){
        try{
            this.logVerbose(`Beginning to run test "${this.name}".`);
            // Check if the test is supposed to be skipped, or if it has already
            // been marked as aborted.
            if(this.aborted){
                return this.logVerbose("The test was already marked as aborted.");
            }
            if(this.shouldSkip()){
                this.logVerbose("The test was marked to be skipped.");
                return this.skip();
            }
            // Prepare to run the test.
            await this.initialize();
            // Handle parent's onEachBegin callbacks
            if(this.parent){
                await this.doEachBeginCallbacks();
            }
            if(this.aborted || this.anyErrors()){
                this.logVerbose(
                    "Aborting due to errors found after executing the " +
                    "parent's onEachBegin callbacks."
                );
                return await this.abort();
            }
            // If the test has a body function, then evaluate it.
            if(this.body && !this.isExpandedGroup){
                // Run the body callback.
                this.bodyReturnedValue = this.body(this);
                // The body function may have explicitly aborted the test or
                // added errors.
                if(this.aborted || this.anyErrors()){
                    this.logVerbose(
                        "Aborting due to errors found after evaluating " +
                        "the test's body function."
                    );
                    return await this.abort();
                }
                // Handle the case where the function returned a promise
                if(this.bodyReturnedValue instanceof Promise){
                    // Wait for the promise to resolve
                    this.bodyReturnedValueResolved = await this.bodyReturnedValue;
                    // The promise may have explicitly aborted the test
                    if(this.aborted || this.anyErrors()){
                        this.logVerbose(
                            "Aborting due to errors found after waiting " +
                            "for the promise returned by the test's body " +
                            "function to resolve."
                        );
                        return await this.abort();
                    }
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
            // Handle onBegin callbacks
            if(this.noErrors() && !this.aborted){
                await this.doBeginCallbacks();
            }
            if(this.aborted || this.anyErrors()){
                this.logVerbose(
                    "Aborting due to errors found after executing onBegin " +
                    "callbacks."
                );
                return await this.abort();
            }
            // Run child tests, if any.
            if(this.children && this.children.length){
                // Run the child tests in order, from first to last, waiting
                // for each test to complete before attempting the next.
                for(let child of this.children){
                    // Run the child test.
                    try{
                        await child.run();
                    }catch(error){
                        this.logVerbose(
                            `Aborting due to errors encountered while running ` +
                            `the child test "${child.name}".`
                        );
                        return await this.abort(error, child);
                    }
                    // Abort if the child test was aborted.
                    if(child.aborted && !child.shouldSkip()){
                        this.logVerbose(
                            `Aborting because the child test "${child.name}" ` +
                            `was aborted`
                        );
                        return await this.abort();
                    // The child may have explicitly aborted the parent test
                    // without having been itself aborted.
                    }else if(this.aborted || this.anyErrors()){
                        this.logVerbose(
                            `Aborting due to errors found after running the ` +
                            `child test "${child.name}".`
                        );
                        return await this.abort();
                    }
                }
            }
            // Mark the test as complete and run onSuccess and onEnd callbacks
            return await this.complete();
        }catch(error){
            // Mark the test as failed and run onFailure and onEnd callbacks
            this.logVerbose(
                "Aborting due to an unhandled error encountered while running the test."
            );
            try{
                return await this.abort(error, this);
            }catch(abortError){
                try{
                    this.error(abortError, this);
                    this.success = false;
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
        // The test was aborted for some other reason, e.g. a failed child test.
        }else if(this.aborted){
            text += red(`X ${this.name} (aborted)`);
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
            // Indicate that tests are about to be run!
            console.log(`Running tests via Canary...`);
            // When "concise" is set, instruct tests to run silently.
            if(options.concise){
                this.silent();
            }else if(options.verbose){
                this.verbose();
            }
            // Expand groups so that filters can be accurately applied.
            this.expandGroups();
            // Construct a list of filter functions. Only run tests which
            // satisfy at least one of these filters, or whose parent satisifies
            // a filter, or parent's parent, etc.
            const filters = [];
            // Heed an explicitly defined filter function
            if(options.filter){
                console.log("Filtering tests by a provided filter function.");
                filters.push(options.filter);
            }
            // When "names" is set, run tests with a fitting name, or that are
            // a child of a test with such a name.
            if(options.names){
                console.log(`Filtering tests by name: "${options.names.join(`", "`)}"`),
                filters.push(test => options.names.indexOf(test.name) >= 0);
            }
            // When "tags" is set, run tests with one of the given tags, or
            // that are a descendant of such a test.
            if(options.tags){
                console.log(`Filtering tests by tags: "${options.tags.join(`", "`)}"`);
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
                console.log(`Filtering tests by file paths: "${paths.join(`", "`)}"`);
                filters.push(test => {
                    for(let path of paths){
                        console.log(test.filePath);
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
            console.log(`Finished running ${totalTests} tests.`);
            if(report.errors.length === 1){
                console.log(red("Encountered 1 error."));
            }else if(report.errors.length){
                console.log(red(`Encountered ${report.errors.length} errors.`));
            }
            if(!options.concise){
                this.logVerbose("Getting a text summary...");
                console.log(this.getSummary());
                this.logVerbose("Showing all errors...");
                for(let error of report.errors){
                    const title = error.getLocationTitle();
                    if(title){
                        console.log(red(`Error at "${title}": ${error.stack}`));
                    }else{
                        console.log(red(`Error: ${error.stack}`));
                    }
                }
            }
            if(report.passed.length === totalTests){
                console.log(green(`${totalTests} of ${totalTests} tests passed.`));
            }else{
                console.log(`${report.passed.length} of ${totalTests} tests ${green("passed")}.`);
            }
            if(report.skipped.length){
                console.log(`${report.skipped.length} of ${totalTests} tests ${yellow("skipped")}.`);
            }
            if(report.failed.length){
                console.log(`${report.failed.length} of ${totalTests} tests ${red("failed")}.`);
                console.log(red("Status: Failed"));
                if(!options.keepAlive){
                    // Since there were any failed tests, exit with a nonzero status code.
                    this.logVerbose("Some tests failed: Exiting with a nonzero status code.");
                    process.exit(1);
                }
            }else{
                console.log(green("Status: OK"));
                if(!options.keepAlive){
                    // Since there were no failed tests, exit with a zero status code.
                    this.logVerbose("Tests ran without errors: Exiting with a zero status code.");
                    process.exit(0);
                }
            }
        }catch(error){
            // Report an unhandled error and exit with a nonzero status code.
            console.log(red("Encountered an unhandled error while running tests."));
            console.log(red(error.stack));
            console.log(red("Status: Failed"));
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