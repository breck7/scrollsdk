import AbstractRuntimeNonRootNode from "./AbstractRuntimeNonRootNode";
import { UnknownNodeTypeError } from "./TreeErrorTypes";
declare class GrammarBackedErrorNode extends AbstractRuntimeNonRootNode {
    getLineCellTypes(): string;
    getErrors(): UnknownNodeTypeError[];
}
export default GrammarBackedErrorNode;
