const tap = require("tap")

module.exports = testTree => {
  const runOnlyTheseTest = Object.keys(testTree).filter(key => key.startsWith("_"))
  const testsToRun = runOnlyTheseTest.length ? runOnlyTheseTest : Object.keys(testTree)

  for (let key of testsToRun) {
    tap.test(key, async childTest => {
      const testCase = await testTree[key](childTest.equal)
      childTest.end()
    })
  }
}
