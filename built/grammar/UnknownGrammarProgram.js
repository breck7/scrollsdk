"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const GrammarConstants_1 = require("./GrammarConstants");
class UnknownGrammarNode extends TreeNode_1.default {
    getGrammarStuff() {
        const xi = this.getXI();
        const myKeywords = this.getColumnNames();
        const cellTypeDefinitions = [];
        const keywordDefinitions = myKeywords //this.getInvalidKeywords()
            .map((keyword) => {
            const lines = this.getColumn(keyword).filter(i => i);
            const cells = lines.map(line => line.split(xi));
            const sizes = new Set(cells.map(c => c.length));
            const max = Math.max(...Array.from(sizes));
            const min = Math.min(...Array.from(sizes));
            let catchAllCellType;
            let cellTypes = [];
            for (let index = 0; index < max; index++) {
                const set = new Set(cells.map(c => c[index]));
                const values = Array.from(set).filter(c => c);
                const type = this._getBestType(values);
                cellTypes.push(type);
            }
            if (max > min) {
                //columns = columns.slice(0, min)
                catchAllCellType = cellTypes.pop();
                while (cellTypes[cellTypes.length - 1] === catchAllCellType) {
                    cellTypes.pop();
                }
            }
            const catchAllCellTypeString = catchAllCellType
                ? `\n ${GrammarConstants_1.GrammarConstants.catchAllCellType} ${catchAllCellType}`
                : "";
            const childrenAnyString = this.isLeafColumn(keyword) ? "" : `\n ${GrammarConstants_1.GrammarConstants.any}`;
            if (!cellTypes.length)
                return `${GrammarConstants_1.GrammarConstants.keyword} ${keyword}${catchAllCellTypeString}${childrenAnyString}`;
            if (cellTypes.length > 1)
                return `${GrammarConstants_1.GrammarConstants.keyword} ${keyword}
 ${GrammarConstants_1.GrammarConstants.cells} ${cellTypes.join(xi)}${catchAllCellTypeString}${childrenAnyString}`;
            return `${GrammarConstants_1.GrammarConstants.keyword} ${keyword} ${cellTypes[0]}${catchAllCellTypeString}${childrenAnyString}`;
        });
        return {
            keywordDefinitions: keywordDefinitions,
            cellTypeDefinitions: cellTypeDefinitions
        };
    }
    _getBestType(values) {
        const all = (fn) => {
            for (let i = 0; i < values.length; i++) {
                if (!fn(values[i]))
                    return false;
            }
            return true;
        };
        if (all((str) => str === "0" || str === "1"))
            return "bit";
        if (all((str) => {
            const num = parseInt(str);
            if (isNaN(num))
                return false;
            return num.toString() === str;
        })) {
            return "int";
        }
        if (all((str) => !str.match(/[^\d\.\-]/)))
            return "float";
        const bools = new Set(["1", "0", "true", "false", "t", "f", "yes", "no"]);
        if (all((str) => bools.has(str.toLowerCase())))
            return "bool";
        return "any";
    }
}
class UnknownGrammarProgram extends UnknownGrammarNode {
    getPredictedGrammarFile(grammarName) {
        const rootNode = new TreeNode_1.default(`grammar
 name ${grammarName}`);
        this.getColumnNames().forEach(keyword => rootNode.touchNode(`grammar keywords ${keyword}`));
        const gram = this.getGrammarStuff();
        const yi = this.getYI();
        return rootNode.toString() + "\n" + gram.cellTypeDefinitions.join(yi) + gram.keywordDefinitions.join(yi);
    }
}
class UnknownGrammarProgramNonRootNode extends UnknownGrammarNode {
}
exports.default = UnknownGrammarProgram;
