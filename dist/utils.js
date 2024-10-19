"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.choose = choose;
function choose(possibilities) {
    return possibilities[Math.floor(possibilities.length * Math.random())];
}
