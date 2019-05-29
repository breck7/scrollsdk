import TreeNode from "../base/TreeNode";
import jTreeTypes from "../jTreeTypes";
declare class GrammarDefinitionErrorNode extends TreeNode {
    getErrors(): jTreeTypes.ParseError[];
    getLineCellTypes(): string;
}
export default GrammarDefinitionErrorNode;
