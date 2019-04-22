import AbstractRuntimeNonRootNode from "./AbstractRuntimeNonRootNode";
declare class GrammarBackedNonTerminalNode extends AbstractRuntimeNonRootNode {
    getKeywordMap(): any;
    protected _getNodeJoinCharacter(): string;
    compile(targetExtension: any): string;
}
export default GrammarBackedNonTerminalNode;
