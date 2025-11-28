"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDbClient = void 0;
const pg_1 = require("pg");
// Singleton
const globalDbClient = global;
const getDbClient = () => {
    if (!globalDbClient.db)
        globalDbClient.db = new pg_1.Client({
            connectionString: process.env.DB_URL,
        });
    return globalDbClient.db;
};
exports.getDbClient = getDbClient;
