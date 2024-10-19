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
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName("query")
    .setDescription("Query the list of approved stocks")
    .addStringOption((option) => option.setName("ticker").setDescription("The ticker of the company"))
    .addStringOption((option) => option
    .setName("company_name")
    .setDescription("The name of the company"))
    .addStringOption((option) => option
    .setName("exchange")
    .setDescription("The stock exchange where the company is listed"))
    .addStringOption((option) => option
    .setName("gics_sector")
    .setDescription("The GICS sector of the company"))
    .addStringOption((option) => option
    .setName("gics_industry_group")
    .setDescription("The GICS industry group of the company"))
    .addStringOption((option) => option
    .setName("gics_industry")
    .setDescription("The GICS industry of the company"))
    .addStringOption((option) => option
    .setName("gics_sub_industry")
    .setDescription("The GICS sub-industry of the company"))
    .addBooleanOption((option) => option
    .setName("verbose")
    .setDescription("Whether to reply with all information, default is false"));
function execute(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const tickerOption = interaction.options.getString("ticker");
        const companyNameOption = interaction.options.getString("company_name");
        const exchangeOption = interaction.options.getString("exchange");
        const gicsSectorOption = interaction.options.getString("gics_sector");
        const gicsIndustryGroupOption = interaction.options.getString("gics_industry_group");
        const gicsIndustryOption = interaction.options.getString("gics_industry");
        const gicsSubIndustryOption = interaction.options.getString("gics_sub_industry");
        const verbose = (_a = interaction.options.getBoolean("verbose")) !== null && _a !== void 0 ? _a : false;
        let query = ticker_1.Ticker.createQueryBuilder("ticker");
        if (tickerOption) {
            query = query.andWhere("ticker.ticker LIKE :ticker", {
                ticker: `%${tickerOption}%`,
            });
        }
        if (companyNameOption) {
            query = query.andWhere("ticker.companyName LIKE :companyName", {
                companyName: `%${companyNameOption}%`,
            });
        }
        if (exchangeOption) {
            query = query.andWhere("ticker.exchange LIKE :exchange", {
                exchange: `%${exchangeOption}%`,
            });
        }
        if (gicsSectorOption) {
            query = query.andWhere("ticker.gicsSector LIKE :gicsSector", {
                gicsSector: `%${gicsSectorOption}%`,
            });
        }
        if (gicsIndustryGroupOption) {
            query = query.andWhere("ticker.gicsIndustryGroup LIKE :gicsIndustryGroup", { gicsIndustryGroup: `%${gicsIndustryGroupOption}%` });
        }
        if (gicsIndustryOption) {
            query = query.andWhere("ticker.gicsIndustry LIKE :gicsIndustry", {
                gicsIndustry: `%${gicsIndustryOption}%`,
            });
        }
        if (gicsSubIndustryOption) {
            query = query.andWhere("ticker.gicsSubIndustry LIKE :gicsSubIndustry", {
                gicsSubIndustry: `%${gicsSubIndustryOption}%`,
            });
        }
        const results = yield query.getMany();
        if (results.length === 0) {
            return interaction.reply({
                content: "No companies found!",
                ephemeral: true,
            });
        }
        if (!verbose) {
            const itemsPerPage = 4;
            let currentPage = 0;
            const groupedResults = results.reduce((acc, result) => {
                if (!acc[result.gicsSubIndustry]) {
                    acc[result.gicsSubIndustry] = [];
                }
                acc[result.gicsSubIndustry].push(result);
                return acc;
            }, {});
            const generateContent = (page) => {
                const subIndustries = Object.keys(groupedResults);
                const start = page * itemsPerPage;
                const end = start + itemsPerPage;
                const pageSubIndustries = subIndustries.slice(start, end);
                return pageSubIndustries
                    .map((subIndustry) => {
                    const companies = groupedResults[subIndustry]
                        .map((result) => `**${result.ticker}** ${result.companyName}`)
                        .join("\n");
                    return `__${subIndustry}__\n${companies}`;
                })
                    .join("\n\n");
            };
            const generateButtons = (page) => {
                return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId("prev")
                    .setLabel("Previous")
                    .setStyle(discord_js_1.ButtonStyle.Primary)
                    .setDisabled(page === 0), new discord_js_1.ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("Next")
                    .setStyle(discord_js_1.ButtonStyle.Primary)
                    .setDisabled((page + 1) * itemsPerPage >=
                    Object.keys(groupedResults).length));
            };
            const message = yield interaction.reply({
                content: generateContent(currentPage),
                components: [generateButtons(currentPage)],
                fetchReply: true,
                ephemeral: true,
            });
            const collector = message.createMessageComponentCollector({
                componentType: discord_js_1.ComponentType.Button,
                time: 60000,
            });
            collector.on("collect", (i) => __awaiter(this, void 0, void 0, function* () {
                if (i.user.id !== interaction.user.id) {
                    yield i.reply({
                        content: "You cannot interact with this button.",
                        ephemeral: true,
                    });
                    return;
                }
                if (i.customId === "prev") {
                    currentPage--;
                }
                else if (i.customId === "next") {
                    currentPage++;
                }
                yield i.update({
                    content: generateContent(currentPage),
                    components: [generateButtons(currentPage)],
                });
            }));
            collector.on("end", () => {
                message.edit({ components: [] });
            });
            return;
        }
        else {
            if (results.length > 0) {
                const itemsPerPage = 4;
                let currentPage = 0;
                const generateEmbeds = (page) => {
                    const start = page * itemsPerPage;
                    const end = start + itemsPerPage;
                    const pageResults = results.slice(start, end);
                    return pageResults.map((result) => {
                        const embed = new discord_js_1.EmbedBuilder()
                            .setTitle(result.companyName)
                            .setColor(0x00ae86)
                            .addFields({
                            name: "Ticker",
                            value: result.ticker,
                            inline: true,
                        }, {
                            name: "Exchange",
                            value: result.exchange,
                            inline: true,
                        }, {
                            name: "GICS Sector",
                            value: result.gicsSector,
                            inline: true,
                        }, {
                            name: "GICS Industry Group",
                            value: result.gicsIndustryGroup,
                            inline: true,
                        }, {
                            name: "GICS Industry",
                            value: result.gicsIndustry,
                            inline: true,
                        }, {
                            name: "GICS Sub-Industry",
                            value: result.gicsSubIndustry,
                            inline: true,
                        });
                        return embed;
                    });
                };
                const generateButtons = (page) => {
                    return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                        .setCustomId("prev")
                        .setLabel("Previous")
                        .setStyle(discord_js_1.ButtonStyle.Primary)
                        .setDisabled(page === 0), new discord_js_1.ButtonBuilder()
                        .setCustomId("next")
                        .setLabel("Next")
                        .setStyle(discord_js_1.ButtonStyle.Primary)
                        .setDisabled((page + 1) * itemsPerPage >= results.length));
                };
                const message = yield interaction.reply({
                    embeds: generateEmbeds(currentPage),
                    components: [generateButtons(currentPage)],
                    fetchReply: true,
                    ephemeral: true,
                });
                const collector = message.createMessageComponentCollector({
                    componentType: discord_js_1.ComponentType.Button,
                    time: 60000,
                });
                collector.on("collect", (i) => __awaiter(this, void 0, void 0, function* () {
                    if (i.user.id !== interaction.user.id) {
                        yield i.reply({
                            content: "You cannot interact with this button.",
                            ephemeral: true,
                        });
                        return;
                    }
                    if (i.customId === "prev") {
                        currentPage--;
                    }
                    else if (i.customId === "next") {
                        currentPage++;
                    }
                    yield i.update({
                        embeds: generateEmbeds(currentPage),
                        components: [generateButtons(currentPage)],
                    });
                }));
                collector.on("end", () => {
                    message.edit({ components: [] });
                });
            }
            else {
                interaction.reply({
                    content: "No companies found that match your query!",
                    ephemeral: true,
                });
            }
        }
    });
}
