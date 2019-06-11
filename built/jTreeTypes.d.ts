export declare namespace jTreeTypes {
    interface point {
        x: int;
        y: int;
    }
    interface inheritanceInfo {
        node: treeNode;
        nodeId: string;
        parentId: string;
    }
    interface TreeError {
        getLineIndex(): positiveInt;
        getLine(): line;
        getExtension(): fileExtension;
        getNode(): treeNode;
        getErrorTypeName(): string;
        getCellIndex(): positiveInt;
        hasSuggestion(): boolean;
        getSuggestionMessage(): string;
        applySuggestion(): void;
        getMessage(): string;
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
    type dataTable = (any[])[];
    type delimiter = string;
    type jsonSubset = string;
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
    type typeScriptCode = string;
    type javascriptCode = string;
    type semanticVersion = string;
    type absoluteFilePath = filepath;
    type asboluteFolderPath = absoluteFilePath;
    type children = string | Object | treeNode | any;
    type TreeNodeConstructor = Function;
    type RunTimeNodeConstructor = Function;
    type TreeProgramConstructor = Function;
    type treeProgram = treeNode;
    type upgradeFunction = (tree: treeNode) => treeNode;
    type upgradeToMap = {
        [toVersion: string]: upgradeFunction;
    };
    type upgradeFromMap = {
        [fromVersion: string]: upgradeToMap;
    };
    type firstWordToNodeConstructorMap = {
        [firstWord: string]: TreeNodeConstructor;
    };
}
export default jTreeTypes;
