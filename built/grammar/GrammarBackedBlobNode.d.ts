import GrammarBackedNonTerminalNode from "./GrammarBackedNonTerminalNode";
import jTreeTypes from "../jTreeTypes";
declare class GrammarBackedBlobNode extends GrammarBackedNonTerminalNode {
    getFirstWordMap(): {};
    getErrors(): jTreeTypes.TreeError[];
    getCatchAllNodeConstructor(line: string): typeof GrammarBackedBlobNode;
}
export default GrammarBackedBlobNode;
