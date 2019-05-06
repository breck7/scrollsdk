import TreeNode from "../base/TreeNode";
import GrammarConstNode from "./GrammarConstNode";
import types from "../types";
declare class GrammarConstantsNode extends TreeNode {
    getCatchAllNodeConstructor(line: string): typeof GrammarConstNode;
    getConstantsObj(): types.stringMap;
}
export default GrammarConstantsNode;
