import AbstractRuntimeNode from "./AbstractRuntimeNode";
import { AbstractGrammarBackedCell } from "./GrammarBackedCell";
declare abstract class AbstractRuntimeNonRootNode extends AbstractRuntimeNode {
    getProgram(): AbstractRuntimeNode;
    getGrammarProgram(): import("./GrammarProgram").default;
    getDefinition(): import("./AbstractGrammarDefinitionNode").default;
    getCompilerNode(targetLanguage: any): import("./GrammarCompilerNode").default;
    getParsedWords(): any[];
    getCompiledIndentation(targetLanguage: any): any;
    getCompiledLine(targetLanguage: any): any;
    compile(targetLanguage: any): any;
    getErrors(): any[];
    readonly cells: {};
    protected _getGrammarBackedCellArray(): AbstractGrammarBackedCell<any>[];
    getLineSyntax(): string;
    getLineHighlightScopes(defaultScope?: string): string;
}
export default AbstractRuntimeNonRootNode;
