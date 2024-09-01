const fs = require("fs")
const path = require("path")

import { particlesTypes } from "../products/particlesTypes"

class Disk {
  static getParticle = () => require("../products/Particle.js").Particle // todo: cleanup
  static rm = (path: particlesTypes.filepath) => fs.unlinkSync(path)
  static getCleanedString = (str: string) => str.replace(/[\,\t\n]/g, " ")
  static makeExecutable = (path: particlesTypes.filepath) => fs.chmodSync(path, 0o755)
  static strCount = (str: string, reg: string) => (str.match(new RegExp(reg, "gi")) || []).length
  static read = (path: particlesTypes.filepath) => {
    try {
      return fs.readFileSync(path, "utf8")
    } catch (err) {
      console.error(`Error reading '$path'`)
      throw err
    }
  }
  static touch = (path: particlesTypes.filepath) => (Disk.exists(path) ? true : Disk.write(path, ""))
  static copy = (source: particlesTypes.filepath, destination: particlesTypes.filepath) => Disk.write(destination, Disk.read(source))
  static mkdir = (path: particlesTypes.filepath) => fs.mkdirSync(path, { recursive: true })
  static getRecursive = (path: particlesTypes.filepath) => Disk.recursiveReaddirSyncSimple(path)
  static readJson = (path: particlesTypes.filepath) => JSON.parse(Disk.read(path))
  static getFileNameWithoutExtension = (filepath: particlesTypes.filepath) => path.parse(filepath).name
  static write = (path: particlesTypes.filepath, content: string) => fs.writeFileSync(path, content, "utf8")
  // Do not overwrite to preserve mtimes for cache
  static writeIfChanged = (filepath: string, content: string) => {
    if (!Disk.exists(filepath) || Disk.read(filepath) !== content) Disk.write(filepath, content)
  }
  static writeJson = (path: particlesTypes.filepath, content: any) => fs.writeFileSync(path, JSON.stringify(content, null, 2), "utf8")
  static createFileIfDoesNotExist = (path: particlesTypes.filepath, initialString = "") => {
    if (!fs.existsSync(path)) Disk.write(path, initialString)
  }
  static exists = (path: particlesTypes.filepath) => fs.existsSync(path)
  static dir = (dir: particlesTypes.absoluteFolderPath) => fs.readdirSync(dir).filter((file: particlesTypes.filepath) => file !== ".DS_Store")
  static getFullPaths = (dir: particlesTypes.absoluteFolderPath) => Disk.dir(dir).map((file: particlesTypes.filepath) => path.join(dir, file))
  static getFiles = (dir: particlesTypes.absoluteFolderPath) => Disk.getFullPaths(dir).filter((file: particlesTypes.filepath) => fs.statSync(file).isFile())
  static getFolders = (dir: particlesTypes.absoluteFolderPath) => Disk.getFullPaths(dir).filter((file: particlesTypes.filepath) => fs.statSync(file).isDirectory())
  static isDir = (path: particlesTypes.absoluteFilePath) => fs.statSync(path).isDirectory()
  static getFileName = (fileName: particlesTypes.filepath) => path.parse(fileName).base
  static append = (path: particlesTypes.filepath, content: string) => fs.appendFileSync(path, content, "utf8")
  static appendAsync = (path: particlesTypes.filepath, content: string, callback: Function) => fs.appendFile(path, content, "utf8", callback)
  static readCsvAsParticles = (path: particlesTypes.filepath) => Disk.getParticle().fromCsv(Disk.read(path))
  static readSsvAsParticles = (path: particlesTypes.filepath) => Disk.getParticle().fromSsv(Disk.read(path))
  static readTsvAsParticles = (path: particlesTypes.filepath) => Disk.getParticle().fromTsv(Disk.read(path))
  static insertIntoFile = (path: particlesTypes.filepath, content: string, delimiter: string) => Disk.write(path, Disk.stickBetween(content, Disk.read(path), delimiter))
  static detectAndReadAsParticles = (path: particlesTypes.filepath) => Disk.detectDelimiterAndReadAsParticles(Disk.read(path))
  static getAllOf = (particle: particlesTypes.particle, prop: string) => particle.filter((particle: particlesTypes.particle) => particle.getWord(0) === prop)
  static getDelimitedChildrenAsParticles = (particle: particlesTypes.particle, delimiter: string = undefined) => Disk.detectDelimiterAndReadAsParticles(particle.childrenToString())
  static sleep = (ms: particlesTypes.int) => new Promise(resolve => setTimeout(resolve, ms))
  static readParticles = (path: particlesTypes.filepath) => new (Disk.getParticle())(Disk.read(path))
  static sizeOf = (path: particlesTypes.filepath) => fs.statSync(path).size
  static stripHtml = (text: string) => (text && text.replace ? text.replace(/<(?:.|\n)*?>/gm, "") : text)
  static stripParentheticals = (text: string) => (text && text.replace ? text.replace(/\((?:.|\n)*?\)/gm, "") : text)
  static escape = (str: string) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
  static hasLine = (path: particlesTypes.filepath, line: string) => Disk.read(path).includes(line)
  static mv = (source: particlesTypes.filepath, dest: particlesTypes.filepath) => {
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
  static deleteDuplicates = (particle: particlesTypes.particle, prop1: any, prop2: any, reverse = false) => {
    const map: any = {}
    Disk.getAllOf(particle, prop1).forEach((particle: particlesTypes.particle) => {
      const val = particle.get(prop2)
      console.log(val)
      if (map[val] && reverse) {
        map[val].destroy()
        map[val] = particle
      } else if (map[val]) {
        particle.destroy()
      } else map[val] = particle
    })
  }
  // todo: remove.
  static getLastFolderName = (path: particlesTypes.filepath) => {
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
  static move = (particle: particlesTypes.particle, newPosition: particlesTypes.int) => {
    particle.parent.insertLineAndChildren(particle.getLine(), particle.childrenToString(), newPosition)
    particle.destroy()
  }
  static _getTextUrl = async (url: particlesTypes.url) => {
    // todo: https://visionmedia.github.io/superagent/
    // build well tested version of this.
    // have a mock server returning with all sorts of things.
    const res = await Disk.getUrl(url)
    // todo: leave it up to user to specfiy text ro body
    return res.body || res.text || ""
  }
  static getUrl = async (url: particlesTypes.url) => {
    const superagent = require("superagent")
    const agent = superagent.agent()
    const res = await agent.get(url)
    return res
  }
  static download = async (url: particlesTypes.url, destination: particlesTypes.filepath) => {
    const result = await Disk._getTextUrl(url)
    Disk.write(destination, result)
  }
  static downloadPlain = async (url: particlesTypes.url, destination: particlesTypes.filepath) => {
    const result = await Disk.getUrl(url)
    Disk.write(destination, result.text)
  }
  static downloadJson = async (url: particlesTypes.url, destination: particlesTypes.filepath) => {
    const result = await Disk._getTextUrl(url)
    if (destination) Disk.writeJson(destination, result)
    return result
  }
  static buildMapFrom = (particle: particlesTypes.particle, key: string, value: string) => {
    const map: particlesTypes.stringMap = {}
    particle.forEach((child: particlesTypes.particle) => {
      map[child.get(key)] = child.get(value)
    })
    return map
  }
  static csvToMap = (path: string, columnName: string) => {
    const particle = Disk.readCsvAsParticles(path)
    const map: particlesTypes.stringMap = {}
    particle.forEach((child: particlesTypes.particle) => {
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
