import TreeNode from "../base/TreeNode";
import types from "../types";
declare abstract class AbstractCustomConstructorNode extends TreeNode {
    private _getBuiltInConstructors;
    getDefinedConstructor(): types.RunTimeNodeConstructor;
    protected isAppropriateEnvironment(): boolean;
    protected _getCustomConstructor(): types.RunTimeNodeConstructor;
    getErrors(): types.ParseError[];
    getBuiltIn(): any;
}
declare class GrammarCustomConstructorsNode extends TreeNode {
    getKeywordMap(): {};
    getConstructorForEnvironment(): AbstractCustomConstructorNode;
}
export default GrammarCustomConstructorsNode;
