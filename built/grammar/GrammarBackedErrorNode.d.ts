import AbstractRuntimeCodeNode from "./AbstractRuntimeCodeNode";
import types from "../types";
declare class GrammarBackedErrorNode extends AbstractRuntimeCodeNode {
    getLineSyntax(): string;
    getErrors(): types.ParseError[];
}
export default GrammarBackedErrorNode;
