"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AbstractNode {
    _getNow() {
        return parseFloat(process.hrtime().join(""));
    }
    toDisk(path, format = "tree") {
        const formats = {
            tree: tree => tree.toString(),
            csv: tree => tree.toCsv(),
            tsv: tree => tree.toTsv()
        };
        require("fs").writeFileSync(path, formats[format](this), "utf8");
        return this;
    }
}
exports.default = AbstractNode;
