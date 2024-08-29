const fs = require("fs")
const path = require("path")

import { scrollNotationTypes } from "../products/scrollNotationTypes"

class Disk {
  static getParticle = () => require("../products/Particle.js").Particle // todo: cleanup
  static rm = (path: scrollNotationTypes.filepath) => fs.unlinkSync(path)
  static getCleanedString = (str: string) => str.replace(/[\,\t\n]/g, " ")
  static makeExecutable = (path: scrollNotationTypes.filepath) => fs.chmodSync(path, 0o755)
  static strCount = (str: string, reg: string) => (str.match(new RegExp(reg, "gi")) || []).length
  static read = (path: scrollNotationTypes.filepath) => {
    try {
      return fs.readFileSync(path, "utf8")
    } catch (err) {
      console.error(`Error reading '$path'`)
      throw err
    }
  }
  static touch = (path: scrollNotationTypes.filepath) => (Disk.exists(path) ? true : Disk.write(path, ""))
  static copy = (source: scrollNotationTypes.filepath, destination: scrollNotationTypes.filepath) => Disk.write(destination, Disk.read(source))
  static mkdir = (path: scrollNotationTypes.filepath) => fs.mkdirSync(path, { recursive: true })
  static getRecursive = (path: scrollNotationTypes.filepath) => Disk.recursiveReaddirSyncSimple(path)
  static readJson = (path: scrollNotationTypes.filepath) => JSON.parse(Disk.read(path))
  static getFileNameWithoutExtension = (filepath: scrollNotationTypes.filepath) => path.parse(filepath).name
  static write = (path: scrollNotationTypes.filepath, content: string) => fs.writeFileSync(path, content, "utf8")
  // Do not overwrite to preserve mtimes for cache
  static writeIfChanged = (filepath: string, content: string) => {
    if (!Disk.exists(filepath) || Disk.read(filepath) !== content) Disk.write(filepath, content)
  }
  static writeJson = (path: scrollNotationTypes.filepath, content: any) => fs.writeFileSync(path, JSON.stringify(content, null, 2), "utf8")
  static createFileIfDoesNotExist = (path: scrollNotationTypes.filepath, initialString = "") => {
    if (!fs.existsSync(path)) Disk.write(path, initialString)
  }
  static exists = (path: scrollNotationTypes.filepath) => fs.existsSync(path)
  static dir = (dir: scrollNotationTypes.absoluteFolderPath) => fs.readdirSync(dir).filter((file: scrollNotationTypes.filepath) => file !== ".DS_Store")
  static getFullPaths = (dir: scrollNotationTypes.absoluteFolderPath) => Disk.dir(dir).map((file: scrollNotationTypes.filepath) => path.join(dir, file))
  static getFiles = (dir: scrollNotationTypes.absoluteFolderPath) => Disk.getFullPaths(dir).filter((file: scrollNotationTypes.filepath) => fs.statSync(file).isFile())
  static getFolders = (dir: scrollNotationTypes.absoluteFolderPath) => Disk.getFullPaths(dir).filter((file: scrollNotationTypes.filepath) => fs.statSync(file).isDirectory())
  static isDir = (path: scrollNotationTypes.absoluteFilePath) => fs.statSync(path).isDirectory()
  static getFileName = (fileName: scrollNotationTypes.filepath) => path.parse(fileName).base
  static append = (path: scrollNotationTypes.filepath, content: string) => fs.appendFileSync(path, content, "utf8")
  static appendAsync = (path: scrollNotationTypes.filepath, content: string, callback: Function) => fs.appendFile(path, content, "utf8", callback)
  static readCsvAsParticles = (path: scrollNotationTypes.filepath) => Disk.getParticle().fromCsv(Disk.read(path))
  static readSsvAsParticles = (path: scrollNotationTypes.filepath) => Disk.getParticle().fromSsv(Disk.read(path))
  static readTsvAsParticles = (path: scrollNotationTypes.filepath) => Disk.getParticle().fromTsv(Disk.read(path))
  static insertIntoFile = (path: scrollNotationTypes.filepath, content: string, delimiter: string) => Disk.write(path, Disk.stickBetween(content, Disk.read(path), delimiter))
  static detectAndReadAsParticles = (path: scrollNotationTypes.filepath) => Disk.detectDelimiterAndReadAsParticles(Disk.read(path))
  static getAllOf = (node: scrollNotationTypes.particle, prop: string) => node.filter((node: scrollNotationTypes.particle) => node.getWord(0) === prop)
  static getDelimitedChildrenAsParticles = (node: scrollNotationTypes.particle, delimiter: string = undefined) => Disk.detectDelimiterAndReadAsParticles(node.childrenToString())
  static sleep = (ms: scrollNotationTypes.int) => new Promise(resolve => setTimeout(resolve, ms))
  static readParticles = (path: scrollNotationTypes.filepath) => new (Disk.getParticle())(Disk.read(path))
  static sizeOf = (path: scrollNotationTypes.filepath) => fs.statSync(path).size
  static stripHtml = (text: string) => (text && text.replace ? text.replace(/<(?:.|\n)*?>/gm, "") : text)
  static stripParentheticals = (text: string) => (text && text.replace ? text.replace(/\((?:.|\n)*?\)/gm, "") : text)
  static escape = (str: string) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
  static hasLine = (path: scrollNotationTypes.filepath, line: string) => Disk.read(path).includes(line)
  static mv = (source: scrollNotationTypes.filepath, dest: scrollNotationTypes.filepath) => {
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
  // todo: move to particle base class
  static detectDelimiterAndReadAsParticles = (str: string) => {
    const line1 = str.split("\n")[0]
    const Particle = Disk.getParticle()
    if (line1.includes("\t")) return Particle.fromTsv(str)
    else if (line1.includes(",")) return Particle.fromCsv(str)
    else if (line1.includes("|")) return Particle.fromDelimited(str, "|")
    else if (line1.includes(";")) return Particle.fromDelimited(str, ";")
    // todo: add more robust. align with choose delimiter
    return Particle.fromSsv(str)
  }
  static deleteDuplicates = (node: scrollNotationTypes.particle, prop1: any, prop2: any, reverse = false) => {
    const map: any = {}
    Disk.getAllOf(node, prop1).forEach((node: scrollNotationTypes.particle) => {
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
  static getLastFolderName = (path: scrollNotationTypes.filepath) => {
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
  static move = (node: scrollNotationTypes.particle, newPosition: scrollNotationTypes.int) => {
    node.parent.insertLineAndChildren(node.getLine(), node.childrenToString(), newPosition)
    node.destroy()
  }
  static _getTextUrl = async (url: scrollNotationTypes.url) => {
    // todo: https://visionmedia.github.io/superagent/
    // build well tested version of this.
    // have a mock server returning with all sorts of things.
    const res = await Disk.getUrl(url)
    // todo: leave it up to user to specfiy text ro body
    return res.body || res.text || ""
  }
  static getUrl = async (url: scrollNotationTypes.url) => {
    const superagent = require("superagent")
    const agent = superagent.agent()
    const res = await agent.get(url)
    return res
  }
  static download = async (url: scrollNotationTypes.url, destination: scrollNotationTypes.filepath) => {
    const result = await Disk._getTextUrl(url)
    Disk.write(destination, result)
  }
  static downloadPlain = async (url: scrollNotationTypes.url, destination: scrollNotationTypes.filepath) => {
    const result = await Disk.getUrl(url)
    Disk.write(destination, result.text)
  }
  static downloadJson = async (url: scrollNotationTypes.url, destination: scrollNotationTypes.filepath) => {
    const result = await Disk._getTextUrl(url)
    if (destination) Disk.writeJson(destination, result)
    return result
  }
  static buildMapFrom = (particle: scrollNotationTypes.particle, key: string, value: string) => {
    const map: scrollNotationTypes.stringMap = {}
    particle.forEach((child: scrollNotationTypes.particle) => {
      map[child.get(key)] = child.get(value)
    })
    return map
  }
  static csvToMap = (path: string, columnName: string) => {
    const particle = Disk.readCsvAsParticles(path)
    const map: scrollNotationTypes.stringMap = {}
    particle.forEach((child: scrollNotationTypes.particle) => {
      const key = child.get(columnName)
      map[key] = child.toObject()
    })
    return map
  }
  /**
   * Take an object like {".gitignore" : "ignore/", "parsers/root.parsers": "foo"}
   * and recreate on the filesystem as files and folders. Each key is 1 file.
   * */
  static writeObjectToDisk = (baseFolder: string, obj: any) => {
    Object.keys(obj).forEach(filename => {
      const filePath = path.join(baseFolder, filename)
      if (filename.includes("/")) Disk.mkdir(path.dirname(filePath))
      if (!fs.existsSync(filePath)) Disk.writeIfChanged(filePath, obj[filename])
    })
  }

  static recursiveReaddirSyncSimple = (filepath: string) => {
    let list: string[] = []
    const files = fs.readdirSync(filepath)
    let stats

    files.forEach(function (file: any) {
      stats = fs.lstatSync(path.join(filepath, file))
      if (stats.isDirectory()) list = list.concat(Disk.recursiveReaddirSyncSimple(path.join(filepath, file)))
      else list.push(path.join(filepath, file))
    })

    return list
  }
  static recursiveReaddirSync = (folder: string, callback: any) =>
    fs.readdirSync(folder).forEach((filename: string) => {
      try {
        const fullPath = path.join(folder, filename)
        const isDir = fs.lstatSync(fullPath).isDirectory()
        if (filename.includes("node_modules")) return // Do not recurse into node_modules folders
        if (isDir) Disk.recursiveReaddirSync(fullPath, callback)
        else callback(fullPath)
      } catch (err) {
        // Ignore errors
      }
    })
}

export { Disk }
