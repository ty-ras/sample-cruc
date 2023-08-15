import * as tyras from "@ty-ras/backend-node-io-ts-openapi";
import { configuration } from "@ty-ras-extras/backend-io-ts";
import { function as F, task as T, taskEither as TE } from "fp-ts";
import * as t from "io-ts";
import * as tt from "io-ts-types";

export type Config = t.TypeOf<typeof config>;
export type ConfigAuthentication = Config["authentication"];
export type ConfigHTTPServer = Config["http"];

const remoteEndpoint = t.type({
  host: tt.NonEmptyString,
  port: t.Int,
});

const authConfig = t.type(
  {
    // Insert authentication-related properties here
    // E.g. AWS pool ID + client ID + region, AzureAD tenant ID + app ID, etc.
  },
  "AuthConfig",
);

const config = t.type(
  {
    authentication: authConfig,
    http: t.type(
      {
        server: t.type(
          {
            ...remoteEndpoint.props,
            // TODO: certs
          },
          "HTTPServerConfig",
        ),
        // Remove this if CORS is not needed
        cors: t.type(
          {
            frontendAddress: tt.NonEmptyString,
          },
          "HTTPCorsConfig",
        ),
      },
      "HTTPConfig",
    ),
    database: t.type(
      {
        // This type has purposefully same property names and types as ClientConfig in 'pg' library.
        connection: t.type(
          {
            ...remoteEndpoint.props,
            database: tt.NonEmptyString,
            user: tt.NonEmptyString,
            password: tt.NonEmptyString,
          },
          "DatabaseConnection",
        ),
        // This type has purposefully same property names and types as resource pool config in TyRAS extras.
        pool: t.type(
          {
            minCount: t.Integer,
            maxCount: t.Integer,
            retry: t.type(
              {
                waitBeforeRetryMs: t.Integer,
                retryCount: t.Integer,
              },
              "DatabasePoolRetry",
            ),
            eviction: t.type(
              {
                checkPeriodMs: t.Integer,
                maxIdleTimeMs: t.Integer,
              },
              "DatabasePoolEviction",
            ),
          },
          "DatabasePool",
        ),
      },
      "Database",
    ),
  },
  "BEConfig",
);

// Change this name to something more suitable for your application, and then update the 'dev' script in package.json file.
const ENV_VAR_NAME = "MY_BACKEND_CONFIG";
export default await F.pipe(
  process.env[ENV_VAR_NAME],
  configuration.getJSONStringValueFromMaybeStringWhichIsJSONOrFilenameFromEnvVar(
    ENV_VAR_NAME,
  ),
  TE.chainEitherKW(configuration.validateFromStringifiedJSON(config)),
  T.map(tyras.getOrElseThrow),
)();
