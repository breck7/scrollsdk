declare type content = string | TreeNotation | Object | any;
declare type int = number;
declare type nodeString = string; // A string that does not contain the nodeDelimiter ("\n")
declare type pathName = string; // user emailAddress
declare type pathVector = int[]; // example: [0,1,1]
declare type name = string; // string that cannot contain the nodeDelimiter, nodeEdgeChar or nodeAssignmentChar
declare type Undefined = any;
declare type This = any;
declare type formatString = string; // "Hello {name}! You are {age} years old."
declare type Json = string; // JSON string
declare type nodeIterator = (node: TreeNotation, index: int) => boolean;
declare type sortResultInt = int; // -1 0 1
declare type JavascriptCode = string;
declare type sortFn = (nodeA: TreeNotation, nodeB: TreeNotation) => sortResultInt;
declare type point = {x: int, y: int}; // Point on the Cartesian plane where the node is located. Assumes canonical whitespace delimiters. -Y = Y.

interface TreeNotation {
  (tree?: content, line?: string): This;

  getIndex: () => int;
  getPoint: () => point;
  getPathVector: () => pathVector;
  getLine: () => nodeString;
  getChildrenByNodeType: () => TreeNotation[];
  getAncestorNodes: () => TreeNotation[];
  getParent: () => TreeNotation | undefined;
  getRootNode: () => This | TreeNotation;
  getHead: () => name;
  getTail: () => (string | Undefined);
  getPathName: () => pathName;
  getTopDownArray: () => TreeNotation[]; // returns all nodes as array in preorder order
  getTailWithChildren: () => string;
  getNext: () => TreeNotation; // wrapsaround
  getPrevious: () => TreeNotation; // wrapsaround
  isTerminal: () => Boolean;
  clone: () => TreeNotation;
  copyTo: (tree: TreeNotation, index?: int) => TreeNotation;
  getLines: () => string[];
  getNodes: () => TreeNotation[];
  length: number;
  nodeAt: (index: int) => TreeNotation;
  findNodes: (name: pathName) => TreeNotation[];
  findTail: (path: name) => (string | Undefined);
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

  append: (line: string, tree?: TreeNotation) => TreeNotation;
  concat: (b: TreeNotation | string) => This;
  delete: (name: pathName) => This; // todo: rename delete child?
  extend: (tree: TreeNotation | string) => This; // recursively extend the object
  destroy: () => undefined;
  duplicate: () => TreeNotation;
  getMTime: () => number | undefined; // Only updates on changes to line. Returns undefined if no modifications yet.
  setLine: (line: string) => This;
  setFromText: (text: string) => This;
  insert: (line: string, tree?: TreeNotation, index?: int) => TreeNotation;
  invert: () => This; // Flips heads and tails on all top level nodes. Does not recurse.
  prepend: (line: string, tree?: TreeNotation) => TreeNotation;
  pushTailAndTree: (tail?: string, tree?: TreeNotation) => TreeNotation; // Name will be set to this.length + 1. todo: remove?
  remap: (key: Object) => This; // Does not recurse.
  rename: (oldName: name, newName: name) => This;
  renameAll: (oldName: name, newName: name) => This;
  sortBy: (nameOrNames: name | name[]) => This;
  setTailWithChildren: (text: string) => This;
  setHead: (name: string) => This;
  setTail: (value?: content) => This;
  reverse: () => This;
  shift: () => TreeNotation;
  sort: (sortFn: sortFn) => This;
}

interface StaticTreeNotation {
  getVersion: () => string;
  fromDelimited: (str: string, delimiter: string, hasHeaders?: boolean, quoteChar?: string) => TreeNotation;
  fromJson: (str: Json) => TreeNotation;
  fromCsv: (str: string, hasHeaders?: boolean) => TreeNotation;
  fromSsv: (str: string, hasHeaders?: boolean) => TreeNotation;
  fromTsv: (str: string, hasHeaders?: boolean) => TreeNotation;
  fromXml: (str: string) => TreeNotation;
}
