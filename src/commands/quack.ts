import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { choose } from "../utils";

export const data = new SlashCommandBuilder()
    .setName("quack")
    .setDescription("Who knows what this command does...");

const responses = ["Quack!", "QUACK!!!!", "quack...", "Quack???"];

export async function execute(interaction: CommandInteraction) {
    let { url } = await fetch("https://random-d.uk/api/v2/random").then((res) =>
        res.json(),
    );

    interaction.reply({ content: choose(responses), files: [url] });
}
