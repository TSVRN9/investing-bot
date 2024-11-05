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
exports.startJobs = startJobs;
exports.polymarketJob = polymarketJob;
exports.kalshiJob = kalshiJob;
const node_schedule_1 = require("node-schedule");
const feed_1 = require("./models/feed");
const config_1 = require("./config");
const marketaux_1 = require("./wrappers/marketaux");
const index_1 = require("./index");
const polymarket_1 = require("./wrappers/polymarket");
const kalshi_1 = require("./wrappers/kalshi");
function startJobs() {
    const scheduleTimes = [
        "0 9 * * 1-5",
        "0 13 * * 1-5",
        "0 17 * * 1-5",
        "0 21 * * 1-5",
    ];
    scheduleTimes.forEach((time) => {
        (0, node_schedule_1.scheduleJob)(time, auxArticlesJob);
    });
    const everyHalfHour = "* */30 * * * *";
    (0, node_schedule_1.scheduleJob)(everyHalfHour, polymarketJob);
}
function auxArticlesJob() {
    return __awaiter(this, void 0, void 0, function* () {
        const lastRun = new Date();
        const currentHour = lastRun.getHours();
        if (currentHour === 9) {
            lastRun.setHours(21);
            lastRun.setDate(lastRun.getDate() - 1);
        }
        else if (currentHour === 13) {
            lastRun.setHours(9);
        }
        else if (currentHour === 17) {
            lastRun.setHours(13);
        }
        else if (currentHour === 21) {
            lastRun.setHours(17);
        }
        else {
            lastRun.setHours(0);
        }
        const lastRunISO = lastRun.toISOString();
        const feeds = yield feed_1.Feed.find();
        const guildArticlesMap = new Map();
        for (const feed of feeds) {
            try {
                const articles = yield (0, marketaux_1.fetchArticlesForTicker)(feed.ticker, lastRunISO.substring(0, lastRunISO.lastIndexOf(".")));
                console.log(`Fetched ${articles.length} articles for ticker ${feed.ticker}`);
                for (const article of articles) {
                    const channel = yield index_1.client.channels.fetch(feed.channelId);
                    if (channel) {
                        const guildId = channel.guildId;
                        if (!guildArticlesMap.has(guildId)) {
                            guildArticlesMap.set(guildId, new Set());
                        }
                        const guildArticles = guildArticlesMap.get(guildId);
                        if (guildArticles && !guildArticles.has(article.url)) {
                            guildArticles.add(article.url);
                            const involvedTickers = article.entities
                                .map((entity) => {
                                const tickerInfo = `${entity.symbol} (${entity.name}, ${entity.industry})`;
                                return feeds.some((f) => f.ticker === entity.symbol &&
                                    f.channelId === feed.channelId)
                                    ? `**${tickerInfo}**`
                                    : tickerInfo;
                            })
                                .join("\n");
                            const publishedDate = new Date(article.published_at);
                            const formattedDate = publishedDate.toLocaleString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                                second: "numeric",
                                hour12: true,
                                timeZoneName: "short",
                            });
                            const message = `__New article for **${feed.ticker}**__:\n` +
                                `${article.url}\n` +
                                `Published at: ${formattedDate}\n\n` +
                                `Keywords: ${article.keywords ? article.keywords.join(", ") : "N/A"}\n\n` +
                                `Involved Tickers:\n${involvedTickers}`;
                            yield channel.send(message);
                        }
                    }
                    else {
                        console.error(`Channel with ID ${feed.channelId} not found`);
                    }
                }
            }
            catch (error) {
                console.error(`Error fetching articles for ticker ${feed.ticker}:`, error);
            }
        }
    });
}
function lastPriceFilter(lastPrices) {
    return (result) => {
        const lastPrice = lastPrices.get(result.market.name);
        const yesBid = result.priceData.find((data) => data.side === "buy" &&
            data.tokenId === result.market.tokenIds[0]);
        const yesAsk = result.priceData.find((data) => data.side === "sell" &&
            data.tokenId === result.market.tokenIds[0]);
        const noBid = result.priceData.find((data) => data.side === "buy" &&
            data.tokenId === result.market.tokenIds[1]);
        const noAsk = result.priceData.find((data) => data.side === "sell" &&
            data.tokenId === result.market.tokenIds[1]);
        if (!lastPrice) {
            lastPrices.set(result.market.name, {
                yesBid: yesBid ? yesBid.price : 0,
                yesAsk: yesAsk ? yesAsk.price : 0,
                noBid: noBid ? noBid.price : 0,
                noAsk: noAsk ? noAsk.price : 0,
            });
            return true;
        }
        const priceChanged = (yesBid && Math.abs(yesBid.price - lastPrice.yesBid) >= 0.01) ||
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
const lastPolymarketPrices = new Map();
const lastKalshiPrices = new Map();
function polymarketJob() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("starting polymarket job...");
        const results = yield (0, polymarket_1.getPolymarketData)();
        const filteredResults = results.filter(lastPriceFilter(lastPolymarketPrices));
        console.log(`finishing polymarket job with: ${filteredResults.length} results`);
        sendPolymarketEmbed(filteredResults, config_1.POLYMARKET_CHANNEL_ID);
    });
}
function kalshiJob() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("starting kalshi job...");
        const results = yield (0, kalshi_1.getKalshiMarketData)();
        const filteredResults = Object.values(results).filter(lastPriceFilter(lastKalshiPrices));
        console.log(`finishing kalshi job with: ${filteredResults.length} results`);
        sendKalshiEmbed(filteredResults, config_1.POLYMARKET_CHANNEL_ID);
    });
}
function sendKalshiEmbed(results, channelId) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const result of results) {
            const channel = (yield index_1.client.channels.fetch(channelId));
            if (channel) {
                const marketName = result.market.name;
                const yesBid = result.priceData.find((data) => data.side === "buy" &&
                    data.tokenId === result.market.tokenIds[0]);
                const yesAsk = result.priceData.find((data) => data.side === "sell" &&
                    data.tokenId === result.market.tokenIds[0]);
                const noBid = result.priceData.find((data) => data.side === "buy" &&
                    data.tokenId === result.market.tokenIds[1]);
                const noAsk = result.priceData.find((data) => data.side === "sell" &&
                    data.tokenId === result.market.tokenIds[1]);
                const embed = {
                    title: `Kalshi Market: ${marketName}`,
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
                yield channel.send({ embeds: [embed] });
            }
            else {
                console.error(`Channel with ID ${channelId} not found`);
            }
        }
    });
}
function sendPolymarketEmbed(results, channelId) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const result of results) {
            const channel = (yield index_1.client.channels.fetch(channelId));
            if (channel) {
                const marketName = result.market.name;
                const yesBid = result.priceData.find((data) => data.side === "buy" &&
                    data.tokenId === result.market.tokenIds[0]);
                const yesAsk = result.priceData.find((data) => data.side === "sell" &&
                    data.tokenId === result.market.tokenIds[0]);
                const noBid = result.priceData.find((data) => data.side === "buy" &&
                    data.tokenId === result.market.tokenIds[1]);
                const noAsk = result.priceData.find((data) => data.side === "sell" &&
                    data.tokenId === result.market.tokenIds[1]);
                const embed = {
                    title: `Polymarket Market: ${marketName}`,
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
                yield channel.send({ embeds: [embed] });
            }
            else {
                console.error(`Channel with ID ${channelId} not found`);
            }
        }
    });
}
