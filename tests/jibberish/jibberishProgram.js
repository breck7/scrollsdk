const TreeProgram = require("../../index.js")

class jibberishProgram extends TreeProgram {
  executeSync() {
    return 42
  }
}

module.exports = jibberishProgram
