import TreeNode from "../base/TreeNode";
declare class GrammarCompilerNode extends TreeNode {
    getKeywordMap(): {};
    getTargetExtension(): string;
    getListDelimiter(): any;
    getTransformation(): any;
    getIndentCharacter(): any;
    getOpenChildrenString(): any;
    getCloseChildrenString(): any;
}
export default GrammarCompilerNode;
