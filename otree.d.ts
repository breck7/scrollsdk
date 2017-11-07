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
  getPoint: (relativeTo?: TreeNode) => point
  getPathVector: (relativeTo?: TreeNode) => pathVector
  getLine: () => nodeString
  getChildrenByNodeType: (type: TreeNodeClass) => TreeNode[]
  getNodeByType: (type: TreeNodeClass) => TreeNode | Undefined
  getStack: (relativeTo?: TreeNode) => TreeNode[]
  getStackString: (relativeTo?: TreeNode) => string
  getParent: () => TreeNode | undefined
  getRootNode: (relativeTo?: TreeNode) => This | TreeNode
  getKeyword: () => word
  getExpanded: () => string
  getErrors: () => string[] // parse errors. base class is permissive and will always have 0 errors.
  getSiblings: () => TreeNode[]
  getOlderSiblings: () => TreeNode[] // where older sibling is a node with a lower index
  getYoungerSiblings: () => TreeNode[] // where younger sibling is a node with a higher index
  getWordTypeLine: () => string // something like "any int int". base class words are always any type.
  getWord: (index: int) => word
  getWords: (startingFrom?: int) => word[]
  getBeam: () => string | Undefined // Always refers to part of the line after the keyword, given that ZI is space.
  getKeywordPath: (relativeTo?: TreeNode) => keywordPath
  getTopDownArray: () => TreeNode[] // returns all nodes as array in preorder order
  getGraph: (headKey?: word) => TreeNode[] // if no param, uses getWord(1)
  getNext: () => TreeNode // wrapsaround
  getPrevious: () => TreeNode // wrapsaround
  getInheritanceTree: () => TreeNode // useful when your trees follow the convention "className parentClassName" line structure
  execute: (context: any) => Promise<any>
  executeSync: (context: any) => any[]
  isTerminal: () => Boolean
  clone: () => TreeNode
  copyTo: (tree: TreeNode, index?: int) => TreeNode
  getLines: () => string[]
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
  toTable: (maxWidth?: int, alignRight?: boolean) => string // Output a table with padding up to maxWidth in each cell
  toSsv: () => string
  toTsv: () => string
  toOutline: (mapFn?: nodeMapFn) => string
  toString: () => string
  toXml: () => string

  // Methods for Tree Languages
  getCatchAllNodeClass: (line: string) => TreeNode
  getKeywordMap: () => KeywordMap
  parseNodeType: (line: string) => TreeNode

  // Mutable Methods
  append: (line: string, tree?: TreeNode) => TreeNode
  concat: (b: TreeNode | string) => This
  delete: (path: keywordPath) => This // todo: rename delete child?
  extend: (tree: TreeNode | string) => This // recursively extend the object
  destroy: () => undefined
  duplicate: () => TreeNode
  getMTime: () => number // Only updates on changes to line. Initializes lazily on first call.
  getTreeMTime: () => number // get time tree was last modified. Initializes lazily on first call.
  setLine: (line: string) => This
  setFromText: (text: string) => This
  insert: (line: string, tree?: TreeNode, index?: int) => TreeNode
  invert: () => This // Flips keywords and beams on all top level nodes. Does not recurse.
  prepend: (line: string, tree?: TreeNode) => TreeNode
  pushBeamAndTree: (beam?: string, tree?: TreeNode) => TreeNode // Keyword will be set to this.length + 1. todo: remove?
  replaceNode: (fn: replaceNodeFn) => TreeNode
  remap: (key: Object) => This // Does not recurse.
  rename: (oldKeyword: word, newKeyword: word) => This
  renameAll: (oldKeyword: word, newKeyword: word) => This
  sortBy: (keywordOrKeywords: word | word[]) => This
  setKeyword: (keyword: word) => This
  setWord: (index: int, value: string) => This
  setBeam: (value?: content) => This
  reverse: () => This
  shift: () => TreeNode
  sort: (sortFn: sortFn) => This
  touchNode: (keywordPath: keywordPath) => TreeNode
}

interface AbstractGrammarBackedProgram {
  getGrammarUsage: () => TreeNode[] // returns a report on what keywords from its language the program uses
}

interface StaticTreeNode {
  nest: (lines: string, xi: int) => string // Insert lines, if any, as child nodes prefixed with the given number of XI characters
  fromDelimited: (str: string, delimiter: string, hasHeaders?: boolean, quoteChar?: string) => TreeNode
  fromJson: (str: Json) => TreeNode
  fromCsv: (str: string, hasHeaders?: boolean) => TreeNode
  fromSsv: (str: string, hasHeaders?: boolean) => TreeNode
  fromTsv: (str: string, hasHeaders?: boolean) => TreeNode
  fromXml: (str: string) => TreeNode
}

interface otree {
  TreeNode: TreeNode
  program: AbstractGrammarBackedProgram
  executeFile: (path: filepath) => Promise<any>
  makeProgram: (programPath: filepath, languagePath: filepath) => AbstractGrammarBackedProgram
  getParser: (grammarPath: filepath) => GrammarBackedProgramClass
  getVersion: () => string
}
