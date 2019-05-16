const jtree = require("../../index.js")

class jibberishProgramRoot extends jtree.programRoot {
  executeSync() {
    return 42
  }
}

module.exports = jibberishProgramRoot
