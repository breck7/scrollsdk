const fs = require("fs").promises
const path = require("path")

import { particlesTypes } from "../products/particlesTypes"
const { Disk } = require("../products/Disk.node.js")
const { Utils } = require("../products/Utils.js")
const { Particle } = require("../products/Particle.js")
const { HandParsersProgram } = require("../products/Parsers.js")
const parsersParser = require("../products/parsers.nodejs.js")
const { posix } = require("../products/Path.js")

const PARSERS_EXTENSION = ".parsers"
const SCROLL_EXTENSION = ".scroll"

interface OpenedFile {
  absolutePath: particlesTypes.filepath
  content: string
  exists: boolean
  stats: any // https://nodejs.org/api/fs.html#class-fsstats
}

interface FusedFile {
  fused: string // codeWithoutImportsNorParserDefinitions
  footers: string[]
  importFilePaths: string[]
  isImportOnly: boolean
  parser?: particlesTypes.particle
  filepathsWithParserDefinitions: string[]
  exists: boolean
}

interface Storage {
  read(absolutePath: string): Promise<string>
  exists(absolutePath: string): Promise<boolean>
  list(absolutePath: string): Promise<string[]>
  write(absolutePath: string, content: string): Promise<void>
  getMTime(absolutePath: string): Promise<number>
  getCTime(absolutePath: string): Promise<number>
  dirname(absolutePath: string): string
  join(...absolutePath: string[]): string
}

// Add URL regex pattern
const urlRegex = /^https?:\/\/[^ ]+$/i
const parserRegex = /^[a-zA-Z0-9_]+Parser$/gm
const importRegex = /^(import |[a-zA-Z\_\-\.0-9\/]+\.(scroll|parsers)$|https?:\/\/.+\.(scroll|parsers)$)/gm
const importOnlyRegex = /^importOnly/

const isUrl = (path: string) => urlRegex.test(path)

// URL content cache with pending requests tracking
const urlCache: { [url: string]: { content: string; timestamp: number; exists: boolean } } = {}
const pendingRequests: { [url: string]: Promise<{ content: string; timestamp: number; exists: boolean }> } = {}

async function fetchWithCache(url: string) {
  const now = Date.now()
  const cached = urlCache[url]

  if (cached) return cached

  // If there's already a pending request for this URL, return that promise
  if (pendingRequests[url]) {
    return pendingRequests[url]
  }

  // Create new request and store in pending
  const requestPromise = (async () => {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const content = await response.text()

      const result = {
        content,
        timestamp: now,
        exists: true
      }

      urlCache[url] = result
      return result
    } catch (error) {
      console.error(`Error fetching ${url}:`, error)
      const result = {
        content: "",
        timestamp: now,
        exists: false
      }
      urlCache[url] = result
      return result
    } finally {
      delete pendingRequests[url]
    }
  })()

  pendingRequests[url] = requestPromise
  return requestPromise
}

class DiskWriter implements Storage {
  fileCache: { [filepath: string]: OpenedFile } = {}

  async _read(absolutePath: particlesTypes.filepath) {
    const { fileCache } = this
    if (isUrl(absolutePath)) {
      const result = await fetchWithCache(absolutePath)
      return {
        absolutePath,
        exists: result.exists,
        content: result.content,
        stats: { mtimeMs: Date.now(), ctimeMs: Date.now() }
      }
    }

    if (!fileCache[absolutePath]) {
      const exists = await fs
        .access(absolutePath)
        .then(() => true)
        .catch(() => false)
      if (exists) {
        const [content, stats] = await Promise.all([fs.readFile(absolutePath, "utf8").then(content => content.replace(/\r/g, "")), fs.stat(absolutePath)])
        fileCache[absolutePath] = { absolutePath, exists: true, content, stats }
      } else {
        fileCache[absolutePath] = { absolutePath, exists: false, content: "", stats: { mtimeMs: 0, ctimeMs: 0 } }
      }
    }
    return fileCache[absolutePath]
  }

  async exists(absolutePath: string) {
    if (isUrl(absolutePath)) {
      const result = await fetchWithCache(absolutePath)
      return result.exists
    }
    const file = await this._read(absolutePath)
    return file.exists
  }

