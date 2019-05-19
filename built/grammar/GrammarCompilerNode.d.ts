import TreeNode from "../base/TreeNode";
import types from "../types";
declare class GrammarCompilerNode extends TreeNode {
    getFirstWordMap(): types.firstWordToNodeConstructorMap;
    getTargetExtension(): string;
    getListDelimiter(): string;
    getTransformation(): string;
    getIndentCharacter(): string;
    getOpenChildrenString(): string;
    getCloseChildrenString(): string;
}
export default GrammarCompilerNode;
