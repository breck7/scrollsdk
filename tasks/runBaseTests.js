#! /usr/local/bin/node

const tap = require("tap")

const runTests = testTree => {
  const testsToRun = testTree._runOnly.length
    ? testTree._runOnly
    : Object.keys(testTree).filter(key => !key.startsWith("_"))
  testsToRun.forEach(key => {
    tap.test(key, function(childTest) {
      const testCase = testTree[key](childTest.equal)
      childTest.end()
    })
  })
}

runTests(require("../tests/base.js"))
