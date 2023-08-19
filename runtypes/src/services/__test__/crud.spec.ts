import test, { type ExecutionContext } from "ava";
import * as spec from "../crud";
import { type sql } from "@ty-ras-extras/backend-runtypes";

// This test illustrates how the SQL strings look like when using SQL string builder of TyRAS extras package.

test("Verify SQL statements", (c) => {
  c.plan(5);
  verifySQL(
    c,
    spec.sqlCreate,
    `
INSERT INTO schema.table(payload_string, payload_timestamp)
VALUES ($1, $2)
RETURNING *
`,
  );
  verifySQL(
    c,
    spec.sqlRead,
    `
SELECT *
FROM schema.table
WHERE id = $1
`,
  );
  verifySQL(
    c,
    spec.sqlUpdate,
    `
UPDATE schema.table t
SET
  payload_string = CASE WHEN $1 IS TRUE THEN $2 ELSE t.payload_string END,
  payload_timestamp = CASE WHEN $3 IS TRUE THEN $4 ELSE t.payload_timestamp END
WHERE id = $5
RETURNING *
`,
  );
  verifySQL(
    c,
    spec.sqlDelete,
    `
DELETE FROM schema.table
WHERE id = $1
RETURNING *
`,
  );
  verifySQL(
    c,
    spec.sqlReadAll,
    `
SELECT *
FROM schema.table
`,
  );
});

const verifySQL = (
  c: ExecutionContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  executor: sql.SQLQueryExecutor<any, any, any>,
  expectedSQL: string,
) => c.deepEqual(executor.sqlString, expectedSQL);
