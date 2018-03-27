Canary's API is the interface used to write and to run automated JavaScript tests. It is built on the `CanaryTest` class and on the global instance of this class acquired by importing the Canary package. By convention, this global instance should be referred to as `canary`.

``` js
const canary = require("canary-test");
```

The `CanaryTest` class can be referred to via `canary.Test`. Although most of the work done with Canary will be using the methods of instances of this class, it should rarely if ever be necessary to instantiate a `CanaryTest` yourself.

``` js
assert(canary instanceof canary.Test);
```

The library also utilizes `CanaryTestCallback` and `CanaryTestError` classes. These classes can be referred to with `canary.Callback` and `canary.Error`, respectively. These classes are mainly for internal use and, normally, it will not be necessary to work with them directly.
