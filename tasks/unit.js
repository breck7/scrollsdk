#! /usr/local/bin/node

const tap = require("tap")

const runTests = testTree => {
  Object.keys(testTree).forEach(key => {
    tap.test(key, function(childTest) {
      const testCase = testTree[key](childTest.equal)
      childTest.end()
    })
  })
}

runTests(require("../tests/unit.js"))
