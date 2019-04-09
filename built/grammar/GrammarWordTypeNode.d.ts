import TreeNode from "../base/TreeNode";
import types from "../types";
declare class GrammarWordTypeNode extends TreeNode {
    getKeywordMap(): types.stringMap;
    getHighlightScope(): any;
    private _getEnumOptions;
    getRegexString(): any;
    parse(str: string): any;
    isValid(str: string, runTimeGrammarBackedProgram: any): boolean;
    getId(): string;
    getTypeId(): string;
    static types: any;
}
export default GrammarWordTypeNode;
