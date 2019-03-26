import jtree from "./jtree";
import AbstractRuntimeProgram from "./grammar/AbstractRuntimeProgram";
declare class jtreeNode extends jtree {
    static executeFile: (programPath: string, grammarPath: string) => Promise<any>;
    static makeProgram: (programPath: string, grammarPath: string) => AbstractRuntimeProgram;
    static getProgramConstructor: (grammarPath: string) => import("./grammar/AbstractRuntimeProgramConstructorInterface").default;
}
export default jtreeNode;
