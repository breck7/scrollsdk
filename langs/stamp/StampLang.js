const fs = require("fs")
const mkdirp = require("mkdirp")
const readline = require("readline")
const recursiveReadSync = require("recursive-readdir-sync")
const path = require("path")

const jtree = require("../../index.js")

class FileNode extends jtree.NonTerminalNode {
  compileToBash(parentDir) {
    const filePath = this.getAbsolutePath()
    return `touch ${filePath}
echo -e "${this.childrenToString()}" >> ${filePath}`
  }

  getAbsolutePath() {
    return process.cwd() + "/" + this.cells.filepath
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

class FolderNode extends jtree.TerminalNode {
  compileToBash(parentDir) {
    return `mkdir ${this.getAbsolutePath()}`
  }

  getAbsolutePath() {
    return process.cwd() + "/" + this.cells.filepath
  }

  execute() {
    const path = this.getAbsolutePath()
    console.log(`Creating folder ${path}`)
    mkdirp.sync(path)
  }
}

class PromptNode extends jtree.TerminalNode {
  execute() {
    return new Promise((res, rej) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })

      rl.question(this.cells.promptWords.join(" ") + " ", answer => {
        rl.close()
        // todo: typecheck the response
        const varName = this.cells.varName
        this.getYoungerSiblings().forEach(node => node.replaceNode(str => str.replace(new RegExp(varName, "g"), answer)))
        res()
      })
    })
  }
}

// todo: file permissions
// todo: diff/patch
// todo: compile to bash, js, go, et cetera
// not meant to be used in browser.

class StampProgramRoot extends jtree.GrammarBackedRootNode {
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
    if (absPathWithoutEndingSlash.startsWith(".")) absPathWithoutEndingSlash = jtree.Utils.resolvePath(absPathWithoutEndingSlash, process.cwd() + "/")
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

module.exports = { PromptNode, FolderNode, FileNode, StampProgramRoot }
