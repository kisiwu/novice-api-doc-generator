# @novice1/api-doc-joi-helper

Joi schemas helpers for `@novice1/api-doc-generator` enabling compatibility with `@novice1/validator-joi`.

## Installation

```bash
npm install @novice1/api-doc-joi-helper joi@^18.3.0"
```

## OpenAPI Specification

[Reference](https://kisiwu.github.io/novice-api-doc-generator/latest/modules/generators_openapi.html).

[OpenAPI Specification 3.1.0](https://spec.openapis.org/oas/v3.1.0).

Example:

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

## Postman Specification

[Reference](https://kisiwu.github.io/novice-api-doc-generator/latest/modules/generators_postman.html).

[Postman Collection Format v2.1.0](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).

Example:

```ts
import { GenerateFoldersRule, Postman } from '@novice1/api-doc-generator';
import { OpenAPIJoiHelper } from '@novice1/api-doc-joi-helper';
import routing from '@novice1/routing';
import Joi from 'joi';

const postman = new Postman({ helperClass: OpenAPIJoiHelper });

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

## Schema helpers

### Types

The default helper handles the following `joi` types: `alternatives`, `any`, `array`, `boolean`, `date` `function`, `number`, `object`, `string`, `binary`.

It also handles format methods like `Joi.string().email()`, `Joi.string().url()` and more.

In some cases you might have to precise the format in `Joi.meta`. For example `Joi.string().meta({format: 'password'})`, `Joi.date().meta({format: 'datetime'})` or more.

Handled formats are:

- `boolean`
- `object`
- `array`
- `number`
- `string`
- `date`
- `date-time`
- `datetime`
- `float`
- `double`
- `integer`
- `int32`
- `int64`
- `byte`
- `binary`
- `password`
- `email`
- `guid`
- `uuid`
- `uri`
- `dataUri`

### Joi.meta

You can configure multiple elements in `Joi.meta` like a [reference](https://swagger.io/specification/#reference-object) to a component. For example:

```js
Joi.object()
  .keys({
    name: Joi.string().required(),
    petType: Joi.string().required(),
  })
  .meta({ ref: '#/components/schemas/Pet' });
```

If the reference is local (`#`), it could automatically generate the component depending on the rule you set (see `OpenAPI.setGenerateComponentsRule`).

List of elements you can configure in `Joi.meta`:

- `additionalProperties`
- `allowReserved`
- `deprecated`
- `discriminator`
- `examples`
- `explode`
- `encoding`
- `format`
- `ref`
- `style`
- `xml`

The possible value for each of them is defined in the [OpenAPI Specification](https://swagger.io/specification/).

## References

- [@novice1/api-doc-generator](https://kisiwu.github.io/novice-api-doc-generator/latest/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Postman Collection Format v2.1.0](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html)
- [@novice1/routing](https://www.npmjs.com/package/@novice1/routing)
- [@novice1/validator-joi](https://www.npmjs.com/package/@novice1/validator-joi)
- [joi](https://www.npmjs.com/package/joi)
