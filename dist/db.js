"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = exports.TickerDataSource = void 0;
const typeorm_1 = require("typeorm");
const ticker_1 = require("./models/ticker");
const feed_1 = require("./models/feed");
exports.TickerDataSource = new typeorm_1.DataSource({
    type: "better-sqlite3",
    database: "tickers.sqlite3",
    entities: [ticker_1.Ticker],
    synchronize: true,
});
exports.AppDataSource = new typeorm_1.DataSource({
    type: "better-sqlite3",
    database: "database.sqlite3",
    entities: [feed_1.Feed],
    synchronize: true,
});
