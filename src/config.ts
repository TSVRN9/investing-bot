import { configDotenv } from "dotenv";
configDotenv();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN as string;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID as string;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID as string;
const NEWS_API_TOKEN = process.env.NEWS_API_TOKEN as string;
const MARKETS_AUX_TOKEN = process.env.MARKETS_AUX_TOKEN as string;
const POLYMARKET_CHANNEL_ID = process.env.POLYMARKET_CHANNEL_ID as string;

if (
    !DISCORD_TOKEN ||
    !DISCORD_CLIENT_ID ||
    !DISCORD_GUILD_ID ||
    !NEWS_API_TOKEN ||
    !MARKETS_AUX_TOKEN
) {
    throw new Error("Environment variables undefined!?");
}

export {
    DISCORD_TOKEN,
    DISCORD_GUILD_ID,
    DISCORD_CLIENT_ID,
    NEWS_API_TOKEN,
    MARKETS_AUX_TOKEN,
    POLYMARKET_CHANNEL_ID,
};
