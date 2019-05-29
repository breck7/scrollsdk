import TreeNode from "../base/TreeNode";
import GrammarConstNode from "./GrammarConstNode";
import jTreeTypes from "../jTreeTypes";
declare class GrammarConstantsNode extends TreeNode {
    getCatchAllNodeConstructor(line: string): typeof GrammarConstNode;
    getConstantsObj(): jTreeTypes.stringMap;
}
export default GrammarConstantsNode;
