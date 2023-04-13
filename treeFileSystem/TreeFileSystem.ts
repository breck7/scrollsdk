const fs = require("fs")
const path = require("path")

import { treeNotationTypes } from "../products/treeNotationTypes"
const { Disk } = require("../products/Disk.node.js")
const { Utils } = require("../products/Utils.js")
const { TreeNode } = require("../products/TreeNode.js")
const { HandGrammarProgram } = require("../products/GrammarLanguage.js")
const grammarParser = require("../products/grammar.nodejs.js")

const GRAMMAR_EXTENSION = ".grammar"

interface OpenedFile {
  absolutePath: treeNotationTypes.filepath
  content: string
  mtimeMs: number
}

interface ImportResult {
  code: string
  importFilePaths: treeNotationTypes.filepath[]
}

interface ImportResults {
  originalFileAsTree: treeNotationTypes.treeNode
  afterImportPass: string
  parser?: treeNotationTypes.treeNode
}

interface Storage {
  read(absolutePath: string): string
  list(absolutePath: string): string[]
  write(absolutePath: string, content: string): void
  getMTime(absolutePath: string): number
  dirname(absolutePath: string): string
  join(...absolutePath: string[]): string
}

class DiskWriter implements Storage {
  fileCache: { [filepath: string]: OpenedFile } = {}
  _read(absolutePath: treeNotationTypes.filepath) {
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
  constructor(inMemoryFiles: treeNotationTypes.diskMap) {
    this.inMemoryFiles = inMemoryFiles
  }

  inMemoryFiles: treeNotationTypes.diskMap

  read(absolutePath: treeNotationTypes.filepath) {
    const value = this.inMemoryFiles[absolutePath]
    if (value === undefined) throw new Error(`File '${absolutePath}' not found.`)
    return value
  }

  write(absolutePath: treeNotationTypes.filepath, content: string) {
    this.inMemoryFiles[absolutePath] = content
  }

  list(absolutePath: treeNotationTypes.filepath) {
    return Object.keys(this.inMemoryFiles).filter(filePath => filePath.startsWith(absolutePath) && !filePath.replace(absolutePath, "").includes("/"))
  }

  getMTime() {
    return 1
  }

  // todo: replace with a browserfied path?
  dirname(path: string) {
    // https://github.com/browserify/path-browserify/blob/master/index.js
    if (path.length === 0) return "."
    var code = path.charCodeAt(0)
    var hasRoot = code === 47 /*/*/
    var end = -1
    var matchedSlash = true
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i)
      if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i
          break
        }
      } else {
        // We saw the first non-path separator
        matchedSlash = false
      }
    }

    if (end === -1) return hasRoot ? "/" : "."
    if (hasRoot && end === 1) return "//"
    return path.slice(0, end)
  }

  normalizePath(path: string) {
    return path.replace(/\/\/+/g, "/")
  }

  join(...segments: string[]) {
    return this.normalizePath(segments.join("/"))
  }
}

class TreeFileSystem implements Storage {
  constructor(inMemoryFiles: treeNotationTypes.diskMap) {
    if (inMemoryFiles) this._storage = new MemoryWriter(inMemoryFiles)
    else this._storage = new DiskWriter()
  }

  read(absolutePath: treeNotationTypes.filepath) {
    return this._storage.read(absolutePath)
  }

  write(absolutePath: treeNotationTypes.filepath, content: string) {
    return this._storage.write(absolutePath, content)
  }

