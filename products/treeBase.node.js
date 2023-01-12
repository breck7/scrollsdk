//onsave jtree build produce treeBase.node.js
const path = require("path")
const fs = require("fs")
const { TreeNode, TreeEvents } = require("../products/TreeNode.js")
const { HandGrammarProgram, GrammarConstants } = require("../products/GrammarLanguage.js")
const { Disk } = require("../products/Disk.node.js")
const { Utils } = require("../products/Utils.js")
const grammarNode = require("../products/grammar.nodejs.js")
const makeId = word => Utils.getFileName(Utils.removeFileExtension(word))
class TreeBasePageTemplate {
  constructor(file) {
    this.file = file
  }
  toScroll() {
    const { file, typeName, title } = this
    const { id } = file
    return `title ${title}

import settings.scroll
htmlTitle ${title} - ${typeName}

html
 <a class="prevLang" href="${this.prevPage}">&lt;</a>
 <a class="nextLang" href="${this.nextPage}">&gt;</a>

viewSourceUrl ${this.viewSourceUrl}

html
 <div class="quickLinks">${this.quickLinks}</div>

keyboardNav ${this.prevPage} ${this.nextPage}
`.replace(/\n\n\n+/g, "\n\n")
  }
  get viewSourceUrl() {
    return ``
  }
  get title() {
    return this.file.get("title")
  }
  get typeName() {
    return ""
  }
  get quickLinks() {
    return ""
  }
  get prevPage() {
    return ""
  }
  get nextPage() {
    return ""
  }
}
class TreeBaseBuilder {
  constructor(folder) {
    this.folder = folder
  }
  compileTreeBaseFilesToScrollFiles(websiteFolder) {
    this.folder.forEach(file => Disk.write(path.join(websiteFolder, `${file.id}.scroll`), new TreeBasePageTemplate(file).toScroll()))
  }
}
class TreeBaseFile extends TreeNode {
  constructor() {
    super(...arguments)
    this.id = this.getWord(0)
  }
  get webPermalink() {
    return `${this.base.baseUrl}${this.permalink}`
  }
  get permalink() {
    return this.id + ".html"
  }
  get type() {
    return ""
  }
  get rank() {
    return this.getIndex()
  }
  get title() {
    return this.id
  }
  get lowercase() {
    return this.toString().toLowerCase()
  }
  get lowercaseNames() {
    return this.names.map(name => name.toLowerCase())
  }
  get names() {
    return [this.id]
  }
  setDiskVersion() {
    this._diskVersion = this.childrenToString()
    return this
  }
  getDiskVersion() {
    return this._diskVersion
  }
  getDoc(terms) {
    return terms
      .map(term => {
        const nodes = this.findNodes(this._getFilePath() + " " + term)
        return nodes.map(node => node.childrenToString()).join("\n")
      })
      .filter(identity => identity)
      .join("\n")
  }
  set(keywordPath, content) {
    return typeof keywordPath === "object" ? this.setProperties(keywordPath) : super.set(keywordPath, content)
  }
  save() {
    const str = this.childrenToString()
    if (this.getDiskVersion() === str) return this
    Disk.write(this._getFilePath(), str)
    this.setDiskVersion()
    return this
  }
  appendUniqueLine(line) {
    const file = this.toString()
    if (file.match(new RegExp("^" + Disk.escape(line), "m"))) return true
    const prefix = !file || file.endsWith("\n") ? "" : "\n"
    return this.appendLine(prefix + line + "\n")
  }
  _getFilePath() {
    return this.base.makeFilePath(this.id)
  }
  getFileName() {
    return Disk.getFileName(this._getFilePath())
  }
  createParser() {
    return new TreeNode.Parser(TreeNode)
  }
  get base() {
    return this.getParent()
  }
  get parsed() {
    const programParser = this.base.grammarProgramConstructor
    return new programParser(this.childrenToString())
  }
}
class TreeBaseFolder extends TreeNode {
  constructor() {
    super(...arguments)
    this._isLoaded = false
    this.dir = ""
    this.grammarDir = ""
    this.grammarCode = ""
    this.grammarProgramConstructor = undefined
    this.fileExtension = ""
    this.baseUrl = ""
  }
  touch(filename) {
    // todo: throw if its a folder path, has wrong file extension, or other invalid
    return Disk.touch(path.join(this.dir, filename))
  }
  // WARNING: Very basic support! Not fully developed.
  // WARNING: Does not yet support having multiple tuples with the same key—will collapse those to one.
  toSQLite() {
    return this.toSQLiteCreateTables() + "\n\n" + this.toSQLiteInsertRows()
  }
  toSQLiteCreateTables() {
    this.loadFolder()
    const grammarProgram = new HandGrammarProgram(this.grammarCode)
    const tableDefinitionNodes = grammarProgram.filter(node => node.getTableNameIfAny && node.getTableNameIfAny())
    // todo: filter out root root
    return tableDefinitionNodes.map(node => node.toSQLiteTableSchema()).join("\n")
  }
  toSQLiteInsertRows() {
    return this.map(file => file.parsed.toSQLiteInsertStatement(file.id)).join("\n")
  }
  createParser() {
    return new TreeNode.Parser(TreeBaseFile)
  }
  get typedMap() {
    this.loadFolder()
    const map = {}
    this.forEach(file => {
      const [id, value] = file.parsed.typedTuple
      map[file.id] = value
    })
    return map
  }
  // todo: RAII?
  loadFolder() {
    if (this._isLoaded) return this
    const files = this._getAndFilterFilesFromFolder()
    this.setChildren(this._readFiles(files)) // todo: speedup?
    this._setDiskVersions()
    this._isLoaded = true
    return this
  }
  // todo: need to RAII this. Likely just not have TreeBaseFolder extend TreeNode
  setDir(dir) {
    this.dir = dir
    return this
  }
  setGrammarDir(dir) {
    this.grammarDir = dir
    const rawCode = this.grammarFilePaths.map(Disk.read).join("\n")
    this.grammarCode = new grammarNode(rawCode).format().toString()
    this.grammarProgramConstructor = new HandGrammarProgram(this.grammarCode).compileAndReturnRootConstructor()
    this.fileExtension = new this.grammarProgramConstructor().fileExtension
    return this
  }
  get grammarFilePaths() {
    return Disk.getFiles(this.grammarDir).filter(file => file.endsWith(GrammarConstants.grammarFileExtension))
  }
  _setDiskVersions() {
    // todo: speedup?
    this.forEach(file => file.setDiskVersion())
    return this
  }
  _getAndFilterFilesFromFolder() {
    return this._filterFiles(Disk.getFiles(this.dir))
  }
  // todo: cleanup the filtering here.
  _filterFiles(files) {
    return files.filter(file => !file.endsWith(GrammarConstants.grammarFileExtension))
  }
  startListeningForFileChanges() {
    this.loadFolder()
    const { dir } = this
    this._fsWatcher = fs.watch(dir, (event, filename) => {
      let fullPath = path.join(dir, filename)
      fullPath = this._filterFiles([fullPath])[0]
      if (!fullPath) return true
      const node = this.getNode(fullPath)
      if (!Disk.exists(fullPath)) {
        this.delete(fullPath)
        this.trigger(new TreeEvents.ChildRemovedTreeEvent(node))
        this.trigger(new TreeEvents.DescendantChangedTreeEvent(node))
        return
      }
      const data = Disk.read(fullPath)
      if (!node) {
        const newNode = this.appendLineAndChildren(fullPath, data)
        this.trigger(new TreeEvents.ChildAddedTreeEvent(newNode))
        this.trigger(new TreeEvents.DescendantChangedTreeEvent(newNode))
      } else {
        node.setChildren(data)
        this.trigger(new TreeEvents.DescendantChangedTreeEvent(node))
      }
    })
  }
  stopListeningForFileChanges() {
    this._fsWatcher.close()
    delete this._fsWatcher
  }
  makeFilePath(id) {
    return path.join(this.dir, id + "." + this.fileExtension)
  }
  get errors() {
    let errors = []
    this.forEach(file => {
      const { parsed } = file
      const errs = parsed.getAllErrors()
      if (errs.length) errors = errors.concat(errs)
      const { scopeErrors } = parsed
      if (scopeErrors.length) errors = errors.concat(scopeErrors)
    })
    return errors
  }
  _readFiles(files) {
    return files
      .map(fullPath => {
        const content = Disk.read(fullPath)
        if (content.match(/\r/)) throw new Error("bad \\r in " + fullPath)
        const id = makeId(fullPath)
        return content ? id + "\n " + content.replace(/\n/g, "\n ") : id
      })
      .join("\n")
  }
}

module.exports = { TreeBaseFile, TreeBaseFolder, TreeBaseBuilder }
