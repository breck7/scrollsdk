import AbstractRuntimeNonRootNode from "./AbstractRuntimeNonRootNode";
declare class GrammarBackedNonTerminalNode extends AbstractRuntimeNonRootNode {
    getKeywordMap(): import("../types").types.keywordToNodeMap;
    protected _getNodeJoinCharacter(): string;
    compile(targetExtension: any): string;
}
export default GrammarBackedNonTerminalNode;
