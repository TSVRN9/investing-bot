"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POLYMARKET_CHANNEL_ID = exports.MARKETS_AUX_TOKEN = exports.NEWS_API_TOKEN = exports.DISCORD_CLIENT_ID = exports.DISCORD_GUILD_ID = exports.DISCORD_TOKEN = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
exports.DISCORD_TOKEN = DISCORD_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
exports.DISCORD_CLIENT_ID = DISCORD_CLIENT_ID;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
exports.DISCORD_GUILD_ID = DISCORD_GUILD_ID;
const NEWS_API_TOKEN = process.env.NEWS_API_TOKEN;
exports.NEWS_API_TOKEN = NEWS_API_TOKEN;
const MARKETS_AUX_TOKEN = process.env.MARKETS_AUX_TOKEN;
exports.MARKETS_AUX_TOKEN = MARKETS_AUX_TOKEN;
const POLYMARKET_CHANNEL_ID = process.env.POLYMARKET_CHANNEL_ID;
exports.POLYMARKET_CHANNEL_ID = POLYMARKET_CHANNEL_ID;
if (!DISCORD_TOKEN ||
    !DISCORD_CLIENT_ID ||
    !DISCORD_GUILD_ID ||
    !NEWS_API_TOKEN ||
    !MARKETS_AUX_TOKEN) {
    throw new Error("Environment variables undefined!?");
}
