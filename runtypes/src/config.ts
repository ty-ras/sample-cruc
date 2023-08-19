import { configuration } from "@ty-ras-extras/backend-runtypes";
import * as t from "runtypes";
import * as process from "node:process";

export type Config = t.Static<typeof config>;
export type ConfigAuthentication = Config["authentication"];
export type ConfigHTTPServer = Config["http"];

const nonEmptyString = t.String.withConstraint((str) => str.length > 0);
const int = t.Number.withConstraint((n) => Number.isInteger(n));

const remoteEP = t.Record({
  host: nonEmptyString,
  port: int,
});

const authConfig = t.Record({
  // Insert authentication-related properties here
  // E.g. AWS pool ID + client ID + region, AzureAD tenant ID + app ID, etc.
});

const config = t.Record({
  authentication: authConfig,
  http: t.Record({
    server: t.Record({
      ...remoteEP.fields,
      // TODO: certs
    }),
    // Remove this if CORS is not needed
    cors: t.Record({
      frontendAddress: nonEmptyString,
    }),
  }),
  database: t.Record({
    // This type has purposefully same property names and types as ClientConfig in 'pg' library.
    connection: t.Record({
      ...remoteEP.fields,
      database: nonEmptyString,
      user: nonEmptyString,
      password: nonEmptyString,
    }),
    // This type has purposefully same property names and types as resource pool config in TyRAS extras.
    pool: t.Record({
      minCount: int,
      maxCount: int,
      retry: t.Record({
        waitBeforeRetryMs: int,
        retryCount: int,
      }),
      eviction: t.Record({
        checkPeriodMs: int,
        maxIdleTimeMs: int,
      }),
    }),
  }),
});

// Change this name to something more suitable for your application, and then update the 'dev' script in package.json file.
const ENV_VAR_NAME = "MY_BACKEND_CONFIG";
export default configuration.validateFromMaybeStringifiedJSONOrThrow(
  config,
  await configuration.getJSONStringValueFromMaybeStringWhichIsJSONOrFilenameFromEnvVar(
    ENV_VAR_NAME,
    process.env[ENV_VAR_NAME],
  ),
);
