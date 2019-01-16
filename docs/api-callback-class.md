The [**CanaryTestCallback**](api-callback-class.md) class is used to represent callbacks added to a test using methods such as [**onBegin**](api-group-callbacks.md#onbegin) and [**onEnd**](api-group-callbacks.md#onend). It has a constructor and no methods. It can be accessed via [**CanaryTest.Callback**](api-callback-class.md) or imported directly.

This class is primarily for internal usage by Canary. It should rarely if ever be necessary for user code to reference or interact with this class.

``` js
const CanaryTestCallback = require("canary-test").CanaryTest.Callback;
```

``` js
import {CanaryTestCallback} from "canary-test";
```

# getOwner

Get the test object to which this callback belongs.

**Returns:** The [**CanaryTest**](api-introduction.md) instance to which this callback was added.

# getName

Get a string naming this callback.

**Returns:** A string representing the name of this callback.

# getTitle

Get a string containing an identifying title for this callback.

**Returns:** A string representing the title of this callback.
