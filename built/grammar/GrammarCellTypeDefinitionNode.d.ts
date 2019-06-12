import TreeNode from "../base/TreeNode";
import jTreeTypes from "../jTreeTypes";
import { AbstractRuntimeProgramRootNode } from "./AbstractRuntimeNodes";
declare class GrammarCellTypeDefinitionNode extends TreeNode {
    getFirstWordMap(): jTreeTypes.stringMap;
    getCellConstructor(): any;
    getHighlightScope(): string | undefined;
    private _getEnumOptions;
    private _getEnumFromGrammarOptions;
    getAutocompleteWordOptions(runTimeProgram: AbstractRuntimeProgramRootNode): string[];
    getRegexString(): string;
    isValid(str: string, runTimeGrammarBackedProgram: AbstractRuntimeProgramRootNode): boolean;
    getCellTypeId(): jTreeTypes.cellTypeId;
    static types: any;
}
export default GrammarCellTypeDefinitionNode;
