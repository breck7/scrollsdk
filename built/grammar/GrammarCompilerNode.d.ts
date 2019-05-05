import TreeNode from "../base/TreeNode";
import types from "../types";
declare class GrammarCompilerNode extends TreeNode {
    getKeywordMap(): types.keywordToNodeMap;
    getTargetExtension(): string;
    getListDelimiter(): any;
    getTransformation(): any;
    getIndentCharacter(): any;
    getOpenChildrenString(): any;
    getCloseChildrenString(): any;
}
export default GrammarCompilerNode;
