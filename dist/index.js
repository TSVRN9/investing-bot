"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
require("reflect-metadata");
const discord_js_1 = require("discord.js");
const schedule_1 = require("./schedule");
(0, schedule_1.sendPolymarketUpdate)();
exports.client = new discord_js_1.Client({
    intents: [
        "Guilds",
        "GuildMessages",
        "GuildMessagePolls",
        "GuildMessageReactions",
    ],
});
