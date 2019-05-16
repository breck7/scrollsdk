export declare namespace types {
    interface ParseError {
        kind: string;
        subkind: string;
        level: int;
        context: string;
        message: string;
    }
    interface point {
        x: int;
        y: int;
    }
    type treeNode = any;
    type line = string;
    type int = number;
    type positiveInt = number;
    type stringMap = {
        [keyword: string]: any;
    };
    type htmlString = string;
    type xmlString = string;
    type jsonString = string;
    type dataTable = (any[])[];
    type delimiter = string;
    type formatString = string;
    type keywordPath = string;
    type pathVector = int[];
    type word = string;
    type triInt = int;
    type filepath = string;
    type globPattern = string;
    type highlightScope = string;
    type fileExtension = string;
    type globPath = string;
    type targetLanguageId = fileExtension;
    type sortFn = (nodeA: treeNode, nodeB: treeNode) => triInt;
    type filterFn = (node: treeNode, index: int) => boolean;
    type forEachFn = (node: treeNode, index: int) => void;
    type everyFn = (node: treeNode, index: int) => boolean;
    type nodeToStringFn = (node: treeNode) => string;
    type formatFunction = (val: string, rowIndex: positiveInt, colIndex: positiveInt) => string;
    type children = string | Object | treeNode | any;
    type TreeNodeConstructor = Function;
    type RunTimeNodeConstructor = Function;
    type TreeProgramConstructor = Function;
    type treeProgram = treeNode;
    type keywordToNodeMap = {
        [keyword: string]: TreeNodeConstructor;
    };
}
export default types;
