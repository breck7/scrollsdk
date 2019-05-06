import AbstractRuntimeNonRootNode from "./AbstractRuntimeNonRootNode";
import types from "../types";
declare class GrammarBackedNonTerminalNode extends AbstractRuntimeNonRootNode {
    getKeywordMap(): types.keywordToNodeMap;
    protected _getNodeJoinCharacter(): string;
    compile(targetExtension: types.targetLanguageId): string;
}
export default GrammarBackedNonTerminalNode;
