import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { deployCommands } from "../deployCommands";
import csv from "csv-parser";
import fs from "fs";
import { Ticker } from "../models/ticker";

export const data = new SlashCommandBuilder()
    .setName("refresh")
    .setDescription("Refreshes and reregisters commands");

export async function execute(interaction: CommandInteraction) {
    await interaction.reply({ content: "Refreshing...", ephemeral: true });
    await deployCommands({ guildId: interaction.guildId as string });
    await interaction.editReply("Refreshed!");
}

// async function loadTickers() {
//     const results: Ticker[] = [];

//     fs.createReadStream("./approved_list.csv")
//         .pipe(csv())
//         .on("data", (data) => {
//             const ticker = new Ticker();
//             ticker.companyName = data["Company Name"];
//             ticker.ticker = data["Ticker"];
//             ticker.exchange = data["Exchange"];
//             ticker.gicsSector = data["GICS Sector"];
//             ticker.gicsIndustryGroup = data["GICS Industry Group"];
//             ticker.gicsIndustry = data["GICS Industry"];
//             ticker.gicsSubIndustry = data["GICS Sub-Industry"];
//             results.push(ticker);
//         })
//         .on("end", async () => {
//             for (const ticker of results) {
//                 await ticker.save();
//             }
//         });
// }
