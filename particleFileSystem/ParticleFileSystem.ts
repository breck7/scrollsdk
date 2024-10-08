const fs = require("fs")
const path = require("path")

import { particlesTypes } from "../products/particlesTypes"
const { Disk } = require("../products/Disk.node.js")
const { Utils } = require("../products/Utils.js")
const { Particle } = require("../products/Particle.js")
const { HandParsersProgram } = require("../products/Parsers.js")
const parsersParser = require("../products/parsers.nodejs.js")
const { posix } = require("../products/Path.js")

const PARSERS_EXTENSION = ".parsers"

interface OpenedFile {
  absolutePath: particlesTypes.filepath
  content: string
  stats: any // https://nodejs.org/api/fs.html#class-fsstats
}

interface AssembledFile {
  afterImportPass: string // codeWithoutImportsNorParserDefinitions
  importFilePaths: string[]
  isImportOnly: boolean
  parser?: particlesTypes.particle
  filepathsWithParserDefinitions: string[]
}

interface Storage {
  read(absolutePath: string): string
  list(absolutePath: string): string[]
  write(absolutePath: string, content: string): void
  getMTime(absolutePath: string): number
  getCTime(absolutePath: string): number
  dirname(absolutePath: string): string
  join(...absolutePath: string[]): string
}

const parserRegex = /^[a-zA-Z0-9_]+Parser/gm
// A regex to check if a multiline string has an import line.
const importRegex = /^(import |[a-zA-Z\_\-\.0-9\/]+\.(scroll|parsers)$)/gm
const importOnlyRegex = /^importOnly/

class DiskWriter implements Storage {
  fileCache: { [filepath: string]: OpenedFile } = {}
  _read(absolutePath: particlesTypes.filepath) {
    const { fileCache } = this
    if (!fileCache[absolutePath]) fileCache[absolutePath] = { absolutePath, content: Disk.read(absolutePath).replace(/\r/g, ""), stats: fs.statSync(absolutePath) }
    return fileCache[absolutePath]
  }

  read(absolutePath: string) {
    return this._read(absolutePath).content
  }

  list(folder: string) {
    return Disk.getFiles(folder)
  }

  write(fullPath: string, content: string) {
    Disk.writeIfChanged(fullPath, content)
  }

  getMTime(absolutePath: string) {
    return this._read(absolutePath).stats.mtimeMs
  }

  getCTime(absolutePath: string) {
    return this._read(absolutePath).stats.ctimeMs
  }

  dirname(absolutePath: string) {
    return path.dirname(absolutePath)
  }

  join(...segments: string[]) {
    return path.join(...arguments)
  }
}

class MemoryWriter implements Storage {
  constructor(inMemoryFiles: particlesTypes.diskMap) {
    this.inMemoryFiles = inMemoryFiles
  }

  inMemoryFiles: particlesTypes.diskMap

  read(absolutePath: particlesTypes.filepath) {
    const value = this.inMemoryFiles[absolutePath]
    if (value === undefined) throw new Error(`File '${absolutePath}' not found.`)
    return value
  }

  write(absolutePath: particlesTypes.filepath, content: string) {
    this.inMemoryFiles[absolutePath] = content
  }

  list(absolutePath: particlesTypes.filepath) {
    return Object.keys(this.inMemoryFiles).filter(filePath => filePath.startsWith(absolutePath) && !filePath.replace(absolutePath, "").includes("/"))
  }

  getMTime() {
    return 1
  }

  getCTime() {
    return 1
  }

  dirname(path: string) {
    return posix.dirname(path)
  }

  join(...segments: string[]) {
    return posix.join(...arguments)
  }
}

class ParticleFileSystem implements Storage {
  constructor(inMemoryFiles: particlesTypes.diskMap) {
    if (inMemoryFiles) this._storage = new MemoryWriter(inMemoryFiles)
    else this._storage = new DiskWriter()
  }

  read(absolutePath: particlesTypes.filepath) {
    return this._storage.read(absolutePath)
  }

  write(absolutePath: particlesTypes.filepath, content: string) {
    return this._storage.write(absolutePath, content)
  }

  list(absolutePath: particlesTypes.filepath) {
    return this._storage.list(absolutePath)
  }

  dirname(absolutePath: string) {
    return this._storage.dirname(absolutePath)
  }

  join(...segments: string[]) {
    return this._storage.join(...segments)
  }

  getMTime(absolutePath: string) {
    return this._storage.getMTime(absolutePath)
  }

  getCTime(absolutePath: string) {
    return this._storage.getMTime(absolutePath)
  }

  private _storage: Storage
  private _particleCache: { [filepath: string]: typeof Particle } = {}
  private _parserCache: { [concatenatedFilepaths: string]: any } = {}
  private _expandedImportCache: { [filepath: string]: AssembledFile } = {}
  private _parsersExpandersCache: { [filepath: string]: boolean } = {}

  private _getFileAsParticles(absoluteFilePath: string) {
    const { _particleCache } = this
    if (_particleCache[absoluteFilePath] === undefined) {
      _particleCache[absoluteFilePath] = new Particle(this._storage.read(absoluteFilePath))
    }
    return _particleCache[absoluteFilePath]
  }

