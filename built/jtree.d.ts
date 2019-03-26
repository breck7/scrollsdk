import TreeUtils from "./base/TreeUtils";
import TreeNode from "./base/TreeNode";
import AbstractRuntimeProgram from "./grammar/AbstractRuntimeProgram";
import GrammarBackedNonTerminalNode from "./grammar/GrammarBackedNonTerminalNode";
import GrammarBackedTerminalNode from "./grammar/GrammarBackedTerminalNode";
import GrammarBackedAnyNode from "./grammar/GrammarBackedAnyNode";
import GrammarProgram from "./grammar/GrammarProgram";
declare class jtree {
    static program: typeof AbstractRuntimeProgram;
    static Utils: typeof TreeUtils;
    static TreeNode: typeof TreeNode;
    static NonTerminalNode: typeof GrammarBackedNonTerminalNode;
    static TerminalNode: typeof GrammarBackedTerminalNode;
    static AnyNode: typeof GrammarBackedAnyNode;
    static GrammarProgram: typeof GrammarProgram;
    static getLanguage: (name: any) => any;
    static getVersion: () => string;
}
export default jtree;
