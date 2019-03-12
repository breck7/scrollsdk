const fs = require("fs")
const jtree = require("../../index.js")

class FileNode extends jtree.NonTerminalNode {
  compileToBash(parentDir) {
    const filePath = this.getAbsolutePath()
    return `touch ${filePath}
echo -e "${this.childrenToString()}" >> ${filePath}`
  }

  getAbsolutePath() {
    return process.cwd() + "/" + this.getWord(1)
  }

  execute() {
    const path = this.getAbsolutePath()
    console.log(`Creating file ${path}`)
    const data = this.getNode("data")
    const content = data ? data.childrenToString() : ""
    fs.writeFileSync(path, content, "utf8")
    const isExecutable = this.has("executable") // todo: allow for all file permissions?
    if (isExecutable) fs.chmodSync(path, "755")
  }
}

module.exports = FileNode
