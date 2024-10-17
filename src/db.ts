import { DataSource } from "typeorm";
import { Ticker } from "./models/ticker";
import { Feed } from "./models/feed";

export const TickerDataSource = new DataSource({
    type: "better-sqlite3",
    database: "tickers.sqlite3",
    entities: [Ticker],
    synchronize: true,
});

export const AppDataSource = new DataSource({
    type: "better-sqlite3",
    database: "database.sqlite3",
    entities: [Feed],
    synchronize: true,
});