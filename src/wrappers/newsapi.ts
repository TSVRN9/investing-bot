import { NEWS_API_TOKEN } from "../config";

const BASE_URL = "https://newsapi.org/v2/";
const API_KEY = NEWS_API_TOKEN;

export interface NewsApiArticle {
    source: {
        id: string | null;
        name: string;
    };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
}

export interface TopHeadlinesResponse {
    status: string;
    totalResults: number;
    articles: NewsApiArticle[];
}

export interface GetTopHeadlinesParams {
    country?: "us";
    category?:
        | "business"
        | "entertainment"
        | "general"
        | "health"
        | "science"
        | "sports"
        | "technology";
    sources?: string;
    q?: string;
    pageSize?: number;
    page?: number;
}

export class NewsApi {
    private apiKey: string;
    private baseUrl: string;

    constructor(apiKey: string, baseUrl: string = BASE_URL) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    async getTopHeadlines(
        params: GetTopHeadlinesParams,
    ): Promise<TopHeadlinesResponse> {
        if (params.country && params.sources) {
            throw new Error(
                "You can't mix the 'country' param with the 'sources' param.",
            );
        }

        if (params.category && params.sources) {
            throw new Error(
                "You can't mix the 'category' param with the 'sources' param.",
            );
        }

        if (params.country && params.category && params.sources) {
            throw new Error(
                "You can't mix the 'country' and 'category' params with the 'sources' param.",
            );
        }

        if (params.pageSize && (params.pageSize < 1 || params.pageSize > 100)) {
            throw new Error("The 'pageSize' param must be between 1 and 100.");
        }

        const url = new URL(`${this.baseUrl}top-headlines`);
        url.searchParams.append("apiKey", this.apiKey);

        Object.keys(params).forEach((key) => {
            if (params[key as keyof typeof params]) {
                url.searchParams.append(
                    key,
                    params[key as keyof typeof params]!.toString(),
                );
            }
        });

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(
                `Error fetching top headlines: ${response.statusText}`,
            );
        }

        const data: TopHeadlinesResponse = await response.json();

        // filter articles with title "[Removed]"
        data.articles = data.articles.filter(
            (article) => article.title !== "[Removed]",
        );

        return data;
    }
}

export const newsApi = new NewsApi(API_KEY);
