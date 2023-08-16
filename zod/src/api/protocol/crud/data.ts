/**
 * @file This file contains the validators which will be used to validate the HTTP-protocol related inputs and outputs when calling the endpoints.
 */

import * as data from "@ty-ras/data-zod"; // This package will be present in both BE and FE.
import * as t from "zod";

export const thing = t.object({
  payload_string: t.string(),
  payload_timestamp: t.string(), // Zod does not have easy way to handle transformations like io-ts has with encoders/decoders. For simplicity sake, we fallback to string.
  id: t.string(),
});

/**
 * The type of thing manipulated by CRUD endpoints.
 */
export type Thing = data.ProtocolTypeOf<typeof thing>;

/**
 * The type of ID of the thing.
 */
export type ThingID = Thing["id"];

/**
 * All the payload properties of the thing.
 */
export type PartialThingWithoutID = Partial<Omit<Thing, "id">>;
