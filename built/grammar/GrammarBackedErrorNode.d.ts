import AbstractRuntimeNonRootNode from "./AbstractRuntimeNonRootNode";
import types from "../types";
declare class GrammarBackedErrorNode extends AbstractRuntimeNonRootNode {
    getLineSyntax(): string;
    getErrors(): types.ParseError[];
}
export default GrammarBackedErrorNode;
