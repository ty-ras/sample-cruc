/**
 * @file This file contains the implementation for manipulating things.
 */

import * as tyras from "@ty-ras/backend-node-io-ts-openapi";
import { sql } from "@ty-ras-extras/backend-io-ts";
import { function as F, taskEither as TE, task as T } from "fp-ts";
import * as t from "io-ts";
import * as db from "../db";

// Auxiliary SQL-related functions
const parameterPresent = <TName extends string>(name: TName) =>
  sql.param(`${name}_present`, t.boolean);
const parameterOptional = <TName extends string, TValidation extends t.Mixed>(
  parameter: sql.SQLParameter<TName, TValidation>,
) =>
  sql.param(
    parameter.parameterName,
    t.union([parameter.validation, t.undefined]),
  );

// Parameters and validations used in SQL statements
const sqlThing = t.type({
  id: t.string,
  payload_string: t.string,
  payload_timestamp: tyras.instanceOf(Date),
});
const table = sql.raw(`schema.table`);
const idParam = sql.param("id", sqlThing.props.id);
const payloadStringParam = sql.param(
  "payload_string",
  sqlThing.props.payload_string,
);
const payloadTimestampParam = sql.param(
  "payload_timestamp",
  sqlThing.props.payload_timestamp,
);
const payloadStringPresent = parameterPresent(payloadStringParam.parameterName);
const payloadStringOptional = parameterOptional(payloadStringParam);
const payloadTimestampPresent = parameterPresent(
  payloadTimestampParam.parameterName,
);
const payloadTimestampOptional = parameterOptional(payloadTimestampParam);

// SQL statement executors
export const sqlCreate = F.pipe(
  db.usingPostgresClient,
  sql.prepareSQL`
INSERT INTO ${table}(payload_string, payload_timestamp)
VALUES (${payloadStringParam}, ${payloadTimestampParam})
RETURNING *
`,
  sql.validateRows(sql.one(sqlThing)),
);

export const sqlRead = F.pipe(
  db.usingPostgresClient,
  sql.prepareSQL`
SELECT *
FROM ${table}
WHERE id = ${idParam}
`,
  sql.validateRows(sql.one(sqlThing)),
);

export const sqlUpdate = F.pipe(
  db.usingPostgresClient,
  sql.prepareSQL`
UPDATE ${table} t
SET
  payload_string = CASE WHEN ${payloadStringPresent} IS TRUE THEN ${payloadStringOptional} ELSE t.payload_string END,
  payload_timestamp = CASE WHEN ${payloadTimestampPresent} IS TRUE THEN ${payloadTimestampOptional} ELSE t.payload_timestamp END
WHERE id = ${idParam}
RETURNING *
`,
  sql.validateRows(sql.one(sqlThing)),
);

export const sqlDelete = F.pipe(
  db.usingPostgresClient,
  sql.prepareSQL`
DELETE FROM ${table}
WHERE id = ${idParam}
RETURNING *
`,
  sql.validateRows(sql.one(sqlThing)),
);

export const sqlReadAll = F.pipe(
  db.usingPostgresClient,
  sql.prepareSQL`
SELECT *
FROM ${table}
`,
  sql.validateRows(sql.many(sqlThing)),
);

export const runSingleQuery = <TParams, TOutput>(
  executor: sql.SQLQueryExecutor<db.DBClient, TParams, TOutput>,
  parameters: TParams,
) =>
  F.pipe(
    // "bracket" is same as "try ... finally"
    TE.bracket(db.pool.acquire(), executor(parameters), db.pool.release),
    T.map(tyras.getOrElseThrow),
  )();
