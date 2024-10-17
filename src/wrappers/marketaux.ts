import { MARKETS_AUX_TOKEN } from "../config";

export interface MarketsAuxArticle {
    uuid: string;
    title: string;
    description: string;
    keywords: string[];
    snippet: string;
    url: string;
    image_url: string;
    language: string;
    published_at: string;
    source: string;
    relevance_score: number | null;
    entities: {
        symbol: string;
        name: string;
        exchange: string;
        exchange_long: string;
        country: string;
        type: string;
        industry: string;
        match_score: number;
        sentiment_score: number;
        highlights: {
            highlight: string;
            sentiment: number;
            highlighted_in: string;
        }[];
    }[];
    similar: MarketsAuxArticle[];
}

export async function fetchArticlesForTicker(ticker: string, lastRun: string) {
    const apiToken = MARKETS_AUX_TOKEN;
    const url = `https://api.marketaux.com/v1/news/all?api_token=${apiToken}&symbols=${ticker}&published_after=${lastRun}`;

    const response = await fetch(url);
    if (!response.ok) {
        console.error(response);
        throw new Error(`Failed to fetch articles for ticker ${ticker}`);
    }

    const data = await response.json();
    return data.data as MarketsAuxArticle[];
}
