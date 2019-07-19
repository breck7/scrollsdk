"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Willow_1 = require("./Willow");
class WillowProgram extends Willow_1.AbstractWillowProgram {
    constructor(baseUrl) {
        super(baseUrl);
        this._offlineMode = true;
    }
}
exports.WillowProgram = WillowProgram;
