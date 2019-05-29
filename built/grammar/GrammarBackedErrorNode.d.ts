import AbstractRuntimeNonRootNode from "./AbstractRuntimeNonRootNode";
import jTreeTypes from "../jTreeTypes";
declare class GrammarBackedErrorNode extends AbstractRuntimeNonRootNode {
    getLineCellTypes(): string;
    getErrors(): jTreeTypes.ParseError[];
}
export default GrammarBackedErrorNode;
