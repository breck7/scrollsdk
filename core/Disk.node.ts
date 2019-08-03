const fs = require("fs")

import jtree from "./jtree.node"
import jTreeTypes from "./jTreeTypes"
const { TreeNode } = jtree

class Disk {
  static rm = (path: jTreeTypes.filepath) => fs.unlinkSync(path)
  static getCleanedString = (str: string) => str.replace(/[\,\t\n]/g, " ")
  static makeExecutable = (path: jTreeTypes.filepath) => fs.chmodSync(path, 0o755)
  static strCount = (str: string, reg: string) => (str.match(new RegExp(reg, "gi")) || []).length
  static read = (path: jTreeTypes.filepath) => fs.readFileSync(path, "utf8")
  static touch = (path: jTreeTypes.filepath) => (Disk.exists(path) ? true : Disk.write(path, ""))
  static mkdir = (path: jTreeTypes.filepath) => require("mkdirp").sync(path)
  static getRecursive = (path: jTreeTypes.filepath) => require("recursive-readdir-sync")(path)
  static readJson = (path: jTreeTypes.filepath) => JSON.parse(Disk.read(path))
  static getFileNameWithoutExtension = (path: jTreeTypes.filepath) => Disk.getFileName(path).replace(/\.[^\.]+$/, "")
  static write = (path: jTreeTypes.filepath, content: string) => fs.writeFileSync(path, content, "utf8")
  static writeJson = (path: jTreeTypes.filepath, content: any) => fs.writeFileSync(path, JSON.stringify(content, null, 2), "utf8")
  static exists = (path: jTreeTypes.filepath) => fs.existsSync(path)
  static dir = (dir: jTreeTypes.absoluteFolderPath) => fs.readdirSync(dir).filter((file: jTreeTypes.filepath) => file !== ".DS_Store")
  static getFullPaths = (dir: jTreeTypes.absoluteFolderPath) => Disk.dir(dir).map((file: jTreeTypes.filepath) => dir.replace(/\/$/, "") + "/" + file)
  static getFiles = (dir: jTreeTypes.absoluteFolderPath) => Disk.getFullPaths(dir).filter((file: jTreeTypes.filepath) => fs.statSync(file).isFile())
  static getFolders = (dir: jTreeTypes.absoluteFolderPath) => Disk.getFullPaths(dir).filter((file: jTreeTypes.filepath) => fs.statSync(file).isDirectory())
  static getFileName = (path: jTreeTypes.filepath) => path.split("/").pop()
  static append = (path: jTreeTypes.filepath, content: string) => fs.appendFileSync(path, content, "utf8")
  static readCsvAsTree = (path: jTreeTypes.filepath) => TreeNode.fromCsv(Disk.read(path))
  static readSsvAsTree = (path: jTreeTypes.filepath) => TreeNode.fromSsv(Disk.read(path))
  static readTsvAsTree = (path: jTreeTypes.filepath) => TreeNode.fromTsv(Disk.read(path))
  static insertIntoFile = (path: jTreeTypes.filepath, content: string, delimiter: string) =>
    Disk.write(path, Disk.stickBetween(content, Disk.read(path), delimiter))
  static detectAndReadAsTree = (path: jTreeTypes.filepath) => Disk.detectDelimiterAndReadAsTree(Disk.read(path))
  static getAllOf = (node: jTreeTypes.treeNode, prop: string) => node.filter((node: jTreeTypes.treeNode) => node.getWord(0) === prop)
  static getDelimitedChildrenAsTree = (node: jTreeTypes.treeNode, delimiter: string = undefined) => Disk.detectDelimiterAndReadAsTree(node.childrenToString())
  static sleep = (ms: jTreeTypes.int) => new Promise(resolve => setTimeout(resolve, ms))
  static readTree = (path: jTreeTypes.filepath) => new TreeNode(Disk.read(path))
  static sizeOf = (path: jTreeTypes.filepath) => fs.statSync(path).size
  static stripHtml = (text: string) => (text && text.replace ? text.replace(/<(?:.|\n)*?>/gm, "") : text)
  static stripParentheticals = (text: string) => (text && text.replace ? text.replace(/\((?:.|\n)*?\)/gm, "") : text)
  static escape = (str: string) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
  static hasLine = (path: jTreeTypes.filepath, line: string) => Disk.read(path).includes(line)
  static mv = (source: jTreeTypes.filepath, dest: jTreeTypes.filepath) => {
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
    if (line1.includes("\t")) return TreeNode.fromTsv(str)
    else if (line1.includes(",")) return TreeNode.fromCsv(str)
    else if (line1.includes("|")) return TreeNode.fromDelimited(str, "|")
    else if (line1.includes(";")) return TreeNode.fromDelimited(str, ";")
    // todo: add more robust. align with choose delimiter
    return TreeNode.fromSsv(str)
  }
  static deleteDuplicates = (node: jTreeTypes.treeNode, prop1: any, prop2: any, reverse = false) => {
    const map: any = {}
    Disk.getAllOf(node, prop1).forEach((node: jTreeTypes.treeNode) => {
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
  static getLastFolderName = (path: jTreeTypes.filepath) => {
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
  static move = (node: jTreeTypes.treeNode, newPosition: jTreeTypes.int) => {
    node.getParent().insertLineAndChildren(node.getLine(), node.childrenToString(), newPosition)
    node.destroy()
  }
  static _getTextUrl = async (url: jTreeTypes.url) => {
    // todo: https://visionmedia.github.io/superagent/
    // build well tested version of this.
    // have a mock server returning with all sorts of things.
    const res = await Disk.getUrl(url)
    // todo: leave it up to user to specfiy text ro body
    return res.body || res.text || ""
  }
  static getUrl = async (url: jTreeTypes.url) => {
    const superagent = require("superagent")
    const agent = superagent.agent()
    const res = await agent.get(url)
    return res
  }
  static download = async (url: jTreeTypes.url, destination: jTreeTypes.filepath) => {
    const result = await Disk._getTextUrl(url)
    Disk.write(destination, result)
  }
  static downloadPlain = async (url: jTreeTypes.url, destination: jTreeTypes.filepath) => {
    const result = await Disk.getUrl(url)
    Disk.write(destination, result.text)
  }
  static downloadJson = async (url: jTreeTypes.url, destination: jTreeTypes.filepath) => {
    const result = await Disk._getTextUrl(url)
    if (destination) Disk.writeJson(destination, result)
    return result
  }
  static buildMapFrom = (tree: jTreeTypes.treeNode, key: string, value: string) => {
    const map: jTreeTypes.stringMap = {}
    tree.forEach((child: jTreeTypes.treeNode) => {
      map[child.get(key)] = child.get(value)
    })
    return map
  }
  static csvToMap = (path: string, columnName: string) => {
    const tree = Disk.readCsvAsTree(path)
    const map: jTreeTypes.stringMap = {}
    tree.forEach(child => {
      const key = child.get(columnName)
      map[key] = child.toObject()
    })
    return map
  }
}

export { Disk }
