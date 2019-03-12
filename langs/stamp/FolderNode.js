const mkdirp = require("mkdirp")
const jtree = require("../../index.js")

class FolderNode extends jtree.TerminalNode {
  compileToBash(parentDir) {
    return `mkdir ${this.getAbsolutePath()}`
  }

  getAbsolutePath() {
    return process.cwd() + "/" + this.getWord(1)
  }

  execute() {
    const path = this.getAbsolutePath()
    console.log(`Creating folder ${path}`)
    mkdirp.sync(path)
  }
}

module.exports = FolderNode
