import TreeNode from "../base/TreeNode";
import { UnknownNodeTypeError } from "./TreeErrorTypes";
declare class GrammarDefinitionErrorNode extends TreeNode {
    getErrors(): UnknownNodeTypeError[];
    getLineCellTypes(): string;
}
export default GrammarDefinitionErrorNode;
