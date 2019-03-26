import TreeNode from "../base/TreeNode";
import GrammarBackedNonTerminalNode from "./GrammarBackedNonTerminalNode";
import GrammarBackedAnyNode from "./GrammarBackedAnyNode";
import GrammarBackedTerminalNode from "./GrammarBackedTerminalNode";
import GrammarBackedErrorNode from "./GrammarBackedErrorNode";
import types from "../types";
declare class GrammarCustomConstructorNode extends TreeNode {
    protected _getNodeConstructorFilePath(): string;
    getSubModuleName(): string;
    protected _getBuiltInConstructors(): {
        ErrorNode: typeof GrammarBackedErrorNode;
        TerminalNode: typeof GrammarBackedTerminalNode;
        NonTerminalNode: typeof GrammarBackedNonTerminalNode;
        AnyNode: typeof GrammarBackedAnyNode;
    };
    getErrors(): types.ParseError[];
    getDefinedConstructor(): types.RunTimeNodeConstructor;
}
export default GrammarCustomConstructorNode;
