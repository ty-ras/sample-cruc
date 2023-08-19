/**
 * @file This file contains the implementation for manipulating things.
 */

import * as tyras from "@ty-ras/backend-node-runtypes-openapi";
import { sql } from "@ty-ras-extras/backend-runtypes";
import * as t from "runtypes";
import * as db from "../db";

// Auxiliary SQL-related functions
const parameterPresent = <TName extends string>(name: TName) =>
  sql.param(`${name}_present`, t.Boolean);
const parameterOptional = <
  TName extends string,
  TValidation extends tyras.AnyDecoder,
>(
  parameter: sql.SQLParameter<TName, TValidation>,
) =>
  sql.param(
    parameter.parameterName,
    t.Union(parameter.validation, t.Undefined),
  );

// Parameters and validations used in SQL statements
const sqlThing = t.Record({
  id: t.String,
  payload_string: t.String,
  payload_timestamp: t.InstanceOf(Date),
});
export type Thing = t.Static<typeof sqlThing>;
const table = sql.raw(`schema.table`);
const idParam = sql.param("id", sqlThing.fields.id);
const payloadStringParam = sql.param(
  "payload_string",
  sqlThing.fields.payload_string,
);
const payloadTimestampParam = sql.param(
  "payload_timestamp",
  sqlThing.fields.payload_timestamp,
);
const payloadStringPresent = parameterPresent(payloadStringParam.parameterName);
const payloadStringOptional = parameterOptional(payloadStringParam);
const payloadTimestampPresent = parameterPresent(
  payloadTimestampParam.parameterName,
);
const payloadTimestampOptional = parameterOptional(payloadTimestampParam);

// SQL statement executors
export const sqlCreate = sql.validateOneRow(
  sql.prepareSQL`
  INSERT INTO ${table}(payload_string, payload_timestamp)
  VALUES (${payloadStringParam}, ${payloadTimestampParam})
  RETURNING *
  `(db.usingPostgresClient),
  sqlThing,
);

export const sqlRead = sql.validateOneRow(
  sql.prepareSQL`
SELECT *
FROM ${table}
WHERE id = ${idParam}
`(db.usingPostgresClient),
  sqlThing,
);

export const sqlUpdate = sql.validateOneRow(
  sql.prepareSQL`
UPDATE ${table} t
SET
  payload_string = CASE WHEN ${payloadStringPresent} IS TRUE THEN ${payloadStringOptional} ELSE t.payload_string END,
  payload_timestamp = CASE WHEN ${payloadTimestampPresent} IS TRUE THEN ${payloadTimestampOptional} ELSE t.payload_timestamp END
WHERE id = ${idParam}
RETURNING *
`(db.usingPostgresClient),
  sqlThing,
);

export const sqlDelete = sql.validateOneRow(
  sql.prepareSQL`
DELETE FROM ${table}
WHERE id = ${idParam}
RETURNING *
`(db.usingPostgresClient),
  sqlThing,
);

export const sqlReadAll = sql.validateRows(
  sql.prepareSQL`
SELECT *
FROM ${table}
`(db.usingPostgresClient),
  sql.many(sqlThing),
);

export const runSingleQuery = async <TParams, TOutput>(
  executor: sql.SQLQueryExecutor<db.DBClient, TParams, TOutput>,
  parameters: TParams,
) => {
  const client = await db.pool.acquire();
  try {
    return await executor(client, parameters);
  } finally {
    await db.pool.release(client);
  }
};
