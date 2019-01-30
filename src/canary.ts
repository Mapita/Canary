import {red, green, yellow} from "./util";
import {getTime, getOrdinal, isFiniteNumber} from "./util";
import {getCallerLocation, normalizePath} from "./util";

// Function types accepted for a test callback body.
export type CanaryTestCallbackBody = (
    ((this: CanaryTest, test: CanaryTest) => void) |
    ((this: CanaryTest, test: CanaryTest) => Promise<any>)
);

// Enumeration of valid test callback types.
export enum CanaryTestCallbackType {
    onBegin = "onBegin",
    onEnd = "onEnd",
    onEachBegin = "onEachBegin",
    onEachEnd = "onEachEnd",
}

export class CanaryTestCallback{
    type: CanaryTestCallbackType;
    owner: CanaryTest;
    name: string;
    body: CanaryTestCallbackBody;
    
    constructor(
        type: CanaryTestCallbackType, owner: CanaryTest,
        name: string, body: CanaryTestCallbackBody
    ){
        this.type = type;
        this.owner = owner;
        this.name = name;
        this.body = body;
    }
    
    // Get the test object to which this callback belongs.
    getOwner(): CanaryTest {
        return this.owner;
    }
    // Get a name for this callback.
    getName(): string {
        return `${this.owner.getName()} => ${this.type} (${this.name})`;
    }
    // Get an identifying title for this callback.
    getTitle(): string {
        return `${this.owner.getTitle()} => ${this.type} (${this.name})`;
    }
}

export namespace CanaryTestCallback {
    export type Body = CanaryTestCallbackBody;
    export type Type = CanaryTestCallbackType;
}

export type CanaryTestErrorLocation = CanaryTest | CanaryTestCallback;

export class CanaryTestError{
    test: CanaryTest;
    error: Error; // TODO: Should this be any?
    location: CanaryTestErrorLocation;
    
    constructor(
        test: CanaryTest, error: Error, location: CanaryTestErrorLocation
    ){
        this.test = test;
        this.error = error;
        this.location = location;
    }
    // Access the error object's stack trace.
    // Returns an empty string if no stack trace was available.
    get stack(): string {
        return (this.error && this.error.stack) || "";
    }
    // Access the error object's message string.
    // Returns an empty string if no message string was available.
    get message(): string {
        return (this.error && this.error.message) || "";
    }
    // Access the error object's name string.
    // Returns an empty string if no error name was available.
    get name(): string {
        return (this.error && this.error.name) || "";
    }
    // Get the original Error instance that was recorded.
    getError(): Error {
        return this.error;
    }
    // Get the location, such as a test or test callback, where this
    // error took place.
    getLocation(): CanaryTestErrorLocation {
        return this.location;
    }
    // Get a short yet identifying name for the test or callback where
    // this error was encountered, or an empty string if the location is unknown.
    getLocationName(): string {
        if(this.location && typeof(this.location.getName) === "function"){
            return this.location.getName();
        }else{
            return "";
        }
    }
    // Get a fully identifying title for the test or callback where
    // this error was encountered, or an empty string if unknown.
    getLocationTitle(){
        if(this.location && this.location.getTitle){
            return this.location.getTitle();
        }else{
            return "";
        }
    }
    // Get the line where this error occurred.
    getLine(): string {
        if(this.error && this.error.stack){
            let messageLineCount = (!this.error.message ? 1 :
                this.error.message.split("\n").length
            );
            return this.error.stack.split("\n")[messageLineCount].trim();
        }else{
            return "";
        }
    }
}

export namespace CanaryTestError {
    export type Location = CanaryTestErrorLocation;
}

// Function types accepted for a CanaryTest body function.
export type CanaryTestBody = (
    ((this: CanaryTest, test: CanaryTest) => void) |
    ((this: CanaryTest, test: CanaryTest) => Promise<any>)
);

// Acceptable signature for CanaryTest filter functions.
export type CanaryTestFilter = (test: CanaryTest) => any;

// Object returned by CanaryTest.getReport and CanaryTest.doReport.
export interface CanaryTestReport {
    unhandledError: null | Error;
    passed: CanaryTest[];
    failed: CanaryTest[];
    skipped: CanaryTest[];
    errors: CanaryTestError[];
}

