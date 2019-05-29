import GrammarExampleNode from "./GrammarExampleNode";
import AbstractGrammarDefinitionNode from "./AbstractGrammarDefinitionNode";
import jTreeTypes from "../jTreeTypes";
declare class GrammarNodeTypeDefinitionNode extends AbstractGrammarDefinitionNode {
    _getRunTimeCatchAllNodeTypeId(): string;
    getExpectedLineCellTypes(): string;
    isOrExtendsANodeTypeInScope(firstWordsInScope: string[]): boolean;
    getSublimeSyntaxContextId(): string;
    private _getFirstCellHighlightScope;
    getMatchBlock(): string;
    private _cache_nodeTypeInheritanceSet;
    private _cache_ancestorNodeTypeIdsArray;
    getNodeTypeInheritanceSet(): Set<string>;
    private _getIdOfNodeTypeThatThisExtends;
    getAncestorNodeTypeNamesArray(): jTreeTypes.nodeTypeId[];
    protected _initNodeTypeInheritanceCache(): void;
    _getProgramNodeTypeDefinitionCache(): {
        [nodeTypeName: string]: GrammarNodeTypeDefinitionNode;
    };
    getDoc(): string;
    private _getDefaultsNode;
    getDefaultFor(name: string): string;
    getDescription(): string;
    getExamples(): GrammarExampleNode[];
    getConstantsObject(): jTreeTypes.stringMap;
    getFrequency(): number;
}
export default GrammarNodeTypeDefinitionNode;
