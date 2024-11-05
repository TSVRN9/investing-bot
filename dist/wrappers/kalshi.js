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
exports.getKalshiMarketData = getKalshiMarketData;
function getKalshiMarketData() {
    return __awaiter(this, void 0, void 0, function* () {
        const urls = {
            DJT: "https://api.elections.kalshi.com/trade-api/v2/markets/PRES-2024-DJT",
            KH: "https://api.elections.kalshi.com/trade-api/v2/markets/PRES-2024-KH",
        };
        const fetchMarket = (url) => __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(url, {
                headers: {
                    accept: "application/json",
                },
            });
            const data = yield response.json();
            return {
                market: {
                    name: data.market.title,
                    tokenIds: [data.market.ticker],
                },
                priceData: [
                    {
                        tokenId: data.market.ticker,
                        side: "buy",
                        price: data.market.yes_bid / 100,
                    },
                    {
                        tokenId: data.market.ticker,
                        side: "sell",
                        price: data.market.yes_ask / 100,
                    },
                    {
                        tokenId: data.market.ticker,
                        side: "buy",
                        price: data.market.no_bid / 100,
                    },
                    {
                        tokenId: data.market.ticker,
                        side: "sell",
                        price: data.market.no_ask / 100,
                    },
                ],
            };
        });
        const [DJT, KH] = yield Promise.all([
            fetchMarket(urls.DJT),
            fetchMarket(urls.KH),
        ]);
        return { DJT, KH };
    });
}
