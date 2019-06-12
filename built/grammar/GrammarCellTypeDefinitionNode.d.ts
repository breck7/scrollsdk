import TreeNode from "../base/TreeNode";
import jTreeTypes from "../jTreeTypes";
import AbstractRuntimeProgram from "./AbstractRuntimeProgram";
declare class GrammarCellTypeDefinitionNode extends TreeNode {
    getFirstWordMap(): jTreeTypes.stringMap;
    getCellConstructor(): any;
    getHighlightScope(): string | undefined;
    private _getEnumOptions;
    private _getEnumFromGrammarOptions;
    getAutocompleteWordOptions(runTimeProgram: AbstractRuntimeProgram): string[];
    getRegexString(): string;
    isValid(str: string, runTimeGrammarBackedProgram: AbstractRuntimeProgram): boolean;
    getCellTypeId(): jTreeTypes.cellTypeId;
    static types: any;
}
export default GrammarCellTypeDefinitionNode;
