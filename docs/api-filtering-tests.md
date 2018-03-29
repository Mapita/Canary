These [**CanaryTest**](api-introduction.md) methods allow filtering of tests; tests that do not satisfy a provided filter will be skipped when tests are run.

The [**doReport**](api-running-tests.md#doreport) method utilizes [**applyFilter**](api-filtering-tests.md#applyfilter) to support filtering tests by name, [tags](api-tagging-tests.md), and file paths.

# applyFilter

Applies a filter function recursively to a test group and all of its children. Tests for which no ancestors or descendants satisfy the filter will be marked, then skipped when tests are run.

Note that if this method is called for a test group or series, and the group has not already been expanded, then this method will cause it to be expanded. (As though [**expandGroups**](api-advanced-usage.md#expandgroups) was called.)

This method is leveraged by [**doReport**](api-running-tests.md#doreport) in order to enforce the filtering criteria that are passed to it.

**Arguments:** `({function} filter)`

**Returns:** **true** if this test or any of its descendants satisfied the filter and **false** if not.

# resetFilter

Reset filtered state that may have been set by the [**applyFilter**](api-advanced-usage.md#resetfilter) method. Any tests that were previously set as filtered out will be restored to their normal state.
