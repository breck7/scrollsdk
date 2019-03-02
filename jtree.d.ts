declare type content = string | TreeNode | Object | any
declare type int = number
declare type nodeString = string // A string that does not contain YI ("\n")
declare type keywordPath = string // user emailAddress
declare type pathVector = int[] // example: [0,1,1]
declare type word = string // string that cannot contain the YI, XI or ZI
declare type Undefined = any
declare type This = any
declare type dataTable = (any[])[]
declare type KeywordMap = Object // {"+" : AdditionNode}
declare type filepath = string
declare type formatString = string // "Hello {name}! You are {age} years old."
declare type Json = string // JSON string
declare type nodeIterator = (node: TreeNode, index: int) => boolean
declare type sortResultInt = int // -1 0 1
declare type TreeNodeClass = Object // a class that extends TreeNode
declare type GrammarBackedProgramClass = TreeNodeClass
declare type nodeMapFn = (node: TreeNode) => string
declare type replaceNodeFn = (str: string) => string
declare type matrixFormatFn = (str: string, rowIndex: int, colIndex: int) => string
declare type errorMessage = string
declare type parseError = { message: string }
declare type sortFn = (nodeA: TreeNode, nodeB: TreeNode) => sortResultInt
declare type filterFn = (node: TreeNode) => boolean
declare type iteratorFn = (node: TreeNode) => any
declare type point = { x: int; y: int } // Point on the Cartesian plane where the node is located. Assumes canonical whitespace delimiters. -Y = Y.

interface TreeNode {
  (tree?: content, line?: string): This

  // Immutable methods
  clone: () => TreeNode
  compile: (targetExtension: string) => string
  copyTo: (tree: TreeNode, index: int) => TreeNode
  execute: (context: any) => Promise<any>
  executeSync: (context: any) => any[]
  findNodes: (path: keywordPath) => TreeNode[]
  getFiltered: (fn: filterFn) => TreeNode
  map: (fn: iteratorFn) => any[]
  forEach: (fn: iteratorFn) => This
  slice: (start: int, end: int) => TreeNode[]
  find: (fn: filterFn) => TreeNode

  format: (str: formatString) => string
  get: (path: keywordPath) => string | Undefined
  getContent: () => string | Undefined // Always refers to part of the line after the keyword, given that ZI is space.
  getContentsArray: () => (string | Undefined)[]
  getChildren: () => TreeNode[] // Returns references to node objects in a copy of child array
  getChildrenByNodeType: (type: TreeNodeClass) => TreeNode[]
  getColumn: (path: word) => (string | Undefined)[]
  getColumnNames: () => string[]
  getErrors: () => parseError[] // parse errors. base class is permissive and will always have 0 errors.
  getExpanded: (idColumnNumber: int, parentIdColumnNumber: int) => TreeNode
  getGraph: (idColumnNumber: int, parentIdColumnNumber: int) => TreeNode[]
  getGraphByKey: (headKey: word) => TreeNode[]
  getIndex: () => int
  getInheritanceTree: () => TreeNode // useful when your trees follow the convention "className parentClassName" line structure
  getKeyword: () => word
  getKeywordPath: () => keywordPath
  getKeywordPathRelativeTo: (relativeTo: TreeNode) => keywordPath
  getKeywords: () => word[]
  getLine: () => nodeString
  getLines: () => string[]
  getLineSyntax: () => string // something like "AdditionNode int int"
  getNext: () => TreeNode // wrapsaround
  getNode: (path: keywordPath) => TreeNode
  getNodeByColumn: (index: int, name: string) => TreeNode | Undefined
  getNodeByColumns: (...columns: string[]) => TreeNode | Undefined
  getNodeByType: (type: TreeNodeClass) => TreeNode | Undefined
  getNodesByRegex: (regex: RegExp) => TreeNode[]
  getNodesByLinePrefixes: (colums: string[]) => TreeNode[]
  getNumberOfLines: () => int
  getOlderSiblings: () => TreeNode[] // where older sibling is a node with a lower index
  getOneHot: () => TreeNode
  getParent: () => TreeNode | undefined
  getPathVector: () => pathVector
  getPathVectorRelativeTo: (relativeTo: TreeNode) => pathVector
  getPoint: () => point
  getPointRelativeTo: (relativeTo: TreeNode) => point
  getPrevious: () => TreeNode // wrapsaround
  getRootNode: () => This | TreeNode
  getSlice: (startIndexInclusive, stopIndexExclusive) => TreeNode[]
  getSiblings: () => TreeNode[]
  getStack: () => TreeNode[]
  getStackString: () => string
  getTopDownArray: () => TreeNode[] // returns all nodes as array in preorder order
  getWord: (index: int) => word
  getWords: () => word[]
  getWordsFrom: (startingFrom: int) => word[]
  getYoungerSiblings: () => TreeNode[] // where younger sibling is a node with a higher index
  has: (keyword: word) => boolean // todo: rename
  hasWord: (index: int, word: string) => boolean
  indexOf: (keyword: word) => int
  indexOfLast: (keyword: word) => int // Returns index of last occurrence of keyword
  isEmpty: () => Boolean // can have a keyword but no content or children
  isBlankLine: () => Boolean
  isRoot: () => Boolean
  isTerminal: () => Boolean
  length: int
  macroExpand: (macroDefKeyword: string, macroUsageKeyword: string) => TreeNode
  nodeAt: (index: int | pathVector) => TreeNode
  pathVectorToKeywordPath: (vector: pathVector) => keywordPath // convert an index path to keyword path
  toCsv: () => string
  toDataTable: () => dataTable
  toDelimited: (delimiter: string, header: word[]) => string
  toFormattedTable: (maxWidth: int, alignRight: boolean) => string // Output a table with padding up to maxWidth in each cell
  toHtml: () => string
  toJson: () => string
  toMappedOutline: (mapFn: nodeMapFn) => string
  toMarkdownTable: () => string
  toMarkdownTableAdvanced: (columns: word[], formatFn: matrixFormatFn) => string
  toObject: () => Object
  toOutline: () => string
  toSsv: () => string
  toString: () => string
  toTable: () => string // Output a table for printing
  toTsv: () => string
  toXml: () => string

