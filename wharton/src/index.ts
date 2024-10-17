import "reflect-metadata";
import { ChatInputCommandInteraction, Client } from "discord.js";
import { deployCommands } from "./deployCommands";
import { commands } from "./commands";
import { DISCORD_GUILD_ID, DISCORD_TOKEN } from "./config";
import { AppDataSource, TickerDataSource } from "./db";
import { fetchMarketsAuxArticles, startSchedules } from "./schedule";

export const client = new Client({
    intents: [
        "Guilds",
        "GuildMessages",
        "GuildMessagePolls",
        "GuildMessageReactions",
    ],
});

client.once("ready", () => {
    console.log("Discord bot is ready! 🤖");
});

client.on("guildCreate", async (guild) => {
    await deployCommands({ guildId: guild.id });
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    const { commandName } = interaction;
    if (commands[commandName as keyof typeof commands]) {
        commands[commandName as keyof typeof commands].execute(
            interaction as ChatInputCommandInteraction,
        );
    }
});

client.login(DISCORD_TOKEN);

TickerDataSource.initialize()
    .then(() => {
        console.log("Ticker Data Source has been initialized!");
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });

AppDataSource.initialize()
    .then(() => {
        console.log("App Data Source has been initialized!");
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });

startSchedules();
