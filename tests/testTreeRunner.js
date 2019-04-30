const tap = require("tap")

module.exports = testTree => {
  const testsToRun =
    testTree._runOnly && testTree._runOnly.length
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
