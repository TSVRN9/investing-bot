// @ts-ignore
import { scheduleJob } from "node-schedule";
import { Feed } from "./models/feed";
import { POLYMARKET_CHANNEL_ID } from "./config";
import { fetchArticlesForTicker } from "./wrappers/marketaux";
import { Client, TextChannel } from "discord.js";
import { client } from "./index";
import { MarketResult, getPolymarketData } from "./wrappers/polymarket";
import { getKalshiMarketData } from "./wrappers/kalshi";

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

    scheduleJob(everyHalfHour, polymarketJob);
    scheduleJob(everyHalfHour, kalshiJob);
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

function lastPriceFilter(
    lastPrices: Map<
        string,
        { yesBid: number; yesAsk: number; noBid: number; noAsk: number }
    >,
) {
    return (result: MarketResult) => {
        const lastPrice = lastPrices.get(result.market.name);
        const yesBid = result.priceData.find(
            (data) =>
                data.side === "buy" &&
                data.tokenId === result.market.tokenIds[0],
        );
        const yesAsk = result.priceData.find(
            (data) =>
                data.side === "sell" &&
                data.tokenId === result.market.tokenIds[0],
        );
        const noBid = result.priceData.find(
            (data) =>
                data.side === "buy" &&
                data.tokenId === result.market.tokenIds[1],
        );
        const noAsk = result.priceData.find(
            (data) =>
                data.side === "sell" &&
                data.tokenId === result.market.tokenIds[1],
        );

        if (!lastPrice) {
            lastPrices.set(result.market.name, {
                yesBid: yesBid ? yesBid.price : 0,
                yesAsk: yesAsk ? yesAsk.price : 0,
                noBid: noBid ? noBid.price : 0,
                noAsk: noAsk ? noAsk.price : 0,
            });
            return true;
        }

        const priceChanged =
            (yesBid && Math.abs(yesBid.price - lastPrice.yesBid) >= 0.01) ||
            (yesAsk && Math.abs(yesAsk.price - lastPrice.yesAsk) >= 0.01) ||
            (noBid && Math.abs(noBid.price - lastPrice.noBid) >= 0.01) ||
            (noAsk && Math.abs(noAsk.price - lastPrice.noAsk) >= 0.01);

        if (priceChanged) {
            lastPrices.set(result.market.name, {
                yesBid: yesBid ? yesBid.price : lastPrice.yesBid,
                yesAsk: yesAsk ? yesAsk.price : lastPrice.yesAsk,
                noBid: noBid ? noBid.price : lastPrice.noBid,
                noAsk: noAsk ? noAsk.price : lastPrice.noAsk,
            });
        }

        return priceChanged;
    };
}

const lastPolymarketPrices = new Map<
    string,
    { yesBid: number; yesAsk: number; noBid: number; noAsk: number }
>();

const lastKalshiPrices = new Map<
    string,
    { yesBid: number; yesAsk: number; noBid: number; noAsk: number }
>();

export async function polymarketJob() {
    console.log("starting polymarket job...");
    const results = await getPolymarketData();

    const filteredResults = results.filter(
        lastPriceFilter(lastPolymarketPrices),
    );

    console.log(
        `finishing polymarket job with: ${filteredResults.length} results`,
    );

    sendMarketEmbed(filteredResults, POLYMARKET_CHANNEL_ID, "Polymarket");
}

export async function kalshiJob() {
    console.log("starting kalshi job...");
    const results = await getKalshiMarketData();

    const filteredResults = Object.values(results).filter(
        lastPriceFilter(lastKalshiPrices),
    );

    console.log(`finishing kalshi job with: ${filteredResults.length} results`);

    sendMarketEmbed(filteredResults, POLYMARKET_CHANNEL_ID, "Kalshi");
}

function extractMarketData(result: MarketResult) {
    const marketName = result.market.name;
    const yesBid = result.priceData.find(
        (data) =>
            data.side === "buy" && data.tokenId === result.market.tokenIds[0],
    );
    const yesAsk = result.priceData.find(
        (data) =>
            data.side === "sell" && data.tokenId === result.market.tokenIds[0],
    );
    const noBid = result.priceData.find(
        (data) =>
            data.side === "buy" && data.tokenId === result.market.tokenIds[1],
    );
    const noAsk = result.priceData.find(
        (data) =>
            data.side === "sell" && data.tokenId === result.market.tokenIds[1],
    );

    return { marketName, yesBid, yesAsk, noBid, noAsk };
}

async function sendMarketEmbed(
    results: MarketResult[],
    channelId: string,
    marketApiName: string,
) {
    for (const result of results) {
        const channel: TextChannel | null = (await client.channels.fetch(
            channelId,
        )) as TextChannel | null;

        if (channel) {
            const { marketName, yesBid, yesAsk, noBid, noAsk } =
                extractMarketData(result);

            const embed = {
                title: `${marketApiName} Market: ${marketName}`,
                fields: [
                    {
                        name: "Yes",
                        value: `Bid: ${yesBid ? (yesBid.price * 100).toFixed(1) : "N/A"}¢ / Ask: ${yesAsk ? (yesAsk.price * 100).toFixed(1) : "N/A"}¢`,
                        inline: true,
                    },
                    {
                        name: "No",
                        value: `Bid: ${noBid ? (noBid.price * 100).toFixed(1) : "N/A"}¢ / Ask: ${noAsk ? (noAsk.price * 100).toFixed(1) : "N/A"}¢`,
                        inline: true,
                    },
                ],
            };

            await channel.send({ embeds: [embed] });
        } else {
            console.error(`Channel with ID ${channelId} not found`);
        }
    }
}
