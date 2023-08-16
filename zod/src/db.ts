import { resources, sql } from "@ty-ras-extras/backend-zod";
import pg from "pg";
import config from "./config";

export type DBClient = pg.Client;

const {
  database: {
    connection,
    pool: { eviction, ...poolConfig },
  },
} = config;

/* eslint-disable no-console */

const { administration, pool } = resources.createSimpleResourcePool({
  ...poolConfig,
  create: async () => {
    const client = new pg.Client(connection);
    await client.connect();
    console.info(`Created DB connection.`);
    return client;
  },
  destroy: async (client) => {
    console.info(`Destroying connection.`);
    await client.end();
  },
});

// Start periodic pool eviction, and lose the promise on purpose - we never want to stop until the process itself stops (on ctrl-c).
void (async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, eviction.checkPeriodMs));
    const evictionResult = await administration.runEviction(
      eviction.maxIdleTimeMs,
    );
    const hasErrors = evictionResult.errors.length > 0;
    if (hasErrors || evictionResult.resourcesDeleted > 0) {
      console[hasErrors ? "error" : "info"](
        "Pool eviction completed.",
        evictionResult,
      );
    }
  }
})();

export { pool };

/**
 * This will be used by query builders to bind SQL string parameter validation and actual DB client to use to execute the SQL.
 */
export const usingPostgresClient: sql.SQLClientInformation<DBClient> = {
  constructParameterReference: (index) => `$${index + 1}`,
  executeQuery: async (client, query, parameters) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    (await client.query(query, parameters)).rows,
};
