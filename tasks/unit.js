#! /usr/local/bin/node

const tap = require("tap")
const testTree = require("../tests.js")

Object.keys(testTree).forEach(key => {
  tap.test(key, function(childTest) {
    const testCase = testTree[key](childTest.equal)
    childTest.end()
  })
})