  async read(absolutePath: string) {
    const file = await this._read(absolutePath)
    return file.content
  }

  async list(folder: string) {
    if (isUrl(folder)) {
      return [] // URLs don't support directory listing
    }
    return Disk.getFiles(folder)
  }

  async write(fullPath: string, content: string) {
    if (isUrl(fullPath)) {
      throw new Error("Cannot write to URL")
    }
    Disk.writeIfChanged(fullPath, content)
  }

  async getMTime(absolutePath: string) {
    if (isUrl(absolutePath)) {
      const cached = urlCache[absolutePath]
      return cached ? cached.timestamp : Date.now()
    }
    const file = await this._read(absolutePath)
    return file.stats.mtimeMs
  }

  async getCTime(absolutePath: string) {
    if (isUrl(absolutePath)) {
      const cached = urlCache[absolutePath]
      return cached ? cached.timestamp : Date.now()
    }
    const file = await this._read(absolutePath)
    return file.stats.ctimeMs
  }

  dirname(absolutePath: string) {
    if (isUrl(absolutePath)) {
      return absolutePath.substring(0, absolutePath.lastIndexOf("/"))
    }
    return path.dirname(absolutePath)
  }

  join(...segments: string[]) {
    const firstSegment = segments[0]
    if (isUrl(firstSegment)) {
      // For URLs, we need to handle joining differently
      const baseUrl = firstSegment.endsWith("/") ? firstSegment : firstSegment + "/"
      return new URL(segments.slice(1).join("/"), baseUrl).toString()
    }
    return path.join(...segments)
  }
}

// Update MemoryWriter to support URLs
class MemoryWriter implements Storage {
  constructor(inMemoryFiles: particlesTypes.diskMap) {
    this.inMemoryFiles = inMemoryFiles
  }

  inMemoryFiles: particlesTypes.diskMap

  async read(absolutePath: particlesTypes.filepath) {
    if (isUrl(absolutePath)) {
      const result = await fetchWithCache(absolutePath)
      return result.content
    }
    const value = this.inMemoryFiles[absolutePath]
    if (value === undefined) {
      return ""
    }
    return value
  }

  async exists(absolutePath: string) {
    if (isUrl(absolutePath)) {
      const result = await fetchWithCache(absolutePath)
      return result.exists
    }
    return this.inMemoryFiles[absolutePath] !== undefined
  }

  async write(absolutePath: particlesTypes.filepath, content: string) {
    if (isUrl(absolutePath)) {
      throw new Error("Cannot write to URL")
    }
    this.inMemoryFiles[absolutePath] = content
  }

  async list(absolutePath: particlesTypes.filepath) {
    if (isUrl(absolutePath)) {
      return []
    }
    return Object.keys(this.inMemoryFiles).filter(filePath => filePath.startsWith(absolutePath) && !filePath.replace(absolutePath, "").includes("/"))
  }

  async getMTime(absolutePath: string) {
    if (isUrl(absolutePath)) {
      const cached = urlCache[absolutePath]
      return cached ? cached.timestamp : Date.now()
    }
    return 1
  }

  async getCTime(absolutePath: string) {
    if (isUrl(absolutePath)) {
      const cached = urlCache[absolutePath]
      return cached ? cached.timestamp : Date.now()
    }
    return 1
  }

  dirname(path: string) {
    if (isUrl(path)) {
      return path.substring(0, path.lastIndexOf("/"))
    }
    return posix.dirname(path)
  }

  join(...segments: string[]) {
    const firstSegment = segments[0]
    if (isUrl(firstSegment)) {
      const baseUrl = firstSegment.endsWith("/") ? firstSegment : firstSegment + "/"
      return new URL(segments.slice(1).join("/"), baseUrl).toString()
    }
    return posix.join(...segments)
  }
}

class EmptyScrollParser extends Particle {
  evalMacros(fusionFile: any) {
    return fusionFile.fusedCode
  }
  setFile(fusionFile: any) {
    this.file = fusionFile
  }
}

