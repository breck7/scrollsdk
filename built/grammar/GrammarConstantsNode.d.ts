import TreeNode from "../base/TreeNode";
import GrammarConstNode from "./GrammarConstNode";
declare class GrammarConstantsNode extends TreeNode {
    getCatchAllNodeConstructor(line: string): typeof GrammarConstNode;
    getConstantsObj(): {};
}
export default GrammarConstantsNode;
