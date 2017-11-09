declare type content = string | TreeNode | Object | any
declare type int = number
declare type nodeString = string // A string that does not contain YI ("\n")
declare type keywordPath = string // user emailAddress
declare type pathVector = int[] // example: [0,1,1]
declare type word = string // string that cannot contain the YI, XI or ZI
declare type Undefined = any
declare type This = any
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
declare type errorMessage = string
declare type sortFn = (nodeA: TreeNode, nodeB: TreeNode) => sortResultInt
declare type point = { x: int; y: int } // Point on the Cartesian plane where the node is located. Assumes canonical whitespace delimiters. -Y = Y.

interface TreeNode {
  (tree?: content, line?: string): This

  compile: (targetExtension: string) => string
  getIndex: () => int
  getLine: () => nodeString
  getChildrenByNodeType: (type: TreeNodeClass) => TreeNode[]
  getNodeByType: (type: TreeNodeClass) => TreeNode | Undefined
  getPoint: () => point
  getPointRelativeTo: (relativeTo: TreeNode) => point
  getPathVector: () => pathVector
  getPathVectorRelativeTo: (relativeTo: TreeNode) => pathVector
  getStack: () => TreeNode[]
  getStackString: () => string
  getRootNode: () => This | TreeNode
  getKeywordPath: () => keywordPath
  getKeywordPathRelativeTo: (relativeTo: TreeNode) => keywordPath
  getParent: () => TreeNode | undefined
  getKeyword: () => word
  getExpanded: (idColumnNumber: int, parentIdColumnNumber: int) => string
  getErrors: () => string[] // parse errors. base class is permissive and will always have 0 errors.
  getSiblings: () => TreeNode[]
  getOlderSiblings: () => TreeNode[] // where older sibling is a node with a lower index
  getYoungerSiblings: () => TreeNode[] // where younger sibling is a node with a higher index
  getLineSyntax: () => string // something like "AdditionNode int int"
  getWord: (index: int) => word
  getWords: () => word[]
  getWordsFrom: (startingFrom: int) => word[]
  getBeam: () => string | Undefined // Always refers to part of the line after the keyword, given that ZI is space.
  getTopDownArray: () => TreeNode[] // returns all nodes as array in preorder order
  getGraphByKey: (headKey: word) => TreeNode[]
  getGraph: (idColumnNumber: int, parentIdColumnNumber: int) => TreeNode[]
  getNext: () => TreeNode // wrapsaround
  getPrevious: () => TreeNode // wrapsaround
  getInheritanceTree: () => TreeNode // useful when your trees follow the convention "className parentClassName" line structure
  execute: (context: any) => Promise<any>
  executeSync: (context: any) => any[]
  isTerminal: () => Boolean
  isRoot: () => Boolean
  clone: () => TreeNode
  copyTo: (tree: TreeNode, index: int) => TreeNode
  getLines: () => string[]
  getNodeByColumn: (index: int, name: string) => TreeNode | Undefined
  getNodeByColumns: (...columns: string[]) => TreeNode | Undefined
  getNode: (path: keywordPath) => TreeNode
  getNodes: () => TreeNode[]
  length: number
  nodeAt: (index: int | pathVector) => TreeNode
  findNodes: (path: keywordPath) => TreeNode[]
  findBeam: (path: keywordPath) => string | Undefined
  format: (str: formatString) => string
  getColumn: (path: word) => (string | Undefined)[]
  getKeywords: () => word[]
  getBeams: () => (string | Undefined)[]
  has: (keyword: word) => boolean
  indexOf: (keyword: word) => int
  indexOfLast: (keyword: word) => int // Returns index of last occurrence of keyword
  pathVectorToKeywordPath: (vector: pathVector) => keywordPath // convert an index path to keyword path
  toHtml: () => string
  toJson: () => string
  toObject: () => Object
  toCsv: () => string
  toDelimited: (delimiter: string, header: word[]) => string
  toTable: () => string // Output a table for printing
  toFormattedTable: (maxWidth: int, alignRight: boolean) => string // Output a table with padding up to maxWidth in each cell
  toSsv: () => string
  toTsv: () => string
  toMappedOutline: (mapFn: nodeMapFn) => string
  toOutline: () => string
  toString: () => string
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
  extend: (tree: TreeNode | string) => This // recursively extend the object
  destroy: () => undefined
  duplicate: () => TreeNode
  getMTime: () => number // Only updates on changes to line. Initializes lazily on first call.
  getTreeMTime: () => number // get time tree was last modified. Initializes lazily on first call.
  setLine: (line: string) => This
  setFromText: (text: string) => This
  insertWord: (index: int, value: string) => This
  insertLine: (line: string, index: int) => TreeNode
  insertLineAndChildren: (line: string, tree: content, index: int) => TreeNode
  invert: () => This // Flips keywords and beams on all top level nodes. Does not recurse.
  prependLine: (line: string) => TreeNode
  replaceNode: (fn: replaceNodeFn) => TreeNode
  remap: (key: Object) => This // Does not recurse.
  rename: (oldKeyword: word, newKeyword: word) => This
  renameAll: (oldKeyword: word, newKeyword: word) => This
  sortBy: (keywordOrKeywords: word | word[]) => This
  setKeyword: (keyword: word) => This
  setWord: (index: int, value: string) => This
  setBeam: (value: content) => This
  reverse: () => This
  shift: () => TreeNode
  sort: (sortFn: sortFn) => This
  touchNode: (keywordPath: keywordPath) => TreeNode
}

interface AbstractGrammarBackedProgram {
  getKeywordUsage: () => TreeNode[] // returns a report on what keywords from its language the program uses
}

interface GrammarProgram {}

interface StaticTreeNode {
  nest: (lines: string, xi: int) => string // Insert lines, if any, as child nodes prefixed with the given number of XI characters
  fromDelimited: (str: string, delimiter: string, quoteChar: string) => TreeNode
  fromDelimitedNoHeaders: (str: string, delimiter: string, quoteChar: string) => TreeNode
  fromJson: (str: Json) => TreeNode
  fromCsv: (str: string) => TreeNode
  fromSsv: (str: string) => TreeNode
  fromTsv: (str: string) => TreeNode
  fromXml: (str: string) => TreeNode
}

interface otree {
  TreeNode: TreeNode
  program: AbstractGrammarBackedProgram
  GrammarProgram: GrammarProgram
  executeFile: (path: filepath) => Promise<any>
  makeProgram: (programPath: filepath, languagePath: filepath) => AbstractGrammarBackedProgram
  getParser: (grammarPath: filepath) => GrammarBackedProgramClass
  getVersion: () => string
}
