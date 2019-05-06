import TreeNode from "../base/TreeNode";
import types from "../types";
declare class GrammarCompilerNode extends TreeNode {
    getKeywordMap(): types.keywordToNodeMap;
    getTargetExtension(): string;
    getListDelimiter(): string;
    getTransformation(): string;
    getIndentCharacter(): string;
    getOpenChildrenString(): string;
    getCloseChildrenString(): string;
}
export default GrammarCompilerNode;
