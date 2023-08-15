/**
 * @file This file contains the validators which will be used to validate the HTTP-protocol related inputs and outputs when calling the endpoints.
 */

import * as data from "@ty-ras/data-io-ts"; // This package will be present in both BE and FE.
import * as t from "io-ts";
import * as tt from "io-ts-types";

export const thingWithoutID = t.type({
  payload_string: t.string,
  payload_timestamp: tt.DateFromISOString,
});

const thingID = t.string;
export const thing = t.type({
  ...thingWithoutID.props,
  id: thingID,
});

/**
 * The type of thing manipulated by CRUD endpoints.
 */
export type Thing = data.ProtocolTypeOf<typeof thing>;

/**
 * The type of ID of the thing.
 */
export type ThingID = data.ProtocolTypeOf<typeof thingID>;

/**
 * All the payload properties of the thing.
 */
export type PartialThingWithoutID = data.ProtocolTypeOf<
  t.PartialC<typeof thingWithoutID.props>
>;
