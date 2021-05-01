# @novice1/api-doc-generator

Quickly generate API Documentation.

## Installation

```bash
$ npm install @novice1/api-doc-generator
```

## OpenAPI

[Module openapi documentation](https://novice1.000webhostapp.com/api-doc-generator/modules/openapi.html).

### Default

By default it understands `joi` schemas.

Example:
```ts
import { OpenAPI } from '@novice1/api-doc-generator';
import { GenerateComponentsRule } from '@novice1/api-doc-generator/generators/openapi';
import routing from '@novice1/routing';
import Joi from 'joi';

const openapi = new OpenAPI();

openapi
  .setTitle('api doc')
  .setHost('http://localhost:8000')
  .setConsumes(['application/json'])
  .setTags([
    {
      name: 'default',
      externalDocs: { description: 'Find more info here', url: 'https://swagger.io/specification/' }
    }
  ])
  .setGenerateComponentsRule(GenerateComponentsRule.ifUndefined)
  .setResponsesProperty('openapi')
  .setSecuritySchemes({
    basicAuth: {
      type: 'http',
      scheme: 'basic',
    }
  })
  .setDefaultSecurity([
    {
      basicAuth: []
    }
  ]);

const router = routing()
  .get({
    name: 'Main app',
    path: '/app',
    auth: false,
    tags: ['default'],
    parameters: {
      query: {
        version: Joi.number()
          .description('version number')
          .min(1)
          .max(3)
          .default(2)
          .example(2)
      },

      operationId: 'default-app',
      undoc: false, // set to `true` to not display the route in the documentation

      // overwite
      consumes: ['application/json'],
      security: [],
    },
    responses: {
      openapi: {
        default: {
          description: 'Version number',
          content: {
            'application/json': {
              schema: {
                type: 'number',
                example: 2
              }
            }
          }
        }
      }
    }
  }, function (req, res) {
    res.json(req.query.version)
  });

// add router metadata
openapi.add(router.getMeta());

// get OpenAPI Object (json)
const doc = openapi.result();
```

The `joi` types it can handle are: *alternatives*, *any*, *array*, *boolean*, *date* *function*, *number*, *object*, *string*, *binary*.

It also handles format methods like `Joi.string().email()`, `Joi.string().url()` and more.

#### Joi.meta

In some cases you might have to precise the format in `Joi.meta`. For example `Joi.string().meta({format: 'password'})`, `Joi.date().meta({format: 'datetime'})` or more.

You can also define a [reference](https://swagger.io/specification/#reference-object). For example:
```js
Joi.object()
  .keys({
    name: Joi.string().required(),
    petType: Joi.string().required()
  })
  .meta({ ref: '#/components/schemas/Pet' })
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

- [@novice1/api-doc-generator documentation](https://novice1.000webhostapp.com/api-doc-generator/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [@novice1/routing](https://www.npmjs.com/package/@novice1/routing)
- [@novice1/validator-joi](https://www.npmjs.com/package/@novice1/validator-joi)
- [joi](https://www.npmjs.com/package/joi)