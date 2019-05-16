const jtree = require("jtree")

class FireProgram extends jtree.program {
  async execute() {
    return this.executeSync()
  }

  compile() {
    return super.compile("js")
  }

  executeSync() {
    let outputLines = []
    const _originalConsoleLog = console.log
    const tempConsoleLog = (...params) => outputLines.push(params)
    console.log = tempConsoleLog
    const compiled = this.compile("js")
    eval(compiled)
    console.log = _originalConsoleLog
    console.log(outputLines.join("\n"))
    return outputLines
  }
}

module.exports = { FireProgram }