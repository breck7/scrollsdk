import AbstractRuntimeNonRootNode from "./AbstractRuntimeNonRootNode";
import jTreeTypes from "../jTreeTypes";
declare class GrammarBackedNonTerminalNode extends AbstractRuntimeNonRootNode {
    getFirstWordMap(): jTreeTypes.firstWordToNodeConstructorMap;
    protected _getNodeJoinCharacter(): string;
    compile(targetExtension: jTreeTypes.targetLanguageId): string;
    private static _backupConstructorEnabled;
    static useAsBackupConstructor(): boolean;
    static setAsBackupConstructor(value: boolean): typeof GrammarBackedNonTerminalNode;
}
export default GrammarBackedNonTerminalNode;
