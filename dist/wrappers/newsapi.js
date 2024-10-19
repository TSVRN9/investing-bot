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
exports.newsApi = exports.NewsApi = void 0;
const config_1 = require("../config");
const BASE_URL = "https://newsapi.org/v2/";
const API_KEY = config_1.NEWS_API_TOKEN;
class NewsApi {
    constructor(apiKey, baseUrl = BASE_URL) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }
    getTopHeadlines(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (params.country && params.sources) {
                throw new Error("You can't mix the 'country' param with the 'sources' param.");
            }
            if (params.category && params.sources) {
                throw new Error("You can't mix the 'category' param with the 'sources' param.");
            }
            if (params.country && params.category && params.sources) {
                throw new Error("You can't mix the 'country' and 'category' params with the 'sources' param.");
            }
            if (params.pageSize && (params.pageSize < 1 || params.pageSize > 100)) {
                throw new Error("The 'pageSize' param must be between 1 and 100.");
            }
            const url = new URL(`${this.baseUrl}top-headlines`);
            url.searchParams.append("apiKey", this.apiKey);
            Object.keys(params).forEach((key) => {
                if (params[key]) {
                    url.searchParams.append(key, params[key].toString());
                }
            });
            const response = yield fetch(url.toString());
            if (!response.ok) {
                throw new Error(`Error fetching top headlines: ${response.statusText}`);
            }
            const data = yield response.json();
            data.articles = data.articles.filter((article) => article.title !== "[Removed]");
            return data;
        });
    }
}
exports.NewsApi = NewsApi;
exports.newsApi = new NewsApi(API_KEY);
