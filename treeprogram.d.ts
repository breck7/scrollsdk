declare type content = string | TreeProgram | Object | any
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
declare type nodeIterator = (node: TreeProgram, index: int) => boolean
declare type sortResultInt = int // -1 0 1
declare type nodeMapFn = (node: TreeProgram) => string
declare type replaceNodeFn = (str: string) => string
declare type sortFn = (nodeA: TreeProgram, nodeB: TreeProgram) => sortResultInt
declare type point = { x: int; y: int } // Point on the Cartesian plane where the node is located. Assumes canonical whitespace delimiters. -Y = Y.

interface TreeProgram {
  (tree?: content, line?: string): This

  compile: () => string
  getIndex: () => int
  getPoint: (relativeTo?: TreeProgram) => point
  getPathVector: (relativeTo?: TreeProgram) => pathVector
  getLine: () => nodeString
  getChildrenByNodeType: () => TreeProgram[]
  getStack: (relativeTo?: TreeProgram) => TreeProgram[]
  getStackString: (relativeTo?: TreeProgram) => string
  getParent: () => TreeProgram | undefined
  getRootNode: (relativeTo?: TreeProgram) => This | TreeProgram
  getKeyword: () => word
  getExpanded: () => string
  getErrors: () => string[] // parse errors. base class is permissive and will always have 0 errors.
  getGrammarUsage: () => TreeProgram[] // returns a report on what keywords from its language the program uses
  getSiblings: () => TreeProgram[]
  getOlderSiblings: () => TreeProgram[] // where older sibling is a node with a lower index
  getYoungerSiblings: () => TreeProgram[] // where younger sibling is a node with a higher index
  getWordTypeLine: () => string // something like "any int int". base class words are always any type.
  getWord: (index: int) => word
  getWords: (startingFrom?: int) => word[]
  getBeam: () => string | Undefined // Always refers to part of the line after the keyword, given that ZI is space.
  getKeywordPath: (relativeTo?: TreeProgram) => keywordPath
  getTopDownArray: () => TreeProgram[] // returns all nodes as array in preorder order
  getGraph: (headKey?: word) => TreeProgram[] // if no param, uses getWord(1)
  getNext: () => TreeProgram // wrapsaround
  getPrevious: () => TreeProgram // wrapsaround
  getInheritanceTree: () => TreeProgram // useful when your trees follow the convention "className parentClassName" line structure
  execute: (context: any) => Promise<any>
  executeSync: (context: any) => any[]
  isTerminal: () => Boolean
  clone: () => TreeProgram
  copyTo: (tree: TreeProgram, index?: int) => TreeProgram
  getLines: () => string[]
  getNode: (path: keywordPath) => TreeProgram
  getNodes: () => TreeProgram[]
  length: number
  nodeAt: (index: int | pathVector) => TreeProgram
  findNodes: (path: keywordPath) => TreeProgram[]
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
  getCatchAllNodeClass: (line: string) => TreeProgram
  getKeywordMap: () => KeywordMap
  parseNodeType: (line: string) => TreeProgram

  // Mutable Methods
  append: (line: string, tree?: TreeProgram) => TreeProgram
  concat: (b: TreeProgram | string) => This
  delete: (path: keywordPath) => This // todo: rename delete child?
  extend: (tree: TreeProgram | string) => This // recursively extend the object
  destroy: () => undefined
  duplicate: () => TreeProgram
  getMTime: () => number // Only updates on changes to line. Initializes lazily on first call.
  getTreeMTime: () => number // get time tree was last modified. Initializes lazily on first call.
  setLine: (line: string) => This
  setFromText: (text: string) => This
  insert: (line: string, tree?: TreeProgram, index?: int) => TreeProgram
  invert: () => This // Flips keywords and beams on all top level nodes. Does not recurse.
  prepend: (line: string, tree?: TreeProgram) => TreeProgram
  pushBeamAndTree: (beam?: string, tree?: TreeProgram) => TreeProgram // Keyword will be set to this.length + 1. todo: remove?
  replaceNode: (fn: replaceNodeFn) => TreeProgram
  remap: (key: Object) => This // Does not recurse.
  rename: (oldKeyword: word, newKeyword: word) => This
  renameAll: (oldKeyword: word, newKeyword: word) => This
  sortBy: (keywordOrKeywords: word | word[]) => This
  setKeyword: (keyword: word) => This
  setWord: (index: int, value: string) => This
  setBeam: (value?: content) => This
  reverse: () => This
  shift: () => TreeProgram
  sort: (sortFn: sortFn) => This
  touchNode: (keywordPath: keywordPath) => TreeProgram
}

interface StaticTreeProgram {
  getVersion: () => string
  nest: (lines: string, xi: int) => string // Insert lines, if any, as child nodes prefixed with the given number of XI characters
  fromDelimited: (str: string, delimiter: string, hasHeaders?: boolean, quoteChar?: string) => TreeProgram
  fromJson: (str: Json) => TreeProgram
  fromCsv: (str: string, hasHeaders?: boolean) => TreeProgram
  fromSsv: (str: string, hasHeaders?: boolean) => TreeProgram
  fromTsv: (str: string, hasHeaders?: boolean) => TreeProgram
  fromXml: (str: string) => TreeProgram
  executeFile: (path: filepath) => Promise<any>
}
