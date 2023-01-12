const { Utils } = require("./Utils.js")
const { TreeNode, TreeWord, ExtendibleTreeNode, AbstractExtendibleTreeNode } = require("./TreeNode")
var GrammarConstantsCompiler
;(function(GrammarConstantsCompiler) {
  GrammarConstantsCompiler["stringTemplate"] = "stringTemplate"
  GrammarConstantsCompiler["indentCharacter"] = "indentCharacter"
  GrammarConstantsCompiler["catchAllCellDelimiter"] = "catchAllCellDelimiter"
  GrammarConstantsCompiler["openChildren"] = "openChildren"
  GrammarConstantsCompiler["joinChildrenWith"] = "joinChildrenWith"
  GrammarConstantsCompiler["closeChildren"] = "closeChildren"
})(GrammarConstantsCompiler || (GrammarConstantsCompiler = {}))
var SQLiteTypes
;(function(SQLiteTypes) {
  SQLiteTypes["integer"] = "INTEGER"
  SQLiteTypes["float"] = "FLOAT"
  SQLiteTypes["text"] = "TEXT"
})(SQLiteTypes || (SQLiteTypes = {}))
var GrammarConstantsMisc
;(function(GrammarConstantsMisc) {
  GrammarConstantsMisc["doNotSynthesize"] = "doNotSynthesize"
  GrammarConstantsMisc["tableName"] = "tableName"
})(GrammarConstantsMisc || (GrammarConstantsMisc = {}))
var PreludeCellTypeIds
;(function(PreludeCellTypeIds) {
  PreludeCellTypeIds["anyCell"] = "anyCell"
  PreludeCellTypeIds["keywordCell"] = "keywordCell"
  PreludeCellTypeIds["extraWordCell"] = "extraWordCell"
  PreludeCellTypeIds["floatCell"] = "floatCell"
  PreludeCellTypeIds["numberCell"] = "numberCell"
  PreludeCellTypeIds["bitCell"] = "bitCell"
  PreludeCellTypeIds["boolCell"] = "boolCell"
  PreludeCellTypeIds["intCell"] = "intCell"
})(PreludeCellTypeIds || (PreludeCellTypeIds = {}))
var GrammarConstantsConstantTypes
;(function(GrammarConstantsConstantTypes) {
  GrammarConstantsConstantTypes["boolean"] = "boolean"
  GrammarConstantsConstantTypes["string"] = "string"
  GrammarConstantsConstantTypes["int"] = "int"
  GrammarConstantsConstantTypes["float"] = "float"
})(GrammarConstantsConstantTypes || (GrammarConstantsConstantTypes = {}))
var GrammarBundleFiles
;(function(GrammarBundleFiles) {
  GrammarBundleFiles["package"] = "package.json"
  GrammarBundleFiles["readme"] = "readme.md"
  GrammarBundleFiles["indexHtml"] = "index.html"
  GrammarBundleFiles["indexJs"] = "index.js"
  GrammarBundleFiles["testJs"] = "test.js"
})(GrammarBundleFiles || (GrammarBundleFiles = {}))
var GrammarCellParser
;(function(GrammarCellParser) {
  GrammarCellParser["prefix"] = "prefix"
  GrammarCellParser["postfix"] = "postfix"
  GrammarCellParser["omnifix"] = "omnifix"
})(GrammarCellParser || (GrammarCellParser = {}))
var GrammarConstants
;(function(GrammarConstants) {
  // node types
  GrammarConstants["extensions"] = "extensions"
  GrammarConstants["toolingDirective"] = "tooling"
  GrammarConstants["todoComment"] = "todo"
  GrammarConstants["version"] = "version"
  GrammarConstants["nodeType"] = "nodeType"
  GrammarConstants["cellType"] = "cellType"
  GrammarConstants["grammarFileExtension"] = "grammar"
  GrammarConstants["abstractNodeTypePrefix"] = "abstract"
  GrammarConstants["nodeTypeSuffix"] = "Node"
  GrammarConstants["cellTypeSuffix"] = "Cell"
  // error check time
  GrammarConstants["regex"] = "regex"
  GrammarConstants["reservedWords"] = "reservedWords"
  GrammarConstants["enumFromCellTypes"] = "enumFromCellTypes"
  GrammarConstants["enum"] = "enum"
  GrammarConstants["examples"] = "examples"
  GrammarConstants["min"] = "min"
  GrammarConstants["max"] = "max"
  // baseNodeTypes
  GrammarConstants["baseNodeType"] = "baseNodeType"
  GrammarConstants["blobNode"] = "blobNode"
  GrammarConstants["errorNode"] = "errorNode"
  // parse time
  GrammarConstants["extends"] = "extends"
  GrammarConstants["root"] = "root"
  GrammarConstants["crux"] = "crux"
  GrammarConstants["cruxFromId"] = "cruxFromId"
  GrammarConstants["pattern"] = "pattern"
  GrammarConstants["inScope"] = "inScope"
  GrammarConstants["cells"] = "cells"
  GrammarConstants["listDelimiter"] = "listDelimiter"
  GrammarConstants["contentKey"] = "contentKey"
  GrammarConstants["childrenKey"] = "childrenKey"
  GrammarConstants["uniqueFirstWord"] = "uniqueFirstWord"
  GrammarConstants["catchAllCellType"] = "catchAllCellType"
  GrammarConstants["cellParser"] = "cellParser"
  GrammarConstants["catchAllNodeType"] = "catchAllNodeType"
  GrammarConstants["constants"] = "constants"
  GrammarConstants["required"] = "required"
  GrammarConstants["single"] = "single"
  GrammarConstants["uniqueLine"] = "uniqueLine"
  GrammarConstants["tags"] = "tags"
  GrammarConstants["_extendsJsClass"] = "_extendsJsClass"
  GrammarConstants["_rootNodeJsHeader"] = "_rootNodeJsHeader"
  // default catchAll nodeType
  GrammarConstants["BlobNode"] = "BlobNode"
  GrammarConstants["defaultRootNode"] = "defaultRootNode"
  // code
  GrammarConstants["javascript"] = "javascript"
  // compile time
  GrammarConstants["compilerNodeType"] = "compiler"
  GrammarConstants["compilesTo"] = "compilesTo"
  // develop time
  GrammarConstants["description"] = "description"
  GrammarConstants["example"] = "example"
  GrammarConstants["frequency"] = "frequency"
  GrammarConstants["highlightScope"] = "highlightScope"
})(GrammarConstants || (GrammarConstants = {}))
class TypedWord extends TreeWord {
  constructor(node, cellIndex, type) {
    super(node, cellIndex)
    this._type = type
  }
  get type() {
    return this._type
  }
  toString() {
    return this.word + ":" + this.type
  }
}
// todo: can we merge these methods into base TreeNode and ditch this class?
class GrammarBackedNode extends TreeNode {
  getDefinition() {
    if (this._definition) return this._definition
    const handGrammarProgram = this.getHandGrammarProgram()
    this._definition = this.isRoot() ? handGrammarProgram : handGrammarProgram.getNodeTypeDefinitionByNodeTypeId(this.constructor.name)
    return this._definition
  }
  toSQLiteInsertStatement(id) {
    const def = this.getDefinition()
    const tableName = this.tableName || def.getTableNameIfAny() || def._getId()
    const columns = def.getSQLiteTableColumns()
    const hits = columns.filter(colDef => this.has(colDef.columnName))
    const values = hits.map(colDef => {
      const node = this.getNode(colDef.columnName)
      let content = node.getContent()
      const hasChildren = node.length
      const isText = colDef.type === SQLiteTypes.text
      if (content && hasChildren) content = node.getContentWithChildren().replace(/\n/g, "\\n")
      else if (hasChildren) content = node.childrenToString().replace(/\n/g, "\\n")
      return isText || hasChildren ? `"${content}"` : content
    })
    hits.unshift({ columnName: "id", type: SQLiteTypes.text })
    values.unshift(`"${id}"`)
    return `INSERT INTO ${tableName} (${hits.map(col => col.columnName).join(",")}) VALUES (${values.join(",")});`
  }
  getAutocompleteResults(partialWord, cellIndex) {
    return cellIndex === 0 ? this._getAutocompleteResultsForFirstWord(partialWord) : this._getAutocompleteResultsForCell(partialWord, cellIndex)
  }
  get nodeIndex() {
    // StringMap<int> {firstWord: index}
    // When there are multiple tails with the same firstWord, _index stores the last content.
    // todo: change the above behavior: when a collision occurs, create an array.
    return this._nodeIndex || this._makeNodeIndex()
  }
  _clearIndex() {
    delete this._nodeIndex
    return super._clearIndex()
  }
  _makeIndex(startAt = 0) {
    if (this._nodeIndex) this._makeNodeIndex(startAt)
    return super._makeIndex(startAt)
  }
  _makeNodeIndex(startAt = 0) {
    if (!this._nodeIndex || !startAt) this._nodeIndex = {}
    const nodes = this._getChildrenArray()
    const newIndex = this._nodeIndex
    const length = nodes.length
    for (let index = startAt; index < length; index++) {
      const node = nodes[index]
      const ancestors = Array.from(node.getDefinition()._getAncestorSet()).forEach(id => {
        if (!newIndex[id]) newIndex[id] = []
        newIndex[id].push(node)
      })
    }
    return newIndex
  }
  getChildInstancesOfNodeTypeId(nodeTypeId) {
    return this.nodeIndex[nodeTypeId] || []
  }
  doesExtend(nodeTypeId) {
    return this.getDefinition()._doesExtend(nodeTypeId)
  }
  _getErrorNodeErrors() {
    return [this.getFirstWord() ? new UnknownNodeTypeError(this) : new BlankLineError(this)]
  }
  _getBlobNodeCatchAllNodeType() {
    return BlobNode
  }
  _getAutocompleteResultsForFirstWord(partialWord) {
    const keywordMap = this.getDefinition().getFirstWordMapWithDefinitions()
    let keywords = Object.keys(keywordMap)
    if (partialWord) keywords = keywords.filter(keyword => keyword.includes(partialWord))
    return keywords.map(keyword => {
      const def = keywordMap[keyword]
      const description = def.getDescription()
      return {
        text: keyword,
        displayText: keyword + (description ? " " + description : "")
      }
    })
  }
  _getAutocompleteResultsForCell(partialWord, cellIndex) {
    // todo: root should be [] correct?
    const cell = this._getParsedCells()[cellIndex]
    return cell ? cell.getAutoCompleteWords(partialWord) : []
  }
  // note: this is overwritten by the root node of a runtime grammar program.
  // some of the magic that makes this all work. but maybe there's a better way.
  getHandGrammarProgram() {
    if (this.isRoot()) throw new Error(`Root node without getHandGrammarProgram defined.`)
    return this.getRootNode().getHandGrammarProgram()
  }
  getRunTimeEnumOptions(cell) {
    return undefined
  }
  _sortNodesByInScopeOrder() {
    const nodeTypeOrder = this.getDefinition()._getMyInScopeNodeTypeIds()
    if (!nodeTypeOrder.length) return this
    const orderMap = {}
    nodeTypeOrder.forEach((word, index) => {
      orderMap[word] = index
    })
    this.sort(
      Utils.makeSortByFn(runtimeNode => {
        return orderMap[runtimeNode.getDefinition().getNodeTypeIdFromDefinition()]
      })
    )
    return this
  }
  get requiredNodeErrors() {
    const errors = []
    Object.values(this.getDefinition().getFirstWordMapWithDefinitions()).forEach(def => {
      if (def.isRequired() && !this.nodeIndex[def.id]) errors.push(new MissingRequiredNodeTypeError(this, def.id))
    })
    return errors
  }
  getProgramAsCells() {
    // todo: what is this?
    return this.getTopDownArray().map(node => {
      const cells = node._getParsedCells()
      let indents = node.getIndentLevel() - 1
      while (indents) {
        cells.unshift(undefined)
        indents--
      }
      return cells
    })
  }
  getProgramWidth() {
    return Math.max(...this.getProgramAsCells().map(line => line.length))
  }
  getAllTypedWords() {
    const words = []
    this.getTopDownArray().forEach(node => {
      node.getWordTypes().forEach((cell, index) => {
        words.push(new TypedWord(node, index, cell.getCellTypeId()))
      })
    })
    return words
  }
  findAllWordsWithCellType(cellTypeId) {
    return this.getAllTypedWords().filter(typedWord => typedWord.type === cellTypeId)
  }
  findAllNodesWithNodeType(nodeTypeId) {
    return this.getTopDownArray().filter(node => node.getDefinition().getNodeTypeIdFromDefinition() === nodeTypeId)
  }
  toCellTypeTree() {
    return this.getTopDownArray()
      .map(child => child.getIndentation() + child.getLineCellTypes())
      .join("\n")
  }
  getParseTable(maxColumnWidth = 40) {
    const tree = new TreeNode(this.toCellTypeTree())
    return new TreeNode(
      tree.getTopDownArray().map((node, lineNumber) => {
        const sourceNode = this.nodeAtLine(lineNumber)
        const errs = sourceNode.getErrors()
        const errorCount = errs.length
        const obj = {
          lineNumber: lineNumber,
          source: sourceNode.getIndentation() + sourceNode.getLine(),
          nodeType: sourceNode.constructor.name,
          cellTypes: node.getContent(),
          errorCount: errorCount
        }
        if (errorCount) obj.errorMessages = errs.map(err => err.getMessage()).join(";")
        return obj
      })
    ).toFormattedTable(maxColumnWidth)
  }
  // Helper method for selecting potential nodeTypes needed to update grammar file.
  getInvalidNodeTypes() {
    return Array.from(
      new Set(
        this.getAllErrors()
          .filter(err => err instanceof UnknownNodeTypeError)
          .map(err => err.getNode().getFirstWord())
      )
    )
  }
  _getAllAutoCompleteWords() {
    return this.getAllWordBoundaryCoordinates().map(coordinate => {
      const results = this.getAutocompleteResultsAt(coordinate.lineIndex, coordinate.charIndex)
      return {
        lineIndex: coordinate.lineIndex,
        charIndex: coordinate.charIndex,
        wordIndex: coordinate.wordIndex,
        word: results.word,
        suggestions: results.matches
      }
    })
  }
  toAutoCompleteCube(fillChar = "") {
    const trees = [this.clone()]
    const filled = this.clone().fill(fillChar)
    this._getAllAutoCompleteWords().forEach(hole => {
      hole.suggestions.forEach((suggestion, index) => {
        if (!trees[index + 1]) trees[index + 1] = filled.clone()
        trees[index + 1].nodeAtLine(hole.lineIndex).setWord(hole.wordIndex, suggestion.text)
      })
    })
    return new TreeNode(trees)
  }
  toAutoCompleteTable() {
    return new TreeNode(
      this._getAllAutoCompleteWords().map(result => {
        result.suggestions = result.suggestions.map(node => node.text).join(" ")
        return result
      })
    ).toTable()
  }
  getAutocompleteResultsAt(lineIndex, charIndex) {
    const lineNode = this.nodeAtLine(lineIndex) || this
    const nodeInScope = lineNode.getNodeInScopeAtCharIndex(charIndex)
    // todo: add more tests
    // todo: second param this.childrenToString()
    // todo: change to getAutocomplete definitions
    const wordIndex = lineNode.getWordIndexAtCharacterIndex(charIndex)
    const wordProperties = lineNode.getWordProperties(wordIndex)
    return {
      startCharIndex: wordProperties.startCharIndex,
      endCharIndex: wordProperties.endCharIndex,
      word: wordProperties.word,
      matches: nodeInScope.getAutocompleteResults(wordProperties.word, wordIndex)
    }
  }
  _sortWithParentNodeTypesUpTop() {
    const familyTree = new HandGrammarProgram(this.toString()).getNodeTypeFamilyTree()
    const rank = {}
    familyTree.getTopDownArray().forEach((node, index) => {
      rank[node.getWord(0)] = index
    })
    const nodeAFirst = -1
    const nodeBFirst = 1
    this.sort((nodeA, nodeB) => {
      const nodeARank = rank[nodeA.getWord(0)]
      const nodeBRank = rank[nodeB.getWord(0)]
      return nodeARank < nodeBRank ? nodeAFirst : nodeBFirst
    })
    return this
  }
  format() {
    if (this.isRoot()) {
      this._sortNodesByInScopeOrder()
      try {
        this._sortWithParentNodeTypesUpTop()
      } catch (err) {
        console.log(`Warning: ${err}`)
      }
    }
    this.getTopDownArray().forEach(child => {
      child.format()
    })
    return this
  }
  getNodeTypeUsage(filepath = "") {
    // returns a report on what nodeTypes from its language the program uses
    const usage = new TreeNode()
    const handGrammarProgram = this.getHandGrammarProgram()
    handGrammarProgram.getValidConcreteAndAbstractNodeTypeDefinitions().forEach(def => {
      const requiredCellTypeIds = def.getCellParser().getRequiredCellTypeIds()
      usage.appendLine([def.getNodeTypeIdFromDefinition(), "line-id", "nodeType", requiredCellTypeIds.join(" ")].join(" "))
    })
    this.getTopDownArray().forEach((node, lineNumber) => {
      const stats = usage.getNode(node.getNodeTypeId())
      stats.appendLine([filepath + "-" + lineNumber, node.getWords().join(" ")].join(" "))
    })
    return usage
  }
  toHighlightScopeTree() {
    return this.getTopDownArray()
      .map(child => child.getIndentation() + child.getLineHighlightScopes())
      .join("\n")
  }
  toDefinitionLineNumberTree() {
    return this.getTopDownArray()
      .map(child => child.getDefinition().getLineNumber() + " " + child.getIndentation() + child.getCellDefinitionLineNumbers().join(" "))
      .join("\n")
  }
  toCellTypeTreeWithNodeConstructorNames() {
    return this.getTopDownArray()
      .map(child => child.constructor.name + this.getWordBreakSymbol() + child.getIndentation() + child.getLineCellTypes())
      .join("\n")
  }
  toPreludeCellTypeTreeWithNodeConstructorNames() {
    return this.getTopDownArray()
      .map(child => child.constructor.name + this.getWordBreakSymbol() + child.getIndentation() + child.getLineCellPreludeTypes())
      .join("\n")
  }
  getTreeWithNodeTypes() {
    return this.getTopDownArray()
      .map(child => child.constructor.name + this.getWordBreakSymbol() + child.getIndentation() + child.getLine())
      .join("\n")
  }
  getCellHighlightScopeAtPosition(lineIndex, wordIndex) {
    this._initCellTypeCache()
    const typeNode = this._cache_highlightScopeTree.getTopDownArray()[lineIndex - 1]
    return typeNode ? typeNode.getWord(wordIndex - 1) : undefined
  }
  _initCellTypeCache() {
    const treeMTime = this.getLineOrChildrenModifiedTime()
    if (this._cache_programCellTypeStringMTime === treeMTime) return undefined
    this._cache_typeTree = new TreeNode(this.toCellTypeTree())
    this._cache_highlightScopeTree = new TreeNode(this.toHighlightScopeTree())
    this._cache_programCellTypeStringMTime = treeMTime
  }
  createParser() {
    return this.isRoot()
      ? new TreeNode.Parser(BlobNode)
      : new TreeNode.Parser(
          this.getParent()
            ._getParser()
            ._getCatchAllNodeConstructor(this.getParent()),
          {}
        )
  }
  getNodeTypeId() {
    return this.getDefinition().getNodeTypeIdFromDefinition()
  }
  getWordTypes() {
    return this._getParsedCells().filter(cell => cell.getWord() !== undefined)
  }
  get cellErrors() {
    return this._getParsedCells()
      .map(check => check.getErrorIfAny())
      .filter(identity => identity)
  }
  get singleNodeUsedTwiceErrors() {
    const errors = []
    const parent = this.getParent()
    const hits = parent.getChildInstancesOfNodeTypeId(this.getDefinition().id)
    if (hits.length > 1)
      hits.forEach((node, index) => {
        if (node === this) errors.push(new NodeTypeUsedMultipleTimesError(node))
      })
    return errors
  }
  get uniqueLineAppearsTwiceErrors() {
    const errors = []
    const parent = this.getParent()
    const hits = parent.getChildInstancesOfNodeTypeId(this.getDefinition().id)
    if (hits.length > 1) {
      const set = new Set()
      hits.forEach((node, index) => {
        const line = node.getLine()
        if (set.has(line)) errors.push(new NodeTypeUsedMultipleTimesError(node))
        set.add(line)
      })
    }
    return errors
  }
  get scopeErrors() {
    let errors = []
    const def = this.getDefinition()
    if (def.isSingle) errors = errors.concat(this.singleNodeUsedTwiceErrors)
    if (def.isUniqueLine) errors = errors.concat(this.uniqueLineAppearsTwiceErrors)
    const { requiredNodeErrors } = this
    if (requiredNodeErrors.length) errors = errors.concat(requiredNodeErrors)
    return errors
  }
  getErrors() {
    return this.cellErrors.concat(this.scopeErrors)
  }
  _getParsedCells() {
    return this.getDefinition()
      .getCellParser()
      .getCellArray(this)
  }
  // todo: just make a fn that computes proper spacing and then is given a node to print
  getLineCellTypes() {
    return this._getParsedCells()
      .map(slot => slot.getCellTypeId())
      .join(" ")
  }
  getLineCellPreludeTypes() {
    return this._getParsedCells()
      .map(slot => {
        const def = slot._getCellTypeDefinition()
        //todo: cleanup
        return def ? def._getPreludeKindId() : PreludeCellTypeIds.anyCell
      })
      .join(" ")
  }
  getLineHighlightScopes(defaultScope = "source") {
    return this._getParsedCells()
      .map(slot => slot.getHighlightScope() || defaultScope)
      .join(" ")
  }
  getCellDefinitionLineNumbers() {
    return this._getParsedCells().map(cell => cell.getDefinitionLineNumber())
  }
  _getCompiledIndentation() {
    const indentCharacter = this.getDefinition()._getCompilerObject()[GrammarConstantsCompiler.indentCharacter]
    const indent = this.getIndentation()
    return indentCharacter !== undefined ? indentCharacter.repeat(indent.length) : indent
  }
  _getFields() {
    // fields are like cells
    const fields = {}
    this.forEach(node => {
      const def = node.getDefinition()
      if (def.isRequired() || def.isSingle) fields[node.getWord(0)] = node.getContent()
    })
    return fields
  }
  _getCompiledLine() {
    const compiler = this.getDefinition()._getCompilerObject()
    const catchAllCellDelimiter = compiler[GrammarConstantsCompiler.catchAllCellDelimiter]
    const str = compiler[GrammarConstantsCompiler.stringTemplate]
    return str !== undefined ? Utils.formatStr(str, catchAllCellDelimiter, Object.assign(this._getFields(), this.cells)) : this.getLine()
  }
  get listDelimiter() {
    return this.getDefinition()._getFromExtended(GrammarConstants.listDelimiter)
  }
  get contentKey() {
    return this.getDefinition()._getFromExtended(GrammarConstants.contentKey)
  }
  get childrenKey() {
    return this.getDefinition()._getFromExtended(GrammarConstants.childrenKey)
  }
  get childrenAreTextBlob() {
    return this.getDefinition()._isBlobNodeType()
  }
  get isArrayElement() {
    return this.getDefinition()._hasFromExtended(GrammarConstants.uniqueFirstWord) ? false : !this.getDefinition().isSingle
  }
  get list() {
    return this.listDelimiter ? this.getContent().split(this.listDelimiter) : super.list
  }
  get typedContent() {
    // todo: probably a better way to do this, perhaps by defining a cellDelimiter at the node level
    // todo: this currently parse anything other than string types
    if (this.listDelimiter) return this.getContent().split(this.listDelimiter)
    const cells = this._getParsedCells()
    if (cells.length === 2) return cells[1].getParsed()
    return this.getContent()
  }
  get typedTuple() {
    const key = this.getFirstWord()
    if (this.childrenAreTextBlob) return [key, this.childrenToString()]
    const { typedContent, contentKey, childrenKey } = this
    if (contentKey || childrenKey) {
      let obj = {}
      if (childrenKey) obj[childrenKey] = this.childrenToString()
      else obj = this.typedMap
      if (contentKey) {
        obj[contentKey] = typedContent
      }
      return [key, obj]
    }
    const hasChildren = this.length > 0
    const hasChildrenNoContent = typedContent === undefined && hasChildren
    const shouldReturnValueAsObject = hasChildrenNoContent
    if (shouldReturnValueAsObject) return [key, this.typedMap]
    const hasChildrenAndContent = typedContent !== undefined && hasChildren
    const shouldReturnValueAsContentPlusChildren = hasChildrenAndContent
    // If the node has a content and a subtree return it as a string, as
    // Javascript object values can't be both a leaf and a tree.
    if (shouldReturnValueAsContentPlusChildren) return [key, this.getContentWithChildren()]
    return [key, typedContent]
  }
  get _shouldSerialize() {
    const should = this.shouldSerialize
    return should === undefined ? true : should
  }
  get typedMap() {
    const obj = {}
    this.forEach(node => {
      if (!node._shouldSerialize) return true
      const tuple = node.typedTuple
      if (!node.isArrayElement) obj[tuple[0]] = tuple[1]
      else {
        if (!obj[tuple[0]]) obj[tuple[0]] = []
        obj[tuple[0]].push(tuple[1])
      }
    })
    return obj
  }
  fromTypedMap() {}
  compile() {
    if (this.isRoot()) return super.compile()
    const def = this.getDefinition()
    const indent = this._getCompiledIndentation()
    const compiledLine = this._getCompiledLine()
    if (def.isTerminalNodeType()) return indent + compiledLine
    const compiler = def._getCompilerObject()
    const openChildrenString = compiler[GrammarConstantsCompiler.openChildren] || ""
    const closeChildrenString = compiler[GrammarConstantsCompiler.closeChildren] || ""
    const childJoinCharacter = compiler[GrammarConstantsCompiler.joinChildrenWith] || "\n"
    const compiledChildren = this.map(child => child.compile()).join(childJoinCharacter)
    return `${indent + compiledLine}${openChildrenString}
${compiledChildren}
${indent}${closeChildrenString}`
  }
  // todo: remove
  get cells() {
    const cells = {}
    this._getParsedCells().forEach(cell => {
      const cellTypeId = cell.getCellTypeId()
      if (!cell.isCatchAll()) cells[cellTypeId] = cell.getParsed()
      else {
        if (!cells[cellTypeId]) cells[cellTypeId] = []
        cells[cellTypeId].push(cell.getParsed())
      }
    })
    return cells
  }
}
class BlobNode extends GrammarBackedNode {
  createParser() {
    return new TreeNode.Parser(BlobNode, {})
  }
  getErrors() {
    return []
  }
}
// todo: can we remove this? hard to extend.
class UnknownNodeTypeNode extends GrammarBackedNode {
  createParser() {
    return new TreeNode.Parser(UnknownNodeTypeNode, {})
  }
  getErrors() {
    return [new UnknownNodeTypeError(this)]
  }
}
/*
A cell contains a word but also the type information for that word.
*/
class AbstractGrammarBackedCell {
  constructor(node, index, typeDef, cellTypeId, isCatchAll, nodeTypeDef) {
    this._typeDef = typeDef
    this._node = node
    this._isCatchAll = isCatchAll
    this._index = index
    this._cellTypeId = cellTypeId
    this._nodeTypeDefinition = nodeTypeDef
  }
  getWord() {
    return this._node.getWord(this._index)
  }
  getDefinitionLineNumber() {
    return this._typeDef.getLineNumber()
  }
  getSQLiteType() {
    return SQLiteTypes.text
  }
  getCellTypeId() {
    return this._cellTypeId
  }
  getNode() {
    return this._node
  }
  getCellIndex() {
    return this._index
  }
  isCatchAll() {
    return this._isCatchAll
  }
  get min() {
    return this._getCellTypeDefinition().get(GrammarConstants.min) || "0"
  }
  get max() {
    return this._getCellTypeDefinition().get(GrammarConstants.max) || "100"
  }
  get placeholder() {
    return this._getCellTypeDefinition().get(GrammarConstants.examples) || ""
  }
  getHighlightScope() {
    const definition = this._getCellTypeDefinition()
    if (definition) return definition.getHighlightScope() // todo: why the undefined?
  }
  getAutoCompleteWords(partialWord = "") {
    const cellDef = this._getCellTypeDefinition()
    let words = cellDef ? cellDef._getAutocompleteWordOptions(this.getNode().getRootNode()) : []
    const runTimeOptions = this.getNode().getRunTimeEnumOptions(this)
    if (runTimeOptions) words = runTimeOptions.concat(words)
    if (partialWord) words = words.filter(word => word.includes(partialWord))
    return words.map(word => {
      return {
        text: word,
        displayText: word
      }
    })
  }
  synthesizeCell(seed = Date.now()) {
    // todo: cleanup
    const cellDef = this._getCellTypeDefinition()
    const enumOptions = cellDef._getFromExtended(GrammarConstants.enum)
    if (enumOptions) return Utils.getRandomString(1, enumOptions.split(" "))
    return this._synthesizeCell(seed)
  }
  _getStumpEnumInput(crux) {
    const cellDef = this._getCellTypeDefinition()
    const enumOptions = cellDef._getFromExtended(GrammarConstants.enum)
    if (!enumOptions) return undefined
    const options = new TreeNode(
      enumOptions
        .split(" ")
        .map(option => `option ${option}`)
        .join("\n")
    )
    return `select
 name ${crux}
${options.toString(1)}`
  }
  _toStumpInput(crux) {
    // todo: remove
    const enumInput = this._getStumpEnumInput(crux)
    if (enumInput) return enumInput
    // todo: cleanup. We shouldn't have these dual cellType classes.
    return `input
 name ${crux}
 placeholder ${this.placeholder}`
  }
  _getCellTypeDefinition() {
    return this._typeDef
  }
  _getFullLine() {
    return this.getNode().getLine()
  }
  _getErrorContext() {
    return this._getFullLine().split(" ")[0] // todo: WordBreakSymbol
  }
  isValid() {
    const runTimeOptions = this.getNode().getRunTimeEnumOptions(this)
    const word = this.getWord()
    if (runTimeOptions) return runTimeOptions.includes(word)
    return this._getCellTypeDefinition().isValid(word, this.getNode().getRootNode()) && this._isValid()
  }
  getErrorIfAny() {
    const word = this.getWord()
    if (word !== undefined && this.isValid()) return undefined
    // todo: refactor invalidwordError. We want better error messages.
    return word === undefined || word === "" ? new MissingWordError(this) : new InvalidWordError(this)
  }
}
AbstractGrammarBackedCell.parserFunctionName = ""
class GrammarBitCell extends AbstractGrammarBackedCell {
  _isValid() {
    const word = this.getWord()
    return word === "0" || word === "1"
  }
  _synthesizeCell() {
    return Utils.getRandomString(1, "01".split(""))
  }
  getRegexString() {
    return "[01]"
  }
  getParsed() {
    const word = this.getWord()
    return !!parseInt(word)
  }
}
GrammarBitCell.defaultHighlightScope = "constant.numeric"
class GrammarNumericCell extends AbstractGrammarBackedCell {
  _toStumpInput(crux) {
    return `input
 name ${crux}
 type number
 placeholder ${this.placeholder}
 min ${this.min}
 max ${this.max}`
  }
}
class GrammarIntCell extends GrammarNumericCell {
  _isValid() {
    const word = this.getWord()
    const num = parseInt(word)
    if (isNaN(num)) return false
    return num.toString() === word
  }
  _synthesizeCell(seed) {
    return Utils.randomUniformInt(parseInt(this.min), parseInt(this.max), seed).toString()
  }
  getRegexString() {
    return "-?[0-9]+"
  }
  getSQLiteType() {
    return SQLiteTypes.integer
  }
  getParsed() {
    const word = this.getWord()
    return parseInt(word)
  }
}
GrammarIntCell.defaultHighlightScope = "constant.numeric.integer"
GrammarIntCell.parserFunctionName = "parseInt"
class GrammarFloatCell extends GrammarNumericCell {
  _isValid() {
    const word = this.getWord()
    const num = parseFloat(word)
    return !isNaN(num) && /^-?\d*(\.\d+)?$/.test(word)
  }
  getSQLiteType() {
    return SQLiteTypes.float
  }
  _synthesizeCell(seed) {
    return Utils.randomUniformFloat(parseFloat(this.min), parseFloat(this.max), seed).toString()
  }
  getRegexString() {
    return "-?d*(.d+)?"
  }
  getParsed() {
    const word = this.getWord()
    return parseFloat(word)
  }
}
GrammarFloatCell.defaultHighlightScope = "constant.numeric.float"
GrammarFloatCell.parserFunctionName = "parseFloat"
// ErrorCellType => grammar asks for a '' cell type here but the grammar does not specify a '' cell type. (todo: bring in didyoumean?)
class GrammarBoolCell extends AbstractGrammarBackedCell {
  constructor() {
    super(...arguments)
    this._trues = new Set(["1", "true", "t", "yes"])
    this._falses = new Set(["0", "false", "f", "no"])
  }
  _isValid() {
    const word = this.getWord()
    const str = word.toLowerCase()
    return this._trues.has(str) || this._falses.has(str)
  }
  getSQLiteType() {
    return SQLiteTypes.integer
  }
  _synthesizeCell() {
    return Utils.getRandomString(1, ["1", "true", "t", "yes", "0", "false", "f", "no"])
  }
  _getOptions() {
    return Array.from(this._trues).concat(Array.from(this._falses))
  }
  getRegexString() {
    return "(?:" + this._getOptions().join("|") + ")"
  }
  getParsed() {
    const word = this.getWord()
    return this._trues.has(word.toLowerCase())
  }
}
GrammarBoolCell.defaultHighlightScope = "constant.numeric"
class GrammarAnyCell extends AbstractGrammarBackedCell {
  _isValid() {
    return true
  }
  _synthesizeCell() {
    const examples = this._getCellTypeDefinition()._getFromExtended(GrammarConstants.examples)
    if (examples) return Utils.getRandomString(1, examples.split(" "))
    return this._nodeTypeDefinition.getNodeTypeIdFromDefinition() + "-" + this.constructor.name
  }
  getRegexString() {
    return "[^ ]+"
  }
  getParsed() {
    return this.getWord()
  }
}
class GrammarKeywordCell extends GrammarAnyCell {
  _synthesizeCell() {
    return this._nodeTypeDefinition._getCruxIfAny()
  }
}
GrammarKeywordCell.defaultHighlightScope = "keyword"
class GrammarExtraWordCellTypeCell extends AbstractGrammarBackedCell {
  _isValid() {
    return false
  }
  synthesizeCell() {
    throw new Error(`Trying to synthesize a GrammarExtraWordCellTypeCell`)
    return this._synthesizeCell()
  }
  _synthesizeCell() {
    return "extraWord" // should never occur?
  }
  getParsed() {
    return this.getWord()
  }
  getErrorIfAny() {
    return new ExtraWordError(this)
  }
}
class GrammarUnknownCellTypeCell extends AbstractGrammarBackedCell {
  _isValid() {
    return false
  }
  synthesizeCell() {
    throw new Error(`Trying to synthesize an GrammarUnknownCellTypeCell`)
    return this._synthesizeCell()
  }
  _synthesizeCell() {
    return "extraWord" // should never occur?
  }
  getParsed() {
    return this.getWord()
  }
  getErrorIfAny() {
    return new UnknownCellTypeError(this)
  }
}
class AbstractTreeError {
  constructor(node) {
    this._node = node
  }
  getLineIndex() {
    return this.getLineNumber() - 1
  }
  getLineNumber() {
    return this.getNode()._getLineNumber() // todo: handle sourcemaps
  }
  isCursorOnWord(lineIndex, characterIndex) {
    return lineIndex === this.getLineIndex() && this._doesCharacterIndexFallOnWord(characterIndex)
  }
  _doesCharacterIndexFallOnWord(characterIndex) {
    return this.getCellIndex() === this.getNode().getWordIndexAtCharacterIndex(characterIndex)
  }
  // convenience method. may be removed.
  isBlankLineError() {
    return false
  }
  // convenience method. may be removed.
  isMissingWordError() {
    return false
  }
  getIndent() {
    return this.getNode().getIndentation()
  }
  getCodeMirrorLineWidgetElement(onApplySuggestionCallBack = () => {}) {
    const suggestion = this.getSuggestionMessage()
    if (this.isMissingWordError()) return this._getCodeMirrorLineWidgetElementCellTypeHints()
    if (suggestion) return this._getCodeMirrorLineWidgetElementWithSuggestion(onApplySuggestionCallBack, suggestion)
    return this._getCodeMirrorLineWidgetElementWithoutSuggestion()
  }
  getNodeTypeId() {
    return this.getNode()
      .getDefinition()
      .getNodeTypeIdFromDefinition()
  }
  _getCodeMirrorLineWidgetElementCellTypeHints() {
    const el = document.createElement("div")
    el.appendChild(
      document.createTextNode(
        this.getIndent() +
          this.getNode()
            .getDefinition()
            .getLineHints()
      )
    )
    el.className = "LintCellTypeHints"
    return el
  }
  _getCodeMirrorLineWidgetElementWithoutSuggestion() {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + this.getMessage()))
    el.className = "LintError"
    return el
  }
  _getCodeMirrorLineWidgetElementWithSuggestion(onApplySuggestionCallBack, suggestion) {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + `${this.getErrorTypeName()}. Suggestion: ${suggestion}`))
    el.className = "LintErrorWithSuggestion"
    el.onclick = () => {
      this.applySuggestion()
      onApplySuggestionCallBack()
    }
    return el
  }
  getLine() {
    return this.getNode().getLine()
  }
  getExtension() {
    return this.getNode()
      .getHandGrammarProgram()
      .getExtensionName()
  }
  getNode() {
    return this._node
  }
  getErrorTypeName() {
    return this.constructor.name.replace("Error", "")
  }
  getCellIndex() {
    return 0
  }
  toObject() {
    return {
      type: this.getErrorTypeName(),
      line: this.getLineNumber(),
      cell: this.getCellIndex(),
      suggestion: this.getSuggestionMessage(),
      path: this.getNode().getFirstWordPath(),
      message: this.getMessage()
    }
  }
  hasSuggestion() {
    return this.getSuggestionMessage() !== ""
  }
  getSuggestionMessage() {
    return ""
  }
  toString() {
    return this.getMessage()
  }
  applySuggestion() {}
  getMessage() {
    return `${this.getErrorTypeName()} at line ${this.getLineNumber()} cell ${this.getCellIndex()}.`
  }
}
class AbstractCellError extends AbstractTreeError {
  constructor(cell) {
    super(cell.getNode())
    this._cell = cell
  }
  getCell() {
    return this._cell
  }
  getCellIndex() {
    return this._cell.getCellIndex()
  }
  _getWordSuggestion() {
    return Utils.didYouMean(
      this.getCell().getWord(),
      this.getCell()
        .getAutoCompleteWords()
        .map(option => option.text)
    )
  }
}
class UnknownNodeTypeError extends AbstractTreeError {
  getMessage() {
    const node = this.getNode()
    const parentNode = node.getParent()
    const options = parentNode._getParser().getFirstWordOptions()
    return super.getMessage() + ` Invalid nodeType "${node.getFirstWord()}". Valid nodeTypes are: ${Utils._listToEnglishText(options, 7)}.`
  }
  _getWordSuggestion() {
    const node = this.getNode()
    const parentNode = node.getParent()
    return Utils.didYouMean(node.getFirstWord(), parentNode.getAutocompleteResults("", 0).map(option => option.text))
  }
  getSuggestionMessage() {
    const suggestion = this._getWordSuggestion()
    const node = this.getNode()
    if (suggestion) return `Change "${node.getFirstWord()}" to "${suggestion}"`
    return ""
  }
  applySuggestion() {
    const suggestion = this._getWordSuggestion()
    if (suggestion) this.getNode().setWord(this.getCellIndex(), suggestion)
    return this
  }
}
class BlankLineError extends UnknownNodeTypeError {
  getMessage() {
    return super.getMessage() + ` Line: "${this.getNode().getLine()}". Blank lines are errors.`
  }
  // convenience method
  isBlankLineError() {
    return true
  }
  getSuggestionMessage() {
    return `Delete line ${this.getLineNumber()}`
  }
  applySuggestion() {
    this.getNode().destroy()
    return this
  }
}
class MissingRequiredNodeTypeError extends AbstractTreeError {
  constructor(node, missingNodeTypeId) {
    super(node)
    this._missingNodeTypeId = missingNodeTypeId
  }
  getMessage() {
    return super.getMessage() + ` A "${this._missingNodeTypeId}" is required.`
  }
}
class NodeTypeUsedMultipleTimesError extends AbstractTreeError {
  getMessage() {
    return super.getMessage() + ` Multiple "${this.getNode().getFirstWord()}" found.`
  }
  getSuggestionMessage() {
    return `Delete line ${this.getLineNumber()}`
  }
  applySuggestion() {
    return this.getNode().destroy()
  }
}
class LineAppearsMultipleTimesError extends AbstractTreeError {
  getMessage() {
    return super.getMessage() + ` "${this.getNode().getLine()}" appears multiple times.`
  }
  getSuggestionMessage() {
    return `Delete line ${this.getLineNumber()}`
  }
  applySuggestion() {
    return this.getNode().destroy()
  }
}
class UnknownCellTypeError extends AbstractCellError {
  getMessage() {
    return super.getMessage() + ` No cellType "${this.getCell().getCellTypeId()}" found. Language grammar for "${this.getExtension()}" may need to be fixed.`
  }
}
class InvalidWordError extends AbstractCellError {
  getMessage() {
    return super.getMessage() + ` "${this.getCell().getWord()}" does not fit in cellType "${this.getCell().getCellTypeId()}".`
  }
  getSuggestionMessage() {
    const suggestion = this._getWordSuggestion()
    if (suggestion) return `Change "${this.getCell().getWord()}" to "${suggestion}"`
    return ""
  }
  applySuggestion() {
    const suggestion = this._getWordSuggestion()
    if (suggestion) this.getNode().setWord(this.getCellIndex(), suggestion)
    return this
  }
}
class ExtraWordError extends AbstractCellError {
  getMessage() {
    return super.getMessage() + ` Extra word "${this.getCell().getWord()}" in ${this.getNodeTypeId()}.`
  }
  getSuggestionMessage() {
    return `Delete word "${this.getCell().getWord()}" at cell ${this.getCellIndex()}`
  }
  applySuggestion() {
    return this.getNode().deleteWordAt(this.getCellIndex())
  }
}
class MissingWordError extends AbstractCellError {
  // todo: autocomplete suggestion
  getMessage() {
    return super.getMessage() + ` Missing word for cell "${this.getCell().getCellTypeId()}".`
  }
  isMissingWordError() {
    return true
  }
}
// todo: add standard types, enum types, from disk types
class AbstractGrammarWordTestNode extends TreeNode {}
class GrammarRegexTestNode extends AbstractGrammarWordTestNode {
  isValid(str) {
    if (!this._regex) this._regex = new RegExp("^" + this.getContent() + "$")
    return !!str.match(this._regex)
  }
}
class GrammarReservedWordsTestNode extends AbstractGrammarWordTestNode {
  isValid(str) {
    if (!this._set) this._set = new Set(this.getContent().split(" "))
    return !this._set.has(str)
  }
}
// todo: remove in favor of custom word type constructors
class EnumFromCellTypesTestNode extends AbstractGrammarWordTestNode {
  _getEnumFromCellTypes(programRootNode) {
    const cellTypeIds = this.getWordsFrom(1)
    const enumGroup = cellTypeIds.join(" ")
    // note: hack where we store it on the program. otherwise has global effects.
    if (!programRootNode._enumMaps) programRootNode._enumMaps = {}
    if (programRootNode._enumMaps[enumGroup]) return programRootNode._enumMaps[enumGroup]
    const wordIndex = 1
    const map = {}
    const cellTypeMap = {}
    cellTypeIds.forEach(typeId => (cellTypeMap[typeId] = true))
    programRootNode
      .getAllTypedWords()
      .filter(typedWord => cellTypeMap[typedWord.type])
      .forEach(typedWord => {
        map[typedWord.word] = true
      })
    programRootNode._enumMaps[enumGroup] = map
    return map
  }
  // todo: remove
  isValid(str, programRootNode) {
    return this._getEnumFromCellTypes(programRootNode)[str] === true
  }
}
class GrammarEnumTestNode extends AbstractGrammarWordTestNode {
  isValid(str) {
    // enum c c++ java
    return !!this.getOptions()[str]
  }
  getOptions() {
    if (!this._map) this._map = Utils.arrayToMap(this.getWordsFrom(1))
    return this._map
  }
}
class cellTypeDefinitionNode extends AbstractExtendibleTreeNode {
  createParser() {
    const types = {}
    types[GrammarConstants.regex] = GrammarRegexTestNode
    types[GrammarConstants.reservedWords] = GrammarReservedWordsTestNode
    types[GrammarConstants.enumFromCellTypes] = EnumFromCellTypesTestNode
    types[GrammarConstants.enum] = GrammarEnumTestNode
    types[GrammarConstants.highlightScope] = TreeNode
    types[GrammarConstants.todoComment] = TreeNode
    types[GrammarConstants.examples] = TreeNode
    types[GrammarConstants.min] = TreeNode
    types[GrammarConstants.max] = TreeNode
    types[GrammarConstants.description] = TreeNode
    types[GrammarConstants.extends] = TreeNode
    return new TreeNode.Parser(undefined, types)
  }
  _getId() {
    return this.getWord(0)
  }
  _getIdToNodeMap() {
    return this.getParent().getCellTypeDefinitions()
  }
  getGetter(wordIndex) {
    const wordToNativeJavascriptTypeParser = this.getCellConstructor().parserFunctionName
    return `get ${this.getCellTypeId()}() {
      return ${wordToNativeJavascriptTypeParser ? wordToNativeJavascriptTypeParser + `(this.getWord(${wordIndex}))` : `this.getWord(${wordIndex})`}
    }`
  }
  getCatchAllGetter(wordIndex) {
    const wordToNativeJavascriptTypeParser = this.getCellConstructor().parserFunctionName
    return `get ${this.getCellTypeId()}() {
      return ${wordToNativeJavascriptTypeParser ? `this.getWordsFrom(${wordIndex}).map(val => ${wordToNativeJavascriptTypeParser}(val))` : `this.getWordsFrom(${wordIndex})`}
    }`
  }
  // `this.getWordsFrom(${requireds.length + 1})`
  // todo: cleanup typings. todo: remove this hidden logic. have a "baseType" property?
  getCellConstructor() {
    return this._getPreludeKind() || GrammarAnyCell
  }
  _getPreludeKind() {
    return PreludeKinds[this.getWord(0)] || PreludeKinds[this._getExtendedCellTypeId()]
  }
  _getPreludeKindId() {
    if (PreludeKinds[this.getWord(0)]) return this.getWord(0)
    else if (PreludeKinds[this._getExtendedCellTypeId()]) return this._getExtendedCellTypeId()
    return PreludeCellTypeIds.anyCell
  }
  _getExtendedCellTypeId() {
    const arr = this._getAncestorsArray()
    return arr[arr.length - 1]._getId()
  }
  getHighlightScope() {
    const hs = this._getFromExtended(GrammarConstants.highlightScope)
    if (hs) return hs
    const preludeKind = this._getPreludeKind()
    if (preludeKind) return preludeKind.defaultHighlightScope
  }
  _getEnumOptions() {
    const enumNode = this._getNodeFromExtended(GrammarConstants.enum)
    if (!enumNode) return undefined
    // we sort by longest first to capture longest match first. todo: add test
    const options = Object.keys(enumNode.getNode(GrammarConstants.enum).getOptions())
    options.sort((a, b) => b.length - a.length)
    return options
  }
  _getEnumFromCellTypeOptions(program) {
    const node = this._getNodeFromExtended(GrammarConstants.enumFromCellTypes)
    return node ? Object.keys(node.getNode(GrammarConstants.enumFromCellTypes)._getEnumFromCellTypes(program)) : undefined
  }
  _getAutocompleteWordOptions(program) {
    return this._getEnumOptions() || this._getEnumFromCellTypeOptions(program) || []
  }
  getRegexString() {
    // todo: enum
    const enumOptions = this._getEnumOptions()
    return this._getFromExtended(GrammarConstants.regex) || (enumOptions ? "(?:" + enumOptions.join("|") + ")" : "[^ ]*")
  }
  _getAllTests() {
    return this._getChildrenByNodeConstructorInExtended(AbstractGrammarWordTestNode)
  }
  isValid(str, programRootNode) {
    return this._getAllTests().every(node => node.isValid(str, programRootNode))
  }
  getCellTypeId() {
    return this.getWord(0)
  }
}
class AbstractCellParser {
  constructor(definition) {
    this._definition = definition
  }
  getCatchAllCellTypeId() {
    return this._definition._getFromExtended(GrammarConstants.catchAllCellType)
  }
  // todo: improve layout (use bold?)
  getLineHints() {
    const catchAllCellTypeId = this.getCatchAllCellTypeId()
    const nodeTypeId = this._definition._getCruxIfAny() || this._definition._getId() // todo: cleanup
    return `${nodeTypeId}: ${this.getRequiredCellTypeIds().join(" ")}${catchAllCellTypeId ? ` ${catchAllCellTypeId}...` : ""}`
  }
  getRequiredCellTypeIds() {
    if (!this._requiredCellTypeIds) {
      const parameters = this._definition._getFromExtended(GrammarConstants.cells)
      this._requiredCellTypeIds = parameters ? parameters.split(" ") : []
    }
    return this._requiredCellTypeIds
  }
  _getCellTypeId(cellIndex, requiredCellTypeIds, totalWordCount) {
    return requiredCellTypeIds[cellIndex]
  }
  _isCatchAllCell(cellIndex, numberOfRequiredCells, totalWordCount) {
    return cellIndex >= numberOfRequiredCells
  }
  getCellArray(node = undefined) {
    const wordCount = node ? node.getWords().length : 0
    const def = this._definition
    const grammarProgram = def.getLanguageDefinitionProgram()
    const requiredCellTypeIds = this.getRequiredCellTypeIds()
    const numberOfRequiredCells = requiredCellTypeIds.length
    const actualWordCountOrRequiredCellCount = Math.max(wordCount, numberOfRequiredCells)
    const cells = []
    // A for loop instead of map because "numberOfCellsToFill" can be longer than words.length
    for (let cellIndex = 0; cellIndex < actualWordCountOrRequiredCellCount; cellIndex++) {
      const isCatchAll = this._isCatchAllCell(cellIndex, numberOfRequiredCells, wordCount)
      let cellTypeId = isCatchAll ? this.getCatchAllCellTypeId() : this._getCellTypeId(cellIndex, requiredCellTypeIds, wordCount)
      let cellTypeDefinition = grammarProgram.getCellTypeDefinitionById(cellTypeId)
      let cellConstructor
      if (cellTypeDefinition) cellConstructor = cellTypeDefinition.getCellConstructor()
      else if (cellTypeId) cellConstructor = GrammarUnknownCellTypeCell
      else {
        cellConstructor = GrammarExtraWordCellTypeCell
        cellTypeId = PreludeCellTypeIds.extraWordCell
        cellTypeDefinition = grammarProgram.getCellTypeDefinitionById(cellTypeId)
      }
      const anyCellConstructor = cellConstructor
      cells[cellIndex] = new anyCellConstructor(node, cellIndex, cellTypeDefinition, cellTypeId, isCatchAll, def)
    }
    return cells
  }
}
class PrefixCellParser extends AbstractCellParser {}
class PostfixCellParser extends AbstractCellParser {
  _isCatchAllCell(cellIndex, numberOfRequiredCells, totalWordCount) {
    return cellIndex < totalWordCount - numberOfRequiredCells
  }
  _getCellTypeId(cellIndex, requiredCellTypeIds, totalWordCount) {
    const catchAllWordCount = Math.max(totalWordCount - requiredCellTypeIds.length, 0)
    return requiredCellTypeIds[cellIndex - catchAllWordCount]
  }
}
class OmnifixCellParser extends AbstractCellParser {
  getCellArray(node = undefined) {
    const cells = []
    const def = this._definition
    const program = node ? node.getRootNode() : undefined
    const grammarProgram = def.getLanguageDefinitionProgram()
    const words = node ? node.getWords() : []
    const requiredCellTypeDefs = this.getRequiredCellTypeIds().map(cellTypeId => grammarProgram.getCellTypeDefinitionById(cellTypeId))
    const catchAllCellTypeId = this.getCatchAllCellTypeId()
    const catchAllCellTypeDef = catchAllCellTypeId && grammarProgram.getCellTypeDefinitionById(catchAllCellTypeId)
    words.forEach((word, wordIndex) => {
      let cellConstructor
      for (let index = 0; index < requiredCellTypeDefs.length; index++) {
        const cellTypeDefinition = requiredCellTypeDefs[index]
        if (cellTypeDefinition.isValid(word, program)) {
          // todo: cleanup cellIndex/wordIndex stuff
          cellConstructor = cellTypeDefinition.getCellConstructor()
          cells.push(new cellConstructor(node, wordIndex, cellTypeDefinition, cellTypeDefinition._getId(), false, def))
          requiredCellTypeDefs.splice(index, 1)
          return true
        }
      }
      if (catchAllCellTypeDef && catchAllCellTypeDef.isValid(word, program)) {
        cellConstructor = catchAllCellTypeDef.getCellConstructor()
        cells.push(new cellConstructor(node, wordIndex, catchAllCellTypeDef, catchAllCellTypeId, true, def))
        return true
      }
      cells.push(new GrammarUnknownCellTypeCell(node, wordIndex, undefined, undefined, false, def))
    })
    const wordCount = words.length
    requiredCellTypeDefs.forEach((cellTypeDef, index) => {
      let cellConstructor = cellTypeDef.getCellConstructor()
      cells.push(new cellConstructor(node, wordCount + index, cellTypeDef, cellTypeDef._getId(), false, def))
    })
    return cells
  }
}
class GrammarExampleNode extends TreeNode {}
class GrammarCompilerNode extends TreeNode {
  createParser() {
    const types = [
      GrammarConstantsCompiler.stringTemplate,
      GrammarConstantsCompiler.indentCharacter,
      GrammarConstantsCompiler.catchAllCellDelimiter,
      GrammarConstantsCompiler.joinChildrenWith,
      GrammarConstantsCompiler.openChildren,
      GrammarConstantsCompiler.closeChildren
    ]
    const map = {}
    types.forEach(type => {
      map[type] = TreeNode
    })
    return new TreeNode.Parser(undefined, map)
  }
}
class GrammarNodeTypeConstant extends TreeNode {
  getGetter() {
    return `get ${this.getIdentifier()}() { return ${this.getConstantValueAsJsText()} }`
  }
  getIdentifier() {
    return this.getWord(1)
  }
  getConstantValueAsJsText() {
    const words = this.getWordsFrom(2)
    return words.length > 1 ? `[${words.join(",")}]` : words[0]
  }
  getConstantValue() {
    return JSON.parse(this.getConstantValueAsJsText())
  }
}
class GrammarNodeTypeConstantInt extends GrammarNodeTypeConstant {}
class GrammarNodeTypeConstantString extends GrammarNodeTypeConstant {
  getConstantValueAsJsText() {
    return "`" + Utils.escapeBackTicks(this.getConstantValue()) + "`"
  }
  getConstantValue() {
    return this.length ? this.childrenToString() : this.getWordsFrom(2).join(" ")
  }
}
class GrammarNodeTypeConstantFloat extends GrammarNodeTypeConstant {}
class GrammarNodeTypeConstantBoolean extends GrammarNodeTypeConstant {}
class AbstractGrammarDefinitionNode extends AbstractExtendibleTreeNode {
  createParser() {
    // todo: some of these should just be on nonRootNodes
    const types = [
      GrammarConstants.frequency,
      GrammarConstants.inScope,
      GrammarConstants.cells,
      GrammarConstants.extends,
      GrammarConstants.description,
      GrammarConstants.catchAllNodeType,
      GrammarConstants.catchAllCellType,
      GrammarConstants.cellParser,
      GrammarConstants.extensions,
      GrammarConstants.version,
      GrammarConstants.tags,
      GrammarConstants.crux,
      GrammarConstants.cruxFromId,
      GrammarConstants.listDelimiter,
      GrammarConstants.contentKey,
      GrammarConstants.childrenKey,
      GrammarConstants.uniqueFirstWord,
      GrammarConstants.uniqueLine,
      GrammarConstants.pattern,
      GrammarConstants.baseNodeType,
      GrammarConstants.required,
      GrammarConstants.root,
      GrammarConstants._extendsJsClass,
      GrammarConstants._rootNodeJsHeader,
      GrammarConstants.javascript,
      GrammarConstants.compilesTo,
      GrammarConstants.javascript,
      GrammarConstants.single,
      GrammarConstants.todoComment
    ]
    const map = {}
    types.forEach(type => {
      map[type] = TreeNode
    })
    map[GrammarConstantsConstantTypes.boolean] = GrammarNodeTypeConstantBoolean
    map[GrammarConstantsConstantTypes.int] = GrammarNodeTypeConstantInt
    map[GrammarConstantsConstantTypes.string] = GrammarNodeTypeConstantString
    map[GrammarConstantsConstantTypes.float] = GrammarNodeTypeConstantFloat
    map[GrammarConstants.compilerNodeType] = GrammarCompilerNode
    map[GrammarConstants.example] = GrammarExampleNode
    return new TreeNode.Parser(undefined, map)
  }
  toTypeScriptInterface(used = new Set()) {
    let childrenInterfaces = []
    let properties = []
    const inScope = this.getFirstWordMapWithDefinitions()
    const thisId = this._getId()
    used.add(thisId)
    Object.keys(inScope).forEach(key => {
      const def = inScope[key]
      const map = def.getFirstWordMapWithDefinitions()
      const id = def._getId()
      const optionalTag = def.isRequired() ? "" : "?"
      const escapedKey = key.match(/\?/) ? `"${key}"` : key
      const description = def.getDescription()
      if (Object.keys(map).length && !used.has(id)) {
        childrenInterfaces.push(def.toTypeScriptInterface(used))
        properties.push(` ${escapedKey}${optionalTag}: ${id}`)
      } else properties.push(` ${escapedKey}${optionalTag}: any${description ? " // " + description : ""}`)
    })
    properties.sort()
    const description = this.getDescription()
    const myInterface = ""
    return `${childrenInterfaces.join("\n")}
${description ? "// " + description : ""}
interface ${thisId} {
${properties.join("\n")}
}`.trim()
  }
  getTableNameIfAny() {
    return this.getFrom(`${GrammarConstantsConstantTypes.string} ${GrammarConstantsMisc.tableName}`)
  }
  getSQLiteTableColumns() {
    return this._getConcreteNonErrorInScopeNodeDefinitions(this._getInScopeNodeTypeIds()).map(def => {
      const firstNonKeywordCellType = def.getCellParser().getCellArray()[1]
      let type = firstNonKeywordCellType ? firstNonKeywordCellType.getSQLiteType() : SQLiteTypes.text
      // For now if it can have children serialize it as text in SQLite
      if (!def.isTerminalNodeType()) type = SQLiteTypes.text
      return {
        columnName: def._getIdWithoutSuffix(),
        type
      }
    })
  }
  toSQLiteTableSchema() {
    const columns = this.getSQLiteTableColumns().map(columnDef => `${columnDef.columnName} ${columnDef.type}`)
    return `create table ${this.getTableNameIfAny() || this._getId()} (
 id TEXT NOT NULL PRIMARY KEY,
 ${columns.join(",\n ")}
);`
  }
  _getId() {
    return this.getWord(0)
  }
  get id() {
    return this._getId()
  }
  _getIdWithoutSuffix() {
    return this._getId().replace(HandGrammarProgram.nodeTypeSuffixRegex, "")
  }
  getConstantsObject() {
    const obj = this._getUniqueConstantNodes()
    Object.keys(obj).forEach(key => (obj[key] = obj[key].getConstantValue()))
    return obj
  }
  _getUniqueConstantNodes(extended = true) {
    const obj = {}
    const items = extended ? this._getChildrenByNodeConstructorInExtended(GrammarNodeTypeConstant) : this.getChildrenByNodeConstructor(GrammarNodeTypeConstant)
    items.reverse() // Last definition wins.
    items.forEach(node => {
      obj[node.getIdentifier()] = node
    })
    return obj
  }
  getExamples() {
    return this._getChildrenByNodeConstructorInExtended(GrammarExampleNode)
  }
  getNodeTypeIdFromDefinition() {
    return this.getWord(0)
  }
  // todo: remove? just reused nodeTypeId
  _getGeneratedClassName() {
    return this.getNodeTypeIdFromDefinition()
  }
  _hasValidNodeTypeId() {
    return !!this._getGeneratedClassName()
  }
  _isAbstract() {
    return this.id.startsWith(GrammarConstants.abstractNodeTypePrefix)
  }
  _getConcreteDescendantDefinitions() {
    const defs = this._getProgramNodeTypeDefinitionCache()
    const id = this._getId()
    return Object.values(defs).filter(def => {
      return def._doesExtend(id) && !def._isAbstract()
    })
  }
  _getCruxIfAny() {
    return this.get(GrammarConstants.crux) || (this._hasFromExtended(GrammarConstants.cruxFromId) ? this._getIdWithoutSuffix() : undefined)
  }
  _getRegexMatch() {
    return this.get(GrammarConstants.pattern)
  }
  _getFirstCellEnumOptions() {
    const firstCellDef = this._getMyCellTypeDefs()[0]
    return firstCellDef ? firstCellDef._getEnumOptions() : undefined
  }
  getLanguageDefinitionProgram() {
    return this.getParent()
  }
  _getCustomJavascriptMethods() {
    const hasJsCode = this.has(GrammarConstants.javascript)
    return hasJsCode ? this.getNode(GrammarConstants.javascript).childrenToString() : ""
  }
  getFirstWordMapWithDefinitions() {
    if (!this._cache_firstWordToNodeDefMap) this._cache_firstWordToNodeDefMap = this._createParserInfo(this._getInScopeNodeTypeIds()).firstWordMap
    return this._cache_firstWordToNodeDefMap
  }
  // todo: remove
  getRunTimeFirstWordsInScope() {
    return this._getParser().getFirstWordOptions()
  }
  _getMyCellTypeDefs() {
    const requiredCells = this.get(GrammarConstants.cells)
    if (!requiredCells) return []
    const grammarProgram = this.getLanguageDefinitionProgram()
    return requiredCells.split(" ").map(cellTypeId => {
      const cellTypeDef = grammarProgram.getCellTypeDefinitionById(cellTypeId)
      if (!cellTypeDef) throw new Error(`No cellType "${cellTypeId}" found`)
      return cellTypeDef
    })
  }
  // todo: what happens when you have a cell getter and constant with same name?
  _getCellGettersAndNodeTypeConstants() {
    // todo: add cellType parsings
    const grammarProgram = this.getLanguageDefinitionProgram()
    const getters = this._getMyCellTypeDefs().map((cellTypeDef, index) => cellTypeDef.getGetter(index))
    const catchAllCellTypeId = this.get(GrammarConstants.catchAllCellType)
    if (catchAllCellTypeId) getters.push(grammarProgram.getCellTypeDefinitionById(catchAllCellTypeId).getCatchAllGetter(getters.length))
    // Constants
    Object.values(this._getUniqueConstantNodes(false)).forEach(node => {
      getters.push(node.getGetter())
    })
    return getters.join("\n")
  }
  _createParserInfo(nodeTypeIdsInScope) {
    const result = {
      firstWordMap: {},
      regexTests: []
    }
    if (!nodeTypeIdsInScope.length) return result
    const allProgramNodeTypeDefinitionsMap = this._getProgramNodeTypeDefinitionCache()
    Object.keys(allProgramNodeTypeDefinitionsMap)
      .filter(nodeTypeId => allProgramNodeTypeDefinitionsMap[nodeTypeId].isOrExtendsANodeTypeInScope(nodeTypeIdsInScope))
      .filter(nodeTypeId => !allProgramNodeTypeDefinitionsMap[nodeTypeId]._isAbstract())
      .forEach(nodeTypeId => {
        const def = allProgramNodeTypeDefinitionsMap[nodeTypeId]
        const regex = def._getRegexMatch()
        const crux = def._getCruxIfAny()
        const enumOptions = def._getFirstCellEnumOptions()
        if (regex) result.regexTests.push({ regex: regex, nodeConstructor: def.getNodeTypeIdFromDefinition() })
        else if (crux) result.firstWordMap[crux] = def
        else if (enumOptions) {
          enumOptions.forEach(option => {
            result.firstWordMap[option] = def
          })
        }
      })
    return result
  }
  getTopNodeTypeDefinitions() {
    const arr = Object.values(this.getFirstWordMapWithDefinitions())
    arr.sort(Utils.makeSortByFn(definition => definition.getFrequency()))
    arr.reverse()
    return arr
  }
  _getMyInScopeNodeTypeIds() {
    const nodeTypesNode = this.getNode(GrammarConstants.inScope)
    return nodeTypesNode ? nodeTypesNode.getWordsFrom(1) : []
  }
  _getInScopeNodeTypeIds() {
    // todo: allow multiple of these if we allow mixins?
    const ids = this._getMyInScopeNodeTypeIds()
    const parentDef = this._getExtendedParent()
    return parentDef ? ids.concat(parentDef._getInScopeNodeTypeIds()) : ids
  }
  get isSingle() {
    const hit = this._getNodeFromExtended(GrammarConstants.single)
    return hit && hit.get(GrammarConstants.single) !== "false"
  }
  get isUniqueLine() {
    const hit = this._getNodeFromExtended(GrammarConstants.uniqueLine)
    return hit && hit.get(GrammarConstants.uniqueLine) !== "false"
  }
  isRequired() {
    return this._hasFromExtended(GrammarConstants.required)
  }
  getNodeTypeDefinitionByNodeTypeId(nodeTypeId) {
    // todo: return catch all?
    const def = this._getProgramNodeTypeDefinitionCache()[nodeTypeId]
    if (def) return def
    // todo: cleanup
    this.getLanguageDefinitionProgram()._addDefaultCatchAllBlobNode()
    return this._getProgramNodeTypeDefinitionCache()[nodeTypeId]
  }
  isDefined(nodeTypeId) {
    return !!this._getProgramNodeTypeDefinitionCache()[nodeTypeId]
  }
  _getIdToNodeMap() {
    return this._getProgramNodeTypeDefinitionCache()
  }
  _amIRoot() {
    if (this._cache_isRoot === undefined) this._cache_isRoot = this._getLanguageRootNode() === this
    return this._cache_isRoot
  }
  _getLanguageRootNode() {
    return this.getParent().getRootNodeTypeDefinitionNode()
  }
  _isErrorNodeType() {
    return this.get(GrammarConstants.baseNodeType) === GrammarConstants.errorNode
  }
  _isBlobNodeType() {
    // Do not check extended classes. Only do once.
    return this._getFromExtended(GrammarConstants.baseNodeType) === GrammarConstants.blobNode
  }
  _getErrorMethodToJavascript() {
    if (this._isBlobNodeType()) return "getErrors() { return [] }" // Skips parsing child nodes for perf gains.
    if (this._isErrorNodeType()) return "getErrors() { return this._getErrorNodeErrors() }"
    return ""
  }
  _getParserToJavascript() {
    if (this._isBlobNodeType())
      // todo: do we need this?
      return "createParser() { return new jtree.TreeNode.Parser(this._getBlobNodeCatchAllNodeType())}"
    const parserInfo = this._createParserInfo(this._getMyInScopeNodeTypeIds())
    const myFirstWordMap = parserInfo.firstWordMap
    const regexRules = parserInfo.regexTests
    // todo: use constants in first word maps?
    // todo: cache the super extending?
    const firstWords = Object.keys(myFirstWordMap)
    const hasFirstWords = firstWords.length
    const catchAllConstructor = this._getCatchAllNodeConstructorToJavascript()
    if (!hasFirstWords && !catchAllConstructor && !regexRules.length) return ""
    const firstWordsStr = hasFirstWords
      ? `Object.assign(Object.assign({}, super.createParser()._getFirstWordMapAsObject()), {` + firstWords.map(firstWord => `"${firstWord}" : ${myFirstWordMap[firstWord].getNodeTypeIdFromDefinition()}`).join(",\n") + "})"
      : "undefined"
    const regexStr = regexRules.length
      ? `[${regexRules
          .map(rule => {
            return `{regex: /${rule.regex}/, nodeConstructor: ${rule.nodeConstructor}}`
          })
          .join(",")}]`
      : "undefined"
    const catchAllStr = catchAllConstructor ? catchAllConstructor : this._amIRoot() ? `this._getBlobNodeCatchAllNodeType()` : "undefined"
    return `createParser() {
  return new jtree.TreeNode.Parser(${catchAllStr}, ${firstWordsStr}, ${regexStr})
  }`
  }
  _getCatchAllNodeConstructorToJavascript() {
    if (this._isBlobNodeType()) return "this._getBlobNodeCatchAllNodeType()"
    const nodeTypeId = this.get(GrammarConstants.catchAllNodeType)
    if (!nodeTypeId) return ""
    const nodeDef = this.getNodeTypeDefinitionByNodeTypeId(nodeTypeId)
    if (!nodeDef) throw new Error(`No definition found for nodeType id "${nodeTypeId}"`)
    return nodeDef._getGeneratedClassName()
  }
  _nodeDefToJavascriptClass() {
    const components = [this._getParserToJavascript(), this._getErrorMethodToJavascript(), this._getCellGettersAndNodeTypeConstants(), this._getCustomJavascriptMethods()].filter(identity => identity)
    if (this._amIRoot()) {
      components.push(`static cachedHandGrammarProgramRoot = new jtree.HandGrammarProgram(\`${Utils.escapeBackTicks(
        this.getParent()
          .toString()
          .replace(/\\/g, "\\\\")
      )}\`)
        getHandGrammarProgram() {
          return this.constructor.cachedHandGrammarProgramRoot
      }`)
      const nodeTypeMap = this.getLanguageDefinitionProgram()
        .getValidConcreteAndAbstractNodeTypeDefinitions()
        .map(def => {
          const id = def.getNodeTypeIdFromDefinition()
          return `"${id}": ${id}`
        })
        .join(",\n")
      components.push(`static getNodeTypeMap() { return {${nodeTypeMap} }}`)
    }
    return `class ${this._getGeneratedClassName()} extends ${this._getExtendsClassName()} {
      ${components.join("\n")}
    }`
  }
  _getExtendsClassName() {
    // todo: this is hopefully a temporary line in place for now for the case where you want your base class to extend something other than another treeclass
    const hardCodedExtend = this.get(GrammarConstants._extendsJsClass)
    if (hardCodedExtend) return hardCodedExtend
    const extendedDef = this._getExtendedParent()
    return extendedDef ? extendedDef._getGeneratedClassName() : "jtree.GrammarBackedNode"
  }
  _getCompilerObject() {
    let obj = {}
    const items = this._getChildrenByNodeConstructorInExtended(GrammarCompilerNode)
    items.reverse() // Last definition wins.
    items.forEach(node => {
      obj = Object.assign(obj, node.toObject()) // todo: what about multiline strings?
    })
    return obj
  }
  // todo: improve layout (use bold?)
  getLineHints() {
    return this.getCellParser().getLineHints()
  }
  isOrExtendsANodeTypeInScope(firstWordsInScope) {
    const chain = this._getNodeTypeInheritanceSet()
    return firstWordsInScope.some(firstWord => chain.has(firstWord))
  }
  isTerminalNodeType() {
    return !this._getFromExtended(GrammarConstants.inScope) && !this._getFromExtended(GrammarConstants.catchAllNodeType)
  }
  _getSublimeMatchLine() {
    const regexMatch = this._getRegexMatch()
    if (regexMatch) return `'${regexMatch}'`
    const cruxMatch = this._getCruxIfAny()
    if (cruxMatch) return `'^ *${Utils.escapeRegExp(cruxMatch)}(?: |$)'`
    const enumOptions = this._getFirstCellEnumOptions()
    if (enumOptions) return `'^ *(${Utils.escapeRegExp(enumOptions.join("|"))})(?: |$)'`
  }
  // todo: refactor. move some parts to cellParser?
  _toSublimeMatchBlock() {
    const defaultHighlightScope = "source"
    const program = this.getLanguageDefinitionProgram()
    const cellParser = this.getCellParser()
    const requiredCellTypeIds = cellParser.getRequiredCellTypeIds()
    const catchAllCellTypeId = cellParser.getCatchAllCellTypeId()
    const firstCellTypeDef = program.getCellTypeDefinitionById(requiredCellTypeIds[0])
    const firstWordHighlightScope = (firstCellTypeDef ? firstCellTypeDef.getHighlightScope() : defaultHighlightScope) + "." + this.getNodeTypeIdFromDefinition()
    const topHalf = ` '${this.getNodeTypeIdFromDefinition()}':
  - match: ${this._getSublimeMatchLine()}
    scope: ${firstWordHighlightScope}`
    if (catchAllCellTypeId) requiredCellTypeIds.push(catchAllCellTypeId)
    if (!requiredCellTypeIds.length) return topHalf
    const captures = requiredCellTypeIds
      .map((cellTypeId, index) => {
        const cellTypeDefinition = program.getCellTypeDefinitionById(cellTypeId) // todo: cleanup
        if (!cellTypeDefinition) throw new Error(`No ${GrammarConstants.cellType} ${cellTypeId} found`) // todo: standardize error/capture error at grammar time
        return `        ${index + 1}: ${(cellTypeDefinition.getHighlightScope() || defaultHighlightScope) + "." + cellTypeDefinition.getCellTypeId()}`
      })
      .join("\n")
    const cellTypesToRegex = cellTypeIds => cellTypeIds.map(cellTypeId => `({{${cellTypeId}}})?`).join(" ?")
    return `${topHalf}
    push:
     - match: ${cellTypesToRegex(requiredCellTypeIds)}
       captures:
${captures}
     - match: $
       pop: true`
  }
  _getNodeTypeInheritanceSet() {
    if (!this._cache_nodeTypeInheritanceSet) this._cache_nodeTypeInheritanceSet = new Set(this.getAncestorNodeTypeIdsArray())
    return this._cache_nodeTypeInheritanceSet
  }
  getAncestorNodeTypeIdsArray() {
    if (!this._cache_ancestorNodeTypeIdsArray) {
      this._cache_ancestorNodeTypeIdsArray = this._getAncestorsArray().map(def => def.getNodeTypeIdFromDefinition())
      this._cache_ancestorNodeTypeIdsArray.reverse()
    }
    return this._cache_ancestorNodeTypeIdsArray
  }
  _getProgramNodeTypeDefinitionCache() {
    return this.getLanguageDefinitionProgram()._getProgramNodeTypeDefinitionCache()
  }
  getDescription() {
    return this._getFromExtended(GrammarConstants.description) || ""
  }
  getFrequency() {
    const val = this._getFromExtended(GrammarConstants.frequency)
    return val ? parseFloat(val) : 0
  }
  _getExtendedNodeTypeId() {
    const ancestorIds = this.getAncestorNodeTypeIdsArray()
    if (ancestorIds.length > 1) return ancestorIds[ancestorIds.length - 2]
  }
  _toStumpString() {
    const crux = this._getCruxIfAny()
    const cellArray = this.getCellParser()
      .getCellArray()
      .filter((item, index) => index) // for now this only works for keyword langs
    if (!cellArray.length)
      // todo: remove this! just doing it for now until we refactor getCellArray to handle catchAlls better.
      return ""
    const cells = new TreeNode(cellArray.map((cell, index) => cell._toStumpInput(crux)).join("\n"))
    return `div
 label ${crux}
${cells.toString(1)}`
  }
  toStumpString() {
    const nodeBreakSymbol = "\n"
    return this._getConcreteNonErrorInScopeNodeDefinitions(this._getInScopeNodeTypeIds())
      .map(def => def._toStumpString())
      .filter(identity => identity)
      .join(nodeBreakSymbol)
  }
  _generateSimulatedLine(seed) {
    // todo: generate simulated data from catch all
    const crux = this._getCruxIfAny()
    return this.getCellParser()
      .getCellArray()
      .map((cell, index) => (!index && crux ? crux : cell.synthesizeCell(seed)))
      .join(" ")
  }
  _shouldSynthesize(def, nodeTypeChain) {
    if (def._isErrorNodeType() || def._isAbstract()) return false
    if (nodeTypeChain.includes(def._getId())) return false
    const tags = def.get(GrammarConstants.tags)
    if (tags && tags.includes(GrammarConstantsMisc.doNotSynthesize)) return false
    return true
  }
  _getConcreteNonErrorInScopeNodeDefinitions(nodeTypeIds) {
    const results = []
    nodeTypeIds.forEach(nodeTypeId => {
      const def = this.getNodeTypeDefinitionByNodeTypeId(nodeTypeId)
      if (def._isErrorNodeType()) return true
      else if (def._isAbstract()) {
        def._getConcreteDescendantDefinitions().forEach(def => results.push(def))
      } else {
        results.push(def)
      }
    })
    return results
  }
  // todo: refactor
  synthesizeNode(nodeCount = 1, indentCount = -1, nodeTypesAlreadySynthesized = [], seed = Date.now()) {
    let inScopeNodeTypeIds = this._getInScopeNodeTypeIds()
    const catchAllNodeTypeId = this._getFromExtended(GrammarConstants.catchAllNodeType)
    if (catchAllNodeTypeId) inScopeNodeTypeIds.push(catchAllNodeTypeId)
    const thisId = this._getId()
    if (!nodeTypesAlreadySynthesized.includes(thisId)) nodeTypesAlreadySynthesized.push(thisId)
    const lines = []
    while (nodeCount) {
      const line = this._generateSimulatedLine(seed)
      if (line) lines.push(" ".repeat(indentCount >= 0 ? indentCount : 0) + line)
      this._getConcreteNonErrorInScopeNodeDefinitions(inScopeNodeTypeIds.filter(nodeTypeId => !nodeTypesAlreadySynthesized.includes(nodeTypeId)))
        .filter(def => this._shouldSynthesize(def, nodeTypesAlreadySynthesized))
        .forEach(def => {
          const chain = nodeTypesAlreadySynthesized // .slice(0)
          chain.push(def._getId())
          def.synthesizeNode(1, indentCount + 1, chain, seed).forEach(line => {
            lines.push(line)
          })
        })
      nodeCount--
    }
    return lines
  }
  getCellParser() {
    if (!this._cellParser) {
      const cellParsingStrategy = this._getFromExtended(GrammarConstants.cellParser)
      if (cellParsingStrategy === GrammarCellParser.postfix) this._cellParser = new PostfixCellParser(this)
      else if (cellParsingStrategy === GrammarCellParser.omnifix) this._cellParser = new OmnifixCellParser(this)
      else this._cellParser = new PrefixCellParser(this)
    }
    return this._cellParser
  }
}
// todo: remove?
class nodeTypeDefinitionNode extends AbstractGrammarDefinitionNode {}
// HandGrammarProgram is a constructor that takes a grammar file, and builds a new
// constructor for new language that takes files in that language to execute, compile, etc.
class HandGrammarProgram extends AbstractGrammarDefinitionNode {
  createParser() {
    const map = {}
    map[GrammarConstants.toolingDirective] = TreeNode
    map[GrammarConstants.todoComment] = TreeNode
    return new TreeNode.Parser(UnknownNodeTypeNode, map, [{ regex: HandGrammarProgram.nodeTypeFullRegex, nodeConstructor: nodeTypeDefinitionNode }, { regex: HandGrammarProgram.cellTypeFullRegex, nodeConstructor: cellTypeDefinitionNode }])
  }
  // Note: this is some so far unavoidable tricky code. We need to eval the transpiled JS, in a NodeJS or browser environment.
  _compileAndEvalGrammar() {
    if (!this.isNodeJs()) this._cache_compiledLoadedNodeTypes = Utils.appendCodeAndReturnValueOnWindow(this.toBrowserJavascript(), this.getRootNodeTypeId()).getNodeTypeMap()
    else {
      const path = require("path")
      const code = this.toNodeJsJavascript(path.join(__dirname, "..", "index.js"))
      try {
        const rootNode = this._requireInVmNodeJsRootNodeTypeConstructor(code)
        this._cache_compiledLoadedNodeTypes = rootNode.getNodeTypeMap()
        if (!this._cache_compiledLoadedNodeTypes) throw new Error(`Failed to getNodeTypeMap`)
      } catch (err) {
        // todo: figure out best error pattern here for debugging
        console.log(err)
        // console.log(`Error in code: `)
        // console.log(new TreeNode(code).toStringWithLineNumbers())
      }
    }
  }
  trainModel(programs, programConstructor = this.compileAndReturnRootConstructor()) {
    const nodeDefs = this.getValidConcreteAndAbstractNodeTypeDefinitions()
    const nodeDefCountIncludingRoot = nodeDefs.length + 1
    const matrix = Utils.makeMatrix(nodeDefCountIncludingRoot, nodeDefCountIncludingRoot, 0)
    const idToIndex = {}
    const indexToId = {}
    nodeDefs.forEach((def, index) => {
      const id = def._getId()
      idToIndex[id] = index + 1
      indexToId[index + 1] = id
    })
    programs.forEach(code => {
      const exampleProgram = new programConstructor(code)
      exampleProgram.getTopDownArray().forEach(node => {
        const nodeIndex = idToIndex[node.getDefinition()._getId()]
        const parentNode = node.getParent()
        if (!nodeIndex) return undefined
        if (parentNode.isRoot()) matrix[0][nodeIndex]++
        else {
          const parentIndex = idToIndex[parentNode.getDefinition()._getId()]
          if (!parentIndex) return undefined
          matrix[parentIndex][nodeIndex]++
        }
      })
    })
    return {
      idToIndex,
      indexToId,
      matrix
    }
  }
  _mapPredictions(predictionsVector, model) {
    const total = Utils.sum(predictionsVector)
    const predictions = predictionsVector.slice(1).map((count, index) => {
      const id = model.indexToId[index + 1]
      return {
        id: id,
        def: this.getNodeTypeDefinitionByNodeTypeId(id),
        count,
        prob: count / total
      }
    })
    predictions.sort(Utils.makeSortByFn(prediction => prediction.count)).reverse()
    return predictions
  }
  predictChildren(model, node) {
    return this._mapPredictions(this._predictChildren(model, node), model)
  }
  predictParents(model, node) {
    return this._mapPredictions(this._predictParents(model, node), model)
  }
  _predictChildren(model, node) {
    return model.matrix[node.isRoot() ? 0 : model.idToIndex[node.getDefinition()._getId()]]
  }
  _predictParents(model, node) {
    if (node.isRoot()) return []
    const nodeIndex = model.idToIndex[node.getDefinition()._getId()]
    return model.matrix.map(row => row[nodeIndex])
  }
  _compileAndReturnNodeTypeMap() {
    if (!this._cache_compiledLoadedNodeTypes) this._compileAndEvalGrammar()
    return this._cache_compiledLoadedNodeTypes
  }
  _setDirName(name) {
    this._dirName = name
    return this
  }
  _requireInVmNodeJsRootNodeTypeConstructor(code) {
    const vm = require("vm")
    const path = require("path")
    const jtreePath = path.join(__dirname, "..", "index.js")
    // todo: cleanup up
    try {
      global.jtree = require(jtreePath)
      global.require = require
      global.__dirname = this._dirName
      global.module = {}
      return vm.runInThisContext(code)
    } catch (err) {
      // todo: figure out best error pattern here for debugging
      console.log(`Error in compiled grammar code for language "${this.getGrammarName()}"`)
      // console.log(new TreeNode(code).toStringWithLineNumbers())
      console.log(`jtreePath: "${jtreePath}"`)
      console.log(err)
      throw err
    }
  }
  examplesToTestBlocks(programConstructor = this.compileAndReturnRootConstructor(), expectedErrorMessage = "") {
    const testBlocks = {}
    this.getValidConcreteAndAbstractNodeTypeDefinitions().forEach(def =>
      def.getExamples().forEach(example => {
        const id = def._getId() + example.getContent()
        testBlocks[id] = equal => {
          const exampleProgram = new programConstructor(example.childrenToString())
          const errors = exampleProgram.getAllErrors(example._getLineNumber() + 1)
          equal(errors.join("\n"), expectedErrorMessage, `Expected no errors in ${id}`)
        }
      })
    )
    return testBlocks
  }
  toReadMe() {
    const languageName = this.getExtensionName()
    const rootNodeDef = this.getRootNodeTypeDefinitionNode()
    const cellTypes = this.getCellTypeDefinitions()
    const nodeTypeFamilyTree = this.getNodeTypeFamilyTree()
    const exampleNode = rootNodeDef.getExamples()[0]
    return `title ${languageName} Readme

paragraph ${rootNodeDef.getDescription()}

subtitle Quick Example

code
${exampleNode ? exampleNode.childrenToString(1) : ""}

subtitle Quick facts about ${languageName}

list
 - ${languageName} has ${nodeTypeFamilyTree.getTopDownArray().length} node types.
 - ${languageName} has ${Object.keys(cellTypes).length} cell types
 - The source code for ${languageName} is ${this.getTopDownArray().length} lines long.

subtitle Installing

code
 npm install .

subtitle Testing

code
 node test.js

subtitle Node Types

code
${nodeTypeFamilyTree.toString(1)}

subtitle Cell Types

code
${new TreeNode(Object.keys(cellTypes).join("\n")).toString(1)}

subtitle Road Map

paragraph Here are the "todos" present in the source code for ${languageName}:

list
${this.getTopDownArray()
  .filter(node => node.getWord(0) === "todo")
  .map(node => ` - ${node.getLine()}`)
  .join("\n")}

paragraph This readme was auto-generated using the
 link https://github.com/treenotation/jtree JTree library.`
  }
  toBundle() {
    const files = {}
    const rootNodeDef = this.getRootNodeTypeDefinitionNode()
    const languageName = this.getExtensionName()
    const example = rootNodeDef.getExamples()[0]
    const sampleCode = example ? example.childrenToString() : ""
    files[GrammarBundleFiles.package] = JSON.stringify(
      {
        name: languageName,
        private: true,
        dependencies: {
          jtree: TreeNode.getVersion()
        }
      },
      null,
      2
    )
    files[GrammarBundleFiles.readme] = this.toReadMe()
    const testCode = `const program = new ${languageName}(sampleCode)
const errors = program.getAllErrors()
console.log("Sample program compiled with " + errors.length + " errors.")
if (errors.length)
 console.log(errors.map(error => error.getMessage()))`
    const nodePath = `${languageName}.node.js`
    files[nodePath] = this.toNodeJsJavascript()
    files[GrammarBundleFiles.indexJs] = `module.exports = require("./${nodePath}")`
    const browserPath = `${languageName}.browser.js`
    files[browserPath] = this.toBrowserJavascript()
    files[GrammarBundleFiles.indexHtml] = `<script src="node_modules/jtree/products/jtree.browser.js"></script>
<script src="${browserPath}"></script>
<script>
const sampleCode = \`${sampleCode.toString()}\`
${testCode}
</script>`
    const samplePath = "sample." + this.getExtensionName()
    files[samplePath] = sampleCode.toString()
    files[GrammarBundleFiles.testJs] = `const ${languageName} = require("./index.js")
/*keep-line*/ const sampleCode = require("fs").readFileSync("${samplePath}", "utf8")
${testCode}`
    return files
  }
  getTargetExtension() {
    return this.getRootNodeTypeDefinitionNode().get(GrammarConstants.compilesTo)
  }
  getCellTypeDefinitions() {
    if (!this._cache_cellTypes) this._cache_cellTypes = this._getCellTypeDefinitions()
    return this._cache_cellTypes
  }
  getCellTypeDefinitionById(cellTypeId) {
    // todo: return unknownCellTypeDefinition? or is that handled somewhere else?
    return this.getCellTypeDefinitions()[cellTypeId]
  }
  getNodeTypeFamilyTree() {
    const tree = new TreeNode()
    Object.values(this.getValidConcreteAndAbstractNodeTypeDefinitions()).forEach(node => {
      const path = node.getAncestorNodeTypeIdsArray().join(" ")
      tree.touchNode(path)
    })
    return tree
  }
  _getCellTypeDefinitions() {
    const types = {}
    // todo: add built in word types?
    this.getChildrenByNodeConstructor(cellTypeDefinitionNode).forEach(type => (types[type.getCellTypeId()] = type))
    return types
  }
  getLanguageDefinitionProgram() {
    return this
  }
  getValidConcreteAndAbstractNodeTypeDefinitions() {
    return this.getChildrenByNodeConstructor(nodeTypeDefinitionNode).filter(node => node._hasValidNodeTypeId())
  }
  _getLastRootNodeTypeDefinitionNode() {
    return this.findLast(def => def instanceof AbstractGrammarDefinitionNode && def.has(GrammarConstants.root) && def._hasValidNodeTypeId())
  }
  _initRootNodeTypeDefinitionNode() {
    if (this._cache_rootNodeTypeNode) return
    if (!this._cache_rootNodeTypeNode) this._cache_rootNodeTypeNode = this._getLastRootNodeTypeDefinitionNode()
    // By default, have a very permissive basic root node.
    // todo: whats the best design pattern to use for this sort of thing?
    if (!this._cache_rootNodeTypeNode) {
      this._cache_rootNodeTypeNode = this.concat(`${GrammarConstants.defaultRootNode}
 ${GrammarConstants.root}
 ${GrammarConstants.catchAllNodeType} ${GrammarConstants.BlobNode}`)[0]
      this._addDefaultCatchAllBlobNode()
    }
  }
  getRootNodeTypeDefinitionNode() {
    this._initRootNodeTypeDefinitionNode()
    return this._cache_rootNodeTypeNode
  }
  // todo: whats the best design pattern to use for this sort of thing?
  _addDefaultCatchAllBlobNode() {
    delete this._cache_nodeTypeDefinitions
    this.concat(`${GrammarConstants.BlobNode}
 ${GrammarConstants.baseNodeType} ${GrammarConstants.blobNode}`)
  }
  getExtensionName() {
    return this.getGrammarName()
  }
  _getId() {
    return this.getRootNodeTypeId()
  }
  getRootNodeTypeId() {
    return this.getRootNodeTypeDefinitionNode().getNodeTypeIdFromDefinition()
  }
  getGrammarName() {
    return this.getRootNodeTypeId().replace(HandGrammarProgram.nodeTypeSuffixRegex, "")
  }
  _getMyInScopeNodeTypeIds() {
    const nodeTypesNode = this.getRootNodeTypeDefinitionNode().getNode(GrammarConstants.inScope)
    return nodeTypesNode ? nodeTypesNode.getWordsFrom(1) : []
  }
  _getInScopeNodeTypeIds() {
    const nodeTypesNode = this.getRootNodeTypeDefinitionNode().getNode(GrammarConstants.inScope)
    return nodeTypesNode ? nodeTypesNode.getWordsFrom(1) : []
  }
  _initProgramNodeTypeDefinitionCache() {
    if (this._cache_nodeTypeDefinitions) return undefined
    this._cache_nodeTypeDefinitions = {}
    this.getChildrenByNodeConstructor(nodeTypeDefinitionNode).forEach(nodeTypeDefinitionNode => {
      this._cache_nodeTypeDefinitions[nodeTypeDefinitionNode.getNodeTypeIdFromDefinition()] = nodeTypeDefinitionNode
    })
  }
  _getProgramNodeTypeDefinitionCache() {
    this._initProgramNodeTypeDefinitionCache()
    return this._cache_nodeTypeDefinitions
  }
  compileAndReturnRootConstructor() {
    if (!this._cache_rootConstructorClass) {
      const def = this.getRootNodeTypeDefinitionNode()
      const rootNodeTypeId = def.getNodeTypeIdFromDefinition()
      this._cache_rootConstructorClass = def.getLanguageDefinitionProgram()._compileAndReturnNodeTypeMap()[rootNodeTypeId]
    }
    return this._cache_rootConstructorClass
  }
  _getFileExtensions() {
    return this.getRootNodeTypeDefinitionNode().get(GrammarConstants.extensions)
      ? this.getRootNodeTypeDefinitionNode()
          .get(GrammarConstants.extensions)
          .split(" ")
          .join(",")
      : this.getExtensionName()
  }
  toNodeJsJavascript(normalizedJtreePath = "jtree") {
    return this._rootNodeDefToJavascriptClass(normalizedJtreePath, true).trim()
  }
  toBrowserJavascript() {
    return this._rootNodeDefToJavascriptClass("", false).trim()
  }
  _getProperName() {
    return Utils.ucfirst(this.getExtensionName())
  }
  _rootNodeDefToJavascriptClass(normalizedJtreePath, forNodeJs = true) {
    const defs = this.getValidConcreteAndAbstractNodeTypeDefinitions()
    // todo: throw if there is no root node defined
    const nodeTypeClasses = defs.map(def => def._nodeDefToJavascriptClass()).join("\n\n")
    const rootDef = this.getRootNodeTypeDefinitionNode()
    const rootNodeJsHeader = forNodeJs && rootDef._getConcatBlockStringFromExtended(GrammarConstants._rootNodeJsHeader)
    const rootName = rootDef._getGeneratedClassName()
    if (!rootName) throw new Error(`Root Node Type Has No Name`)
    let exportScript = ""
    if (forNodeJs) {
      exportScript = `module.exports = ${rootName};
${rootName}`
    } else {
      exportScript = `window.${rootName} = ${rootName}`
    }
    // todo: we can expose the previous "constants" export, if needed, via the grammar, which we preserve.
    return `{
${forNodeJs ? `const {jtree} = require("${normalizedJtreePath.replace(/\\/g, "\\\\")}")` : ""}
${rootNodeJsHeader ? rootNodeJsHeader : ""}
${nodeTypeClasses}

${exportScript}
}
`
  }
  toSublimeSyntaxFile() {
    const cellTypeDefs = this.getCellTypeDefinitions()
    const variables = Object.keys(cellTypeDefs)
      .map(name => ` ${name}: '${cellTypeDefs[name].getRegexString()}'`)
      .join("\n")
    const defs = this.getValidConcreteAndAbstractNodeTypeDefinitions().filter(kw => !kw._isAbstract())
    const nodeTypeContexts = defs.map(def => def._toSublimeMatchBlock()).join("\n\n")
    const includes = defs.map(nodeTypeDef => `  - include: '${nodeTypeDef.getNodeTypeIdFromDefinition()}'`).join("\n")
    return `%YAML 1.2
---
name: ${this.getExtensionName()}
file_extensions: [${this._getFileExtensions()}]
scope: source.${this.getExtensionName()}

variables:
${variables}

contexts:
 main:
${includes}

${nodeTypeContexts}`
  }
}
HandGrammarProgram.makeNodeTypeId = str => Utils._replaceNonAlphaNumericCharactersWithCharCodes(str).replace(HandGrammarProgram.nodeTypeSuffixRegex, "") + GrammarConstants.nodeTypeSuffix
HandGrammarProgram.makeCellTypeId = str => Utils._replaceNonAlphaNumericCharactersWithCharCodes(str).replace(HandGrammarProgram.cellTypeSuffixRegex, "") + GrammarConstants.cellTypeSuffix
HandGrammarProgram.nodeTypeSuffixRegex = new RegExp(GrammarConstants.nodeTypeSuffix + "$")
HandGrammarProgram.nodeTypeFullRegex = new RegExp("^[a-zA-Z0-9_]+" + GrammarConstants.nodeTypeSuffix + "$")
HandGrammarProgram.cellTypeSuffixRegex = new RegExp(GrammarConstants.cellTypeSuffix + "$")
HandGrammarProgram.cellTypeFullRegex = new RegExp("^[a-zA-Z0-9_]+" + GrammarConstants.cellTypeSuffix + "$")
HandGrammarProgram._languages = {}
HandGrammarProgram._nodeTypes = {}
const PreludeKinds = {}
PreludeKinds[PreludeCellTypeIds.anyCell] = GrammarAnyCell
PreludeKinds[PreludeCellTypeIds.keywordCell] = GrammarKeywordCell
PreludeKinds[PreludeCellTypeIds.floatCell] = GrammarFloatCell
PreludeKinds[PreludeCellTypeIds.numberCell] = GrammarFloatCell
PreludeKinds[PreludeCellTypeIds.bitCell] = GrammarBitCell
PreludeKinds[PreludeCellTypeIds.boolCell] = GrammarBoolCell
PreludeKinds[PreludeCellTypeIds.intCell] = GrammarIntCell
class UnknownGrammarProgram extends TreeNode {
  _inferRootNodeForAPrefixLanguage(grammarName) {
    grammarName = HandGrammarProgram.makeNodeTypeId(grammarName)
    const rootNode = new TreeNode(`${grammarName}
 ${GrammarConstants.root}`)
    // note: right now we assume 1 global cellTypeMap and nodeTypeMap per grammar. But we may have scopes in the future?
    const rootNodeNames = this.getFirstWords()
      .filter(identity => identity)
      .map(word => HandGrammarProgram.makeNodeTypeId(word))
    rootNode
      .nodeAt(0)
      .touchNode(GrammarConstants.inScope)
      .setWordsFrom(1, Array.from(new Set(rootNodeNames)))
    return rootNode
  }
  _renameIntegerKeywords(clone) {
    // todo: why are we doing this?
    for (let node of clone.getTopDownArrayIterator()) {
      const firstWordIsAnInteger = !!node.getFirstWord().match(/^\d+$/)
      const parentFirstWord = node.getParent().getFirstWord()
      if (firstWordIsAnInteger && parentFirstWord) node.setFirstWord(HandGrammarProgram.makeNodeTypeId(parentFirstWord + UnknownGrammarProgram._childSuffix))
    }
  }
  _getKeywordMaps(clone) {
    const keywordsToChildKeywords = {}
    const keywordsToNodeInstances = {}
    for (let node of clone.getTopDownArrayIterator()) {
      const firstWord = node.getFirstWord()
      if (!keywordsToChildKeywords[firstWord]) keywordsToChildKeywords[firstWord] = {}
      if (!keywordsToNodeInstances[firstWord]) keywordsToNodeInstances[firstWord] = []
      keywordsToNodeInstances[firstWord].push(node)
      node.forEach(child => {
        keywordsToChildKeywords[firstWord][child.getFirstWord()] = true
      })
    }
    return { keywordsToChildKeywords: keywordsToChildKeywords, keywordsToNodeInstances: keywordsToNodeInstances }
  }
  _inferNodeTypeDef(firstWord, globalCellTypeMap, childFirstWords, instances) {
    const edgeSymbol = this.getEdgeSymbol()
    const nodeTypeId = HandGrammarProgram.makeNodeTypeId(firstWord)
    const nodeDefNode = new TreeNode(nodeTypeId).nodeAt(0)
    const childNodeTypeIds = childFirstWords.map(word => HandGrammarProgram.makeNodeTypeId(word))
    if (childNodeTypeIds.length) nodeDefNode.touchNode(GrammarConstants.inScope).setWordsFrom(1, childNodeTypeIds)
    const cellsForAllInstances = instances
      .map(line => line.getContent())
      .filter(identity => identity)
      .map(line => line.split(edgeSymbol))
    const instanceCellCounts = new Set(cellsForAllInstances.map(cells => cells.length))
    const maxCellsOnLine = Math.max(...Array.from(instanceCellCounts))
    const minCellsOnLine = Math.min(...Array.from(instanceCellCounts))
    let catchAllCellType
    let cellTypeIds = []
    for (let cellIndex = 0; cellIndex < maxCellsOnLine; cellIndex++) {
      const cellType = this._getBestCellType(firstWord, instances.length, maxCellsOnLine, cellsForAllInstances.map(cells => cells[cellIndex]))
      if (!globalCellTypeMap.has(cellType.cellTypeId)) globalCellTypeMap.set(cellType.cellTypeId, cellType.cellTypeDefinition)
      cellTypeIds.push(cellType.cellTypeId)
    }
    if (maxCellsOnLine > minCellsOnLine) {
      //columns = columns.slice(0, min)
      catchAllCellType = cellTypeIds.pop()
      while (cellTypeIds[cellTypeIds.length - 1] === catchAllCellType) {
        cellTypeIds.pop()
      }
    }
    const needsCruxProperty = !firstWord.endsWith(UnknownGrammarProgram._childSuffix + "Node") // todo: cleanup
    if (needsCruxProperty) nodeDefNode.set(GrammarConstants.crux, firstWord)
    if (catchAllCellType) nodeDefNode.set(GrammarConstants.catchAllCellType, catchAllCellType)
    const cellLine = cellTypeIds.slice()
    cellLine.unshift(PreludeCellTypeIds.keywordCell)
    if (cellLine.length > 0) nodeDefNode.set(GrammarConstants.cells, cellLine.join(edgeSymbol))
    //if (!catchAllCellType && cellTypeIds.length === 1) nodeDefNode.set(GrammarConstants.cells, cellTypeIds[0])
    // Todo: add conditional frequencies
    return nodeDefNode.getParent().toString()
  }
  //  inferGrammarFileForAnSSVLanguage(grammarName: string): string {
  //     grammarName = HandGrammarProgram.makeNodeTypeId(grammarName)
  //    const rootNode = new TreeNode(`${grammarName}
  // ${GrammarConstants.root}`)
  //    // note: right now we assume 1 global cellTypeMap and nodeTypeMap per grammar. But we may have scopes in the future?
  //    const rootNodeNames = this.getFirstWords().map(word => HandGrammarProgram.makeNodeTypeId(word))
  //    rootNode
  //      .nodeAt(0)
  //      .touchNode(GrammarConstants.inScope)
  //      .setWordsFrom(1, Array.from(new Set(rootNodeNames)))
  //    return rootNode
  //  }
  inferGrammarFileForAKeywordLanguage(grammarName) {
    const clone = this.clone()
    this._renameIntegerKeywords(clone)
    const { keywordsToChildKeywords, keywordsToNodeInstances } = this._getKeywordMaps(clone)
    const globalCellTypeMap = new Map()
    globalCellTypeMap.set(PreludeCellTypeIds.keywordCell, undefined)
    const nodeTypeDefs = Object.keys(keywordsToChildKeywords)
      .filter(identity => identity)
      .map(firstWord => this._inferNodeTypeDef(firstWord, globalCellTypeMap, Object.keys(keywordsToChildKeywords[firstWord]), keywordsToNodeInstances[firstWord]))
    const cellTypeDefs = []
    globalCellTypeMap.forEach((def, id) => cellTypeDefs.push(def ? def : id))
    const nodeBreakSymbol = this.getNodeBreakSymbol()
    return this._formatCode([this._inferRootNodeForAPrefixLanguage(grammarName).toString(), cellTypeDefs.join(nodeBreakSymbol), nodeTypeDefs.join(nodeBreakSymbol)].filter(identity => identity).join("\n"))
  }
  _formatCode(code) {
    // todo: make this run in browser too
    if (!this.isNodeJs()) return code
    const grammarProgram = new HandGrammarProgram(TreeNode.fromDisk(__dirname + "/../langs/grammar/grammar.grammar"))
    const programConstructor = grammarProgram.compileAndReturnRootConstructor()
    const program = new programConstructor(code)
    return program.format().toString()
  }
  _getBestCellType(firstWord, instanceCount, maxCellsOnLine, allValues) {
    const asSet = new Set(allValues)
    const edgeSymbol = this.getEdgeSymbol()
    const values = Array.from(asSet).filter(identity => identity)
    const every = fn => {
      for (let index = 0; index < values.length; index++) {
        if (!fn(values[index])) return false
      }
      return true
    }
    if (every(str => str === "0" || str === "1")) return { cellTypeId: PreludeCellTypeIds.bitCell }
    if (
      every(str => {
        const num = parseInt(str)
        if (isNaN(num)) return false
        return num.toString() === str
      })
    ) {
      return { cellTypeId: PreludeCellTypeIds.intCell }
    }
    if (every(str => str.match(/^-?\d*.?\d+$/))) return { cellTypeId: PreludeCellTypeIds.floatCell }
    const bools = new Set(["1", "0", "true", "false", "t", "f", "yes", "no"])
    if (every(str => bools.has(str.toLowerCase()))) return { cellTypeId: PreludeCellTypeIds.boolCell }
    // todo: cleanup
    const enumLimit = 30
    if (instanceCount > 1 && maxCellsOnLine === 1 && allValues.length > asSet.size && asSet.size < enumLimit)
      return {
        cellTypeId: HandGrammarProgram.makeCellTypeId(firstWord),
        cellTypeDefinition: `${HandGrammarProgram.makeCellTypeId(firstWord)}
 enum ${values.join(edgeSymbol)}`
      }
    return { cellTypeId: PreludeCellTypeIds.anyCell }
  }
}
UnknownGrammarProgram._childSuffix = "Child"

module.exports = { GrammarConstants, PreludeCellTypeIds, HandGrammarProgram, GrammarBackedNode, UnknownNodeTypeError, UnknownGrammarProgram }
