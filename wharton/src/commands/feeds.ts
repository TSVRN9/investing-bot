import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Feed } from "../models/feed";

export const data = new SlashCommandBuilder()
    .setName("feeds")
    .setDescription("Manage your feeds")
    .addSubcommand((subcommand) =>
        subcommand.setName("list").setDescription("List all feeds"),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("add")
            .setDescription("Add a new feed (max: 20)")
            .addStringOption((option) =>
                option
                    .setName("ticker")
                    .setDescription("The ticker of the feed")
                    .setRequired(true),
            )
            .addChannelOption((option) =>
                option
                    .setName("channel")
                    .setDescription("The channel to link the feed to")
                    .setRequired(true),
            ),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("remove")
            .setDescription("Remove a feed")
            .addStringOption((option) =>
                option
                    .setName("ticker")
                    .setDescription("The ticker of the feed to remove")
                    .setRequired(true),
            ),
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId: string = interaction.guildId as string;

    if (subcommand === "list") {
        const feeds = await Feed.find({ where: { guildId } });
        if (feeds.length === 0) {
            await interaction.reply({
                content: "No feeds found.",
                ephemeral: true,
            });
        } else {
            const feedList = feeds
                .map(
                    (feed) =>
                        `Ticker: **${feed.ticker}**, Channel: <#${feed.channelId}>`,
                )
                .join("\n");
            await interaction.reply({
                content: `Feeds:\n${feedList}`,
                ephemeral: true,
            });
        }
    } else if (subcommand === "add") {
        const ticker = interaction.options.getString("ticker", true);
        const channel = interaction.options.getChannel("channel", true);

        const feedCount = await Feed.count({ where: { guildId } });
        if (feedCount >= 20) {
            await interaction.reply({
                content: `You have reached the maximum number of feeds (20). Please remove an existing feed before adding a new one.`,
                ephemeral: true,
            });
            return;
        }

        const existingFeed = await Feed.findOne({ where: { ticker, guildId } });
        if (existingFeed) {
            await interaction.reply({
                content: `A feed with ticker **${ticker}** already exists.`,
                ephemeral: true,
            });
        } else {
            const feed = new Feed();
            feed.ticker = ticker;
            feed.guildId = interaction.guildId!;
            feed.channelId = channel.id;
            await feed.save();
            await interaction.reply({
                content: `Feed with ticker **${ticker}** added to channel <#${channel.id}>.`,
                ephemeral: true,
            });
        }
    } else if (subcommand === "remove") {
        const ticker = interaction.options.getString("ticker", true);

        const feed = await Feed.findOne({ where: { ticker, guildId } });
        if (!feed) {
            await interaction.reply({
                content: `No feed found with ticker **${ticker}**.`,
                ephemeral: true,
            });
        } else {
            await feed.remove();
            await interaction.reply({
                content: `Feed with ticker **${ticker}** removed.`,
                ephemeral: true,
            });
        }
    }
}
