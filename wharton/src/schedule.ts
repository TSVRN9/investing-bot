// @ts-ignore
import { scheduleJob } from "node-schedule";
import { Feed } from "./models/feed";
import { MARKETS_AUX_TOKEN } from "./config";
import { fetchArticlesForTicker } from "./wrappers/marketaux";
import { Client, TextChannel } from "discord.js";
import { client } from "./index";
import { assert } from "console";

export function startSchedules() {
    const scheduleTimes = [
        "0 9 * * 1-5",
        "0 13 * * 1-5",
        "0 17 * * 1-5",
        "0 21 * * 1-5",
    ];

    scheduleTimes.forEach((time) => {
        scheduleJob(time, fetchMarketsAuxArticles);
    });
}

export async function fetchMarketsAuxArticles() {
    const lastRun = new Date();
    const currentHour = lastRun.getHours();
    if (currentHour === 9) {
        lastRun.setHours(21);
        lastRun.setDate(lastRun.getDate() - 1);
    } else if (currentHour === 13) {
        lastRun.setHours(9);
    } else if (currentHour === 17) {
        lastRun.setHours(13);
    } else if (currentHour === 21) {
        lastRun.setHours(17);
    } else {
        lastRun.setHours(0);
    }
    const lastRunISO = lastRun.toISOString();

    const feeds = await Feed.find();
    const guildArticlesMap = new Map<string, Set<string>>();

    for (const feed of feeds) {
        try {
            const articles = await fetchArticlesForTicker(
                feed.ticker,
                lastRunISO.substring(0, lastRunISO.lastIndexOf(".")),
            );

            console.log(
                `Fetched ${articles.length} articles for ticker ${feed.ticker}`,
            );

            // Process the articles as needed

            for (const article of articles) {
                // @ts-ignore
                const channel: TextChannel | null = await client.channels.fetch(
                    feed.channelId,
                );
                if (channel) {
                    const guildId = channel.guildId;
                    if (!guildArticlesMap.has(guildId)) {
                        guildArticlesMap.set(guildId, new Set<string>());
                    }

                    const guildArticles = guildArticlesMap.get(guildId);
                    if (guildArticles && !guildArticles.has(article.url)) {
                        guildArticles.add(article.url);

                        const involvedTickers = article.entities
                            .map((entity) => {
                                const tickerInfo = `${entity.symbol} (${entity.name}, ${entity.industry}) - Sentiment Score: ${entity.sentiment_score.toFixed(2)}`;
                                return feeds.some(
                                    (f) =>
                                        f.ticker === entity.symbol &&
                                        f.channelId === feed.channelId,
                                )
                                    ? `**${tickerInfo}**`
                                    : tickerInfo;
                            })
                            .join("\n");

                        const publishedDate = new Date(article.published_at);
                        const formattedDate = publishedDate.toLocaleString(
                            "en-US",
                            {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                                second: "numeric",
                                hour12: true,
                                timeZoneName: "short",
                            },
                        );

                        const message =
                            `__New article for **${feed.ticker}**__:\n` +
                            `${article.url}\n` +
                            `Published at: ${formattedDate}\n\n` +
                            `Snippet: ${article.snippet ? article.snippet : "N/A"}\n\n` +
                            `Keywords: ${article.keywords ? article.keywords.join(", ") : "N/A"}\n\n` +
                            `Involved Tickers:\n${involvedTickers}`;
                        await channel.send(message);
                    }
                } else {
                    console.error(
                        `Channel with ID ${feed.channelId} not found`,
                    );
                }
            }
        } catch (error) {
            console.error(
                `Error fetching articles for ticker ${feed.ticker}:`,
                error,
            );
        }
    }
}
