import TreeUtils from "./base/TreeUtils";
import TreeNode from "./base/TreeNode";
import { AbstractRuntimeProgramRootNode } from "./grammar/AbstractRuntimeNodes";
import { GrammarBackedTerminalNode, GrammarBackedNonTerminalNode, GrammarBackedBlobNode } from "./grammar/GrammarBackedNodes";
import GrammarProgram from "./grammar/GrammarProgram";
import UnknownGrammarProgram from "./grammar/UnknownGrammarProgram";
import TreeNotationCodeMirrorMode from "./grammar/TreeNotationCodeMirrorMode";
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
