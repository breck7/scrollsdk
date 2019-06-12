import TreeNode from "../base/TreeNode";
import jTreeTypes from "../jTreeTypes";
declare class GrammarConstNode extends TreeNode {
    getValue(): string;
    getName(): string;
}
declare class GrammarConstantsNode extends TreeNode {
    getCatchAllNodeConstructor(line: string): typeof GrammarConstNode;
    getConstantsObj(): jTreeTypes.stringMap;
}
export default GrammarConstantsNode;
