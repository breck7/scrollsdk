import TreeUtils from "./base/TreeUtils";
import TreeNode from "./base/TreeNode";
import { GrammarProgram, AbstractRuntimeProgramRootNode, GrammarBackedTerminalNode, GrammarBackedNonTerminalNode, GrammarBackedBlobNode } from "./GrammarLanguage";
import UnknownGrammarProgram from "./tools/UnknownGrammarProgram";
import TreeNotationCodeMirrorMode from "./codemirror/TreeNotationCodeMirrorMode";
declare class jtree {
    static programRoot: typeof AbstractRuntimeProgramRootNode;
    static Utils: typeof TreeUtils;
    static TreeNode: typeof TreeNode;
    static NonTerminalNode: typeof GrammarBackedNonTerminalNode;
    static TerminalNode: typeof GrammarBackedTerminalNode;
    static BlobNode: typeof GrammarBackedBlobNode;
    static GrammarProgram: typeof GrammarProgram;
    static UnknownGrammarProgram: typeof UnknownGrammarProgram;
    static TreeNotationCodeMirrorMode: typeof TreeNotationCodeMirrorMode;
    static getVersion: () => string;
}
export default jtree;
