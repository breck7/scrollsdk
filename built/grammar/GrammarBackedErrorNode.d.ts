import AbstractRuntimeNonRootNode from "./AbstractRuntimeNonRootNode";
import types from "../types";
declare class GrammarBackedErrorNode extends AbstractRuntimeNonRootNode {
    getLineCellTypes(): string;
    getErrors(): types.ParseError[];
}
export default GrammarBackedErrorNode;
