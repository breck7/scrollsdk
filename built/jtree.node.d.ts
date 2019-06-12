import jtree from "./jtree";
import { AbstractRuntimeProgramRootNode } from "./grammar/AbstractRuntimeNodes";
import Upgrader from "./tools/Upgrader";
declare class jtreeNode extends jtree {
    static Upgrader: typeof Upgrader;
    static executeFile: (programPath: string, grammarPath: string) => Promise<any>;
    static executeFiles: (programPaths: string[], grammarPath: string) => Promise<any>[];
    static executeFileSync: (programPath: string, grammarPath: string) => any;
    static makeProgram: (programPath: string, grammarPath: string) => AbstractRuntimeProgramRootNode;
    static getProgramConstructor: (grammarPath: string) => import("./grammar/AbstractRuntimeProgramConstructorInterface").default;
    static combineFiles: (globPatterns: string[]) => import("./base/TreeNode").default;
}
export default jtreeNode;
