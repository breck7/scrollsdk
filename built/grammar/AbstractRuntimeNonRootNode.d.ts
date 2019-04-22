import GrammarBackedCell from "./GrammarBackedCell";
import AbstractRuntimeNode from "./AbstractRuntimeNode";
declare abstract class AbstractRuntimeNonRootNode extends AbstractRuntimeNode {
    getProgram(): AbstractRuntimeNode;
    getGrammarProgram(): import("./GrammarProgram").default;
    getDefinition(): import("./AbstractGrammarDefinitionNode").default;
    getCompilerNode(targetLanguage: any): import("./GrammarCompilerNode").default;
    getParsedWords(): any[];
    protected _getParameterMap(): {};
    getCompiledIndentation(targetLanguage: any): any;
    getCompiledLine(targetLanguage: any): any;
    compile(targetLanguage: any): any;
    getErrors(): any[];
    protected _getGrammarBackedCellArray(): GrammarBackedCell[];
    getLineSyntax(): string;
    getLineHighlightScopes(defaultScope?: string): string;
}
export default AbstractRuntimeNonRootNode;
