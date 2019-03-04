// TODO: Delete this file in favor of auto-generated d.ts and types.ts

declare type content = string | TreeNode | Object | any
declare type nodeString = string // A string that does not contain YI ("\n")
declare type Undefined = any
declare type KeywordMap = Object // {"+" : AdditionNode}
declare type nodeIterator = (node: TreeNode, index: int) => boolean
declare type TreeNodeClass = Object // a class that extends TreeNode
declare type GrammarBackedProgramClass = TreeNodeClass
declare type nodeMapFn = (node: TreeNode) => string
declare type replaceNodeFn = (str: string) => string
declare type matrixFormatFn = (str: string, rowIndex: int, colIndex: int) => string
declare type errorMessage = string
declare type parseError = { message: string }
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

  get: (path: keywordPath) => string | Undefined
  getContentsArray: () => (string | Undefined)[]
  getChildren: () => TreeNode[] // Returns references to node objects in a copy of child array
  getChildrenByNodeType: (type: TreeNodeClass) => TreeNode[]
  getColumn: (path: word) => (string | Undefined)[]
  getColumnNames: () => string[]
  getErrors: () => parseError[] // parse errors. base class is permissive and will always have 0 errors.
  getExpanded: (idColumnNumber: int, parentIdColumnNumber: int) => TreeNode
  getGraph: (idColumnNumber: int, parentIdColumnNumber: int) => TreeNode[]
  getGraphByKey: (headKey: word) => TreeNode[]
  getInheritanceTree: () => TreeNode // useful when your trees follow the convention "className parentClassName" line structure
  getLine: () => nodeString
  getLines: () => string[]
  getLineSyntax: () => string // something like "AdditionNode int int"
  getNext: () => TreeNode // wrapsaround
  getNode: (path: keywordPath) => TreeNode
  getNodeByType: (type: TreeNodeClass) => TreeNode | Undefined
  getNumberOfLines: () => int
  getOlderSiblings: () => TreeNode[] // where older sibling is a node with a lower index
  getOneHot: () => TreeNode
  getParent: () => TreeNode | undefined
  getPoint: () => point
  getPointRelativeTo: (relativeTo: TreeNode) => point
  getPrevious: () => TreeNode // wrapsaround
  getRootNode: () => This | TreeNode
  getSlice: (startIndexInclusive, stopIndexExclusive) => TreeNode[]
  getSiblings: () => TreeNode[]
  getStack: () => TreeNode[]
  getStackString: () => string
  getTopDownArray: () => TreeNode[] // returns all nodes as array in preorder order
  getYoungerSiblings: () => TreeNode[] // where younger sibling is a node with a higher index
  macroExpand: (macroDefKeyword: string, macroUsageKeyword: string) => TreeNode
  nodeAt: (index: int | pathVector) => TreeNode

  // Methods for Tree Languages
  getCatchAllNodeClass: (line: string) => TreeNode
  getKeywordMap: () => KeywordMap
  parseNodeType: (line: string) => TreeNode

  // Mutable Methods
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
  sortBy: (keywordOrKeywords: word | word[]) => This
  sortByColumns: (columnIndexes: int[]) => This
}
