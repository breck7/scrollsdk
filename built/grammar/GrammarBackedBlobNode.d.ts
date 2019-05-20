import GrammarBackedNonTerminalNode from "./GrammarBackedNonTerminalNode";
import types from "../types";
declare class GrammarBackedBlobNode extends GrammarBackedNonTerminalNode {
    getFirstWordMap(): {};
    getErrors(): types.ParseError[];
    getCatchAllNodeConstructor(line: string): typeof GrammarBackedBlobNode;
}
export default GrammarBackedBlobNode;
