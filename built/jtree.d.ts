import TreeUtils from "./base/TreeUtils";
import TreeNode from "./base/TreeNode";
import { GrammarProgram, GrammarBackedRootNode, GrammarBackedNonRootNode, GrammarBackedBlobNode, GrammarBackedErrorNode } from "./GrammarLanguage";
import UnknownGrammarProgram from "./tools/UnknownGrammarProgram";
import TreeNotationCodeMirrorMode from "./codemirror/TreeNotationCodeMirrorMode";
declare class jtree {
    static GrammarBackedRootNode: typeof GrammarBackedRootNode;
    static GrammarBackedNonRootNode: typeof GrammarBackedNonRootNode;
    static Utils: typeof TreeUtils;
    static TreeNode: typeof TreeNode;
    static BlobNode: typeof GrammarBackedBlobNode;
    static ErrorNode: typeof GrammarBackedErrorNode;
    static GrammarProgram: typeof GrammarProgram;
    static UnknownGrammarProgram: typeof UnknownGrammarProgram;
    static TreeNotationCodeMirrorMode: typeof TreeNotationCodeMirrorMode;
    static getVersion: () => string;
}
export default jtree;
