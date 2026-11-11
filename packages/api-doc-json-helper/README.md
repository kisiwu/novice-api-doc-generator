# @novice1/api-doc-json-helper

JSON schemas helpers for `@novice1/api-doc-generator` enabling compatibility with `@novice1/validator-json`.

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [OpenAPI](#openapi)
  - [Recommended setup](#recommended-setup)
- [Postman](#postman)
- [References](#references)

## Installation

```bash
npm install @novice1/api-doc-json-helper @novice1/api-doc-generator
```

The examples below also use [`@novice1/routing`](https://www.npmjs.com/package/@novice1/routing).

## Usage

Give the helper matching your generator to its constructor through the `helperClass` option:

| Generator | Helper              | Specification                                                                                                  | Reference                                                                                       |
| --------- | ------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `OpenAPI` | `OpenAPIJsonHelper` | [OpenAPI Specification 3.1.0](https://spec.openapis.org/oas/v3.1.0)                                            | [API](https://kisiwu.github.io/novice-api-doc-generator/latest/modules/generators_openapi.html) |
| `Postman` | `PostmanJsonHelper` | [Postman Collection Format v2.1.0](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html) | [API](https://kisiwu.github.io/novice-api-doc-generator/latest/modules/generators_postman.html) |

The schemas can be declared directly in `parameters`, or isolated in a dedicated property configured with `helperSchemaProperty` (recommended).

## OpenAPI

Schemas declared directly in `parameters`:

```ts
import { OpenAPI } from '@novice1/api-doc-generator';
import { OpenAPIJsonHelper } from '@novice1/api-doc-json-helper';
import routing from '@novice1/routing';

const openapi = new OpenAPI({ helperClass: OpenAPIJsonHelper });

const router = routing().get(
  {
    name: 'Main app',
    path: '/app',
    auth: true,
    tags: ['default'],
    parameters: {
      query: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          version: {
            type: 'string',
            description: 'version number',
            enum: ['1', '2', '3'],
            default: '2',
            nullable: true,
          },
        },
      },
    },
  },
  function (req, res) {
    res.json(req.query.version);
  }
);

// ...
```

### Recommended setup

It's [recommended](https://github.com/kisiwu/novice-validator-json?tab=readme-ov-file#best-practices) to keep your schemas isolated from other properties of `parameters`.
Set `helperSchemaProperty` to the name of that property (here `schema`).

```ts
import { OpenAPI } from '@novice1/api-doc-generator';
import { OpenAPIJsonHelper } from '@novice1/api-doc-json-helper';
import routing from '@novice1/routing';

const openapi = new OpenAPI({
  helperClass: OpenAPIJsonHelper,
  helperSchemaProperty: 'schema', // recommended
});

const router = routing().get(
  {
    name: 'Main app',
    path: '/app',
    auth: true,
    tags: ['default'],
    parameters: {
      // recommended
      schema: {
        query: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          properties: {
            version: {
              type: 'string',
              description: 'version number',
              enum: ['1', '2', '3'],
              default: '2',
              nullable: true,
            },
          },
        },
      },
    },
  },
  function (req, res) {
    res.json(req.query.version);
  }
);

// ...
```

## Postman

Same setup as OpenAPI, with `Postman` and `PostmanJsonHelper`:

```ts
import { Postman } from '@novice1/api-doc-generator';
import { PostmanJsonHelper } from '@novice1/api-doc-json-helper';
import routing from '@novice1/routing';

const postman = new Postman({
  helperClass: PostmanJsonHelper,
  helperSchemaProperty: 'schema',
});

const router = routing().get(
  {
    name: 'Main app',
    path: '/app',
    auth: true,
    tags: ['default'],
    parameters: {
      schema: {
        query: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          properties: {
            version: {
              type: 'string',
              description: 'version number',
              enum: ['1', '2', '3'],
              default: '2',
              nullable: true,
            },
          },
        },
      },
    },
  },
  function (req, res) {
    res.json(req.query.version);
  }
);

// ...
```

## References

- [@novice1/api-doc-generator](https://kisiwu.github.io/novice-api-doc-generator/latest/)
- [@novice1/validator-json](https://kisiwu.github.io/novice-validator-json/latest/)
- [@novice1/routing](https://www.npmjs.com/package/@novice1/routing)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Postman Collection Format v2.1.0](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html)
