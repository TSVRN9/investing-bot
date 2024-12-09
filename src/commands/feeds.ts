import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { RSSFeed } from "../models/rssfeed";

export const data = new SlashCommandBuilder()
    .setName("feeds")
    .setDescription("Manage your RSS feeds")
    .addSubcommand((subcommand) =>
        subcommand.setName("list").setDescription("List all RSS feeds"),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("add")
            .setDescription("Add a new RSS feed (max: 20)")
            .addStringOption((option) =>
                option
                    .setName("keywords")
                    .setDescription("Comma-separated keywords for the RSS feed")
                    .setRequired(true),
            )
            .addChannelOption((option) =>
                option
                    .setName("channel")
                    .setDescription("The channel to link the RSS feed to")
                    .setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName("name")
                    .setDescription("Optional name for the RSS feed"),
            ),
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("remove")
            .setDescription("Remove an RSS feed")
            .addStringOption((option) =>
                option
                    .setName("name")
                    .setDescription("The name of the RSS feed to remove")
                    .setRequired(true),
            ),
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId: string = interaction.guildId as string;

    if (subcommand === "list") {
        const feeds = await RSSFeed.find({ where: { guildId } });
        if (feeds.length === 0) {
            await interaction.reply({
                content: "No RSS feeds found.",
                ephemeral: true,
            });
        } else {
            const feedList = feeds
                .map(
                    (feed) =>
                        `Name: **${feed.name || "Unnamed"}**, Channel: <#${feed.channelId}>, Keywords: ${feed.keywords.join(", ")}`,
                )
                .join("\n");
            await interaction.reply({
                content: `RSS Feeds:\n${feedList}`,
                ephemeral: true,
            });
        }
    } else if (subcommand === "add") {
        const keywords = interaction.options.getString("keywords", true);
        const channel = interaction.options.getChannel("channel", true);
        const name = interaction.options.getString("name") || undefined;

        const feedCount = await RSSFeed.count({ where: { guildId } });
        if (feedCount >= 20) {
            await interaction.reply({
                content: `You have reached the maximum number of RSS feeds (20). Please remove an existing feed before adding a new one.`,
                ephemeral: true,
            });
            return;
        }

        const feed = new RSSFeed();
        feed.keywords = keywords.toLowerCase().split(",");
        feed.guildId = interaction.guildId!;
        feed.channelId = channel.id;
        feed.name = name;
        await feed.save();
        await interaction.reply({
            content: `RSS feed added to channel <#${channel.id}> with keywords: ${keywords}.`,
            ephemeral: true,
        });
    } else if (subcommand === "remove") {
        const name = interaction.options.getString("name", true);

        const feed = await RSSFeed.findOne({ where: { name, guildId } });
        if (!feed) {
            await interaction.reply({
                content: `No RSS feed found with name **${name}**.`,
                ephemeral: true,
            });
        } else {
            await feed.remove();
            await interaction.reply({
                content: `RSS feed with name **${name}** removed.`,
                ephemeral: true,
            });
        }
    }
}
