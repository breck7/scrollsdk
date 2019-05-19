import GrammarExampleNode from "./GrammarExampleNode";
import AbstractGrammarDefinitionNode from "./AbstractGrammarDefinitionNode";
import types from "../types";
declare class GrammarNodeTypeDefinitionNode extends AbstractGrammarDefinitionNode {
    _getRunTimeCatchAllNodeTypeId(): string;
    isOrExtendsANodeTypeInScope(firstWordsInScope: string[]): boolean;
    getSyntaxContextId(): string;
    getMatchBlock(): string;
    private _cache_nodeTypeInheritanceSet;
    getNodeTypeInheritanceSet(): Set<string>;
    private _getIdOfNodeTypeThatThisExtends;
    protected _initNodeTypeInheritanceSetCache(): void;
    _getProgramNodeTypeDefinitionCache(): {
        [nodeTypeName: string]: GrammarNodeTypeDefinitionNode;
    };
    getDoc(): string;
    private _getDefaultsNode;
    getDefaultFor(name: string): string;
    getDescription(): string;
    getExamples(): GrammarExampleNode[];
    getConstantsObject(): types.stringMap;
    getFrequency(): number;
}
export default GrammarNodeTypeDefinitionNode;
