import {
    ChatInputCommandInteraction,
    CommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import { Ticker } from "../models/ticker";
import { choose } from "../utils";

export const data = new SlashCommandBuilder()
    .setName("check")
    .setDescription("Check if a ticker is on the approved list and view info")
    .addStringOption((option) =>
        option
            .setName("ticker")
            .setDescription("The ticker to check")
            .setRequired(true),
    );

const incorrectImages = [
    "https://preview.redd.it/extremely-loud-incorrect-buzzer-v0-t89vj586071d1.jpeg?auto=webp&s=25195d209068268846df8a859624d15881cb9293",
    "https://bluemoji.io/cdn-proxy/646218c67da47160c64a84d5/66b3eba284d9bc814570814d_18.png",
    "https://cdn.vectorstock.com/i/500p/62/31/thumb-down-emoticon-vector-42706231.jpg",
    "https://mike-robbins.com/wp-content/uploads/2010/03/3-17-10-blog-1000x703.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/ISO_7010_P001.svg/1200px-ISO_7010_P001.svg.png",
];

export async function execute(interaction: ChatInputCommandInteraction) {
    const ticker: string = interaction.options
        .getString("ticker", true)
        .toUpperCase();
    const ticker_object = await Ticker.findOneBy({ ticker });

    if (ticker_object == null) {
        const embed = new EmbedBuilder()
            .setTitle(`${ticker} is not on the approved stocks list!`)
            .setImage(choose(incorrectImages))
            .setColor(0xff0000);
        interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
        const embed = new EmbedBuilder()
            .setTitle(ticker_object.companyName)
            .setDescription("This ticker is on the approved list.")
            .setColor(0x00ff00)
            .addFields(
                {
                    name: "Ticker",
                    value: ticker_object.ticker,
                    inline: true,
                },
                {
                    name: "Exchange",
                    value: ticker_object.exchange,
                    inline: true,
                },
                {
                    name: "GICS Sector",
                    value: ticker_object.gicsSector,
                    inline: true,
                },
                {
                    name: "GICS Industry Group",
                    value: ticker_object.gicsIndustryGroup,
                    inline: true,
                },
                {
                    name: "GICS Industry",
                    value: ticker_object.gicsIndustry,
                    inline: true,
                },
                {
                    name: "GICS Sub-Industry",
                    value: ticker_object.gicsSubIndustry,
                    inline: true,
                },
            )
            .setTimestamp();
        interaction.reply({ embeds: [embed], ephemeral: true });
    }
}
