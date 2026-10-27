# @novice1/api-doc-zod-helper

Zod4 helpers for `@novice1/api-doc-generator` enabling compatibility with `@novice1/validator-zod`.

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [OpenAPI](#openapi)
- [Postman](#postman)
- [References](#references)

## Installation

```bash
npm install @novice1/api-doc-zod-helper @novice1/api-doc-generator zod@~4.6.7
```

The examples below also use [`@novice1/routing`](https://www.npmjs.com/package/@novice1/routing) and [`@novice1/validator-zod`](https://www.npmjs.com/package/@novice1/validator-zod).

## Usage

Give the helper matching your generator to its constructor through the `helperClass` option, and set `helperSchemaProperty` to the property name you use to define schemas in your routes (here `schema`):

| Generator | Helper             | Specification                                                                                                  | Reference                                                                                       |
| --------- | ------------------ | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `OpenAPI` | `OpenAPIZodHelper` | [OpenAPI Specification 3.1.0](https://spec.openapis.org/oas/v3.1.0)                                            | [API](https://kisiwu.github.io/novice-api-doc-generator/latest/modules/generators_openapi.html) |
| `Postman` | `PostmanZodHelper` | [Postman Collection Format v2.1.0](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html) | [API](https://kisiwu.github.io/novice-api-doc-generator/latest/modules/generators_postman.html) |

## OpenAPI

```ts
import { OpenAPI } from '@novice1/api-doc-generator';
import { OpenAPIZodHelper } from '@novice1/api-doc-zod-helper';
import routing from '@novice1/routing';
import { validatorZod } from '@novice1/validator-zod';
import * as z from 'zod';

const openapi = new OpenAPI({
  helperClass: OpenAPIZodHelper, // here
  helperSchemaProperty: 'schema',
});

// create a router
const router = routing()
  .setValidators(validatorZod({}, undefined, 'schema'))
  .get(
    {
      name: 'Main app',
      path: '/app',
      tags: ['default'],
      parameters: {
        schema: {
          query: {
            version: z
              .preprocess(
                (x) => Number(x),
                z
                  .enum({
                    one: 1,
                    two: 2,
                    three: 3,
                  })
                  .meta({
                    description: 'version number',
                  })
              )
              .optional()
              .default(2),
          },
        },
      },
    },
    function (req, res) {
      res.json(req.validated?.<{ version: number }>().query?.version);
    }
  );

// add router metadata
openapi.add(router.getMeta());

// get OpenAPI Object (json)
const doc = openapi.result();
```

## Postman

```ts
import { Postman } from '@novice1/api-doc-generator';
import { PostmanZodHelper } from '@novice1/api-doc-zod-helper';
import routing from '@novice1/routing';
import { validatorZod } from '@novice1/validator-zod';
import * as z from 'zod';

const postman = new Postman({
  helperClass: PostmanZodHelper, // here
  helperSchemaProperty: 'schema',
});

// create a router
const router = routing()
  .setValidators(validatorZod({}, undefined, 'schema'))
  .get(
    {
      name: 'Main app',
      path: '/app',
      tags: ['default'],
      parameters: {
        schema: {
          query: {
            version: z
              .preprocess(
                (x) => Number(x),
                z
                  .enum({
                    one: 1,
                    two: 2,
                    three: 3,
                  })
                  .meta({
                    description: 'version number',
                  })
              )
              .optional()
              .default(2),
          },
        },
      },
    },
    function (req, res) {
      res.json(req.validated?.<{ version: number }>().query?.version);
    }
  );

// add router metadata
postman.add(router.getMeta());

// get Postman Collection (json)
const doc = postman.result();
```

## References

- [@novice1/api-doc-generator](https://kisiwu.github.io/novice-api-doc-generator/latest/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Postman Collection Format v2.1.0](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html)
- [@novice1/routing](https://www.npmjs.com/package/@novice1/routing)
- [@novice1/validator-zod](https://www.npmjs.com/package/@novice1/validator-zod)
- [zod](https://github.com/colinhacks/zod)
