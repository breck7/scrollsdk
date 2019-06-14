import TreeUtils from "./base/TreeUtils";
import TreeNode from "./base/TreeNode";
import { GrammarProgram, AbstractRuntimeProgramRootNode, GrammarBackedTerminalNode, GrammarBackedNonTerminalNode, CompiledLanguageRootNode, CompiledLanguageNonRootNode } from "./GrammarLanguage";
import UnknownGrammarProgram from "./tools/UnknownGrammarProgram";
import TreeNotationCodeMirrorMode from "./codemirror/TreeNotationCodeMirrorMode";
declare class jtree {
    static programRoot: typeof AbstractRuntimeProgramRootNode;
    static Utils: typeof TreeUtils;
    static TreeNode: typeof TreeNode;
    static NonTerminalNode: typeof GrammarBackedNonTerminalNode;
    static TerminalNode: typeof GrammarBackedTerminalNode;
    static GrammarProgram: typeof GrammarProgram;
    static CompiledLanguageRootNode: typeof CompiledLanguageRootNode;
    static CompiledLanguageNonRootNode: typeof CompiledLanguageNonRootNode;
    static UnknownGrammarProgram: typeof UnknownGrammarProgram;
    static TreeNotationCodeMirrorMode: typeof TreeNotationCodeMirrorMode;
    static getVersion: () => string;
}
export default jtree;
