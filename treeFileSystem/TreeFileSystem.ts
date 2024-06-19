const fs = require("fs")
const path = require("path")

import { scrollNotationTypes } from "../products/scrollNotationTypes"
const { Disk } = require("../products/Disk.node.js")
const { Utils } = require("../products/Utils.js")
const { TreeNode } = require("../products/TreeNode.js")
const { HandParsersProgram } = require("../products/Parsers.js")
const grammarParser = require("../products/parsers.nodejs.js")
const { posix } = require("../products/Path.js")

const PARSERS_EXTENSION = ".parsers"

interface OpenedFile {
  absolutePath: scrollNotationTypes.filepath
  content: string
  mtimeMs: number
}

interface AssembledFile {
  afterImportPass: string // codeWithoutImportsNorParserDefinitions
  importFilePaths: string[]
  isImportOnly: boolean
  parser?: scrollNotationTypes.treeNode
  filepathsWithParserDefinitions: string[]
}

interface Storage {
  read(absolutePath: string): string
  list(absolutePath: string): string[]
  write(absolutePath: string, content: string): void
  getMTime(absolutePath: string): number
  dirname(absolutePath: string): string
  join(...absolutePath: string[]): string
}

const parserRegex = /^[a-zA-Z0-9_]+Parser/gm
// A regex to check if a multiline string has a line that starts with "import ".
const importRegex = /^import /gm
const importOnlyRegex = /^importOnly/

class DiskWriter implements Storage {
  fileCache: { [filepath: string]: OpenedFile } = {}
  _read(absolutePath: scrollNotationTypes.filepath) {
    const { fileCache } = this
    if (!fileCache[absolutePath]) fileCache[absolutePath] = { absolutePath, content: Disk.read(absolutePath).replace(/\r/g, ""), mtimeMs: fs.statSync(absolutePath) }
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
    return this._read(absolutePath).mtimeMs
  }

  dirname(absolutePath: string) {
    return path.dirname(absolutePath)
  }

  join(...segments: string[]) {
    return path.join(...arguments)
  }
}

class MemoryWriter implements Storage {
  constructor(inMemoryFiles: scrollNotationTypes.diskMap) {
    this.inMemoryFiles = inMemoryFiles
  }

  inMemoryFiles: scrollNotationTypes.diskMap

  read(absolutePath: scrollNotationTypes.filepath) {
    const value = this.inMemoryFiles[absolutePath]
    if (value === undefined) throw new Error(`File '${absolutePath}' not found.`)
    return value
  }

  write(absolutePath: scrollNotationTypes.filepath, content: string) {
    this.inMemoryFiles[absolutePath] = content
  }

  list(absolutePath: scrollNotationTypes.filepath) {
    return Object.keys(this.inMemoryFiles).filter(filePath => filePath.startsWith(absolutePath) && !filePath.replace(absolutePath, "").includes("/"))
  }

  getMTime() {
    return 1
  }

  dirname(path: string) {
    return posix.dirname(path)
  }

  join(...segments: string[]) {
    return posix.join(...arguments)
  }
}

class TreeFileSystem implements Storage {
  constructor(inMemoryFiles: scrollNotationTypes.diskMap) {
    if (inMemoryFiles) this._storage = new MemoryWriter(inMemoryFiles)
    else this._storage = new DiskWriter()
  }

  read(absolutePath: scrollNotationTypes.filepath) {
    return this._storage.read(absolutePath)
  }

  write(absolutePath: scrollNotationTypes.filepath, content: string) {
    return this._storage.write(absolutePath, content)
  }

  list(absolutePath: scrollNotationTypes.filepath) {
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

  private _storage: Storage
  private _treeCache: { [filepath: string]: typeof TreeNode } = {}
  private _parserCache: { [concatenatedFilepaths: string]: any } = {}
  private _expandedImportCache: { [filepath: string]: AssembledFile } = {}
  private _grammarExpandersCache: { [filepath: string]: boolean } = {}

  private _getFileAsTree(absoluteFilePath: string) {
    const { _treeCache } = this
    if (_treeCache[absoluteFilePath] === undefined) {
      _treeCache[absoluteFilePath] = new TreeNode(this._storage.read(absoluteFilePath))
    }
    return _treeCache[absoluteFilePath]
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
        .filter(line => line.startsWith("import "))
        .join("\n")

    const filepathsWithParserDefinitions = []
    if (this._doesFileHaveGrammarDefinitions(absoluteFilePath)) filepathsWithParserDefinitions.push(absoluteFilePath)

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
      filepathsWithParserDefinitions: importFilePaths.filter((filename: string) => this._doesFileHaveGrammarDefinitions(filename)).concat(filepathsWithParserDefinitions)
    }

    return _expandedImportCache[absoluteFilePath]
  }

  private _doesFileHaveGrammarDefinitions(absoluteFilePath: scrollNotationTypes.filepath) {
    if (!absoluteFilePath) return false
    const { _grammarExpandersCache } = this
    if (_grammarExpandersCache[absoluteFilePath] === undefined) _grammarExpandersCache[absoluteFilePath] = !!this._storage.read(absoluteFilePath).match(parserRegex)

    return _grammarExpandersCache[absoluteFilePath]
  }

  private _getOneGrammarParserFromFiles(filePaths: string[], baseParsersCode: string) {
    const parserDefinitionRegex = /^[a-zA-Z0-9_]+Parser/
    const cellDefinitionRegex = /^[a-zA-Z0-9_]+Cell/
    const asOneFile = filePaths
      .map(filePath => {
        const content = this._storage.read(filePath)
        if (filePath.endsWith(PARSERS_EXTENSION)) return content
        // Strip scroll content
        return new TreeNode(content)
          .filter((node: scrollNotationTypes.treeNode) => node.getLine().match(parserDefinitionRegex) || node.getLine().match(cellDefinitionRegex))
          .map((node: scrollNotationTypes.treeNode) => node.asString)
          .join("\n")
      })
      .join("\n")
      .trim()

    // todo: clean up scrollsdk so we are using supported methods (perhaps add a formatOptions that allows you to tell Grammar not to run prettier on js nodes)
    return new grammarParser(baseParsersCode + "\n" + asOneFile)._sortNodesByInScopeOrder()._sortWithParentParsersUpTop()
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
    const grammarParser = this._getOneGrammarParserFromFiles(filePaths, baseParsersCode)
    const grammarCode = grammarParser.asString
    _parserCache[key] = {
      grammarParser,
      grammarCode,
      parser: new HandParsersProgram(grammarCode).compileAndReturnRootParser()
    }
    return _parserCache[key]
  }

  assembleFile(absoluteFilePath: string, defaultParserCode?: string): AssembledFile {
    const assembledFile = this._assembleFile(absoluteFilePath)

    if (!defaultParserCode) return assembledFile

    // BUILD CUSTOM COMPILER, IF THERE ARE CUSTOM GRAMMAR NODES DEFINED
    if (assembledFile.filepathsWithParserDefinitions.length) assembledFile.parser = this.getParser(assembledFile.filepathsWithParserDefinitions, defaultParserCode).parser
    return assembledFile
  }
}

export { TreeFileSystem }
