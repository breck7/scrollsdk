import TreeNode from "../base/TreeNode";
import GrammarProgram from "./GrammarProgram";
declare abstract class AbstractRuntimeNode extends TreeNode {
    abstract getGrammarProgram(): GrammarProgram;
    getProgram(): AbstractRuntimeNode;
    abstract getDefinition(): any;
    protected _getKeywordDefinitionByName(path: string): import("./AbstractGrammarDefinitionNode").default;
    protected _getRequiredNodeErrors(errors?: any[]): any[];
}
export default AbstractRuntimeNode;
