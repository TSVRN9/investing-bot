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
exports.fetchArticlesForTicker = fetchArticlesForTicker;
const config_1 = require("../config");
function fetchArticlesForTicker(ticker, lastRun) {
    return __awaiter(this, void 0, void 0, function* () {
        const apiToken = config_1.MARKETS_AUX_TOKEN;
        const url = `https://api.marketaux.com/v1/news/all?api_token=${apiToken}&symbols=${ticker}&published_after=${lastRun}`;
        const response = yield fetch(url);
        if (!response.ok) {
            console.error(response);
            throw new Error(`Failed to fetch articles for ticker ${ticker}`);
        }
        const data = yield response.json();
        return data.data;
    });
}
