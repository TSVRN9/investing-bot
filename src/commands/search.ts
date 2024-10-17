import {
    ChatInputCommandInteraction,
    CommandInteraction,
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    ButtonInteraction,
} from "discord.js";
import {
    NewsApiArticle,
    GetTopHeadlinesParams,
    newsApi,
} from "../wrappers/newsapi";

export const data = new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search the news!")
    .addStringOption((option) =>
        option
            .setName("category")
            .setDescription("The category of news to search for")
            .setRequired(false)
            .addChoices(
                { name: "business", value: "business" },
                { name: "entertainment", value: "entertainment" },
                { name: "general", value: "general" },
                { name: "health", value: "health" },
                { name: "science", value: "science" },
                { name: "sports", value: "sports" },
                { name: "technology", value: "technology" },
            ),
    )
    .addStringOption((option) =>
        option
            .setName("country")
            .setDescription("The country of news to search for")
            .setRequired(false)
            .addChoices({ name: "us", value: "us" }),
    )
    .addStringOption((option) =>
        option
            .setName("sources")
            .setDescription("The sources of news to search for")
            .setRequired(false),
    )
    .addStringOption((option) =>
        option
            .setName("query")
            .setDescription("The search query for news articles")
            .setRequired(false),
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const cache: NewsApiArticle[] = [];

    try {
        const category = interaction.options.getString("category") || undefined;
        const country = interaction.options.getString("country") || undefined;
        const sources = interaction.options.getString("sources") || undefined;
        const query = interaction.options.getString("query") || undefined;

        const response = await newsApi.getTopHeadlines({
            category,
            country,
            sources,
            q: query,
            pageSize: 100,
        } as GetTopHeadlinesParams);
        if (response.status !== "ok") {
            throw new Error("Failed to fetch news articles");
        }
        cache.push(...response.articles);

        if (cache.length === 0) {
            await interaction.reply({
                content:
                    "No news articles found for the given search criteria.",
                ephemeral: true,
            });
            return;
        }

        const articlesPerPage = 4;
        let currentPage = 0;

        const generateArticleMessage = (page: number) => {
            const start = page * articlesPerPage;
            const end = start + articlesPerPage;
            const articlesToShow = cache.slice(start, end);

            return articlesToShow
                .map(
                    (article, index) =>
                        `${start + index + 1}. **${article.title}**\n${article.description || ""} *${article.publishedAt}*\n${article.url}`,
                )
                .join("\n\n");
        };

        const updateMessage = async (page: number) => {
            const content = generateArticleMessage(page);
            await interaction.editReply({
                content,
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder()
                            .setCustomId("prev")
                            .setLabel("Previous")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page === 0),
                        new ButtonBuilder()
                            .setCustomId("next")
                            .setLabel("Next")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(
                                (page + 1) * articlesPerPage >= cache.length,
                            ),
                    ),
                ],
            });
        };

        await interaction.reply({
            content: generateArticleMessage(currentPage),
            components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId("prev")
                        .setLabel("Previous")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId("next")
                        .setLabel("Next")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(articlesPerPage >= cache.length),
                ),
            ],
            ephemeral: true,
        });

        // @ts-ignore
        const collector = interaction.channel?.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000,
        });

        collector?.on("collect", async (i: ButtonInteraction) => {
            if (i.user.id !== interaction.user.id) {
                await i.reply({
                    content: "You cannot use these buttons.",
                    ephemeral: true,
                });
                return;
            }

            if (i.customId === "prev") {
                currentPage--;
            } else if (i.customId === "next") {
                currentPage++;
            }

            await updateMessage(currentPage);
            await i.deferUpdate();
        });

        collector?.on("end", async () => {
            await interaction.editReply({ components: [] });
        });
    } catch (error) {
        if (error instanceof Error) {
            await interaction.reply({
                content: `Error: ${error.message}`,
                ephemeral: true,
            });
        }
    }
}
