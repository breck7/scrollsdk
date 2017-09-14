declare type content = string | TreeProgram | Object | any
declare type int = number
declare type nodeString = string // A string that does not contain YI ("\n")
declare type symbolPath = string // user emailAddress
declare type pathVector = int[] // example: [0,1,1]
declare type word = string // string that cannot contain the YI, XI or ZI
declare type Undefined = any
declare type This = any
declare type SymbolMap = Object // {"+" : AdditionNode}
declare type filepath = string
declare type formatString = string // "Hello {name}! You are {age} years old."
declare type Json = string // JSON string
declare type nodeIterator = (node: TreeProgram, index: int) => boolean
declare type sortResultInt = int // -1 0 1
declare type nodeMapFn = (node: TreeProgram) => string
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
  getSymbol: () => word
  getExpanded: () => string
  getWord: (index: int) => word
  getWords: (startingFrom?: int) => word[]
  getBeam: () => string | Undefined // Always refers to part of the line after the symbol, given that ZI is space.
  getSymbolPath: (relativeTo?: TreeProgram) => symbolPath
  getTopDownArray: () => TreeProgram[] // returns all nodes as array in preorder order
  getGraph: (headKey?: word) => TreeProgram[] // if no param, uses getWord(1)
  getNext: () => TreeProgram // wrapsaround
  getPrevious: () => TreeProgram // wrapsaround
  getInheritanceTree: () => TreeProgram // useful when your trees follow the convention "className parentClassName" line structure
  execute: () => Promise<any>
  executeSync: () => any[]
  isTerminal: () => Boolean
  clone: () => TreeProgram
  copyTo: (tree: TreeProgram, index?: int) => TreeProgram
  getLines: () => string[]
  getNode: (path: symbolPath) => TreeProgram
  getNodes: () => TreeProgram[]
  length: number
  nodeAt: (index: int | pathVector) => TreeProgram
  findNodes: (path: symbolPath) => TreeProgram[]
  findBeam: (path: symbolPath) => string | Undefined
  format: (str: formatString) => string
  getColumn: (path: word) => (string | Undefined)[]
  getSymbols: () => word[]
  getBeams: () => (string | Undefined)[]
  has: (symbol: word) => boolean
  indexOf: (symbol: word) => int
  indexOfLast: (symbol: word) => int // Returns index of last occurrence of symbol
  pathVectorToSymbolPath: (vector: pathVector) => symbolPath // convert an index path to symbol path
  toHtml: () => string
  toJson: () => string
  toObject: () => Object
  toCsv: () => string
  toDelimited: (delimiter: string, header: word[]) => string
  toFixedWidthTable: (maxWidth?: int) => string
  toSsv: () => string
  toTsv: () => string
  toOutline: (mapFn?: nodeMapFn) => string
  toString: () => string
  toXml: () => string

  // Methods for ETNs
  getCatchAllNodeClass: (line: string) => TreeProgram
  getSymbolMap: () => SymbolMap
  parseNodeType: (line: string) => TreeProgram

  // Mutable Methods
  append: (line: string, tree?: TreeProgram) => TreeProgram
  concat: (b: TreeProgram | string) => This
  delete: (path: symbolPath) => This // todo: rename delete child?
  extend: (tree: TreeProgram | string) => This // recursively extend the object
  destroy: () => undefined
  duplicate: () => TreeProgram
  getMTime: () => number // Only updates on changes to line. Initializes lazily on first call.
  getTreeMTime: () => number // get time tree was last modified. Initializes lazily on first call.
  setLine: (line: string) => This
  setFromText: (text: string) => This
  insert: (line: string, tree?: TreeProgram, index?: int) => TreeProgram
  invert: () => This // Flips symbols and beams on all top level nodes. Does not recurse.
  prepend: (line: string, tree?: TreeProgram) => TreeProgram
  pushBeamAndTree: (beam?: string, tree?: TreeProgram) => TreeProgram // Symbol will be set to this.length + 1. todo: remove?
  remap: (key: Object) => This // Does not recurse.
  rename: (oldSymbol: word, newSymbol: word) => This
  renameAll: (oldSymbol: word, newSymbol: word) => This
  sortBy: (symbolOrSymbols: word | word[]) => This
  setSymbol: (symbol: word) => This
  setWord: (index: int, value: string) => This
  setBeam: (value?: content) => This
  reverse: () => This
  shift: () => TreeProgram
  sort: (sortFn: sortFn) => This
  touchNode: (symbolPath: symbolPath) => TreeProgram
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
