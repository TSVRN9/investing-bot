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
exports.deployCommands = deployCommands;
const discord_js_1 = require("discord.js");
const commands_1 = require("./commands");
const config_1 = require("./config");
const commandsData = Object.values(commands_1.commands).map((command) => command.data);
const rest = new discord_js_1.REST({ version: "10" }).setToken(config_1.DISCORD_TOKEN);
function deployCommands(_a) {
    return __awaiter(this, arguments, void 0, function* ({ guildId }) {
        try {
            console.log("Started refreshing application (/) commands.");
            yield rest.put(discord_js_1.Routes.applicationGuildCommands(config_1.DISCORD_CLIENT_ID, guildId), {
                body: commandsData,
            });
            console.log("Successfully reloaded application (/) commands.");
        }
        catch (error) {
            console.error(error);
        }
    });
}
