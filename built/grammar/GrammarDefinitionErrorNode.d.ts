import TreeNode from "../base/TreeNode";
import types from "../types";
declare class GrammarDefinitionErrorNode extends TreeNode {
    getErrors(): types.ParseError[];
    getLineCellTypes(): string;
}
export default GrammarDefinitionErrorNode;
