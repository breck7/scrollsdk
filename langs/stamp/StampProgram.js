const jtree = require("../../index.js")
const recursiveReadSync = require("recursive-readdir-sync")
const fs = require("fs")
const path = require("path")

// todo: file permissions
// todo: diff/patch
// todo: compile to bash, js, go, et cetera
// not meant to be used in browser.

class StampProgram extends jtree.program {
  async executeSeries(context) {
    const length = this.length
    for (let index = 0; index < length; index++) {
      const node = this.nodeAt(index)
      await node.execute(context)
    }
    return context
  }

  async execute(context) {
    await this.executeSeries(context)
  }

  static dirToStamp(absPathWithoutEndingSlash, output = "list") {
    // todo: add chmod, file metadata
    if (absPathWithoutEndingSlash.startsWith("."))
      absPathWithoutEndingSlash = jtree.Utils.resolvePath(absPathWithoutEndingSlash, process.cwd() + "/")
    const stat = fs.statSync(absPathWithoutEndingSlash)
    if (!stat.isDirectory()) throw new Error(`${absPath} is a file not a directory.`)
    const fns = {
      list: (file, reducedPath) => {
        const stat = fs.statSync(file)
        const isDir = stat.isDirectory()
        if (isDir) return `folder ` + reducedPath
        return `file ` + reducedPath
      },
      content: (file, reducedPath) => {
        const stat = fs.statSync(file)
        const isDir = stat.isDirectory()
        if (isDir) return `folder ` + reducedPath
        const content = fs.readFileSync(file, "utf8")
        return `file ${reducedPath}
 data${jtree.TreeNode.nest(content, 2)}`
      }
    }
    const fn = fns[output]

    return this._dirToStamp(absPathWithoutEndingSlash, fn)
  }

  static _dirToStamp(absPathWithoutEndingSlash, fileFn) {
    const files = recursiveReadSync(absPathWithoutEndingSlash)
    const folderParts = absPathWithoutEndingSlash.split("/")
    const rootFolderName = folderParts.pop()
    const rootFolderPath = folderParts.join("/")
    const pathStartIndex = rootFolderPath.length + 1
    return files.map(file => fileFn(file, file.substr(pathStartIndex))).join("\n")
  }
}

module.exports = StampProgram