class FusionFile {
  constructor(codeAtStart: string, absoluteFilePath = "", fileSystem = new Fusion({})) {
    this.fileSystem = fileSystem
    this.filePath = absoluteFilePath
    this.filename = posix.basename(absoluteFilePath)
    this.folderPath = posix.dirname(absoluteFilePath) + "/"
    this.codeAtStart = codeAtStart
    this.timeIndex = 0
    this.timestamp = 0
    this.importOnly = false
  }

  async readCodeFromStorage() {
    if (this.codeAtStart !== undefined) return this // Code provided
    const { filePath } = this
    if (!filePath) {
      this.codeAtStart = ""
      return this
    }
    this.codeAtStart = await this.fileSystem.read(filePath)
  }

  get isFused() {
    return this.fusedCode !== undefined
  }

  async fuse() {
    // PASS 1: READ FULL FILE
    await this.readCodeFromStorage()
    const { codeAtStart, fileSystem, filePath, defaultParserCode, defaultParser } = this
    // PASS 2: READ AND REPLACE IMPORTs
    let fusedCode = codeAtStart
    let fusedFile
    if (filePath) {
      this.timestamp = await fileSystem.getCTime(filePath)
      fusedFile = await fileSystem.fuseFile(filePath, defaultParserCode)
      this.importOnly = fusedFile.isImportOnly
      fusedCode = fusedFile.fused
      if (fusedFile.footers.length) fusedCode += "\n" + fusedFile.footers.join("\n")
      this.dependencies = fusedFile.importFilePaths
      this.fusedFile = fusedFile
    }
    this.fusedCode = fusedCode

    const tempProgram = new defaultParser()
    // PASS 3: READ AND REPLACE MACROS. PARSE AND REMOVE MACROS DEFINITIONS THEN REPLACE REFERENCES.
    const codeAfterMacroPass = tempProgram.evalMacros(this)
    this.codeAfterMacroPass = codeAfterMacroPass
    this.parser = fusedFile?.parser || defaultParser
    // PASS 4: PARSER WITH CUSTOM PARSER OR STANDARD SCROLL PARSER
    this.scrollProgram = new this.parser(codeAfterMacroPass)
    this.scrollProgram.setFile(this)
    return this
  }

  get formatted() {
    return this.codeAtStart
  }

  async formatAndSave() {
    const { codeAtStart, formatted } = this
    if (codeAtStart === formatted) return false
    await this.fileSystem.write(this.filePath, formatted)
    return true
  }

  defaultParserCode = ""
  defaultParser = EmptyScrollParser
}
let fusionIdNumber = 0
class Fusion implements Storage {
  constructor(inMemoryFiles: particlesTypes.diskMap) {
    if (inMemoryFiles) this._storage = new MemoryWriter(inMemoryFiles)
    else this._storage = new DiskWriter()
    fusionIdNumber = fusionIdNumber + 1
    this.fusionId = fusionIdNumber
  }

  async read(absolutePath: particlesTypes.filepath) {
    return await this._storage.read(absolutePath)
  }

  async exists(absolutePath: particlesTypes.filepath) {
    return await this._storage.exists(absolutePath)
  }

  async write(absolutePath: particlesTypes.filepath, content: string) {
    return await this._storage.write(absolutePath, content)
  }

  async list(absolutePath: particlesTypes.filepath) {
    return await this._storage.list(absolutePath)
  }

  dirname(absolutePath: string) {
    return this._storage.dirname(absolutePath)
  }

  join(...segments: string[]) {
    return this._storage.join(...segments)
  }

  async getMTime(absolutePath: string) {
    return await this._storage.getMTime(absolutePath)
  }

  async getCTime(absolutePath: string) {
    return await this._storage.getCTime(absolutePath)
  }

  productCache = {}
  async writeProduct(absolutePath, content) {
    this.productCache[absolutePath] = content
    return await this.write(absolutePath, content)
  }

  private _storage: Storage
  private _particleCache: { [filepath: string]: typeof Particle } = {}
  private _parserCache: { [concatenatedFilepaths: string]: any } = {}
  private _expandedImportCache: { [filepath: string]: FusedFile } = {}
  private _parsersExpandersCache: { [filepath: string]: boolean } = {}