// Options object accepted by the CanaryTest.doReport method.
export interface CanaryTestReportOptions {
    // Report only a small amount of information regarding the test
    // process and its results, and set all tests to run silently.
    concise?: boolean;
    // Report no information at all regarding the test process.
    // When keepAlive is not set, the process exit status code can be used
    // to see whether the test was successful or not.
    silent?: boolean;
    // Report a great deal of information regarding the test process
    // and set all tests to run verbosely.
    verbose?: boolean;
    // Don't terminate the process after running tests and reporting
    // the results.
    keepAlive?: boolean;
    // A filter function to be applied to tests. Only tests which
    // satisfy the filter function, or that have a direct ancestor or
    // descendant satisfying the filter function, will be run.
    filter?: CanaryTestFilter;
    // Run only those tests with a name in this list, or with a direct
    // ancestor or descendant with such a name.
    names?: string[];
    // Run only those tests with a tag in this list, or with a direct
    // ancestor or descendant having such a tag.
    tags?: string[];
    // Run only those tests implemented in a file path matching
    // a string in this list, or with a direct ancestor or descendant having
    // such a file path.
    // Note that file paths are case-sensitive and normalized before comparison.
    paths?: string[];
}

export class CanaryTest{
    // Keep track of the test group currently being expanded.
    // Used to output warning messages if something looks unusual.
    static currentlyExpandingGroup: null | CanaryTest = null;
    
    // The name of the test.
    name: string = "";
    // A body function for the test. It is run as part of test initialization,
    // or it may simply contain the test's normal code.
    body: CanaryTestBody;
    // This flag is set to true when the test is initialized (meaning it is
    // about to be attempted). Skipped tests will not have this flag changed
    // from false.
    attempted: boolean = false;
    // This flag is set to true when part or all of the test was skipped,
    // e.g. because its todo flag or ignore flag was set.
    skipped: boolean = false;
    // This flag is set to true when the test was completed successfully and
    // to false when the test was aborted.
    success: null | boolean = null;
    // This flag is set to false when the test was completed successfully and
    // to true when the test was aborted prematurely due to an error.
    aborted: null | boolean = null;
    // This flag is set to false when the test was completed successfully and
    // to true when the test was found to have failed for any reason.
    failed: null | boolean = null;
    // This flag is set when the test was skipped due to an unmet filter.
    filtered: boolean = false;
    // This flag can be set using the "todo" method. It indicates that the
    // test should be skipped and marked as TODO in any log output.
    isTodo: boolean = false;
    // This flag can be set using the "ignore" method. It indicates that
    // the test should be skipped and marked as ignored in any log output.
    isIgnored: boolean = false;
    // This flag can be set using the "verbose" method. It causes tests to
    // log an exceptional amount of information.
    isVerbose: boolean = false;
    // This flag can be set using the "silent" method. It causes tests to
    // run silently, not outputting any information to logs.
    isSilent: boolean = false;
    // This flag indicates whether this is a test group. Test groups do not
    // have any test code running immediately in their body, but instead
    // should only add child tests.
    isGroup: boolean = false;
    // This flag indicates whether this is a test series. (Which is a
    // special of test groups as far as the implementation is concerned.)
    // A test series aborts at the first failure of a child test.
    isSeries: boolean = false;
    // This flag is set after a test group was expanded; i.e. its body
    // function was evaluated.
    isExpandedGroup: boolean = false;
    // The time at which the test was initialized.
    startTime: null | number = null;
    // The time at which the test was totally concluded, whether due to
    // success or failure.
    endTime: null | number = null;
    // The time at which a test group was expanded.
    expandTime: null | number = null;
    // When the test has concluded, this array will contain every error that
    // was encountered over the course of attempting the test, represented
    // as a CanaryTestError instance.
    errors: CanaryTestError[] = [];
    // This attribute records the return value of the "body" function.
    bodyReturnedValue: any = undefined;
    // When the "body" function returns a promise, this attribute records
    // whatever value that promised resolved with.
    bodyReturnedValueResolved: any = undefined;
    // The parent test, or the CanaryTest instance to which this instance was
    // added. Running a parent test implies running all of its child tests.
    parent: null | CanaryTest = null;
    // An array of child tests which have been added to this one.
    children: CanaryTest[] = [];
    // Will contain references to failed child tests.
    failedChildren: CanaryTest[] = [];
    // An array of onBegin callbacks.
    onBeginCallbacks: CanaryTestCallback[] = [];
    // An array of onEnd callbacks.
    onEndCallbacks: CanaryTestCallback[] = [];
    // An array of onEachBegin callbacks.
    onEachBeginCallbacks: CanaryTestCallback[] = [];
    // An array of onEachEnd callbacks.
    onEachEndCallbacks: CanaryTestCallback[] = [];
    // A dictionary of tags assigned to this test in particular.
    tagDictionary: {[key: string]: boolean} = {};
    // Logging function determining what should happen to logged messages
    logFunction: Function = console.log;
    // The location where this test was defined. Blank string if unknown.
    location: string = "";
    // The file path taken from the location.
    filePath: null | string = null;
    // The line number taken from the location.
    lineInFile: null | number = null;
    // The column number taken from the location.
    columnInLine: null | number = null;
    
