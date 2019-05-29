export declare namespace jTreeTypes {
    interface ParseError {
        kind: string;
        subkind: string;
        level: int;
        context: string;
        message: string;
    }
    enum GrammarConstantsErrors {
        invalidNodeTypeError = "invalidNodeTypeError",
        invalidConstructorPathError = "invalidConstructorPathError",
        invalidWordError = "invalidWordError",
        grammarDefinitionError = "grammarDefinitionError",
        extraWordError = "extraWordError",
        unfilledColumnError = "unfilledColumnError",
        missingRequiredNodeTypeError = "missingRequiredNodeTypeError",
        nodeTypeUsedMultipleTimesError = "nodeTypeUsedMultipleTimesError"
    }
    interface point {
        x: int;
        y: int;
    }
    interface inheritanceInfo {
        node: treeNode;
        nodeId: string;
        parentId: string;
    }
    type treeNode = any;
    type line = string;
    type int = number;
    type positiveInt = number;
    type stringMap = {
        [firstWord: string]: any;
    };
    type htmlString = string;
    type xmlString = string;
    type jsonString = string;
    type dataTable = (any[])[];
    type delimiter = string;
    type formatString = string;
    type firstWordPath = string;
    type pathVector = int[];
    type word = string;
    type firstWord = word;
    type nodeTypeId = string;
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
    type nodeIdRenameMap = {
        [oldNodeTypeId: string]: string;
    };
    type children = string | Object | treeNode | any;
    type TreeNodeConstructor = Function;
    type RunTimeNodeConstructor = Function;
    type TreeProgramConstructor = Function;
    type treeProgram = treeNode;
    type firstWordToNodeConstructorMap = {
        [firstWord: string]: TreeNodeConstructor;
    };
}
export default jTreeTypes;
