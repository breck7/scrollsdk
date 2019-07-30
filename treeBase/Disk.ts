const fs = require("fs")

import jtree from "../built/jtree.node"
const TreeNode = jtree.TreeNode
const recursiveReadSync = require("recursive-readdir-sync")
const mkdirp = require("mkdirp")

class Disk {
  static rm = path => fs.unlinkSync(path)
  static getCleanedString = str => str.replace(/[\,\t\n]/g, " ")
  static strCount = (str, reg) => (str.match(new RegExp(reg, "gi")) || []).length
  static read = path => fs.readFileSync(path, "utf8")
  static touch = path => (Disk.exists(path) ? true : Disk.write(path, ""))
  static mkdir = path => mkdirp.sync(path)
  static getRecursive = path => recursiveReadSync(path)
  static readJson = path => JSON.parse(Disk.read(path))
  static getFileNameWithoutExtension = path => Disk.getFileName(path).replace(/\.[^\.]+$/, "")
  static write = (path, content) => fs.writeFileSync(path, content, "utf8")
  static writeJson = (path, content) => fs.writeFileSync(path, JSON.stringify(content, null, 2), "utf8")
  static exists = path => fs.existsSync(path)
  static dir = dir => fs.readdirSync(dir).filter(file => file !== ".DS_Store")
  static getFullPaths = dir => Disk.dir(dir).map(file => dir.replace(/\/$/, "") + "/" + file)
  static getFiles = dir => Disk.getFullPaths(dir).filter(file => fs.statSync(file).isFile())
  static getFolders = dir => Disk.getFullPaths(dir).filter(file => fs.statSync(file).isDirectory())
  static getFileName = path => path.split("/").pop()
  static append = (path, content) => fs.appendFileSync(path, content, "utf8")
  static readCsvAsTree = path => TreeNode.fromCsv(Disk.read(path))
  static readSsvAsTree = path => TreeNode.fromSsv(Disk.read(path))
  static readTsvAsTree = path => TreeNode.fromTsv(Disk.read(path))
  static insertIntoFile = (path, content, delimiter) => Disk.write(path, Disk.stickBetween(content, Disk.read(path), delimiter))
  static detectAndReadAsTree = path => Disk.detectDelimiterAndReadAsTree(Disk.read(path))
  static getAllOf = (node, prop) => node.filter(node => node.getWord(0) === prop)
  static getDelimitedChildrenAsTree = (node, delimiter = undefined) => Disk.detectDelimiterAndReadAsTree(node.childrenToString())
  static sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
  static readTree = path => new TreeNode(Disk.read(path))
  static sizeOf = path => fs.statSync(path).size
  static stripHtml = text => (text && text.replace ? text.replace(/<(?:.|\n)*?>/gm, "") : text)
  static stripParentheticals = text => (text && text.replace ? text.replace(/\((?:.|\n)*?\)/gm, "") : text)
  static escape = s => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
  static hasLine = (path, line) => Disk.read(path).includes(line)
  static mv = (source, dest) => {
    if (Disk.exists(dest) && false) {
      console.log(`${dest} exists. Skipping`)
    } else {
      Disk.write(dest, Disk.read(source))
      Disk.rm(source)
    }
  }
  static stickBetween = (content, dest, delimiter) => {
    const parts = dest.split(delimiter)
    return [parts[0], content, parts[2]].join(delimiter)
  }
  // todo: move to tree base class
  static detectDelimiterAndReadAsTree = str => {
    const line1 = str.split("\n")[0]
    if (line1.includes("\t")) return TreeNode.fromTsv(str)
    else if (line1.includes(",")) return TreeNode.fromCsv(str)
    else if (line1.includes("|")) return TreeNode.fromDelimited(str, "|")
    else if (line1.includes(";")) return TreeNode.fromDelimited(str, ";")
    // todo: add more robust. align with choose delimiter
    return TreeNode.fromSsv(str)
  }
  static deleteDuplicates = (node, prop1, prop2, reverse = false) => {
    const map = {}
    Disk.getAllOf(node, prop1).forEach(n => {
      const val = n.get(prop2)
      console.log(val)
      if (map[val] && reverse) {
        map[val].destroy()
        map[val] = n
      } else if (map[val]) {
        n.destroy()
      } else map[val] = n
    })
  }
  static getLastFolderName = path => {
    const parts = path.replace(/\/$/, "").split("/")
    const last = parts.pop()
    return fs.statSync(path).isDirectory() ? last : parts.pop()
  }
  static appendUniqueLine = (path, line) => {
    const file = Disk.read(path)
    if (file.match(new RegExp("^" + Disk.escape(line), "m"))) return true
    const prefix = !file || file.endsWith("\n") ? "" : "\n"
    return Disk.append(path, prefix + line + "\n")
  }
  static move = (node, newPosition) => {
    node.getParent().insertLineAndChildren(node.getLine(), node.childrenToString(), newPosition)
    node.destroy()
  }
  static _getTextUrl = async url => {
    // todo: https://visionmedia.github.io/superagent/
    // build well tested version of this.
    // have a mock server returning with all sorts of things.
    const res = await Disk.getUrl(url)
    // todo: leave it up to user to specfiy text ro body
    return res.body || res.text || ""
  }
  static getUrl = async url => {
    const superagent = require("superagent")
    const agent = superagent.agent()
    const res = await agent.get(url)
    return res
  }
  static download = async (url, destination) => {
    const result = await Disk._getTextUrl(url)
    Disk.write(destination, result)
  }
  static downloadPlain = async (url, destination) => {
    const result = await Disk.getUrl(url)
    Disk.write(destination, result.text)
  }
  static downloadJson = async (url, destination) => {
    const result = await Disk._getTextUrl(url)
    if (destination) Disk.writeJson(destination, result)
    return result
  }
  static buildMapFrom = (tree, key, value) => {
    const map = {}
    tree.forEach(child => {
      map[child.get(key)] = child.get(value)
    })
    return map
  }
  static csvToMap = (path, columnName) => {
    const tree = Disk.readCsvAsTree(path)
    const map = {}
    tree.forEach(child => {
      const key = child.get(columnName)
      map[key] = child.toObject()
    })
    return map
  }
}

export { Disk }
