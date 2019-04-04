import TreeNode from "../base/TreeNode";
declare abstract class AbstractRuntimeNode extends TreeNode {
    getGrammarProgram(): any;
    getProgram(): AbstractRuntimeNode;
    abstract getDefinition(): any;
    protected _getKeywordDefinitionByName(path: string): any;
    protected _getRequiredNodeErrors(errors?: any[]): any[];
}
export default AbstractRuntimeNode;
