"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Parser {
    constructor(catchAllNodeConstructor, firstWordMap = {}, regexTests = undefined) {
        this._catchAllNodeConstructor = catchAllNodeConstructor;
        this._firstWordMap = firstWordMap;
        this._regexTests = regexTests;
    }
    getFirstWordOptions() {
        return Object.keys(this._firstWordMap);
    }
    // todo: remove
    _getFirstWordMap() {
        return this._firstWordMap;
    }
    _getNodeConstructor(line, zi = " ") {
        return this._firstWordMap[this._getFirstWord(line, zi)] || this._getConstructorFromRegexTests(line) || this._catchAllNodeConstructor;
    }
    _getConstructorFromRegexTests(line) {
        if (!this._regexTests)
            return undefined;
        const hit = this._regexTests.find(test => test.regex.test(line));
        if (hit)
            return hit.nodeConstructor;
        return undefined;
    }
    _getFirstWord(line, zi) {
        const firstBreak = line.indexOf(zi);
        return line.substr(0, firstBreak > -1 ? firstBreak : undefined);
    }
}
exports.default = Parser;
