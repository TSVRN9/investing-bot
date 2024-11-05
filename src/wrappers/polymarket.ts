export type Market = {
    name: string;
    tokenIds: string[];
};

export type MarketResult = {
    market: Market;
    priceData: {
        tokenId: string;
        side: "buy" | "sell";
        price: number;
    }[];
};

export async function getPolymarketData() {
    const endpoint = "https://clob.polymarket.com";
    const markets: Market[] = [
        {
            name: "Will Donald Trump win?",
            tokenIds: [
                "21742633143463906290569050155826241533067272736897614950488156847949938836455",
                "48331043336612883890938759509493159234755048973500640148014422747788308965732",
            ],
        },
        {
            name: "Will Kamala Harris win?",
            tokenIds: [
                "69236923620077691027083946871148646972011131466059644796654161903044970987404",
                "87584955359245246404952128082451897287778571240979823316620093987046202296181",
            ],
        },
    ];

    const marketResults: MarketResult[] = [];

    for (const market of markets) {
        const priceData = [];
        for (let i = 0; i < market.tokenIds.length; i++) {
            const tokenId = market.tokenIds[i];
            for (const side of ["buy", "sell"]) {
                try {
                    const response = await fetch(
                        `${endpoint}/price?token_id=${tokenId}&side=${side}`,
                    );
                    const data = await response.json();
                    priceData.push({
                        tokenId,
                        side: side as "buy" | "sell",
                        price: data.price,
                    });
                    console.log(
                        `Fetched price data for market: ${market.name}, token ID: ${tokenId}, side: ${side}, price: ${data.price}`,
                    );
                } catch (error) {
                    console.error(
                        `Error fetching data for market ${market.name} with token ID ${tokenId}:`,
                        error,
                    );
                }
            }
        }
        marketResults.push({ market, priceData });
    }

    return marketResults;
}
