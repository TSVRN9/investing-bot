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
exports.pollPolymarket = pollPolymarket;
function pollPolymarket() {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = "https://clob.polymarket.com";
        const markets = [
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
        const marketResults = [];
        for (const market of markets) {
            const priceData = [];
            for (let i = 0; i < market.tokenIds.length; i++) {
                const tokenId = market.tokenIds[i];
                for (const side of ["buy", "sell"]) {
                    try {
                        const response = yield fetch(`${endpoint}/price?token_id=${tokenId}&side=${side}`);
                        const data = yield response.json();
                        priceData.push({
                            tokenId,
                            side: side,
                            price: data.price,
                        });
                    }
                    catch (error) {
                        console.error(`Error fetching data for market ${market.name} with token ID ${tokenId}:`, error);
                    }
                }
            }
            marketResults.push({ market, priceData });
        }
        return marketResults;
    });
}
