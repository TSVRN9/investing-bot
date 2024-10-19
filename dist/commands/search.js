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
const newsapi_1 = require("../wrappers/newsapi");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName("search")
    .setDescription("Search the news!")
    .addStringOption((option) => option
    .setName("category")
    .setDescription("The category of news to search for")
    .setRequired(false)
    .addChoices({ name: "business", value: "business" }, { name: "entertainment", value: "entertainment" }, { name: "general", value: "general" }, { name: "health", value: "health" }, { name: "science", value: "science" }, { name: "sports", value: "sports" }, { name: "technology", value: "technology" }))
    .addStringOption((option) => option
    .setName("country")
    .setDescription("The country of news to search for")
    .setRequired(false)
    .addChoices({ name: "us", value: "us" }))
    .addStringOption((option) => option
    .setName("sources")
    .setDescription("The sources of news to search for")
    .setRequired(false))
    .addStringOption((option) => option
    .setName("query")
    .setDescription("The search query for news articles")
    .setRequired(false));
function execute(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const cache = [];
        try {
            const category = interaction.options.getString("category") || undefined;
            const country = interaction.options.getString("country") || undefined;
            const sources = interaction.options.getString("sources") || undefined;
            const query = interaction.options.getString("query") || undefined;
            const response = yield newsapi_1.newsApi.getTopHeadlines({
                category,
                country,
                sources,
                q: query,
                pageSize: 100,
            });
            if (response.status !== "ok") {
                throw new Error("Failed to fetch news articles");
            }
            cache.push(...response.articles);
            if (cache.length === 0) {
                yield interaction.reply({
                    content: "No news articles found for the given search criteria.",
                    ephemeral: true,
                });
                return;
            }
            const articlesPerPage = 4;
            let currentPage = 0;
            const generateArticleMessage = (page) => {
                const start = page * articlesPerPage;
                const end = start + articlesPerPage;
                const articlesToShow = cache.slice(start, end);
                return articlesToShow
                    .map((article, index) => `${start + index + 1}. **${article.title}**\n${article.description || ""} *${article.publishedAt}*\n${article.url}`)
                    .join("\n\n");
            };
            const updateMessage = (page) => __awaiter(this, void 0, void 0, function* () {
                const content = generateArticleMessage(page);
                yield interaction.editReply({
                    content,
                    components: [
                        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                            .setCustomId("prev")
                            .setLabel("Previous")
                            .setStyle(discord_js_1.ButtonStyle.Primary)
                            .setDisabled(page === 0), new discord_js_1.ButtonBuilder()
                            .setCustomId("next")
                            .setLabel("Next")
                            .setStyle(discord_js_1.ButtonStyle.Primary)
                            .setDisabled((page + 1) * articlesPerPage >= cache.length)),
                    ],
                });
            });
            yield interaction.reply({
                content: generateArticleMessage(currentPage),
                components: [
                    new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                        .setCustomId("prev")
                        .setLabel("Previous")
                        .setStyle(discord_js_1.ButtonStyle.Primary)
                        .setDisabled(true), new discord_js_1.ButtonBuilder()
                        .setCustomId("next")
                        .setLabel("Next")
                        .setStyle(discord_js_1.ButtonStyle.Primary)
                        .setDisabled(articlesPerPage >= cache.length)),
                ],
                ephemeral: true,
            });
            const collector = (_a = interaction.channel) === null || _a === void 0 ? void 0 : _a.createMessageComponentCollector({
                componentType: discord_js_1.ComponentType.Button,
                time: 60000,
            });
            collector === null || collector === void 0 ? void 0 : collector.on("collect", (i) => __awaiter(this, void 0, void 0, function* () {
                if (i.user.id !== interaction.user.id) {
                    yield i.reply({
                        content: "You cannot use these buttons.",
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
                yield updateMessage(currentPage);
                yield i.deferUpdate();
            }));
            collector === null || collector === void 0 ? void 0 : collector.on("end", () => __awaiter(this, void 0, void 0, function* () {
                yield interaction.editReply({ components: [] });
            }));
        }
        catch (error) {
            if (error instanceof Error) {
                yield interaction.reply({
                    content: `Error: ${error.message}`,
                    ephemeral: true,
                });
            }
        }
    });
}
