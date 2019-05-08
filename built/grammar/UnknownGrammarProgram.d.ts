import TreeNode from "../base/TreeNode";
declare class UnknownGrammarNode extends TreeNode {
    protected getGrammarStuff(): {
        keywordDefinitions: string[];
        cellTypeDefinitions: string[];
    };
    protected _getBestCellType(keyword: string, allValues: any[]): {
        cellTypeName: string;
        cellTypeDefinition?: string;
    };
}
declare class UnknownGrammarProgram extends UnknownGrammarNode {
    getPredictedGrammarFile(grammarName: string): string;
}
export default UnknownGrammarProgram;
