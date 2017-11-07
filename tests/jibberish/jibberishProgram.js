const otree = require("../../index.js")

class jibberishProgram extends otree.program {
  executeSync() {
    return 42
  }
}

module.exports = jibberishProgram
