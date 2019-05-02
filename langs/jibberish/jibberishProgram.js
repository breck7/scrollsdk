const jtree = require("../../index.js")

class jibberishProgram extends jtree.program {
  executeSync() {
    return 42
  }
}

module.exports = jibberishProgram
