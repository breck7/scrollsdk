const tap = require("tap")

module.exports = testTree => {
  const testsToRun =
    testTree._runOnly && testTree._runOnly.length
      ? typeof testTree._runOnly === "string"
        ? [testTree._runOnly]
        : testTree._runOnly
      : Object.keys(testTree).filter(key => !key.startsWith("_"))

  for (let key of testsToRun) {
    tap.test(key, async childTest => {
      const testCase = await testTree[key](childTest.equal)
      childTest.end()
    })
  }
}