    // Test object constructor. Accepts an identifying name and an optional
    // body function.
    constructor(name: string, body?: CanaryTestBody) {
        this.name = name;
        this.body = body || ((test: CanaryTest) => {});
        const location = getCallerLocation();
        if(location){
            const locationParts = location.split(":");
            this.filePath = normalizePath(locationParts[0]);
            this.lineInFile = parseInt(locationParts[1]);
            this.columnInLine = parseInt(locationParts[2]);
        }else{
            this.filePath = null;
            this.lineInFile = null;
            this.columnInLine = null;
        }
    }
    
    // Convenience function to create a test group.
    static Group(name: string, body?: CanaryTestBody): CanaryTest {
        const group = new CanaryTest(name, body);
        group.isGroup = true;
        return group;
    }
    // Convenience function to create a test series.
    static Series(name: string, body?: CanaryTestBody): CanaryTest {
        const series = new CanaryTest(name, body);
        series.isGroup = true;
        series.isSeries = true;
        return series;
    }
    
    // Reset the state of the test and all child tests so that it's safe to
    // run it again.
    reset(): void {
        this.logVerbose(`Resetting test "${this.name}".`);
        this.attempted = false;
        this.skipped = false;
        this.success = null;
        this.aborted = null;
        this.failed = null;
        this.startTime = null;
        this.endTime = null;
        this.errors = [];
        this.failedChildren = [];
        for(const child of this.children){
            child.reset();
        }
    }
    // Mark the test and all its children as "TODO". These tests will not be
    // attempted.
    todo(): void {
        this.logVerbose(`Marking test "${this.name}" as todo.`);
        this.isTodo = true;
        for(const child of this.children){
            child.todo();
        }
    }
    // Remove "TODO" from this test and all children.
    removeTodo(): void {
        this.logVerbose(`Removing todo status from test "${this.name}".`);
        this.isTodo = false;
        for(const child of this.children){
            child.removeTodo();
        }
    }
    // Mark the test and all its children as ignored. These tests will not be
    // attempted.
    ignore(): void {
        this.logVerbose(`Marking test "${this.name}" as ignored.`);
        this.isIgnored = true;
        for(const child of this.children){
            child.ignore();
        }
    }
    // Mark the test and all its children as not-ignored.
    unignore(): void {
        this.logVerbose(`Marking test "${this.name}" as unignored.`);
        this.isIgnored = false;
        for(const child of this.children){
            child.unignore();
        }
    }
    // Mark the test and all its children as silent. They will not output
    // any log information anywhere.
    silent(): void {
        this.isSilent = true;
        for(const child of this.children){
            child.silent();
        }
    }
    // Mark the test and all its children as not silent.
    notSilent(): void {
        this.isSilent = false;
        for(const child of this.children){
            child.notSilent();
        }
    }
    // Mark the test and all its children as verbose. They will log a lot of
    // information about the test process.
    // It also un-silences silenced tests.
    verbose(): void {
        this.isVerbose = true;
        this.isSilent = false;
        for(const child of this.children){
            child.verbose();
        }
    }
    // Mark the test and all its children as not silent.
    notVerbose(): void {
        this.isVerbose = false;
        for(const child of this.children){
            child.notVerbose();
        }
    }
    // Assign some tags to this test, which will be inherited by its children
    // and grandchildren and etc.
    tags(...tags: string[]): void {
        for(const tag of tags){
            this.tagDictionary[String(tag)] = true;
        }
    }
    // Get the parent test.
    getParent(): (null | CanaryTest) {
        return this.parent;
    }
    // Get a list of child tests.
    // If the group has not been expanded already, it will be expanded now.
    getChildren(): CanaryTest[] {
        if(this.isGroup && !this.isExpandedGroup){
            this.expandGroups();
        }
        return this.children;
    }
    // Get this test's tags as a list of strings.
    getTags(): string[] {
        const tagList = [];
        for(const tag in this.tagDictionary){
            tagList.push(tag);
        }
        return tagList;
    }
    // Get whether this test has a certain tag.
    hasTag(tag: string): boolean {
        return !!(tag in this.tagDictionary);
    }
    // Get whether this test should be skipped, e.g. if its todo or ignore
    // flag has been set.
    shouldSkip(): boolean {
        return this.isTodo || this.isIgnored || this.filtered;
    }
    // Get a string identifying this test in particular.
    getTitle(): string {
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
    getName(): string {
        return this.name;
    }
    // Get the current log function. It's `console.log` by default.
    getLogFunction(): Function {
        return this.logFunction;
    }
    // Set the log function for this test and all of its children.
    setLogFunction(logFunction: Function): void {
        this.logFunction = logFunction;
        for(const child of this.children){
            child.setLogFunction(logFunction);
        }
    }
    // Log a message. (Except if the test was marked as silent.)
    log(message: string): void {
        if(!this.isSilent){
            return this.logFunction(message);
        }
    }
    // Log a verbose message - only if the test is verbose and not silent.
    logVerbose(message: string): void {
        if(this.isVerbose && !this.isSilent){
            return this.logFunction(message);
        }
    }
    // Get how long the test took to run, in seconds
    // Returns 0 if the test hasn't run yet.
    getDurationSeconds(): number {
        if(!isFiniteNumber(this.startTime) || !isFiniteNumber(this.endTime)){
            return 0;
        }else{
            return 0.001 * (<number> this.endTime - <number> this.startTime);
        }
    }
    // Get how long the test took to run, in milliseconds
    // Returns 0 if the test hasn't run yet.
    getDurationMilliseconds(): number {
        if(!isFiniteNumber(this.startTime) || !isFiniteNumber(this.endTime)){
            return 0;
        }else{
            return <number> this.endTime - <number> this.startTime;
        }
    }
    // True when at least one error has been encountered so far in attempting
    // to run the test.
    anyErrors(): boolean {
        return !!(this.errors && this.errors.length);
    }
    // True when the test has encountered no errors so far.
    noErrors(): boolean {
        return !this.errors || !this.errors.length;
    }
    // Get a list of errors that have been encountered so far while attempting
    // to run this test.
    getErrors(): CanaryTestError[] {
        return this.errors;
    }
    // True when any child tests in a group have failed.
    anyFailedChildren(): boolean {
        return !!(this.failedChildren && this.failedChildren.length);
    }
    // True when no child tests in a group have failed.
    noFailedChildren(): boolean {
        return !this.failedChildren || !this.failedChildren.length;
    }
    // Get a list of failed child tests.
    getFailedChildren(): CanaryTest[] {
        return this.failedChildren;
    }
    
    // Generalized helper method for implementing onBegin, onEnd, etc. methods.
    addCallback(
        type: CanaryTestCallbackType, callbackList: CanaryTestCallback[],
        name: string, callback: CanaryTestCallbackBody
    ): CanaryTestCallback {
        this.logVerbose(`Adding "${type}" callback to test "${this.name}"...`);
        if(!this.isGroup){
            throw new Error("Callbacks can only be added to test groups.");
        }
        // If the input name string was empty, then assign one.
        const useName: string = name || (
            `${getOrdinal(callbackList.length + 1)} ${type} callback`
        );
        // Create a CanaryTestCallback instance and add it to the correct list.
        const testCallback = new CanaryTestCallback(type, this, useName, callback);
        callbackList.push(testCallback);
        // All done! Return the produced CanaryTestCallback instance.
        this.logVerbose(
            `Added "${type}" callback named "${useName}" to test "${this.name}".`
        );
        return testCallback;
    }
    
    // Add an onBegin callback. Let the implementation assign a name.
    onBegin(callback: CanaryTestCallbackBody): CanaryTestCallback;
    // Add an onBegin callback. Assign an identifying name explicitly.
    onBegin(name: string, callback: CanaryTestCallbackBody): CanaryTestCallback;
    // Implementation to actually add an onBegin callback.
    onBegin(
        x: string | CanaryTestCallbackBody, y?: CanaryTestCallbackBody
    ): CanaryTestCallback {
        return this.addCallback(
            CanaryTestCallbackType.onBegin, this.onBeginCallbacks,
            typeof(x) === "string" ? x : "", <CanaryTestCallbackBody> y || x
        );
    }
    // Add an onEnd callback. Let the implementation assign a name.
    onEnd(callback: CanaryTestCallbackBody): CanaryTestCallback;
    // Add an onEnd callback. Assign an identifying name explicitly.
    onEnd(name: string, callback: CanaryTestCallbackBody): CanaryTestCallback;
    // Implementation to actually add an onEnd callback.
    onEnd(
        x: string | CanaryTestCallbackBody, y?: CanaryTestCallbackBody
    ): CanaryTestCallback {
        return this.addCallback(
            CanaryTestCallbackType.onEnd, this.onEndCallbacks,
            typeof(x) === "string" ? x : "", <CanaryTestCallbackBody> y || x
        );
    }
    // Add an onEachBegin callback. Let the implementation assign a name.
    onEachBegin(callback: CanaryTestCallbackBody): CanaryTestCallback;
    // Add an onEachBegin callback. Assign an identifying name explicitly.
    onEachBegin(name: string, callback: CanaryTestCallbackBody): CanaryTestCallback;
    // Implementation to actually add an onEachBegin callback.
    onEachBegin(
        x: string | CanaryTestCallbackBody, y?: CanaryTestCallbackBody
    ): CanaryTestCallback {
        return this.addCallback(
            CanaryTestCallbackType.onEachBegin, this.onEachBeginCallbacks,
            typeof(x) === "string" ? x : "", <CanaryTestCallbackBody> y || x
        );
    }
    // Add an onEachEnd callback. Let the implementation assign a name.
    onEachEnd(callback: CanaryTestCallbackBody): CanaryTestCallback;
    // Add an onEachEnd callback. Assign an identifying name explicitly.
    onEachEnd(name: string, callback: CanaryTestCallbackBody): CanaryTestCallback;
    // Implementation to actually add an onEachEnd callback.
    onEachEnd(
        x: string | CanaryTestCallbackBody, y?: CanaryTestCallbackBody
    ): CanaryTestCallback {
        return this.addCallback(
            CanaryTestCallbackType.onEachEnd, this.onEachEndCallbacks,
            typeof(x) === "string" ? x : "", <CanaryTestCallbackBody> y || x
        );
    }
    
    // Internal helper method to run a list of callbacks.
    async runCallbacks(
        exitOnError: boolean, callbackList: CanaryTestCallback[]
    ): Promise<void> {
        // Bail out if no callback list was actually provided.
        if(!callbackList){
            return;
        }
        // Enumerate and invoke callbacks in order.
        for(const callback of callbackList){
            // Record an error when the callback is missing an implementation.
            if(!callback.body){
                this.addError(new Error("Callback has no implementation."), callback);
            }
            // When the exitOnError flag is set, check that the test has not
            // entered any kind of error or abort state before going through
            // with the next callback.
            if((this.aborted || this.failed || this.anyErrors()) && exitOnError){
                return;
            }
            // Actually attempt the callback.
            try{
                const result: any = callback.body.call(this, this);
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
    async initialize(): Promise<void> {
        this.logVerbose(`Initializing test "${this.name}...`);
        this.startTime = getTime();
        this.attempted = true;
    }
    // Report an error. The first argument is the error object that was thrown
    // and the second argument is an optional location indicating where the
    // error was encountered, such as a CanaryTest instance or a
    // CanaryTestCallback instance.
    // If no location was given explicitly, then the test instance is used as
    // the location.
    addError(error: Error, location?: CanaryTestErrorLocation): CanaryTestError {
        if(error){
            this.log(red(`Encountered an error while running test "${this.name}":\n  ${error.message}`));
        }else{
            this.log(red(`Encountered an error while running test "${this.name}".`));
        }
        const testError = new CanaryTestError(this, error, location || this);
        this.errors.push(testError);
        return testError;
    }
    
    // A failed test is one that was completed, but somehow ended up in an
    // error state anyway. One example is a test group with failing child tests
    // but with no issues with the test group itself.
    async fail(): Promise<void>;
    // Fail the test, and provide an error which is triggering the failure.
    async fail(error: Error, location: CanaryTestErrorLocation): Promise<void>;
    // Implementation for `fail` method.
    async fail(error?: Error, location?: CanaryTestErrorLocation): Promise<void> {
        this.logVerbose(`Beginning to fail test "${this.name}"...`);
        // If the test was already failed, then skip all of this.
        // This might happen if, for example, an onEnd, or onEachEnd callback
        // attempts to abort the test.
        if(this.failed){
            this.logVerbose("Ignoring because the test already failed.");
            return;
        }
        // Set failure state.
        this.failed = true;
        this.success = false;
        // If the function arguments included an error and an optional location,
        // then add this information to the list of encountered errors.
        if(error && location){
            this.addError(error, location);
        }
        // Log a message stating that the test is being aborted.
        this.log(`Failing test "${this.name}".`);
        // Run onEnd and onEachEnd callbacks.
        await this.doEndCallbacks();
        // All done! Mark the time.
        this.endTime = getTime();
    }
    
    async abort(): Promise<void>;
    async abort(error: Error, location: CanaryTestErrorLocation): Promise<void>;
    async abort(error?: Error, location?: CanaryTestErrorLocation): Promise<void> {
        this.logVerbose(`Beginning to abort test "${this.name}"...`);
        if(!this.failed){
            this.aborted = true;
            if(error && location){
                return await this.fail(error, location);
            }else{
                return await this.fail();
            }
        }
    }
    
    async exitTestGroup(childTest: CanaryTest): Promise<void> {
        this.logVerbose(`Beginning to exit test group "${this.name}" due to a failed child test.`);
        if(!this.failed){
            this.failedChildren.push(childTest);
            return await this.abort();
        }
    }
    async complete(): Promise<void> {
        this.logVerbose(`Beginning to set success state on test "${this.name}".`);
        // Set completion state.
        this.success = true;
        this.failed = false;
        this.aborted = false;
        // Run onEnd and onEachEnd callbacks.
        await this.doEndCallbacks();
        // Wrapping up! Mark the time.
        this.endTime = getTime();
        // Check once again for errors, in this case probably caused by an onEnd
        // or onEachEnd callback, and mark the test as failed if any was
        // encountered.
        if(this.anyErrors()){
            this.failed = true;
            this.success = false;
        // If no errors were encountered during this completion process, log a
        // message explaining that the test was completed.
        }else{
            const duration = this.getDurationSeconds().toFixed(3);
            if(this.isGroup){
                this.log(`Completed test group "${this.getTitle()}". (${duration}s)`);
            }else{
                this.log(`Completed test "${this.getTitle()}". (${duration}s)`);
            }
        }
    }
    // To be run when the test was skipped.
    skip(): void {
        this.logVerbose(`Skipping test "${this.name}".`);
        this.skipped = true;
        this.endTime = getTime();
    }
    // Invoke onBegin callbacks.
    async doBeginCallbacks(): Promise<void> {
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
    async doEndCallbacks(): Promise<void> {
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
    // Returns true if the removal was successful.
    // Returns false if the test did not have a parent.
    orphan(): boolean {
        if(!this.parent){
            return false;
        }
        this.logVerbose(
            `Orphaning test "${this.name}" from its parent ` +
            `"${this.parent.name}".`
        );
        if(typeof(this.parent.removeTest) === "function"){
            return this.parent.removeTest(this);
        }
        this.parent = null;
        return false;
    }
    // Remove a child test.
    // Returns true if the removal was successful.
    // Returns false if the input test was not actually a child of this one.
    removeTest(child: CanaryTest): boolean {
        this.logVerbose(
            `Removing child test "${child.name}" from parent test ` +
            `"${this.name}".`
        );
        const index = this.children.indexOf(child);
        if(index >= 0){
            this.children[index].parent = null;
            this.children.splice(index, 1);
            return true;
        }else{
            for(const searchChild of this.children){
                if(searchChild.removeTest(child)){
                    return true;
                }
            }
        }
        return false;
    }
    // Remove all child tests.
    removeAllTests(): void {
        this.logVerbose(`Removing all child tests from "${this.name}".`);
        for(const child of this.children){
            child.parent = null;
        }
        this.children = [];
    }
    // Add a Test instance as a child of this one.
    addTest(child: CanaryTest): void {
        this.logVerbose(
            `Adding test "${child.name}" as a child of parent "${this.name}".`
        );
        if(child.parent === this){
            return;
        }
        if(!this.isGroup){
            throw new Error("Tests can only be added as children to test groups.");
        }
        if(child.parent){
            child.orphan();
        }
        child.parent = this;
        this.children.push(child);
    }
    
    // Create a Test instance with the given body, then add it as a
    // child of this test. A name is automatically assigned.
    test(body: CanaryTestBody): CanaryTest;
    // Create a Test instance with the given body, then add it as a
    // child of this test. A name for the test is explicitly provided.
    test(name: string, body: CanaryTestBody): CanaryTest;
    // Implementation for `test` method.
    test(x: string | CanaryTestBody, y?: CanaryTestBody): CanaryTest {
        const body: CanaryTestBody = <CanaryTestBody> y || x;
        const name: string = (typeof(x) === "string" ? x :
            `${getOrdinal(this.children.length + 1)} child test`
        );
        // Instantiate the CanaryTest object.
        const test = new CanaryTest(name, body);
        // Add it as a child of this test.
        this.addTest(test);
        // Set some properties of the child test to match properties of this test.
        test.isTodo = this.isTodo;
        test.isIgnored = this.isIgnored;
        test.isSilent = this.isSilent;
        test.isVerbose = this.isVerbose;
        test.logFunction = this.logFunction;
        // Log a warning for a very possible mistake.
        const currentGroup = CanaryTest.currentlyExpandingGroup;
        if(currentGroup && currentGroup !== this){
            this.log(yellow(
                `Warning: Adding test "${name}" to a group other than ` +
                `"${currentGroup.getTitle()}" even though the operation is ` +
                `taking place in that group's body function. This is ` +
                `probably unintended!`
            ));
        }
        // All done! Return the produced CanaryTest instance.
        return test;
    }
    
    // Create a CanaryTest instance that is marked as a test group.
    // Test groups should not have any test code that runs immediately in their
    // body functions; instead they should rely only on adding callbacks and
    // child tests. Their body functions should also be synchronous.
    group(name: string, body: CanaryTestBody): CanaryTest {
        const testGroup = this.test(name, body);
        testGroup.isGroup = true;
        return testGroup;
    }
    
    // Create a CanaryTest instance that is marked as a test series.
    // Test groups should not have any test code that runs immediately in their
    // body functions; instead they should rely only on adding callbacks and
    // child tests. Their body functions should also be synchronous.
    series(name: string, body: CanaryTestBody): CanaryTest {
        const testSeries = this.group(name, body);
        testSeries.isSeries = true;
        return testSeries;
    }
    
    // Evaluate all tests marked as groups to create a workably complete tree
    // structure of tests. This should only be a necessary step when attempting
    // to filter tests, and even then not in all cases.
    expandGroups(): void {
        this.logVerbose(`Expanding test groups belonging to test "${this.name}"...`);
        try{
            if(this.isGroup && !this.isExpandedGroup && this.body){
                this.expandTime = getTime();
                this.isExpandedGroup = true;
                // Expand the group by evaluating the body function, and record
                // whose body function this is in while doing so.
                const previousExpandingGroup = CanaryTest.currentlyExpandingGroup;
                CanaryTest.currentlyExpandingGroup = this;
                if(this.body){
                    this.bodyReturnedValue = this.body(this);
                }
                CanaryTest.currentlyExpandingGroup = previousExpandingGroup;
                this.logVerbose(
                    `Test group "${this.name}" has ${this.children.length} ` +
                    `child tests after expansion.`
                );
            }
            for(const child of this.children){
                child.expandGroups();
            }
        }catch(error){
            this.addError(error, this);
            this.attempted = true;
            this.aborted = true;
            this.startTime = getTime();
            this.endTime = this.startTime;
        }
    }
    // Apply a filter function. This means marking tests that did not satisfy
    // the filter, and where none of their direct ancestors or descendents
    // satisfied the filter, so that they will be skipped instead of run.
    applyFilter(filter: CanaryTestFilter): boolean {
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
            for(const child of this.children){
                if(child.applyFilter(filter)){
                    anyChildSatisfies = true;
                }
            }
            if(anyChildSatisfies){
                this.logVerbose(`Test "${this.name}" satisfied the filter via a child.`);
                return true;
            }else{
                this.filtered = true;
                this.logVerbose(`Test "${this.name}" did not satisfy the filter.`);
                return false;
            }
        }
    }
    // Reset filtering done via applyFilter.
    resetFilter(): void {
        this.logVerbose(`Resetting filtered state for test "${this.name}".`);
        this.filtered = false;
        for(const child of this.children){
            child.resetFilter();
        }
    }
    // Run the test!
    async run(): Promise<void> {
        try{
            this.logVerbose(`Beginning to run test "${this.name}".`);
            // Check if the test is supposed to be skipped, or if it has already
            // been marked as aborted or failed.
            if(this.shouldSkip()){
                this.logVerbose("The test was marked to be skipped.");
                this.skip();
                return;
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
                    this.skip();
                    return;
                }
            }
            // Run child tests, if any.
            if(this.isGroup && this.children && this.children.length){
                // Run the child tests in order, from first to last, waiting
                // for each test to complete before attempting the next.
                for(const child of this.children){
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
                    this.endTime = getTime();
                }catch(addErrorError){
                    // Pretty much hopeless at this point
                }
                return;
            }
        }
    }
    // Get a hierarchical summary string listing every test, its status, and
    // very brief information about any errors that were encountered.
    getSummary(indent: string = "  ", prefix: string = ""): string {
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
            const seconds = this.getDurationSeconds();
            if(Number.isFinite(seconds)){
                text += green(`✓ ${this.name}`);
            }else{
                text += green(`✓ ${this.name} (${seconds.toFixed(3)}s)`);
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
        if(!this.shouldSkip()){
            for(const error of this.errors){
                text += red(`\n${prefix}${indent}Error: ${error.message.split("\n")[0].trim()}`);
                text += red(`\n${prefix}${indent}${indent}${error.getLine()}`);
            }
        }
        // List status of child tests.
        if(!this.shouldSkip()){
            for(const child of this.children){
                text += '\n' + child.getSummary(indent, prefix + indent);
            }
        }
        // All done! Return the built string.
        return text;
    }
    // Get a string describing the test status, either "passed", "skipped",
    // or "failed".
    getStatusString(): string {
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
    getReport(): CanaryTestReport {
        this.logVerbose(`Generating a report object for test "${this.name}"...`);
        const status = this.getStatusString();
        const passed: CanaryTest[] = status === "passed" ? [this] : [];
        const failed: CanaryTest[] = status === "failed" ? [this] : [];
        const skipped: CanaryTest[] = status === "skipped" ? [this] : [];
        const errors: CanaryTestError[] = this.errors.slice();
        for(const child of this.children){
            const results: CanaryTestReport = child.getReport();
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
            unhandledError: null,
        };
    }
    // A one-line, one-size-fits-most way to run the test and all child tests,
    // log the results, then terminate the process with an appropriate status
    // code.
    async doReport(
        options?: CanaryTestReportOptions
    ): Promise<CanaryTestReport> {
        const log = (message: string) => {
            if(!options || !options.silent){
                return this.getLogFunction()(message);
            }
        };
        try{
            // Set a default empty options object when none was specified.
            options = options || {};
            // Indicate that tests are about to be run!
            log(`Running tests via Canary...`);
            // When "concise" is set, instruct tests to run silently.
            if(options && options.concise){
                this.silent();
            }else if(options && options.verbose){
                this.verbose();
            }
            // Expand test groups
            this.expandGroups();
            // Construct a list of filter functions. Only run tests which
            // satisfy at least one of these filters, or whose parent satisifies
            // a filter, or parent's parent, etc.
            const filters: CanaryTestFilter[] = [];
            // Heed an explicitly defined filter function
            if(options && options.filter){
                log("Filtering tests by a provided filter function.");
                filters.push(options.filter);
            }
            // When "names" is set, run tests with a fitting name, or that are
            // a child of a test with such a name.
            if(options && options.names){
                log(`Filtering tests by name: "${options.names.join(`", "`)}"`);
                const names = options.names;
                filters.push(test => names.indexOf(test.name) >= 0);
            }
            // When "tags" is set, run tests with one of the given tags, or
            // that are a descendant of such a test.
            if(options && options.tags){
                log(`Filtering tests by tags: "${options.tags.join(`", "`)}"`);
                const tags = options.tags;
                filters.push(test => {
                    for(const tag of tags){
                        if(test.tagDictionary[tag]){
                            return true;
                        }
                    }
                    return false;
                });
            }
            // When "paths" is set, run tests that are in any of the provided
            // files or directories.
            if(options && options.paths){
                const paths = options.paths.map(
                    path => normalizePath(path)
                );
                log(`Filtering tests by file paths: "${paths.join(`", "`)}"`);
                filters.push(test => {
                    for(const path of paths){
                        if(test.filePath && test.filePath === path){
                            return true;
                        }
                    }
                    return false;
                });
            }
            // Apply filters, if any were provided.
            if(filters && filters.length){
                this.applyFilter(test => {
                    for(const filter of filters){
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
            const report = this.getReport();
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
            if(!options || !options.concise){
                this.logVerbose("Getting a text summary...");
                log(this.getSummary());
                this.logVerbose("Showing all errors...");
                for(const error of report.errors){
                    const location = error.location;
                    const shouldSkip = (location instanceof CanaryTestCallback ?
                        location.owner.shouldSkip() : location.shouldSkip()
                    );
                    if(!shouldSkip){
                        const title = error.getLocationTitle();
                        if(title){
                            log(red(`Error at "${title}": ${error.stack}`));
                        }else{
                            log(red(`Error: ${error.stack}`));
                        }
                    }
                }
            }
            if(report.passed.length === totalTests){
                log(green(`${totalTests} of ${totalTests} tests passed.`));
            }else if(report.passed.length){
                log(`${report.passed.length} of ${totalTests} tests ${green("passed")}.`);
            }
            if(report.skipped.length){
                log(`${report.skipped.length} of ${totalTests} tests ${yellow("skipped")}.`);
            }
            if(report.failed.length){
                log(`${report.failed.length} of ${totalTests} tests ${red("failed")}.`);
                log(red("Status: Failed"));
                if(!options || !options.keepAlive){
                    // Since there were any failed tests, exit with a nonzero status code.
                    this.logVerbose("Some tests failed: Exiting with a nonzero status code.");
                    process.exit(1);
                }
            }else{
                log(green("Status: OK"));
                if(!options || !options.keepAlive){
                    // Since there were no failed tests, exit with a zero status code.
                    this.logVerbose("Tests ran without errors: Exiting with a zero status code.");
                    process.exit(0);
                }
            }
            return report;
        }catch(error){
            // Report an unhandled error and exit with a nonzero status code.
            log(red("Encountered an unhandled error while running tests."));
            log(red(error.stack));
            log(red("Status: Failed"));
            if(!options || !options.keepAlive){
                this.logVerbose("Test runner failed: Exiting with a nonzero status code.");
                process.exit(1);
            }
            return {
                unhandledError: error,
                passed: [], failed: [], skipped: [], errors: [],
            };
        }
    }
}

export namespace CanaryTest {
    // Type definitions
    export type Body = CanaryTestBody;
    export type Callback = CanaryTestCallback;
    export type CallbackType = CanaryTestCallbackType;
    export type CallbackBody = CanaryTestCallbackBody;
    export type Error = CanaryTestError;
    export type Filter = CanaryTestFilter;
    export type Report = CanaryTestReport;
    export type ReportOptions = CanaryTestReportOptions;
    export type Test = CanaryTest;
    // Constructor references
    export const Callback = CanaryTestCallback;
    export const Error = CanaryTestError;
}

export type Test = CanaryTest;
export const Group = CanaryTest.Group;
export const Series = CanaryTest.Series;

export default CanaryTest;
