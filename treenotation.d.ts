declare type content = string | TreeNotation | Object | any
declare type int = number
declare type nodeString = string // A string that does not contain YI ("\n")
declare type basePath = string // user emailAddress
declare type pathVector = int[] // example: [0,1,1]
declare type word = string // string that cannot contain the YI, XI or ZI
declare type Undefined = any
declare type This = any
declare type formatString = string // "Hello {name}! You are {age} years old."
declare type Json = string // JSON string
declare type nodeIterator = (node: TreeNotation, index: int) => boolean
declare type sortResultInt = int // -1 0 1
declare type nodeMapFn = (node: TreeNotation) => string
declare type sortFn = (nodeA: TreeNotation, nodeB: TreeNotation) => sortResultInt
declare type point = { x: int; y: int } // Point on the Cartesian plane where the node is located. Assumes canonical whitespace delimiters. -Y = Y.

interface TreeNotation {
  (tree?: content, line?: string): This

  getIndex: () => int
  getPoint: () => point
  getPathVector: () => pathVector
  getLine: () => nodeString
  getChildrenByNodeType: () => TreeNotation[]
  getStack: () => TreeNotation[]
  getStackString: () => string
  getParent: () => TreeNotation | undefined
  getRootNode: () => This | TreeNotation
  getBase: () => word
  getWords: (startingFrom?: int) => word[]
  getLoad: () => string | Undefined // Always refers to part of the line after the base, given that ZI is space.
  getBasePath: () => basePath
  getTopDownArray: () => TreeNotation[] // returns all nodes as array in preorder order
  getGraph: (headKey?: word) => TreeNotation[] // if no param, uses getWord(1)
  getBeamWithChildren: () => string
  getNext: () => TreeNotation // wrapsaround
  getPrevious: () => TreeNotation // wrapsaround
  isTerminal: () => Boolean
  clone: () => TreeNotation
  copyTo: (tree: TreeNotation, index?: int) => TreeNotation
  getLines: () => string[]
  getNode: (path: basePath) => TreeNotation
  getNodes: () => TreeNotation[]
  length: number
  nodeAt: (index: int) => TreeNotation
  findNodes: (path: basePath) => TreeNotation[]
  findBeam: (path: basePath) => string | Undefined
  format: (str: formatString) => string
  getColumn: (path: word) => (string | Undefined)[]
  getBases: () => word[]
  getBeams: () => (string | Undefined)[]
  has: (base: word) => boolean
  indexOf: (base: word) => int
  indexOfLast: (base: word) => int // Returns index of last occurrence of base
  pathVectorToBasePath: (vector: pathVector) => basePath // convert an index path to base path
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

  append: (line: string, tree?: TreeNotation) => TreeNotation
  concat: (b: TreeNotation | string) => This
  delete: (path: basePath) => This // todo: rename delete child?
  extend: (tree: TreeNotation | string) => This // recursively extend the object
  destroy: () => undefined
  duplicate: () => TreeNotation
  getMTime: () => number | undefined // Only updates on changes to line. Returns undefined if no modifications yet.
  setLine: (line: string) => This
  setFromText: (text: string) => This
  insert: (line: string, tree?: TreeNotation, index?: int) => TreeNotation
  invert: () => This // Flips bases and beams on all top level nodes. Does not recurse.
  prepend: (line: string, tree?: TreeNotation) => TreeNotation
  pushBeamAndTree: (beam?: string, tree?: TreeNotation) => TreeNotation // Base will be set to this.length + 1. todo: remove?
  remap: (key: Object) => This // Does not recurse.
  rename: (oldBase: word, newBase: word) => This
  renameAll: (oldBase: word, newBase: word) => This
  sortBy: (baseOrBases: word | word[]) => This
  setBeamWithChildren: (text: string) => This
  setBase: (base: word) => This
  setWord: (index: int, value: string) => This
  setBeam: (value?: content) => This
  reverse: () => This
  shift: () => TreeNotation
  sort: (sortFn: sortFn) => This
}

interface StaticTreeNotation {
  getVersion: () => string
  fromDelimited: (str: string, delimiter: string, hasHeaders?: boolean, quoteChar?: string) => TreeNotation
  fromJson: (str: Json) => TreeNotation
  fromCsv: (str: string, hasHeaders?: boolean) => TreeNotation
  fromSsv: (str: string, hasHeaders?: boolean) => TreeNotation
  fromTsv: (str: string, hasHeaders?: boolean) => TreeNotation
  fromXml: (str: string) => TreeNotation
}
