# TyRAS Sample - CRUD REST API
This repository contains code implementing small [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) REST API using TyRAS framework.
The subfolders of git root contain standalone applications that contain BE code that is originally initialized using `npx @ty-ras/start@latest` command, and modified with minimal changes to host a CRUD REST API utilizing one validation framework.

Currently, the sample code exists of code for the folloing validation frameworks:
- [io-ts](./io-ts) folder contains code utilizing [io-ts validation framework](https://github.com/gcanti/io-ts) along with its functional programming cousin [fp-ts](https://github.com/gcanti/fp-ts), and
- [zod](./zod) folder contains code utilizing [zod validation framework](https://github.com/colinhacks/zod).
