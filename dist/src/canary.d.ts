export declare type CanaryTestCallbackBody = (((this: CanaryTest, test: CanaryTest) => void) | ((this: CanaryTest, test: CanaryTest) => Promise<any>));
export declare enum CanaryTestCallbackType {
    onBegin = "onBegin",
    onEnd = "onEnd",
    onEachBegin = "onEachBegin",
    onEachEnd = "onEachEnd"
}
export declare class CanaryTestCallback {
    type: CanaryTestCallbackType;
    owner: CanaryTest;
    name: string;
    body: CanaryTestCallbackBody;
    constructor(type: CanaryTestCallbackType, owner: CanaryTest, name: string, body: CanaryTestCallbackBody);
    getOwner(): CanaryTest;
    getName(): string;
    getTitle(): string;
}
export declare namespace CanaryTestCallback {
    type Body = CanaryTestCallbackBody;
    type Type = CanaryTestCallbackType;
}
export declare type CanaryTestErrorLocation = CanaryTest | CanaryTestCallback;
export declare class CanaryTestError {
    test: CanaryTest;
    error: Error;
    location: CanaryTestErrorLocation;
    constructor(test: CanaryTest, error: Error, location: CanaryTestErrorLocation);
    readonly stack: string;
    readonly message: string;
    readonly name: string;
    getError(): Error;
    getLocation(): CanaryTestErrorLocation;
    getLocationName(): string;
    getLocationTitle(): string;
    getLine(): string;
}
export declare namespace CanaryTestError {
    type Location = CanaryTestErrorLocation;
}
export declare type CanaryTestBody = (((this: CanaryTest, test: CanaryTest) => void) | ((this: CanaryTest, test: CanaryTest) => Promise<any>));
export declare type CanaryTestFilter = (test: CanaryTest) => any;
export interface CanaryTestReport {
    unhandledError: null | Error;
    passed: CanaryTest[];
    failed: CanaryTest[];
    skipped: CanaryTest[];
    errors: CanaryTestError[];
    status: number;
}
export interface CanaryTestReportOptions {
    concise?: boolean;
    silent?: boolean;
    verbose?: boolean;
    keepAlive?: boolean;
    filter?: CanaryTestFilter;
    names?: string[];
    tags?: string[];
    paths?: string[];
    logFunction?: Function;
    addSections?: {
        [key: string]: ((this: CanaryTest, test: CanaryTest, report: CanaryTestReport) => (string | string[] | Promise<string | string[]>));
    };
}
export declare class CanaryTest {
    static currentlyExpandingGroup: null | CanaryTest;
    name: string;
    body: CanaryTestBody;
    attempted: boolean;
    skipped: boolean;
    success: null | boolean;
    aborted: null | boolean;
    failed: null | boolean;
    filtered: boolean;
    isTodo: boolean;
    isIgnored: boolean;
    isVerbose: boolean;
    isSilent: boolean;
    isGroup: boolean;
    isSeries: boolean;
    isExpandedGroup: boolean;
    startTime: null | number;
    endTime: null | number;
    expandTime: null | number;
    errors: CanaryTestError[];
    bodyReturnedValue: any;
    bodyReturnedValueResolved: any;
    parent: null | CanaryTest;
    children: CanaryTest[];
    failedChildren: CanaryTest[];
    onBeginCallbacks: CanaryTestCallback[];
    onEndCallbacks: CanaryTestCallback[];
    onEachBeginCallbacks: CanaryTestCallback[];
    onEachEndCallbacks: CanaryTestCallback[];
    tagDictionary: {
        [key: string]: boolean;
    };
    logFunction: Function;
    location: string;
    filePath: null | string;
    lineInFile: null | number;
    columnInLine: null | number;
    constructor(name: string, body?: CanaryTestBody);
    static Group(name: string, body?: CanaryTestBody): CanaryTest;
    static Series(name: string, body?: CanaryTestBody): CanaryTest;
    reset(): void;
    todo(): void;
    removeTodo(): void;
    ignore(): void;
    unignore(): void;
    silent(): void;
    notSilent(): void;
    verbose(): void;
    notVerbose(): void;
    tags(...tags: string[]): void;
    getParent(): (null | CanaryTest);
    getChildren(): CanaryTest[];
    getTags(): string[];
    hasTag(tag: string): boolean;
    shouldSkip(): boolean;
    getTitle(): string;
    getName(): string;
    getLogFunction(): Function;
    setLogFunction(logFunction: Function): void;
    log(message: string): void;
    logVerbose(message: string): void;
    getDurationSeconds(): number;
    getDurationMilliseconds(): number;
    anyErrors(): boolean;
    noErrors(): boolean;
    getErrors(): CanaryTestError[];
    anyFailedChildren(): boolean;
    noFailedChildren(): boolean;
    getFailedChildren(): CanaryTest[];
    addCallback(type: CanaryTestCallbackType, callbackList: CanaryTestCallback[], name: string, callback: CanaryTestCallbackBody): CanaryTestCallback;
    onBegin(callback: CanaryTestCallbackBody): CanaryTestCallback;
    onBegin(name: string, callback: CanaryTestCallbackBody): CanaryTestCallback;
    onEnd(callback: CanaryTestCallbackBody): CanaryTestCallback;
    onEnd(name: string, callback: CanaryTestCallbackBody): CanaryTestCallback;
    onEachBegin(callback: CanaryTestCallbackBody): CanaryTestCallback;
    onEachBegin(name: string, callback: CanaryTestCallbackBody): CanaryTestCallback;
    onEachEnd(callback: CanaryTestCallbackBody): CanaryTestCallback;
    onEachEnd(name: string, callback: CanaryTestCallbackBody): CanaryTestCallback;
    runCallbacks(exitOnError: boolean, callbackList: CanaryTestCallback[]): Promise<void>;
    initialize(): Promise<void>;
    addError(error: Error, location?: CanaryTestErrorLocation): CanaryTestError;
    fail(): Promise<void>;
    fail(error: Error, location: CanaryTestErrorLocation): Promise<void>;
    abort(): Promise<void>;
    abort(error: Error, location: CanaryTestErrorLocation): Promise<void>;
    exitTestGroup(childTest: CanaryTest): Promise<void>;
    complete(): Promise<void>;
    skip(): void;
    doBeginCallbacks(): Promise<void>;
    doEndCallbacks(): Promise<void>;
    orphan(): boolean;
    removeTest(child: CanaryTest): boolean;
    removeAllTests(): void;
    addTest(child: CanaryTest): void;
    test(body: CanaryTestBody): CanaryTest;
    test(name: string, body: CanaryTestBody): CanaryTest;
    group(name: string, body: CanaryTestBody): CanaryTest;
    series(name: string, body: CanaryTestBody): CanaryTest;
    expandGroups(): void;
    applyFilter(filter: CanaryTestFilter): boolean;
    resetFilter(): void;
    run(): Promise<void>;
    getSummary(indent?: string, prefix?: string): string;
    getStatusString(): string;
    getReport(): CanaryTestReport;
    doReport(options?: CanaryTestReportOptions): Promise<CanaryTestReport>;
}
export declare namespace CanaryTest {
    type Body = CanaryTestBody;
    type Callback = CanaryTestCallback;
    type CallbackType = CanaryTestCallbackType;
    type CallbackBody = CanaryTestCallbackBody;
    type Error = CanaryTestError;
    type Filter = CanaryTestFilter;
    type Report = CanaryTestReport;
    type ReportOptions = CanaryTestReportOptions;
    type Test = CanaryTest;
    const Callback: typeof CanaryTestCallback;
    const Error: typeof CanaryTestError;
}
export declare type Test = CanaryTest;
export declare const Group: typeof CanaryTest.Group;
export declare const Series: typeof CanaryTest.Series;
export default CanaryTest;
