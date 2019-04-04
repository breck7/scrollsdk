import AbstractRuntimeNode from "./AbstractRuntimeNode";
declare abstract class AbstractRuntimeCodeNode extends AbstractRuntimeNode {
    getProgram(): AbstractRuntimeNode;
    getGrammarProgram(): any;
    getDefinition(): any;
    getCompilerNode(targetLanguage: any): any;
    getParsedWords(): any[];
    protected _getParameterMap(): {};
    getCompiledIndentation(targetLanguage: any): any;
    getCompiledLine(targetLanguage: any): any;
    compile(targetLanguage: any): any;
    getErrors(): any[];
    protected _getGrammarBackedCellArray(): any[];
    getLineSyntax(): string;
}
export default AbstractRuntimeCodeNode;
