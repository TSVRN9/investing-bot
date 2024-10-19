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
const feed_1 = require("../models/feed");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName("feeds")
    .setDescription("Manage your feeds")
    .addSubcommand((subcommand) => subcommand.setName("list").setDescription("List all feeds"))
    .addSubcommand((subcommand) => subcommand
    .setName("add")
    .setDescription("Add a new feed (max: 20)")
    .addStringOption((option) => option
    .setName("ticker")
    .setDescription("The ticker of the feed")
    .setRequired(true))
    .addChannelOption((option) => option
    .setName("channel")
    .setDescription("The channel to link the feed to")
    .setRequired(true)))
    .addSubcommand((subcommand) => subcommand
    .setName("remove")
    .setDescription("Remove a feed")
    .addStringOption((option) => option
    .setName("ticker")
    .setDescription("The ticker of the feed to remove")
    .setRequired(true)));
function execute(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;
        if (subcommand === "list") {
            const feeds = yield feed_1.Feed.find({ where: { guildId } });
            if (feeds.length === 0) {
                yield interaction.reply({
                    content: "No feeds found.",
                    ephemeral: true,
                });
            }
            else {
                const feedList = feeds
                    .map((feed) => `Ticker: **${feed.ticker}**, Channel: <#${feed.channelId}>`)
                    .join("\n");
                yield interaction.reply({
                    content: `Feeds:\n${feedList}`,
                    ephemeral: true,
                });
            }
        }
        else if (subcommand === "add") {
            const ticker = interaction.options.getString("ticker", true);
            const channel = interaction.options.getChannel("channel", true);
            const feedCount = yield feed_1.Feed.count({ where: { guildId } });
            if (feedCount >= 20) {
                yield interaction.reply({
                    content: `You have reached the maximum number of feeds (20). Please remove an existing feed before adding a new one.`,
                    ephemeral: true,
                });
                return;
            }
            const existingFeed = yield feed_1.Feed.findOne({ where: { ticker, guildId } });
            if (existingFeed) {
                yield interaction.reply({
                    content: `A feed with ticker **${ticker}** already exists.`,
                    ephemeral: true,
                });
            }
            else {
                const feed = new feed_1.Feed();
                feed.ticker = ticker;
                feed.guildId = interaction.guildId;
                feed.channelId = channel.id;
                yield feed.save();
                yield interaction.reply({
                    content: `Feed with ticker **${ticker}** added to channel <#${channel.id}>.`,
                    ephemeral: true,
                });
            }
        }
        else if (subcommand === "remove") {
            const ticker = interaction.options.getString("ticker", true);
            const feed = yield feed_1.Feed.findOne({ where: { ticker, guildId } });
            if (!feed) {
                yield interaction.reply({
                    content: `No feed found with ticker **${ticker}**.`,
                    ephemeral: true,
                });
            }
            else {
                yield feed.remove();
                yield interaction.reply({
                    content: `Feed with ticker **${ticker}** removed.`,
                    ephemeral: true,
                });
            }
        }
    });
}
