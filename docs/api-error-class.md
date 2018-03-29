The [**CanaryTestError**](api-error-class.md) class is used to record errors encountered while attempting tests using Canary. It can be accessed via [**canary.Error**](api-error-class.md).

This class is primarily for internal usage by Canary. Usually, user code should not need to reference or interact with this class. However, when writing custom code to report test status and error information, it may be necessary to interact with the instances of this class that were created to record errors that were encountered while running tests.

# name

A property to get the [**name**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/name) attribute of the error object that this [**CanaryTestError**](api-error-class.md) instance was instantiated with, provided such an attribute exists.

**Value:** An error name, or **undefined** if none was found.

# message

A property to get the [**message**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/message) attribute of the error object that this [**CanaryTestError**](api-error-class.md) instance was instantiated with, provided such an attribute exists.

**Value:** An error message, or **undefined** if none was found.

# stack

A property to get the [**stack**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack) attribute of the error object that this [**CanaryTestError**](api-error-class.md) instance was instantiated with, provided such an attribute exists.

**Value:** A stack trace, or **undefined** if none was found.

# getError

Get a reference to the error object that this [**CanaryTestError**](api-error-class.md) was created for. Normally, this will be an [**Error**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) instance.

**Returns:** The thrown error object associated with this test error.

# getLocation

Get a reference to the test or callback where this error was encountered.

**Returns:** The location where the error occurred, or **undefined** if the location wasn't known.

# getLocationName

Get the name of the test or callback where this error was encountered. The name is a short string that can be used to help identify a test or a callback.

**Returns:** A string giving the name of the location where the error occurred, or **undefined** if the location wasn't known.

# getLocationTitle

Get the title of the test or callback where this error was encountered. The title is a long string that can be used to uniquely identify a test or a callback.

**Returns:** A string giving the title of the location where the error occurred, or **undefined** if the location wasn't known.

# getLine

Get the line of the error's stack trace indicating where in the source the error occurred.

**Returns:** A string indicating on what line and in what file the error occurred, or **undefined** if the information couldn't be found.
