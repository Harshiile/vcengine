import { Client } from "pg";

// Singleton
const globalDbClient = global as unknown as {
    db: Client;
};

export const getDbClient = () => {
    if (!globalDbClient.db)
        globalDbClient.db = new Client({
            connectionString: process.env.DB_URL,
        });
    return globalDbClient.db;
};
