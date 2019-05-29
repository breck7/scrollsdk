import TreeNode from "../base/TreeNode";
import { InvalidConstructorPathError } from "./TreeErrorTypes";
import jTreeTypes from "../jTreeTypes";
declare abstract class AbstractCustomConstructorNode extends TreeNode {
    getTheDefinedConstructor(): jTreeTypes.RunTimeNodeConstructor;
    protected isAppropriateEnvironment(): boolean;
    protected _getCustomConstructor(): jTreeTypes.RunTimeNodeConstructor;
    getErrors(): InvalidConstructorPathError[];
    getBuiltIn(): any;
}
declare class GrammarCustomConstructorsNode extends TreeNode {
    getFirstWordMap(): jTreeTypes.firstWordToNodeConstructorMap;
    getConstructorForEnvironment(): AbstractCustomConstructorNode;
}
export default GrammarCustomConstructorsNode;
