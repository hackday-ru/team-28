define({
 environments: [
    { browserName: 'chrome' }
  ],

  // Only functional tests interact with a WebDriver client and have a remote property.
  // In your config, include your test suite in the functionalSuites array, not suites.
  functionalSuites: [ 'tests/sample-test.js' ],
  tunnel: 'NullTunnel',

  excludeInstrumentation: /./
});
