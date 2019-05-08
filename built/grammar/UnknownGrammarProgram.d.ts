import TreeNode from "../base/TreeNode";
declare class UnknownGrammarNode extends TreeNode {
    protected getGrammarStuff(): {
        keywordDefinitions: string[];
        cellTypeDefinitions: string[];
    };
    protected _getBestType(values: any): "any" | "int" | "float" | "bit" | "bool";
}
declare class UnknownGrammarProgram extends UnknownGrammarNode {
    getPredictedGrammarFile(grammarName: string): string;
}
export default UnknownGrammarProgram;
