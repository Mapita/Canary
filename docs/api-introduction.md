# Using Canary

Canary's API is the interface used to write and to run automated JavaScript tests. It is built on the [**CanaryTest**](api-introduction.md) class. You can acquire an instance to be shared by the automated tests in your package by using the [**CanaryTest.Group**](api-adding-tests.md#group-static) function. By convention, this instance should be referred to as [**canary**](api-introduction.md).

``` js
const canary = require("canary-test").Group("My Canary Instance");
```

``` js
import CanaryTest from "canary-test";
const canary = CanaryTest.Group("My Canary Instance");
```

You can add tests and groups of tests to your shared Canary instance using the [**test**](api-adding-tests.md#test), [**group**](api-adding-tests.md#group), and [**series**](api-adding-tests.md#series) methods.

``` js
canary.test("Example test", function(){
    assert(2 + 2 === 4);
});
```

You can run the tests that have been attached to this shared instance by calling its [**doReport**](api-running-tests.md#doreport) method. With the default options, this method will log detailed status messages, then it will immediately terminate the process upon completion. The process will exit with an error status code if any test failed, or with a success status code if no tests failed.

``` js
canary.doReport();
```

# The Test Class

The [**CanaryTest**](api-introduction.md) class is the default exported value of the canary-test package. Although most of the work done with Canary will be using the methods of instances of this class, it should not normally be necessary to instantiate a [**CanaryTest**](api-introduction.md) yourself.

``` js
assert(canary instanceof CanaryTest);
```

There are also functions available for creating disconnected test groups and series in a similar way, specifically [**CanaryTest.Group**](api-adding-tests.md#group-static) and [**CanaryTest.Series**](api-adding-tests.md#series-static):

``` js
const someGroup = CanaryTest.Group("Some group");
assert(someGroup.isGroup);
```

``` js
const someSeries = CanaryTest.Series("Some series");
assert(someSeries.isSeries);
```

The library also utilizes [**CanaryTestCallback**](api-callback-class.md) and [**CanaryTestError**](api-error-class.md) classes. These classes can be referred to with [**CanaryTest.Callback**](api-callback-class.md) and [**CanaryTest.Error**](api-error-class.md), respectively. These classes are mainly for internal use and, normally, it will not be necessary to work with them directly.

# List of Attributes

Here is an exhaustive list of documented [**CanaryTest**](api-introduction.md) methods and other instance attributes. Attributes not documented here are liable to change often and without notice; it is not recommended to rely on undocumented implementation details.

- [**abort**](api-advanced-usage.md#abort)
- [**aborted**](api-status-attributes.md#aborted)
- [**addError**](api-advanced-usage.md#adderror)
- [**addTest**](api-advanced-usage.md#addtest)
- [**anyErrors**](api-advanced-usage.md#anyerrors)
- [**anyFailedChildren**](api-advanced-usage.md#anyfailedchildren)
- [**applyFilter**](api-filtering-tests.md#applyfilter)
- [**attempted**](api-status-attributes.md#attempted)
- [**constructor**](api-advanced-usage.md#constructor)
- [**doReport**](api-running-tests.md#doreport)
- [**endTime**](api-status-attributes.md#endtime)
- [**expandGroups**](api-advanced-usage.md#expandgroups)
- [**fail**](api-advanced-usage.md#fail)
- [**failed**](api-status-attributes.md#failed)
- [**filtered**](api-status-attributes.md#filtered)
- [**getChildren**](api-advanced-usage.md#getchildren)
- [**getDurationMilliseconds**](api-advanced-usage.md#getdurationmilliseconds)
- [**getDurationSeconds**](api-advanced-usage.md#getdurationseconds)
- [**getErrors**](api-advanced-usage.md#geterrors)
- [**getFailedChildren**](api-advanced-usage.md#getfailedchildren)
- [**getLogFunction**](api-logging.md#getlogfunction)
- [**getName**](api-advanced-usage.md#getname)
- [**getParent**](api-advanced-usage.md#getparent)
- [**getReport**](api-running-tests.md#getreport)
- [**getStatusString**](api-advanced-usage.md#getstatusstring)
- [**getSummary**](api-running-tests.md#getsummary)
- [**getTags**](api-tagging-tests.md#gettags)
- [**getTitle**](api-advanced-usage.md#gettitle)
- [**group**](api-adding-tests.md#group)
- [**hasTag**](api-tagging-tests.md#hastag)
- [**ignore**](api-skipping-tests.md#ignore)
- [**isGroup**](api-status-attributes.md#isgroup)
- [**isIgnored**](api-status-attributes.md#isignored)
- [**isSeries**](api-status-attributes.md#isseries)
- [**isSilent**](api-status-attributes.md#issilent)
- [**isTodo**](api-status-attributes.md#istodo)
- [**isVerbose**](api-status-attributes.md#isverbose)
- [**log**](api-logging.md#log)
- [**logVerbose**](api-logging.md#logverbose)
- [**noErrors**](api-advanced-usage.md#noerrors)
- [**noFailedChildren**](api-advanced-usage.md#nofailedchildren)
- [**notSilent**](api-logging.md#notsilent)
- [**notVerbose**](api-logging.md#notverbose)
- [**onBegin**](api-group-callbacks.md#onbegin)
- [**onEachBegin**](api-group-callbacks.md#oneachbegin)
- [**onEachEnd**](api-group-callbacks.md#oneachend)
- [**onEnd**](api-group-callbacks.md#onend)
- [**orphan**](api-advanced-usage.md#orphan)
- [**removeAllTests**](api-advanced-usage.md#removealltests)
- [**removeTest**](api-advanced-usage.md#removetest)
- [**removeTodo**](api-skipping-tests.md#removetodo)
- [**reset**](api-running-tests.md#reset)
- [**resetFilter**](api-filtering-tests.md#resetfilter)
- [**run**](api-running-tests.md#run)
- [**series**](api-adding-tests.md#series)
- [**setLogFunction**](api-logging.md#setlogfunction)
- [**shouldSkip**](api-skipping-tests.md#shouldskip)
- [**silent**](api-logging.md#silent)
- [**skipped**](api-status-attributes.md#skipped)
- [**startTime**](api-status-attributes.md#starttime)
- [**success**](api-status-attributes.md#success)
- [**tags**](api-tagging-tests.md#tags)
- [**test**](api-adding-tests.md#test)
- [**todo**](api-skipping-tests.md#todo)
- [**unignore**](api-skipping-tests.md#unignore)
- [**verbose**](api-logging.md#verbose)
