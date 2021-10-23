module.exports = {
  providerOptions: {
    networkId: 1337,
    chainId: 1337,
    gas: 20000000,
  },
  skipFiles: ["external"],
  measureStatementCoverage: false,
  measureFunctionCoverage: false,
  istanbulReporter: ["html"],
  mocha: {
    timeout: 1111111111111111111111111110000,
    grep: "@skip-on-coverage", // Find everything with this tag
    invert: true, // Run the grep's inverse set.
  },
};
