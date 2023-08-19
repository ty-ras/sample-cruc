# TyRAS Sample - CRUD REST API
This repository contains code implementing small [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) REST API using TyRAS framework.
The subfolders of git root contain standalone applications that contain BE code that is originally initialized using `npx @ty-ras/start@latest` command, and modified with minimal changes to host a CRUD REST API utilizing one validation framework.

Currently, the sample code exists of code for the following validation frameworks:
- [io-ts](./io-ts) folder contains code utilizing [`io-ts` validation framework](https://github.com/gcanti/io-ts) along with its functional programming cousin [fp-ts](https://github.com/gcanti/fp-ts), and
- [zod](./zod) folder contains code utilizing [`zod` validation framework](https://github.com/colinhacks/zod).
- [runtypes](./runtypes) folder contains code utilizing [`runtypes` validation framework](https://github.com/pelotom/runtypes).

# Differences Between Validation Frameworks
Of the validation framework variants mentioned above, currently only `io-ts` is the framework, which can do both encoding *and* decoding with a _single_ validation object.
This enables intuitive and simple definitions for situations when some data element is of one type in transit, and another type when in JS runtime.

One such example could be `Date` class, which is transmitted as JSON string with ISO timestamp format.
The [`io-ts-types` provides simple way to declare this in API protocol folder](https://github.com/ty-ras/sample-crud/blob/main/io-ts/src/api/protocol/crud/data.ts#L11), and the TyRAS framework will automatically provide that kind of timestamp as `Date` to the endpoint methods.
The `zod` and `runtypes` do not have similar functionality (`zod` comes close!), so with those frameworks the timestamp field is seen as string ([zod example](https://github.com/ty-ras/sample-crud/blob/main/zod/src/api/protocol/crud/data.ts#L10) and [runtypes example](https://github.com/ty-ras/sample-crud/blob/main/runtypes/src/api/protocol/crud/data.ts#L10)) also at runtime.

With these frameworks, if there is a need to perform the type conversion, it has to be done manually, like `encodeThing` function, and code inside `update` method, [here in zod example](https://github.com/ty-ras/sample-crud/blob/main/zod/src/api/endpoints/crud.ts#L229), and [here in runtypes example](https://github.com/ty-ras/sample-crud/blob/main/runtypes/src/api/endpoints/crud.ts#L229).

On the other hand, the `io-ts` is heavily paired with functional programming library `fp-ts`, and as such, is often not easy to use outside of functional programming code.
