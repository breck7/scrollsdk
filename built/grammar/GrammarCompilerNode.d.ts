import TreeNode from "../base/TreeNode";
import jTreeTypes from "../jTreeTypes";
declare class GrammarCompilerNode extends TreeNode {
    getFirstWordMap(): jTreeTypes.firstWordToNodeConstructorMap;
    getTargetExtension(): string;
    getListDelimiter(): string;
    getTransformation(): string;
    getIndentCharacter(): string;
    getOpenChildrenString(): string;
    getCloseChildrenString(): string;
}
export default GrammarCompilerNode;
