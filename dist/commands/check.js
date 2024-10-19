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
const ticker_1 = require("../models/ticker");
const utils_1 = require("../utils");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName("check")
    .setDescription("Check if a ticker is on the approved list and view info")
    .addStringOption((option) => option
    .setName("ticker")
    .setDescription("The ticker to check")
    .setRequired(true));
const incorrectImages = [
    "https://preview.redd.it/extremely-loud-incorrect-buzzer-v0-t89vj586071d1.jpeg?auto=webp&s=25195d209068268846df8a859624d15881cb9293",
    "https://bluemoji.io/cdn-proxy/646218c67da47160c64a84d5/66b3eba284d9bc814570814d_18.png",
    "https://cdn.vectorstock.com/i/500p/62/31/thumb-down-emoticon-vector-42706231.jpg",
    "https://mike-robbins.com/wp-content/uploads/2010/03/3-17-10-blog-1000x703.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/ISO_7010_P001.svg/1200px-ISO_7010_P001.svg.png",
];
function execute(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const ticker = interaction.options
            .getString("ticker", true)
            .toUpperCase();
        const ticker_object = yield ticker_1.Ticker.findOneBy({ ticker });
        if (ticker_object == null) {
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(`${ticker} is not on the approved stocks list!`)
                .setImage((0, utils_1.choose)(incorrectImages))
                .setColor(0xff0000);
            interaction.reply({ embeds: [embed], ephemeral: true });
        }
        else {
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(ticker_object.companyName)
                .setDescription("This ticker is on the approved list.")
                .setColor(0x00ff00)
                .addFields({
                name: "Ticker",
                value: ticker_object.ticker,
                inline: true,
            }, {
                name: "Exchange",
                value: ticker_object.exchange,
                inline: true,
            }, {
                name: "GICS Sector",
                value: ticker_object.gicsSector,
                inline: true,
            }, {
                name: "GICS Industry Group",
                value: ticker_object.gicsIndustryGroup,
                inline: true,
            }, {
                name: "GICS Industry",
                value: ticker_object.gicsIndustry,
                inline: true,
            }, {
                name: "GICS Sub-Industry",
                value: ticker_object.gicsSubIndustry,
                inline: true,
            })
                .setTimestamp();
            interaction.reply({ embeds: [embed], ephemeral: true });
        }
    });
}
