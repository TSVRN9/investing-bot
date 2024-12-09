// @ts-ignore
import { scheduleJob } from "node-schedule";
import { Feed } from "./models/feed";
import { fetchArticlesForTicker } from "./wrappers/marketaux";
import { Client, TextChannel } from "discord.js";
import { client } from "./index";

export function startJobs() {
    const scheduleTimes = [
        "0 9 * * 1-5",
        "0 13 * * 1-5",
        "0 17 * * 1-5",
        "0 21 * * 1-5",
    ];

    scheduleTimes.forEach((time) => {
        scheduleJob(time, auxArticlesJob);
    });

    const everyHalfHour = "* */30 * * * *";
    scheduleJob(everyHalfHour, rssFeedJob);
}

async function auxArticlesJob() {
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
                                const tickerInfo = `${entity.symbol} (${entity.name}, ${entity.industry})`;
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

const FEED_LINKS = [
    "https://www.theguardian.com/us/rss",
    "https://www.cbsnews.com/latest/rss/us",
    "https://feeds.npr.org/1003/rss.xml",
];

import Parser from "rss-parser";
import { RSSFeed } from "./models/rssfeed";

async function rssFeedJob() {
    const parser = new Parser();
    const userFeeds = await RSSFeed.find();
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    const newArticles = (
        await Promise.all(
            FEED_LINKS.map(async (link) => {
                try {
                    const feed = await parser.parseURL(link);
                    return feed.items.filter(
                        (item) =>
                            new Date(item.pubDate || "") > thirtyMinutesAgo,
                    );
                } catch (error) {
                    console.error(`Error parsing feed from ${link}:`, error);
                    return [];
                }
            }),
        )
    ).flat();

    console.log(`Fetched ${newArticles.length} new articles from RSS feeds.`);
    newArticles.forEach((article) => {
        console.log(`Title: ${article.title}`);
        console.log(`> Link: ${article.link}`);
        console.log(`> Published Date: ${article.pubDate}`);
    });

    for (const article of newArticles) {
        for (const userFeed of userFeeds) {
            const matchesKeyword = userFeed.keywords.some((keyword) => {
                const lowerKeyword = keyword.toLowerCase();
                return (
                    article.title?.toLowerCase().includes(lowerKeyword) ||
                    article.description?.toLowerCase().includes(lowerKeyword)
                );
            });

            if (matchesKeyword) {
                // @ts-ignore
                const channel: TextChannel | null = await client.channels.fetch(
                    userFeed.channelId,
                );
                if (channel) {
                    const publishedDate = new Date(article.pubDate || "");
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
                        `__New article matching your keywords__:\n` +
                        `${article.link}\n` +
                        `Published at: ${formattedDate}\n\n` +
                        `Title: ${article.title}\n\n` +
                        `Content: ${article.content || "N/A"}`;
                    await channel.send(message);
                } else {
                    console.error(
                        `Channel with ID ${userFeed.channelId} not found`,
                    );
                }
            }
        }
    }
}
