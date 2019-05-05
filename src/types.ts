export namespace types {
  export interface ParseError {
    kind: string
    subkind: string
    level: int
    context: string
    message: string
  }

  export interface point {
    x: int
    y: int
  } // Point on the Cartesian plane where the node is located. Assumes canonical whitespace delimiters. -Y = Y.

  export declare type treeNode = any
  export declare type something = string | Object | any | treeNode
  export declare type line = string // no YI (\n)
  export declare type int = number
  export declare type positiveInt = number
  export declare type stringMap = { [keyword: string]: any }
  export declare type htmlString = string
  export declare type xmlString = string
  export declare type jsonString = string
  export declare type dataTable = (any[])[]

  export declare type formatString = string // "Hello {name}! You are {age} years old."
  export declare type keywordPath = string // user emailAddress
  export declare type pathVector = int[] // example: [0,1,1]
  export declare type word = string // string that cannot contain the YI, XI or ZI
  export declare type triInt = int // -1 0 1
  export declare type filepath = string
  export declare type highlightScope = string
  export declare type fileExtension = string
  export declare type sortFn = (nodeA: treeNode, nodeB: treeNode) => triInt
  export declare type filterFn = (node: treeNode, index: int) => boolean
  export declare type forEachFn = (node: treeNode, index: int) => void

  export declare type TreeNodeConstructor = Function // A constructor extending TreeNodeConstructor
  export declare type RunTimeNodeConstructor = Function // A constructor extending AbstractRuntimeNode
  export declare type TreeProgramConstructor = Function // A constructor extending AbstractRuntimeNode
  export declare type treeProgram = treeNode // A constructor extending AbstractRuntimeNode

  export declare type keywordToNodeMap = { [keyword: string]: TreeNodeConstructor }
}

export default types