  private _assembleFile(absoluteFilePath: string) {
    const { _expandedImportCache } = this
    if (_expandedImportCache[absoluteFilePath]) return _expandedImportCache[absoluteFilePath]

    let code = this.read(absoluteFilePath)

    const isImportOnly = importOnlyRegex.test(code)

    // Perf hack
    // If its a parsers file, it will have no content, just parsers (and maybe imports).
    // The parsers will already have been processed. We can skip them
    const stripParsers = absoluteFilePath.endsWith(PARSERS_EXTENSION)
    if (stripParsers)
      code = code
        .split("\n")
        .filter(line => importRegex.test(line))
        .join("\n")

    const filepathsWithParserDefinitions = []
    if (this._doesFileHaveParsersDefinitions(absoluteFilePath)) filepathsWithParserDefinitions.push(absoluteFilePath)

    if (!importRegex.test(code))
      return <AssembledFile>{
        afterImportPass: code,
        isImportOnly,
        importFilePaths: [],
        filepathsWithParserDefinitions
      }

    let importFilePaths: string[] = []
    const lines = code.split("\n")
    const replacements: { lineNumber: number; code: string }[] = []
    lines.forEach((line, lineNumber) => {
      const folder = this.dirname(absoluteFilePath)
      if (line.match(importRegex)) {
        const relativeFilePath = line.replace("import ", "")
        const absoluteImportFilePath = this.join(folder, relativeFilePath)
        const expandedFile = this._assembleFile(absoluteImportFilePath)
        importFilePaths.push(absoluteImportFilePath)
        importFilePaths = importFilePaths.concat(expandedFile.importFilePaths)

        replacements.push({ lineNumber, code: expandedFile.afterImportPass })
      }
    })

    replacements.forEach(replacement => {
      const { lineNumber, code } = replacement
      lines[lineNumber] = code
    })

    const combinedLines = lines.join("\n")

    _expandedImportCache[absoluteFilePath] = {
      importFilePaths,
      isImportOnly,
      afterImportPass: combinedLines,
      filepathsWithParserDefinitions: importFilePaths.filter((filename: string) => this._doesFileHaveParsersDefinitions(filename)).concat(filepathsWithParserDefinitions)
    }

    return _expandedImportCache[absoluteFilePath]
  }

  private _doesFileHaveParsersDefinitions(absoluteFilePath: particlesTypes.filepath) {
    if (!absoluteFilePath) return false
    const { _parsersExpandersCache } = this
    if (_parsersExpandersCache[absoluteFilePath] === undefined) _parsersExpandersCache[absoluteFilePath] = !!this._storage.read(absoluteFilePath).match(parserRegex)

    return _parsersExpandersCache[absoluteFilePath]
  }

  private _getOneParsersParserFromFiles(filePaths: string[], baseParsersCode: string) {
    const parserDefinitionRegex = /^[a-zA-Z0-9_]+Parser/
    const atomDefinitionRegex = /^[a-zA-Z0-9_]+Atom/
    const asOneFile = filePaths
      .map(filePath => {
        const content = this._storage.read(filePath)
        if (filePath.endsWith(PARSERS_EXTENSION)) return content
        // Strip scroll content
        return new Particle(content)
          .filter((particle: particlesTypes.particle) => particle.getLine().match(parserDefinitionRegex) || particle.getLine().match(atomDefinitionRegex))
          .map((particle: particlesTypes.particle) => particle.asString)
          .join("\n")
      })
      .join("\n")
      .trim()

    // todo: clean up scrollsdk so we are using supported methods (perhaps add a formatOptions that allows you to tell Parsers not to run prettier on js particles)
    return new parsersParser(baseParsersCode + "\n" + asOneFile)._sortParticlesByInScopeOrder()._sortWithParentParsersUpTop()
  }

  get parsers() {
    return Object.values(this._parserCache).map(parser => parser.parsersParser)
  }

  getParser(filePaths: string[], baseParsersCode = "") {
    const { _parserCache } = this
    const key = filePaths
      .filter(fp => fp)
      .sort()
      .join("\n")
    const hit = _parserCache[key]
    if (hit) return hit
    const parsersParser = this._getOneParsersParserFromFiles(filePaths, baseParsersCode)
    const parsersCode = parsersParser.asString
    _parserCache[key] = {
      parsersParser,
      parsersCode,
      parser: new HandParsersProgram(parsersCode).compileAndReturnRootParser()
    }
    return _parserCache[key]
  }

  assembleFile(absoluteFilePath: string, defaultParserCode?: string): AssembledFile {
    const assembledFile = this._assembleFile(absoluteFilePath)

    if (!defaultParserCode) return assembledFile

    // BUILD CUSTOM COMPILER, IF THERE ARE CUSTOM PARSERS NODES DEFINED
    if (assembledFile.filepathsWithParserDefinitions.length) assembledFile.parser = this.getParser(assembledFile.filepathsWithParserDefinitions, defaultParserCode).parser
    return assembledFile
  }
}

export { ParticleFileSystem }
