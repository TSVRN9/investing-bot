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
exports.client = void 0;
require("reflect-metadata");
const discord_js_1 = require("discord.js");
const deployCommands_1 = require("./deployCommands");
const commands_1 = require("./commands");
const config_1 = require("./config");
const db_1 = require("./db");
const jobs_1 = require("./jobs");
exports.client = new discord_js_1.Client({
    intents: [
        "Guilds",
        "GuildMessages",
        "GuildMessagePolls",
        "GuildMessageReactions",
    ],
});
exports.client.once("ready", () => {
    console.log("Discord bot is ready! 🤖");
});
exports.client.on("guildCreate", (guild) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, deployCommands_1.deployCommands)({ guildId: guild.id });
}));
exports.client.on("interactionCreate", (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (!interaction.isCommand()) {
        return;
    }
    const { commandName } = interaction;
    if (commands_1.commands[commandName]) {
        commands_1.commands[commandName].execute(interaction);
    }
}));
exports.client.login(config_1.DISCORD_TOKEN);
db_1.TickerDataSource.initialize()
    .then(() => {
    console.log("Ticker Data Source has been initialized!");
})
    .catch((err) => {
    console.error("Error during Data Source initialization", err);
});
db_1.AppDataSource.initialize()
    .then(() => {
    console.log("App Data Source has been initialized!");
})
    .catch((err) => {
    console.error("Error during Data Source initialization", err);
});
(0, jobs_1.startJobs)();
