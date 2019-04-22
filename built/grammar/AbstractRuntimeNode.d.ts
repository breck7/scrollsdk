import TreeNode from "../base/TreeNode";
import AbstractGrammarDefinitionNode from "./AbstractGrammarDefinitionNode";
declare abstract class AbstractRuntimeNode extends TreeNode {
    getGrammarProgram(): any;
    getCatchAllNodeConstructor(line: string): any;
    getProgram(): AbstractRuntimeNode;
    abstract getDefinition(): AbstractGrammarDefinitionNode;
    protected _getKeywordDefinitionByName(path: string): AbstractGrammarDefinitionNode;
    protected _getRequiredNodeErrors(errors?: any[]): any[];
}
export default AbstractRuntimeNode;
