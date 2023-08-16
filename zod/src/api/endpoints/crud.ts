/**
 * @file This file contains the HTTP implementation for CRUD endpoints.
 */

import * as tyras from "@ty-ras/backend-node-zod-openapi";
import * as t from "zod";
import { crud } from "../protocol";
import app, { type StateSpecBase } from "../app";
import * as sql from "../../services/crud";

// HTTP CRUD protocol elements
const urlPathNoParameters = app.url``({
  openapi: {
    pathItem: {
      description: "Create a new thing, or query all things.",
    },
  },
});
const urlPathWithParameters = app.url`/${tyras.urlParameter(
  "id",
  crud.data.thing.shape.id,
)}`({
  // OpenAPI-specific information about all endpoints behind this URL pattern.
  openapi: {
    pathItem: {
      description: "Get, update, or delete a single thing.",
    },
    url: {
      id: {
        description: "The id of the thing.",
      },
    },
  },
});

const state = {
  // We don't really use authentication-related properties in the endpoint.
  // This is just to demonstrate how to specify that "this endpoint works for both authenticated and unauthenticated requests".
  // For truly unauthenticated endpoints, simply remove this property altogether so that stateSpec is simply an empty object.
  userId: false,
} as const satisfies StateSpecBase;

const example: tyras.GetEncoded<crud.data.Thing> = {
  id: "id",
  payload_string: "payload_string",
  payload_timestamp: "2023-01-01T00:00:00",
};
const responseBody = tyras.responseBody(crud.data.thing);

// Currently TyRAS has limitation of applying one url-builder to one class
// So, export two classes

export default [
  class {
    // CREATE
    @urlPathNoParameters<crud.ThingCreate>({
      openapi: {
        operation: {
          description: "Create a new thing to DB.",
        },
        responseBody: {
          description: "A newly created thing.",
          mediaTypes: {
            "application/json": {
              example,
            },
          },
        },
      },
    })({
      method: "POST",
      responseBody,
      state,
    })
    static async create() {
      return encodeThing(
        await sql.runSingleQuery(sql.sqlCreate, {
          payload_string: "default",
          payload_timestamp: new Date(),
        }),
      );
    }

    // READ ALL
    @urlPathNoParameters<crud.ThingReadAll>({
      openapi: {
        operation: {
          description: "Gets all the things from DB.",
        },
        responseBody: {
          description: "All the things from DB.",
          mediaTypes: {
            "application/json": {
              example: [example],
            },
          },
        },
      },
    })({
      method: "GET",
      responseBody: tyras.responseBody(t.array(crud.data.thing)),
      state,
    })
    static async readAll() {
      return (await sql.runSingleQuery(sql.sqlReadAll, undefined)).map(
        encodeThing,
      );
    }
  },

  class {
    // READ
    @urlPathWithParameters<crud.ThingRead>({
      openapi: {
        operation: {
          description: "Read one thing from DB.",
        },
        responseBody: {
          description: "Thing fetched from DB.",
          mediaTypes: {
            "application/json": {
              example,
            },
          },
        },
      },
    })({
      method: "GET",
      responseBody,
      state,
    })
    static async read({
      url: { id },
    }: tyras.GetMethodArgs<
      crud.ThingRead,
      typeof urlPathWithParameters,
      typeof state
    >) {
      return encodeThing(await sql.runSingleQuery(sql.sqlRead, { id }));
    }

    // UPDATE
    @urlPathWithParameters<crud.ThingUpdate>({
      openapi: {
        operation: {
          description: "Update one thing in DB.",
        },
        responseBody: {
          description: "Thing after updating it in DB.",
          mediaTypes: {
            "application/json": {
              example,
            },
          },
        },
        requestBody: {
          "application/json": {
            example,
          },
        },
      },
    })({
      method: "PATCH",
      responseBody,
      state,
      requestBody: app.requestBody(
        t.object(
          tyras.transformEntries(
            tyras.omit(crud.data.thing.shape, "id"),
            (prop) => prop.optional(),
          ),
        ),
      ),
    })
    static async update({
      url: { id },
      body: { payload_string, payload_timestamp },
    }: tyras.GetMethodArgs<
      crud.ThingUpdate,
      typeof urlPathWithParameters,
      typeof state
    >) {
      return encodeThing(
        await sql.runSingleQuery(sql.sqlUpdate, {
          id,
          payload_string,
          payload_timestamp:
            payload_timestamp !== undefined
              ? new Date(payload_timestamp)
              : undefined,
          payload_string_present: payload_string !== undefined,
          payload_timestamp_present: payload_timestamp !== undefined,
        }),
      );
    }

    // DELETE
    @urlPathWithParameters<crud.ThingDelete>({
      openapi: {
        operation: {
          description: "Delete one thing from DB.",
        },
        responseBody: {
          description: "Thing just before deleting it from DB.",
          mediaTypes: {
            "application/json": {
              example,
            },
          },
        },
      },
    })({
      method: "DELETE",
      responseBody,
      state,
    })
    static async delete({
      url: { id },
    }: tyras.GetMethodArgs<
      crud.ThingDelete,
      typeof urlPathWithParameters,
      typeof state
    >) {
      return encodeThing(await sql.runSingleQuery(sql.sqlDelete, { id }));
    }
  },
];

const encodeThing = ({
  payload_timestamp,
  ...thing
}: sql.Thing): crud.data.Thing => ({
  ...thing,
  payload_timestamp: payload_timestamp.toISOString(),
});
