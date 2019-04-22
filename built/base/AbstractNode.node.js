"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AbstractNode {
    _getNow() {
        return parseFloat(process.hrtime().join(""));
    }
}
exports.default = AbstractNode;
