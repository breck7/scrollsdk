const jtree = require("../../index.js")
const path = require("path")

class FileNode extends jtree.NonTerminalNode {
  getFilePath() {
    return this.cells.filepath.join(" ")
  }

  _getDependencies() {
    return this.getChildren()
      .map(child => {
        const keyword = child.getKeyword()
        const childFilePath = child.cells.filepath.join(" ")
        if (keyword === "external") return ""
        if (keyword === "absolute") return childFilePath
        const link = childFilePath
        const folderPath = jtree.Utils.getPathWithoutFileName(this.getFilePath())
        const resolvedPath = path.resolve(folderPath + "/" + link)
        return resolvedPath
      })
      .filter(path => path)
  }

  getMissingDependencies(includedMap) {
    return this._getDependencies().filter(file => includedMap[file] === undefined)
  }
}

module.exports = FileNode