  // Methods for Tree Languages
  getCatchAllNodeClass: (line: string) => TreeNode
  getKeywordMap: () => KeywordMap
  parseNodeType: (line: string) => TreeNode

  // Mutable Methods
  appendLine: (line: string) => TreeNode
  appendLineAndChildren: (line: string, tree: content) => TreeNode
  concat: (b: TreeNode | string) => This
  delete: (path: keywordPath) => This // todo: perhaps rename to delete child
  deleteBlanks: () => This
  deleteColumn: (path: keyword) => This
  deleteChildren: () => This
  deleteDuplicates: () => This
  destroy: () => undefined
  duplicate: () => TreeNode
  extend: (tree: TreeNode | string) => This // recursively extend the object
  getMTime: () => number // Only updates on changes to line. Initializes lazily on first call.
  getTreeMTime: () => number // get time tree was last modified. Initializes lazily on first call.
  insertLine: (line: string, index: int) => TreeNode
  insertLineAndChildren: (line: string, tree: content, index: int) => TreeNode
  insertWord: (index: int, value: string) => This
  invert: () => This // Flips keywords and contents on all top level nodes. Does not recurse.
  prependLine: (line: string) => TreeNode
  pushContentAndChildren: (line: string, children: content) => TreeNode
  remap: (key: Object) => This // Does not recurse.
  rename: (oldKeyword: word, newKeyword: word) => This
  renameAll: (oldKeyword: word, newKeyword: word) => This
  replaceNode: (fn: replaceNodeFn) => TreeNode[]
  reverse: () => This
  set: (keywordPath: keywordPath, content: content) => This
  setChildren: (text: content) => This
  setContent: (value: content) => This
  setContentWithChildren: (value: content) => This
  setFromText: (text: content) => This
  setKeyword: (keyword: word) => This
  setLine: (line: string) => This
  setWord: (index: int, value: string) => This
  shift: () => TreeNode
  sort: (sortFn: sortFn) => This
  sortBy: (keywordOrKeywords: word | word[]) => This
  sortByColumns: (columnIndexes: int[]) => This
  touchNode: (keywordPath: keywordPath) => TreeNode
}

interface NodeTreeNode {
  toDisk(path: filepath, format: string): This
}

interface AbstractGrammarBackedProgram {
  getKeywordUsage: () => TreeNode[] // returns a report on what keywords from its language the program uses
  getInvalidKeywords: () => string[]
}

interface GrammarProgram {
  getProgramErrorsIterator: () => string[]
  predictGrammarFile: () => string
}

interface StaticTreeNode {
  nest: (lines: string, xi: int) => string // Insert lines, if any, as child nodes prefixed with the given number of XI characters
  fromCsv: (str: string) => TreeNode
  fromDataTable: (dt: dataTable) => TreeNode
  fromDelimited: (str: string, delimiter: string, quoteChar: string) => TreeNode
  fromDelimitedNoHeaders: (str: string, delimiter: string, quoteChar: string) => TreeNode
  fromJson: (str: Json) => TreeNode
  fromSsv: (str: string) => TreeNode
  fromTsv: (str: string) => TreeNode
  fromXml: (str: string) => TreeNode
  fromShape: (shape: int[]) => TreeNode
  iris: string
}

interface jtree {
  TreeNode: TreeNode
  program: AbstractGrammarBackedProgram
  GrammarProgram: GrammarProgram
  executeFile: (path: filepath) => Promise<any>
  getParser: (grammarPath: filepath) => GrammarBackedProgramClass
  getVersion: () => string
  makeProgram: (programPath: filepath, languagePath: filepath) => AbstractGrammarBackedProgram
}
