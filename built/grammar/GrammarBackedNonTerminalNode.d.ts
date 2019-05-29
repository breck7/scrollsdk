import AbstractRuntimeNonRootNode from "./AbstractRuntimeNonRootNode";
import jTreeTypes from "../jTreeTypes";
declare class GrammarBackedNonTerminalNode extends AbstractRuntimeNonRootNode {
    getFirstWordMap(): jTreeTypes.firstWordToNodeConstructorMap;
    protected _getNodeJoinCharacter(): string;
    compile(targetExtension: jTreeTypes.targetLanguageId): string;
}
export default GrammarBackedNonTerminalNode;
