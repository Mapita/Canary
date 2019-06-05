# v1.1.2

Released 5 June 2019.

- Report objects now include a suggested process exit status.
- The doReport function now accepts a logFunction option.
- The doReport function now accepts an addSections option.

# v1.1.1

Released 30 January 2019.

- Convert main test script to TypeScript.
- Improve typings for callback functions used by tests. (Specify "this" type.)
- The second argument to CanaryTest.addError is now optional.

# v1.1.0

Released 16 January 2019.

- Add typings for TypeScript; include definitions in the package.
- Beware changes to API due to typing and switching to ES6 modules.

# v1.0.3

Released 19 July 2018.

- Fix issue reporting errors thrown in callbacks during `doReport`.

# v1.0.2

Released 7 May 2018.

- Fix handling of errors with multi-line messages
- Fix log spam when using the `paths` options for `doReport` 
- Improve handling of groups and series without body functions
- Improve handling of errors in skipped/filtered tests

# v1.0.1

Released 13 April 2018.

- Add `canary.Group` and `canary.Series`
- Fix logging bug when calling `doReport`

# v1.0.0

Released 29 March 2018.
