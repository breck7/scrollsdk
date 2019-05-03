import TreeNode from "../base/TreeNode";
import types from "../types";
declare class GrammarCellTypeNode extends TreeNode {
    getKeywordMap(): types.stringMap;
    getHighlightScope(): string | undefined;
    private _getEnumOptions;
    getAutocompleteWordOptions(): string[];
    getRegexString(): any;
    parse(str: string): any;
    isValid(str: string, runTimeGrammarBackedProgram: any): boolean;
    getId(): string;
    getTypeId(): string;
    static types: any;
}
export default GrammarCellTypeNode;