  list(absolutePath: treeNotationTypes.filepath) {
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
  private _expandedImportCache: { [filepath: string]: ImportResult } = {}
  private _grammarExpandersCache: { [filepath: string]: boolean } = {}

  private _getFileAsTree(absoluteFilePath: string) {
    const { _treeCache } = this
    if (_treeCache[absoluteFilePath] === undefined) {
      _treeCache[absoluteFilePath] = new TreeNode(this._storage.read(absoluteFilePath))
    }
    return _treeCache[absoluteFilePath]
  }

  private _doesFileHaveGrammarDefinitions(absoluteFilePath: treeNotationTypes.filepath) {
    if (!absoluteFilePath) return false
    const { _grammarExpandersCache } = this
    if (_grammarExpandersCache[absoluteFilePath] === undefined) _grammarExpandersCache[absoluteFilePath] = !!this._storage.read(absoluteFilePath).match(/^[a-zA-Z0-9_]+Parser/gm)

    return _grammarExpandersCache[absoluteFilePath]
  }

  private _evaluateImports(absoluteFilePath: string) {
    const { _expandedImportCache } = this
    if (_expandedImportCache[absoluteFilePath]) return _expandedImportCache[absoluteFilePath]
    // A regex to check if a multiline string has a line that starts with "import ".
    const importRegex = /^import /gm
    const code = this.read(absoluteFilePath)

    if (!code.match(importRegex))
      return {
        code,
        importFilePaths: []
      }

    let importFilePaths: string[] = []
    const lines = code.split("\n")
    const replacements: { lineNumber: number; code: string }[] = []
    lines.forEach((line, lineNumber) => {
      const folder = this.dirname(absoluteFilePath)
      if (line.match(importRegex)) {
        const relativeFilePath = line.replace("import ", "")
        const absoluteImportFilePath = this.join(folder, relativeFilePath)
        const expandedFile = this._evaluateImports(absoluteImportFilePath)
        replacements.push({ lineNumber, code: expandedFile.code })
        importFilePaths.push(absoluteImportFilePath)
        importFilePaths = importFilePaths.concat(expandedFile.importFilePaths)
      }
    })

    replacements.forEach(replacement => {
      const { lineNumber, code } = replacement
      lines[lineNumber] = code
    })

    _expandedImportCache[absoluteFilePath] = {
      code: lines.join("\n"),
      importFilePaths
    }
    return _expandedImportCache[absoluteFilePath]
  }

  private _getOneGrammarParserFromFiles(filePaths: string[], baseGrammarCode: string) {
    const parserDefinitionRegex = /^[a-zA-Z0-9_]+Parser/
    const asOneFile = filePaths
      .map(filePath => {
        const content = this._storage.read(filePath)
        if (filePath.endsWith(GRAMMAR_EXTENSION)) return content
        // Strip scroll content
        return new TreeNode(content)
          .filter((node: treeNotationTypes.treeNode) => node.getLine().match(parserDefinitionRegex))
          .map((node: treeNotationTypes.treeNode) => node.asString)
          .join("\n")
      })
      .join("\n")
      .trim()

    // todo: clean up jtree so we are using supported methods (perhaps add a formatOptions that allows you to tell Grammar not to run prettier on js nodes)
    return new grammarParser(baseGrammarCode + "\n" + asOneFile)._sortNodesByInScopeOrder()._sortWithParentParsersUpTop()
  }

  get parsers() {
    return Object.values(this._parserCache).map(parser => parser.grammarParser)
  }

  getParser(filePaths: string[], baseGrammarCode = "") {
    const { _parserCache } = this
    const key = filePaths
      .filter(fp => fp)
      .sort()
      .join("\n")
    const hit = _parserCache[key]
    if (hit) return hit
    const grammarParser = this._getOneGrammarParserFromFiles(filePaths, baseGrammarCode)
    const grammarCode = grammarParser.asString
    _parserCache[key] = {
      grammarParser,
      grammarCode,
      parser: new HandGrammarProgram(grammarCode).compileAndReturnRootParser()
    }
    return _parserCache[key]
  }

  evaluateImports(absoluteFilePath: string, defaultParserCode?: string): ImportResults {
    const importResults = this._evaluateImports(absoluteFilePath)
    const results: ImportResults = {
      originalFileAsTree: this._getFileAsTree(absoluteFilePath),
      afterImportPass: importResults.code
    }

    if (!defaultParserCode) return results

    const filepathsWithParserDefinitions = importResults.importFilePaths.filter(filename => this._doesFileHaveGrammarDefinitions(filename))
    if (this._doesFileHaveGrammarDefinitions(absoluteFilePath)) filepathsWithParserDefinitions.push(absoluteFilePath)

    // BUILD CUSTOM COMPILER, IF THERE ARE CUSTOM GRAMMAR NODES DEFINED
    if (filepathsWithParserDefinitions.length) results.parser = this.getParser(filepathsWithParserDefinitions, defaultParserCode).parser
    return results
  }
}

export { TreeFileSystem }
