"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const utils_1 = require("../utils");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName("quack")
    .setDescription("Who knows what this command does...");
const responses = ["Quack!", "QUACK!!!!", "quack...", "Quack???"];
function execute(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        let { url } = yield fetch("https://random-d.uk/api/v2/random").then((res) => res.json());
        interaction.reply({ content: (0, utils_1.choose)(responses), files: [url] });
    });
}
