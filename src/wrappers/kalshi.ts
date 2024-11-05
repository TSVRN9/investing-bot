import { MarketResult } from "./polymarket";

export async function getKalshiMarketData(): Promise<{
    DJT: MarketResult;
    KH: MarketResult;
}> {
    const urls = {
        DJT: "https://api.elections.kalshi.com/trade-api/v2/markets/PRES-2024-DJT",
        KH: "https://api.elections.kalshi.com/trade-api/v2/markets/PRES-2024-KH",
    };

    const fetchMarket = async (url: string): Promise<MarketResult> => {
        const response = await fetch(url, {
            headers: {
                accept: "application/json",
            },
        });
        const data = await response.json();
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
    };

    const [DJT, KH] = await Promise.all([
        fetchMarket(urls.DJT),
        fetchMarket(urls.KH),
    ]);
    console.log("Fetched data for DJT:", {
        marketName: DJT.market.name,
        buyPrice: DJT.priceData.find(
            (p) => p.side === "buy" && p.tokenId === DJT.market.tokenIds[0],
        )?.price,
        sellPrice: DJT.priceData.find(
            (p) => p.side === "sell" && p.tokenId === DJT.market.tokenIds[0],
        )?.price,
    });

    console.log("Fetched data for KH:", {
        marketName: KH.market.name,
        buyPrice: KH.priceData.find(
            (p) => p.side === "buy" && p.tokenId === KH.market.tokenIds[0],
        )?.price,
        sellPrice: KH.priceData.find(
            (p) => p.side === "sell" && p.tokenId === KH.market.tokenIds[0],
        )?.price,
    });
    return { DJT, KH };
}
