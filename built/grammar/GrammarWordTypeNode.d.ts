import TreeNode from "../base/TreeNode";
declare class GrammarWordTypeNode extends TreeNode {
    getKeywordMap(): any[];
    getHighlightScope(): any;
    private _getEnumOptions;
    getRegexString(): any;
    parse(str: any): any;
    isValid(str: any, runTimeGrammarBackedProgram: any): boolean;
    getId(): string;
    getTypeId(): string;
    static types: any;
}
export default GrammarWordTypeNode;
