import TreeNode from "../base/TreeNode";
import GrammarConstNode from "./GrammarConstNode";
declare class GrammarConstantsNode extends TreeNode {
    getCatchAllNodeConstructor(line: any): typeof GrammarConstNode;
    getConstantsObj(): {};
}
export default GrammarConstantsNode;
