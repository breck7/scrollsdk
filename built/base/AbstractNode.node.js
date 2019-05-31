"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AbstractNode {
    _getProcessTimeInMilliseconds() {
        const hrtime = process.hrtime();
        return (hrtime[0] * 1e9 + hrtime[1]) / 1e6;
    }
}
exports.default = AbstractNode;