  private async _getFileAsParticles(absoluteFilePathOrUrl: string) {
    const { _particleCache } = this
    if (_particleCache[absoluteFilePathOrUrl] === undefined) {
      const content = await this._storage.read(absoluteFilePathOrUrl)
      _particleCache[absoluteFilePathOrUrl] = new Particle(content)
    }
    return _particleCache[absoluteFilePathOrUrl]
  }

  private async _fuseFile(absoluteFilePathOrUrl: string): Promise<FusedFile> {
    const { _expandedImportCache } = this
    if (_expandedImportCache[absoluteFilePathOrUrl]) return _expandedImportCache[absoluteFilePathOrUrl]

    const [code, exists] = await Promise.all([this.read(absoluteFilePathOrUrl), this.exists(absoluteFilePathOrUrl)])

    const isImportOnly = importOnlyRegex.test(code)

    // Perf hack
    // If its a parsers file, it will have no content, just parsers (and maybe imports).
    // The parsers will already have been processed. We can skip them
    const stripParsers = absoluteFilePathOrUrl.endsWith(PARSERS_EXTENSION)
    const processedCode = stripParsers
      ? code
          .split("\n")
          .filter(line => importRegex.test(line))
          .join("\n")
      : code

    const filepathsWithParserDefinitions = []
    if (await this._doesFileHaveParsersDefinitions(absoluteFilePathOrUrl)) {
      filepathsWithParserDefinitions.push(absoluteFilePathOrUrl)
    }

    if (!importRegex.test(processedCode)) {
      return {
        fused: processedCode,
        footers: [],
        isImportOnly,
        importFilePaths: [],
        filepathsWithParserDefinitions,
        exists
      }
    }

    const particle = new Particle(processedCode)
    const folder = this.dirname(absoluteFilePathOrUrl)

    // Fetch all imports in parallel
    const importParticles = particle.filter(particle => particle.getLine().match(importRegex))
    const importResults = importParticles.map(async importParticle => {
      const rawPath = importParticle.getLine().replace("import ", "")
      let absoluteImportFilePath = this.join(folder, rawPath)
      if (isUrl(rawPath)) absoluteImportFilePath = rawPath
      else if (isUrl(folder)) absoluteImportFilePath = folder + "/" + rawPath

      // todo: race conditions
      const [expandedFile, exists] = await Promise.all([this._fuseFile(absoluteImportFilePath), this.exists(absoluteImportFilePath)])
      return {
        expandedFile,
        exists,
        absoluteImportFilePath,
        importParticle
      }
    })

    const imported = await Promise.all(importResults)

    // Assemble all imports
    let importFilePaths: string[] = []
    let footers: string[] = []
    imported.forEach(importResults => {
      const { importParticle, absoluteImportFilePath, expandedFile, exists } = importResults
      importFilePaths.push(absoluteImportFilePath)
      importFilePaths = importFilePaths.concat(expandedFile.importFilePaths)

      importParticle.setLine("imported " + absoluteImportFilePath)
      importParticle.set("exists", `${exists}`)

      footers = footers.concat(expandedFile.footers)
      if (importParticle.has("footer")) footers.push(expandedFile.fused)
      else importParticle.insertLinesAfter(expandedFile.fused)
    })

    const existStates = await Promise.all(importFilePaths.map(file => this.exists(file)))

    const allImportsExist = !existStates.some(exists => !exists)

    _expandedImportCache[absoluteFilePathOrUrl] = {
      importFilePaths,
      isImportOnly,
      fused: particle.toString(),
      footers,
      exists: allImportsExist,
      filepathsWithParserDefinitions: (
        await Promise.all(
          importFilePaths.map(async filename => ({
            filename,
            hasParser: await this._doesFileHaveParsersDefinitions(filename)
          }))
        )
      )
        .filter(result => result.hasParser)
        .map(result => result.filename)
        .concat(filepathsWithParserDefinitions)
    }

    return _expandedImportCache[absoluteFilePathOrUrl]
  }

  private async _doesFileHaveParsersDefinitions(absoluteFilePathOrUrl: particlesTypes.filepath) {
    if (!absoluteFilePathOrUrl) return false
    const { _parsersExpandersCache } = this
    if (_parsersExpandersCache[absoluteFilePathOrUrl] === undefined) {
      const content = await this._storage.read(absoluteFilePathOrUrl)
      _parsersExpandersCache[absoluteFilePathOrUrl] = !!content.match(parserRegex)
    }
    return _parsersExpandersCache[absoluteFilePathOrUrl]
  }

