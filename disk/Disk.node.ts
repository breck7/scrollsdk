const fs = require("fs")
const path = require("path")

import { treeNotationTypes } from "../products/treeNotationTypes"

class Disk {
  static getTreeNode = () => require("../index.js").jtree.TreeNode // todo: cleanup
  static rm = (path: treeNotationTypes.filepath) => fs.unlinkSync(path)
  static getCleanedString = (str: string) => str.replace(/[\,\t\n]/g, " ")
  static makeExecutable = (path: treeNotationTypes.filepath) => fs.chmodSync(path, 0o755)
  static strCount = (str: string, reg: string) => (str.match(new RegExp(reg, "gi")) || []).length
  static read = (path: treeNotationTypes.filepath) => fs.readFileSync(path, "utf8")
  static touch = (path: treeNotationTypes.filepath) => (Disk.exists(path) ? true : Disk.write(path, ""))
  static copy = (source: treeNotationTypes.filepath, destination: treeNotationTypes.filepath) => Disk.write(destination, Disk.read(source))
  static mkdir = (path: treeNotationTypes.filepath) => require("mkdirp").sync(path)
  static getRecursive = (path: treeNotationTypes.filepath) => require("recursive-readdir-sync")(path)
  static readJson = (path: treeNotationTypes.filepath) => JSON.parse(Disk.read(path))
  static getFileNameWithoutExtension = (filepath: treeNotationTypes.filepath) => path.parse(filepath).name
  static write = (path: treeNotationTypes.filepath, content: string) => fs.writeFileSync(path, content, "utf8")
  static writeJson = (path: treeNotationTypes.filepath, content: any) => fs.writeFileSync(path, JSON.stringify(content, null, 2), "utf8")
  static createFileIfDoesNotExist = (path: treeNotationTypes.filepath, initialString = "") => {
    if (!fs.existsSync(path)) Disk.write(path, initialString)
  }
  static exists = (path: treeNotationTypes.filepath) => fs.existsSync(path)
  static dir = (dir: treeNotationTypes.absoluteFolderPath) => fs.readdirSync(dir).filter((file: treeNotationTypes.filepath) => file !== ".DS_Store")
  static getFullPaths = (dir: treeNotationTypes.absoluteFolderPath) => Disk.dir(dir).map((file: treeNotationTypes.filepath) => path.join(dir, file))
  static getFiles = (dir: treeNotationTypes.absoluteFolderPath) => Disk.getFullPaths(dir).filter((file: treeNotationTypes.filepath) => fs.statSync(file).isFile())
  static getFolders = (dir: treeNotationTypes.absoluteFolderPath) => Disk.getFullPaths(dir).filter((file: treeNotationTypes.filepath) => fs.statSync(file).isDirectory())
  static isDir = (path: treeNotationTypes.absoluteFilePath) => fs.statSync(path).isDirectory()
  static getFileName = (fileName: treeNotationTypes.filepath) => path.parse(fileName).base
  static append = (path: treeNotationTypes.filepath, content: string) => fs.appendFileSync(path, content, "utf8")
  static appendAsync = (path: treeNotationTypes.filepath, content: string, callback: Function) => fs.appendFile(path, content, "utf8", callback)
  static readCsvAsTree = (path: treeNotationTypes.filepath) => Disk.getTreeNode().fromCsv(Disk.read(path))
  static readSsvAsTree = (path: treeNotationTypes.filepath) => Disk.getTreeNode().fromSsv(Disk.read(path))
  static readTsvAsTree = (path: treeNotationTypes.filepath) => Disk.getTreeNode().fromTsv(Disk.read(path))
  static insertIntoFile = (path: treeNotationTypes.filepath, content: string, delimiter: string) => Disk.write(path, Disk.stickBetween(content, Disk.read(path), delimiter))
  static detectAndReadAsTree = (path: treeNotationTypes.filepath) => Disk.detectDelimiterAndReadAsTree(Disk.read(path))
  static getAllOf = (node: treeNotationTypes.treeNode, prop: string) => node.filter((node: treeNotationTypes.treeNode) => node.getWord(0) === prop)
  static getDelimitedChildrenAsTree = (node: treeNotationTypes.treeNode, delimiter: string = undefined) => Disk.detectDelimiterAndReadAsTree(node.childrenToString())
  static sleep = (ms: treeNotationTypes.int) => new Promise(resolve => setTimeout(resolve, ms))
  static readTree = (path: treeNotationTypes.filepath) => new (Disk.getTreeNode())(Disk.read(path))
  static sizeOf = (path: treeNotationTypes.filepath) => fs.statSync(path).size
  static stripHtml = (text: string) => (text && text.replace ? text.replace(/<(?:.|\n)*?>/gm, "") : text)
  static stripParentheticals = (text: string) => (text && text.replace ? text.replace(/\((?:.|\n)*?\)/gm, "") : text)
  static escape = (str: string) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
  static hasLine = (path: treeNotationTypes.filepath, line: string) => Disk.read(path).includes(line)
  static mv = (source: treeNotationTypes.filepath, dest: treeNotationTypes.filepath) => {
    if (Disk.exists(dest) && false) {
      console.log(`${dest} exists. Skipping`)
    } else {
      Disk.write(dest, Disk.read(source))
      Disk.rm(source)
    }
  }
  static stickBetween = (content: string, dest: any, delimiter: string) => {
    const parts = dest.split(delimiter)
    return [parts[0], content, parts[2]].join(delimiter)
  }
  // todo: move to tree base class
  static detectDelimiterAndReadAsTree = (str: string) => {
    const line1 = str.split("\n")[0]
    const TreeNode = Disk.getTreeNode()
    if (line1.includes("\t")) return TreeNode.fromTsv(str)
    else if (line1.includes(",")) return TreeNode.fromCsv(str)
    else if (line1.includes("|")) return TreeNode.fromDelimited(str, "|")
    else if (line1.includes(";")) return TreeNode.fromDelimited(str, ";")
    // todo: add more robust. align with choose delimiter
    return TreeNode.fromSsv(str)
  }
  static deleteDuplicates = (node: treeNotationTypes.treeNode, prop1: any, prop2: any, reverse = false) => {
    const map: any = {}
    Disk.getAllOf(node, prop1).forEach((node: treeNotationTypes.treeNode) => {
      const val = node.get(prop2)
      console.log(val)
      if (map[val] && reverse) {
        map[val].destroy()
        map[val] = node
      } else if (map[val]) {
        node.destroy()
      } else map[val] = node
    })
  }
  // todo: remove.
  static getLastFolderName = (path: treeNotationTypes.filepath) => {
    const parts = path.replace(/\/$/, "").split("/")
    const last = parts.pop()
    return fs.statSync(path).isDirectory() ? last : parts.pop()
  }
  static appendUniqueLine = (path: string, line: string) => {
    const file = Disk.read(path)
    if (file.match(new RegExp("^" + Disk.escape(line), "m"))) return true
    const prefix = !file || file.endsWith("\n") ? "" : "\n"
    return Disk.append(path, prefix + line + "\n")
  }
  static move = (node: treeNotationTypes.treeNode, newPosition: treeNotationTypes.int) => {
    node.getParent().insertLineAndChildren(node.getLine(), node.childrenToString(), newPosition)
    node.destroy()
  }
  static _getTextUrl = async (url: treeNotationTypes.url) => {
    // todo: https://visionmedia.github.io/superagent/
    // build well tested version of this.
    // have a mock server returning with all sorts of things.
    const res = await Disk.getUrl(url)
    // todo: leave it up to user to specfiy text ro body
    return res.body || res.text || ""
  }
  static getUrl = async (url: treeNotationTypes.url) => {
    const superagent = require("superagent")
    const agent = superagent.agent()
    const res = await agent.get(url)
    return res
  }
  static download = async (url: treeNotationTypes.url, destination: treeNotationTypes.filepath) => {
    const result = await Disk._getTextUrl(url)
    Disk.write(destination, result)
  }
  static downloadPlain = async (url: treeNotationTypes.url, destination: treeNotationTypes.filepath) => {
    const result = await Disk.getUrl(url)
    Disk.write(destination, result.text)
  }
  static downloadJson = async (url: treeNotationTypes.url, destination: treeNotationTypes.filepath) => {
    const result = await Disk._getTextUrl(url)
    if (destination) Disk.writeJson(destination, result)
    return result
  }
  static buildMapFrom = (tree: treeNotationTypes.treeNode, key: string, value: string) => {
    const map: treeNotationTypes.stringMap = {}
    tree.forEach((child: treeNotationTypes.treeNode) => {
      map[child.get(key)] = child.get(value)
    })
    return map
  }
  static csvToMap = (path: string, columnName: string) => {
    const tree = Disk.readCsvAsTree(path)
    const map: treeNotationTypes.stringMap = {}
    tree.forEach((child: treeNotationTypes.treeNode) => {
      const key = child.get(columnName)
      map[key] = child.toObject()
    })
    return map
  }
}

export { Disk }
