/**
 * @file This file contains TyRAS protocol type definitions for endpoint doing a greeting.
 */

import type * as data from "./data";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type * as protocol from "@ty-ras/protocol"; // Imported only for JSDoc.

/**
 * This is TyRAS protocol type definition for endpoint which creates a new thing to DB.
 */
export interface ThingCreate {
  /**
   * The HTTP method for this endpoint: `POST`.
   * @see protocol.ProtocolSpecCore.method
   */
  method: "POST";

  /**
   * The response body for this endpoint.
   * @see protocol.ProtocolSpecCore.responseBody
   */
  responseBody: data.Thing;
}

/**
 * This is TyRAS protocol type definition for endpoint which reads one thing from DB.
 */
export interface ThingRead {
  /**
   * The HTTP method for this endpoint: `GET`.
   * @see protocol.ProtocolSpecCore.method
   */
  method: "GET";

  /**
   * The URL parameters for this endpoint.
   * Only one:
   * - `id`: The id of the thing existing in DB.
   * @see protocol.ProtocolSpecURL.url
   * @see data.ThingID
   */
  url: {
    id: data.ThingID;
  };

  /**
   * The response body for this endpoint.
   * @see protocol.ProtocolSpecCore.responseBody
   */
  responseBody: data.Thing;
}

/**
 * This is TyRAS protocol type definition for endpoint which updates one thing to DB.
 */
export interface ThingUpdate {
  /**
   * The HTTP method for this endpoint: `PATCH`.
   * @see protocol.ProtocolSpecCore.method
   */
  method: "PATCH";

  /**
   * The URL parameters for this endpoint.
   * Only one:
   * - `id`: The id of the thing existing in DB.
   * @see protocol.ProtocolSpecURL.url
   * @see data.ThingID
   */
  url: {
    id: data.ThingID;
  };

  /**
   * The request body type for this endpoint.
   * Includes all the payload (not ID) properties of the thing.
   * @see data.ThingWithoutID
   */
  requestBody: data.PartialThingWithoutID;

  /**
   * The response body for this endpoint.
   * @see protocol.ProtocolSpecCore.responseBody
   */
  responseBody: data.Thing;
}

/**
 * This is TyRAS protocol type definition for endpoint which deletes one thing from DB.
 */
export interface ThingDelete {
  /**
   * The HTTP method for this endpoint: `DELETE`.
   * @see protocol.ProtocolSpecCore.method
   */
  method: "DELETE";

  /**
   * The URL parameters for this endpoint.
   * Only one:
   * - `id`: The id of the thing existing in DB.
   * @see protocol.ProtocolSpecURL.url
   * @see data.ThingID
   */
  url: {
    id: data.ThingID;
  };

  /**
   * The response body for this endpoint.
   * @see protocol.ProtocolSpecCore.responseBody
   */
  responseBody: data.Thing;
}

/**
 * This is TyRAS protocol type definition for endpoint which reads all things from DB.
 */
export interface ThingReadAll {
  /**
   * The HTTP method for this endpoint: `POST`.
   * @see protocol.ProtocolSpecCore.method
   */
  method: "GET";

  /**
   * The response body for this endpoint.
   * @see protocol.ProtocolSpecCore.responseBody
   */
  responseBody: Array<data.Thing>;
}
