import { resources, sql } from "@ty-ras-extras/backend-io-ts";
import { function as F, taskEither as TE, either as E } from "fp-ts";
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

const { administration, pool } = resources.createSimpleResourcePoolFromTasks({
  ...poolConfig,
  create: () =>
    F.pipe(
      E.tryCatch(() => new pg.Client(connection), E.toError),
      TE.fromEither,
      TE.chainFirst((client) =>
        TE.tryCatch(
          async () => (
            await client.connect(), console.info(`Created DB connection.`)
          ),
          E.toError,
        ),
      ),
    ),
  destroy: (client) =>
    TE.tryCatch(
      async () => (console.info(`Returning connection.`), await client.end()),
      E.toError,
    ),
});

// Start periodic pool eviction, and lose the promise on purpose - we never want to stop until the process itself stops (on ctrl-c).
void (async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await new Promise((resolve) => setTimeout(resolve, eviction.checkPeriodMs));
    const evictionResult = await administration.runEviction(
      eviction.maxIdleTimeMs,
    )();
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
  executeQuery: (client, query, parameters) =>
    F.pipe(
      TE.tryCatch(async () => await client.query(query, parameters), E.toError),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      TE.map(({ rows }) => rows),
    ),
};
