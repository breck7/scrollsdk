import TreeNode from "../base/TreeNode";
import types from "../types";
declare class GrammarDefinitionErrorNode extends TreeNode {
    getErrors(): types.ParseError[];
    getLineSyntax(): string;
}
export default GrammarDefinitionErrorNode;
