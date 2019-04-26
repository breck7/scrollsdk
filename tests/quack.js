const tap = require("tap")

const quack = {}

quack.quickTest = (name, fn) => {
  tap.test(name, async childTest => {
    try {
      await fn(childTest.equal)
    } catch (err) {
      console.error(err)
      debugger
    }
    childTest.end()
  })
}

quack.runTestTree = testTree => {
  const testsToRun = testTree._runOnly.length
    ? typeof testTree._runOnly === "string"
      ? [testTree._runOnly]
      : testTree._runOnly
    : Object.keys(testTree).filter(key => !key.startsWith("_"))
  testsToRun.forEach(key => {
    tap.test(key, function(childTest) {
      const testCase = testTree[key](childTest.equal)
      childTest.end()
    })
  })
}

module.exports = quack
