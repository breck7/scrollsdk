import jtree from "./jtree";
import jTreeTypes from "./jTreeTypes";
import { GrammarBackedRootNode, GrammarConstants } from "./GrammarLanguage";
import Upgrader from "./tools/Upgrader";
declare class jtreeNode extends jtree {
    static Upgrader: typeof Upgrader;
    static GrammarConstants: typeof GrammarConstants;
    static executeFile: (programPath: string, grammarPath: string) => Promise<any>;
    static executeFiles: (programPaths: string[], grammarPath: string) => Promise<any>[];
    static executeFileSync: (programPath: string, grammarPath: string) => any;
    static makeProgram: (programPath: string, grammarPath: string) => GrammarBackedRootNode;
    static compileGrammarForNodeJs(pathToGrammar: jTreeTypes.absoluteFilePath, outputFolder: jTreeTypes.asboluteFolderPath, usePrettier?: boolean): string;
    private static _compileGrammar;
    static compileGrammarForBrowser(pathToGrammar: jTreeTypes.absoluteFilePath, outputFolder: jTreeTypes.asboluteFolderPath, usePrettier?: boolean): string;
    static getProgramConstructor: (grammarPath: string) => any;
    static combineFiles: (globPatterns: string[]) => import("./base/TreeNode").default;
}
export default jtreeNode;
