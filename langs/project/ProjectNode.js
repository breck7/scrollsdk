const jtree = require("../../index.js")
const path = require("path")

class ProjectNode extends jtree.NonTerminalNode {
  getFilePath() {
    return this.getWord(1)
  }

  _getDependencies() {
    return this.getChildren()
      .map(child => {
        const keyword = child.getKeyword()
        if (keyword === "external") return ""
        if (keyword === "absolute") return child.getWord(1)
        const link = child.getWord(1)
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

module.exports = ProjectNode
