declare type content = string | TreeNode | Object | any;
declare type int = number;
declare type nodeString = string; // A string that does not contain the nodeDelimiter ("\n")
declare type pathName = string; // user emailAddress
declare type pathVector = int[]; // example: [0,1,1]
declare type name = string; // string that cannot contain the nodeDelimiter, nodeEdgeChar or nodeAssignmentChar
declare type Undefined = any;
declare type This = any;
declare type formatString = string; // "Hello {name}! You are {age} years old."
declare type Json = string; // JSON string
declare type nodeIterator = (node: TreeNode, index: int) => boolean;
declare type sortResultInt = int; // -1 0 1
declare type JavascriptCode = string;
declare type sortFn = (nodeA: TreeNode, nodeB: TreeNode) => sortResultInt;

interface TreeNode {
  (tree?: content, line?: string): This;

  getIndex: () => int;
  getPathVector: () => pathVector;
  getLine: () => nodeString;
  getAncestorNodes: () => TreeNode[];
  getParent: () => TreeNode | undefined;
  getRootNode: () => This | TreeNode;
  getHead: () => name;
  getTail: () => (string | Undefined);
  getPathName: () => pathName;
  getTailWithChildren: () => string;
  isTerminal: () => Boolean;
  clone: () => TreeNode;
  getLines: () => string[];
  getNodes: () => TreeNode[];
  length: number;
  nodeAt: (index: int) => TreeNode;
  findNodes: (name: pathName) => TreeNode[];
  format: (str: formatString) => string;
  getColumn: (path: name) => (string|Undefined)[];
  getHeads: () => name[];
  getTails: () => (string | Undefined)[];
  has: (name: name) => boolean;
  indexOf: (name: name) => int;
  indexOfLast: (name: name) => int; // Returns index of last occurrence of name
  pathVectorToPathName: (vector: pathVector) => pathName; // convert an index path to named path
  toHtml: () => string;
  toJson: () => string;
  toObject: () => Object;
  toCsv: () => string;
  toDelimited: (delimiter: string, header: name[]) => string;
  toFixedWidthTable: (maxWidth?: int) => string;
  toJavascript: () => JavascriptCode;
  toSsv: () => string;
  toTsv: () => string;
  toOutline: () => string; // todo: move this to base class
  toString: () => string;
  toXml: () => string;

  append: (name: name, value?: content, tree?: TreeNode) => TreeNode;
  concat: (b: TreeNode | string) => This;
  delete: (name: pathName) => This; // todo: rename delete child?
  extend: (tree: TreeNode | string) => This; // recursively extend the object
  destroy: () => This;
  duplicate: () => TreeNode;
  moveTo: (tree: TreeNode, index?: int) => This;
  setLine: (line: string) => This;
  setFromText: (text: string) => This;
  insert: (line: string, tree?: TreeNode, index?: int) => TreeNode;
  invert: () => This; // Flips names and values on all top level nodes. Does not recurse.
  prepend: (line: string, tree?: TreeNode) => TreeNode;
  pushTailAndTree: (tail?: string, tree?: TreeNode) => TreeNode; // Name will be set to this.length + 1. todo: remove?
  remap: (key: Object) => This; // Does not recurse.
  rename: (oldName: name, newName: name) => This;
  renameAll: (oldName: name, newName: name) => This;
  sortBy: (nameOrNames: name | name[]) => This;
  setTailWithChildren: (text: string) => This;
  setHead: (name: string) => This;
  setTail: (value?: content) => This;
  every: (fn: nodeIterator) => This;
  reload: (content: content) => This;
  reverse: () => This;
  shift: () => TreeNode;
  sort: (sortFn: sortFn) => This;
}

interface StaticTreeNode {
  getVersion: () => string;
  fromDelimited: (str: string, delimiter: string, hasHeaders?: boolean, quoteChar?: string) => TreeNode;
  fromJson: (str: Json) => TreeNode;
  fromCsv: (str: string, hasHeaders?: boolean) => TreeNode;
  fromSsv: (str: string, hasHeaders?: boolean) => TreeNode;
  fromTsv: (str: string, hasHeaders?: boolean) => TreeNode;
  fromXml: (str: string) => TreeNode;
}
