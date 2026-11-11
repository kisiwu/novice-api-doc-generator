# @novice1/api-doc-joi-helper

Joi schemas helpers for `@novice1/api-doc-generator` enabling compatibility with `@novice1/validator-joi`.

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [OpenAPI](#openapi)
- [Postman](#postman)
- [Supported Joi features](#supported-joi-features)
  - [Types](#types)
  - [Formats](#formats)
  - [Joi.meta](#joimeta)
- [References](#references)

## Installation

```bash
npm install @novice1/api-doc-joi-helper @novice1/api-doc-generator joi@^18.3.0
```

## Usage

Give the helper matching your generator to its constructor through the `helperClass` option:

| Generator | Helper             | Specification                                                                                                  | Reference                                                                                       |
| --------- | ------------------ | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `OpenAPI` | `OpenAPIJoiHelper` | [OpenAPI Specification 3.1.0](https://spec.openapis.org/oas/v3.1.0)                                            | [API](https://kisiwu.github.io/novice-api-doc-generator/latest/modules/generators_openapi.html) |
| `Postman` | `PostmanJoiHelper` | [Postman Collection Format v2.1.0](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html) | [API](https://kisiwu.github.io/novice-api-doc-generator/latest/modules/generators_postman.html) |

Then declare your `params`, `query`, `body`, `files`, `headers` and `cookies` parameters directly with `Joi` schemas.

## OpenAPI

```ts
import { GenerateComponentsRule, OpenAPI } from '@novice1/api-doc-generator';
import { OpenAPIJoiHelper } from '@novice1/api-doc-joi-helper';
import routing from '@novice1/routing';
import Joi from 'joi';

const openapi = new OpenAPI({ helperClass: OpenAPIJoiHelper });

openapi
  .setTitle('api doc')
  .setHost('http://localhost:8000')
  .setConsumes(['application/json'])
  .setTags([
    {
      name: 'default',
      externalDocs: { description: 'Find more info here', url: 'https://swagger.io/specification/' },
    },
  ])
  .setGenerateComponentsRule(GenerateComponentsRule.ifUndefined)
  .setResponsesProperty('openapi')
  .setSecuritySchemes({
    basicAuth: {
      type: 'http',
      scheme: 'basic',
    },
  })
  .setDefaultSecurity([
    {
      basicAuth: [],
    },
  ]);

const router = routing().get(
  {
    name: 'Main app',
    path: '/app',
    auth: true,
    tags: ['default'],
    parameters: {
      query: {
        version: Joi.number().description('version number').min(1).max(3).default(2).example(2),
      },

      operationId: 'default-app',
      undoc: false, // set to `true` to not display the route in the documentation

      // override consumes
      consumes: ['application/json'],
      // override default security
      security: ['basicAuth'],
    },
    responses: {
      openapi: {
        default: {
          description: 'Version number',
          content: {
            'application/json': {
              schema: {
                type: 'number',
                example: 2,
              },
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

// add router metadata
openapi.add(router.getMeta());

// get OpenAPI Object (json)
const doc = openapi.result();
```

## Postman

```ts
import { GenerateFoldersRule, Postman } from '@novice1/api-doc-generator';
import { PostmanJoiHelper } from '@novice1/api-doc-joi-helper';
import routing from '@novice1/routing';
import Joi from 'joi';

const postman = new Postman({ helperClass: PostmanJoiHelper });

postman
  .setName('api doc')
  .setHost('http://localhost:8000')
  .setConsumes(['multipart/form-data', 'application/json'])
  .setFolders([
    {
      name: 'default',
      description: 'A folder is just an ordered set of requests.',
      item: [],
    },
  ])
  .setGenerateFoldersRule(GenerateFoldersRule.siblings)
  .setResponsesProperty('postman')
  .setDefaultSecurity({
    type: 'basic',
    basic: [],
  });

const router = routing().get(
  {
    name: 'Main app',
    path: '/app',
    auth: true,
    tags: ['default'], // folders
    parameters: {
      query: {
        version: Joi.number().description('version number').min(1).max(3).default(2).example(2),
      },

      operationId: 'default-app',

      // override consumes
      consumes: ['application/json'],
      // override default security
      security: ['basic'],
    },
    responses: {
      postman: {
        // ...
      },
    },
  },
  function (req, res) {
    res.json(req.query.version);
  }
);

// add router metadata
postman.add(router.getMeta());

// get Postman Collection (json)
const doc = postman.result();
```

## Supported Joi features

### Types

The helpers handle the following `joi` types: `alternatives`, `any`, `array`, `boolean`, `date`, `function`, `number`, `object`, `string`, `binary`.

They also handle format methods like `Joi.string().email()`, `Joi.string().url()` and more.

### Formats

In some cases you might have to specify the format in `Joi.meta`. For example `Joi.string().meta({ format: 'password' })` or `Joi.date().meta({ format: 'datetime' })`.

Handled formats are:

| Category | Formats                                                                 |
| -------- | ----------------------------------------------------------------------- |
| Types    | `boolean`, `object`, `array`, `number`, `string`                        |
| Numbers  | `float`, `double`, `integer`, `int32`, `int64`                          |
| Dates    | `date`, `date-time`, `datetime`                                         |
| Strings  | `byte`, `binary`, `password`, `email`, `guid`, `uuid`, `uri`, `dataUri` |

### Joi.meta

You can configure multiple elements in `Joi.meta`, like a [reference](https://swagger.io/specification/#reference-object) to a component. For example:

```js
Joi.object()
  .keys({
    name: Joi.string().required(),
    petType: Joi.string().required(),
  })
  .meta({ ref: '#/components/schemas/Pet' });
```

If the reference is local (`#`), the component can be generated automatically depending on the rule you set (see `OpenAPI.setGenerateComponentsRule`).

Elements you can configure in `Joi.meta`:

- `additionalProperties`
- `allowReserved`
- `deprecated`
- `discriminator`
- `encoding`
- `examples`
- `explode`
- `format`
- `ref`
- `style`
- `xml`

The possible values for each of them are defined in the [OpenAPI Specification](https://swagger.io/specification/).

## References

- [@novice1/api-doc-generator](https://kisiwu.github.io/novice-api-doc-generator/latest/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Postman Collection Format v2.1.0](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html)
- [@novice1/routing](https://www.npmjs.com/package/@novice1/routing)
- [@novice1/validator-joi](https://www.npmjs.com/package/@novice1/validator-joi)
- [joi](https://www.npmjs.com/package/joi)
