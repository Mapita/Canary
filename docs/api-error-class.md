The [`CanaryTestError`](api-error-class.md) class is used to record errors encountered while attempting tests using Canary. It can be accessed via `canary.Error`.

# stack

A property to get the stack trace attribute of the error object that this [`CanaryTestError`](api-error-class.md) instance was instantiated with, provided such an attribute exists.

**Value:** A stack trace, or `undefined` if none was found.

# message

A property to get the message attribute of the error object that this [`CanaryTestError`](api-error-class.md) instance was instantiated with, provided such an attribute exists.

**Value:** An error message, or `undefined` if none was found.

# getLocationName

Get the name of the test or callback where this error was encountered. The name is a short string that can be used to help identify a test or a callback.

**Returns:** A string giving the name of the location where the error occurred, or `undefined` if the location wasn't known.

# getLocationTitle

Get the title of the test or callback where this error was encountered. The title is a long string that can be used to uniquely identify a test or a callback.

**Returns:** A string giving the title of the location where the error occurred, or `undefined` if the location wasn't known.

# getLine

Get the line of the error's stack trace indicating where in the source the error occurred.

**Returns:** A string indicating on what line and in what file the error occurred, or `undefined` if the information couldn't be found.
