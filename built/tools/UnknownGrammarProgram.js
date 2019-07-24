"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const GrammarLanguage_1 = require("../GrammarLanguage");
class UnknownGrammarProgram extends TreeNode_1.default {
    getPredictedGrammarFile(grammarName) {
        grammarName = GrammarLanguage_1.GrammarProgram.makeNodeTypeId(grammarName);
        const rootNode = new TreeNode_1.default(`${grammarName}
 ${GrammarLanguage_1.GrammarConstants.root}`);
        // note: right now we assume 1 global cellTypeMap and nodeTypeMap per grammar. But we may have scopes in the future?
        const rootNodeNames = this.getFirstWords().map(word => GrammarLanguage_1.GrammarProgram.makeNodeTypeId(word));
        rootNode.nodeAt(0).touchNode(GrammarLanguage_1.GrammarConstants.inScope).setWordsFrom(1, Array.from(new Set(rootNodeNames)));
        const clone = this.clone();
        let node;
        for (node of clone.getTopDownArrayIterator()) {
            const firstWord = node.getFirstWord();
            const asInt = parseInt(firstWord);
            const isANumber = !isNaN(asInt);
            const parentFirstWord = node.getParent().getFirstWord();
            if (isANumber && asInt.toString() === firstWord && parentFirstWord)
                node.setFirstWord(GrammarLanguage_1.GrammarProgram.makeNodeTypeId(parentFirstWord + "Child"));
        }
        const allChilds = {};
        const allFirstWordNodes = {};
        for (let node of clone.getTopDownArrayIterator()) {
            const firstWord = node.getFirstWord();
            if (!allChilds[firstWord])
                allChilds[firstWord] = {};
            if (!allFirstWordNodes[firstWord])
                allFirstWordNodes[firstWord] = [];
            allFirstWordNodes[firstWord].push(node);
            node.forEach((child) => {
                allChilds[firstWord][child.getFirstWord()] = true;
            });
        }
        const globalCellTypeMap = new Map();
        const xi = this.getXI();
        const yi = this.getYI();
        const firstWords = Object.keys(allChilds).map(firstWord => {
            const nodeTypeId = GrammarLanguage_1.GrammarProgram.makeNodeTypeId(firstWord);
            const nodeDefNode = new TreeNode_1.default(nodeTypeId).nodeAt(0);
            const childFirstWords = Object.keys(allChilds[firstWord]).map(word => GrammarLanguage_1.GrammarProgram.makeNodeTypeId(word));
            if (childFirstWords.length)
                nodeDefNode.touchNode(GrammarLanguage_1.GrammarConstants.inScope).setWordsFrom(1, childFirstWords);
            const allLines = allFirstWordNodes[firstWord];
            const cells = allLines
                .map(line => line.getContent())
                .filter(i => i)
                .map(i => i.split(xi));
            const sizes = new Set(cells.map(c => c.length));
            const max = Math.max(...Array.from(sizes));
            const min = Math.min(...Array.from(sizes));
            let catchAllCellType;
            let cellTypes = [];
            for (let index = 0; index < max; index++) {
                const cellType = this._getBestCellType(firstWord, cells.map(c => c[index]));
                if (cellType.cellTypeDefinition && !globalCellTypeMap.has(cellType.cellTypeId))
                    globalCellTypeMap.set(cellType.cellTypeId, cellType.cellTypeDefinition);
                cellTypes.push(cellType.cellTypeId);
            }
            if (max > min) {
                //columns = columns.slice(0, min)
                catchAllCellType = cellTypes.pop();
                while (cellTypes[cellTypes.length - 1] === catchAllCellType) {
                    cellTypes.pop();
                }
            }
            if (catchAllCellType)
                nodeDefNode.set(GrammarLanguage_1.GrammarConstants.catchAllCellType, catchAllCellType);
            if (cellTypes.length > 1)
                nodeDefNode.set(GrammarLanguage_1.GrammarConstants.cells, cellTypes.join(xi));
            if (!catchAllCellType && cellTypes.length === 1)
                nodeDefNode.set(GrammarLanguage_1.GrammarConstants.cells, cellTypes[0]);
            // Todo: add conditional frequencies
            return nodeDefNode.getParent().toString();
        });
        const cellTypes = [];
        globalCellTypeMap.forEach(def => cellTypes.push(def));
        return [rootNode.toString(), cellTypes.join(yi), firstWords.join(yi)].filter(i => i).join("\n");
    }
    _getBestCellType(firstWord, allValues) {
        const asSet = new Set(allValues);
        const xi = this.getXI();
        const values = Array.from(asSet).filter(c => c);
        const all = (fn) => {
            for (let i = 0; i < values.length; i++) {
                if (!fn(values[i]))
                    return false;
            }
            return true;
        };
        if (all((str) => str === "0" || str === "1"))
            return { cellTypeId: GrammarLanguage_1.PreludeCellTypeIds.bitCell };
        if (all((str) => {
            const num = parseInt(str);
            if (isNaN(num))
                return false;
            return num.toString() === str;
        })) {
            return { cellTypeId: GrammarLanguage_1.PreludeCellTypeIds.intCell };
        }
        if (all((str) => !str.match(/[^\d\.\-]/)))
            return { cellTypeId: GrammarLanguage_1.PreludeCellTypeIds.floatCell };
        const bools = new Set(["1", "0", "true", "false", "t", "f", "yes", "no"]);
        if (all((str) => bools.has(str.toLowerCase())))
            return { cellTypeId: GrammarLanguage_1.PreludeCellTypeIds.boolCell };
        // If there are duplicate files and the set is less than enum
        const enumLimit = 10;
        if ((asSet.size === 1 || allValues.length > asSet.size) && asSet.size < enumLimit)
            return {
                cellTypeId: GrammarLanguage_1.GrammarProgram.makeCellTypeId(firstWord),
                cellTypeDefinition: `${GrammarLanguage_1.GrammarProgram.makeCellTypeId(firstWord)}
 enum ${values.join(xi)}`
            };
        return { cellTypeId: GrammarLanguage_1.PreludeCellTypeIds.anyCell };
    }
}
exports.default = UnknownGrammarProgram;
