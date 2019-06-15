import TreeUtils from "./base/TreeUtils";
import TreeNode from "./base/TreeNode";
import { GrammarProgram, GrammarBackedRootNode, GrammarBackedTerminalNode, GrammarBackedNonTerminalNode } from "./GrammarLanguage";
import UnknownGrammarProgram from "./tools/UnknownGrammarProgram";
import TreeNotationCodeMirrorMode from "./codemirror/TreeNotationCodeMirrorMode";
declare class jtree {
    static GrammarBackedRootNode: typeof GrammarBackedRootNode;
    static Utils: typeof TreeUtils;
    static TreeNode: typeof TreeNode;
    static NonTerminalNode: typeof GrammarBackedNonTerminalNode;
    static TerminalNode: typeof GrammarBackedTerminalNode;
    static GrammarProgram: typeof GrammarProgram;
    static UnknownGrammarProgram: typeof UnknownGrammarProgram;
    static TreeNotationCodeMirrorMode: typeof TreeNotationCodeMirrorMode;
    static getVersion: () => string;
}
export default jtree;