  private async _getOneParsersParserFromFiles(filePaths: string[], baseParsersCode: string) {
    const fileContents = await Promise.all(filePaths.map(async filePath => await this._storage.read(filePath)))
    return Fusion.combineParsers(filePaths, fileContents, baseParsersCode)
  }

  async getParser(filePaths: string[], baseParsersCode = "") {
    const { _parserCache } = this
    const key = filePaths
      .filter(fp => fp)
      .sort()
      .join("\n")

    const hit = _parserCache[key]
    if (hit) return hit

    _parserCache[key] = await this._getOneParsersParserFromFiles(filePaths, baseParsersCode)
    return _parserCache[key]
  }

  static combineParsers(filePaths: string[], fileContents: string[], baseParsersCode = "") {
    const parserDefinitionRegex = /^[a-zA-Z0-9_]+Parser$/
    const atomDefinitionRegex = /^[a-zA-Z0-9_]+Atom/

    const mapped = fileContents.map((content, index) => {
      const filePath = filePaths[index]
      if (filePath.endsWith(PARSERS_EXTENSION)) return content

      return new Particle(content)
        .filter((particle: particlesTypes.particle) => particle.getLine().match(parserDefinitionRegex) || particle.getLine().match(atomDefinitionRegex))
        .map((particle: particlesTypes.particle) => particle.asString)
        .join("\n")
    })

    const asOneFile = mapped.join("\n").trim()
    const sorted = new parsersParser(baseParsersCode + "\n" + asOneFile)._sortParticlesByInScopeOrder()._sortWithParentParsersUpTop()
    const parsersCode = sorted.asString
    return {
      parsersParser: sorted,
      parsersCode,
      parser: new HandParsersProgram(parsersCode).compileAndReturnRootParser()
    }
  }

  get parsers() {
    return Object.values(this._parserCache).map(parser => parser.parsersParser)
  }

  async fuseFile(absoluteFilePathOrUrl: string, defaultParserCode?: string): Promise<FusedFile> {
    const fusedFile = await this._fuseFile(absoluteFilePathOrUrl)

    if (!defaultParserCode) return fusedFile

    if (fusedFile.filepathsWithParserDefinitions.length) {
      const parser = await this.getParser(fusedFile.filepathsWithParserDefinitions, defaultParserCode)
      fusedFile.parser = parser.parser
    }
    return fusedFile
  }

  defaultFileClass = FusionFile
  async getLoadedFile(filePath) {
    return await this._getLoadedFile(filePath, this.defaultFileClass)
  }

  parsedFiles = {}
  async _getLoadedFile(absolutePath, parser) {
    if (this.parsedFiles[absolutePath]) return this.parsedFiles[absolutePath]
    const file = new parser(undefined, absolutePath, this)
    await file.fuse()
    this.parsedFiles[absolutePath] = file
    return file
  }

  getCachedLoadedFilesInFolder(folderPath, requester) {
    folderPath = Utils.ensureFolderEndsInSlash(folderPath)
    const hit = this.folderCache[folderPath]
    if (!hit) console.log(`Warning: '${folderPath}' not yet loaded in '${this.fusionId}'. Requested by '${requester.filePath}'`)
    return hit || []
  }

  folderCache = {}
  async getLoadedFilesInFolder(folderPath, extension) {
    folderPath = Utils.ensureFolderEndsInSlash(folderPath)
    if (this.folderCache[folderPath]) return this.folderCache[folderPath]
    const allFiles = await this.list(folderPath)
    const loadedFiles = await Promise.all(allFiles.filter(file => file.endsWith(extension)).map(filePath => this.getLoadedFile(filePath)))
    const sorted = loadedFiles.sort((a, b) => b.timestamp - a.timestamp)
    sorted.forEach((file, index) => (file.timeIndex = index))
    this.folderCache[folderPath] = sorted
    return this.folderCache[folderPath]
  }
}

export { Fusion, FusionFile }
