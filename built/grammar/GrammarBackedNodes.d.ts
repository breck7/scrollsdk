import { AbstractRuntimeNonRootNode } from "./AbstractRuntimeNodes";
import { UnknownNodeTypeError } from "./TreeErrorTypes";
import jTreeTypes from "../jTreeTypes";
declare class GrammarBackedTerminalNode extends AbstractRuntimeNonRootNode {
}
declare class GrammarBackedErrorNode extends AbstractRuntimeNonRootNode {
    getLineCellTypes(): string;
    getErrors(): UnknownNodeTypeError[];
}
declare class GrammarBackedNonTerminalNode extends AbstractRuntimeNonRootNode {
    protected _getNodeJoinCharacter(): string;
    compile(targetExtension: jTreeTypes.targetLanguageId): string;
    private static _backupConstructorEnabled;
    static useAsBackupConstructor(): boolean;
    static setAsBackupConstructor(value: boolean): typeof GrammarBackedNonTerminalNode;
}
declare class GrammarBackedBlobNode extends GrammarBackedNonTerminalNode {
    getFirstWordMap(): {};
    getErrors(): jTreeTypes.TreeError[];
    getCatchAllNodeConstructor(line: string): typeof GrammarBackedBlobNode;
}
export { GrammarBackedTerminalNode, GrammarBackedErrorNode, GrammarBackedNonTerminalNode, GrammarBackedBlobNode };
