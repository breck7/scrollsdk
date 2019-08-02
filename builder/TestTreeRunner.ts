const tap = require("tap")
import jTreeTypes from "../core/jTreeTypes"

class TestTreeRunner {
  run(testTree: jTreeTypes.testTree) {
    const runOnlyTheseTest = Object.keys(testTree).filter(key => key.startsWith("_"))
    const testsToRun = runOnlyTheseTest.length ? runOnlyTheseTest : Object.keys(testTree)

    for (let key of testsToRun) {
      tap.test(key, async (childTest: any) => {
        const testCase = await testTree[key](childTest.equal)
        childTest.end()
      })
    }
  }
}

export { TestTreeRunner }
