# @novice1/api-doc-generator

Generate API documentation directly from application.

## Installation

```bash
$ npm install @novice1/api-doc-generator
```

## OpenAPI Specification

[Reference](https://novice1.000webhostapp.com/api-doc-generator/modules/generators_openapi.html).

### Default

By default it handles `joi` schemas.

Example:
```ts
import { 
  GenerateComponentsRule, 
  OpenAPI 
} from '@novice1/api-doc-generator';
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
    auth: true,
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

## Postman Specification

[Reference](https://novice1.000webhostapp.com/api-doc-generator/modules/generators_postman.html).

### Default

By default it handles `joi` schemas.

Example:
```ts
import { 
  GenerateFoldersRule, 
  Postman 
} from '@novice1/api-doc-generator';
import routing from '@novice1/routing';
import Joi from 'joi';

const postman = new Postman();

postman
      .setName('api doc')
      .setHost('http://localhost:8000')
      .setConsumes(['multipart/form-data', 'application/json'])
      .setFolders([
        {
          name: 'default',
          description: 'A folder is just an ordered set of requests.',
          item: [],
        }
      ])
      .setGenerateFoldersRule(GenerateFoldersRule.siblings)
      .setResponsesProperty('postman')
      .setDefaultSecurity({
        type: 'basic',
        basic: []
      });

const router = routing()
  .get({
    name: 'Main app',
    path: '/app',
    auth: true,
    tags: ['default'], // folders
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

      // override consumes
      consumes: ['application/json'],
      // override default security
      security: ['basic'],
    },
    responses: {
      postman: {
        // ...
      }
    }
  }, function (req, res) {
    res.json(req.query.version)
  });

// add router metadata
postman.add(router.getMeta());

// get Postman Collection (json)
const doc = postman.result();
```

## Schema helpers

### Default helper

The `joi` types it can handle are: *alternatives*, *any*, *array*, *boolean*, *date* *function*, *number*, *object*, *string*, *binary*.

It also handles format methods like `Joi.string().email()`, `Joi.string().url()` and more.

#### Joi.meta

In some cases you might have to precise the format in `Joi.meta`. For example `Joi.string().meta({format: 'password'})`, `Joi.date().meta({format: 'datetime'})` or more.

Valid values for `format` are:
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

### Custom helper

You can create your own helper to handle another schema than `joi`.
The helper 
- needs to be a class that implements 
  - `OpenAPIHelperInterface` (for `OpenAPI`)
  - or `PostmanHelperInterface` (for `Postman`)
- should be given to the generator's constructor.

Example:
```ts
import { OpenAPI, Postman } from '@novice1/api-doc-generator';
import { 
  CustomOpenAPIHelperClass,
  CustomPostmanHelperClass
} from './custom';

const openapi = new OpenAPI(CustomOpenAPIHelperClass);

const postman = new Postman(CustomPostmanHelperClass);
```

## Utils

As the documentation format differs between specifications, there are classes you can use in case you need to generate the documentation following multiple specifications. 

### Auth

Classes:
- `ApiKeyUtil`
- `BasicAuthUtil`
- `BearerUtil`
- `NoAuthUtil`
- `OAuth2Util`

Example:
```ts
import {
  OpenAPI,
  Postman,
  BearerUtil
} from '@novice1/api-doc-generator';
import routing from '@novice1/routing';

const bearerAuth = new BearerUtil('bearerName');

// add it to OpenAPI security schemes
const openapi = new OpenAPI();
openapi.addSecuritySchemes(bearerAuth);

// add it to Postman global authentication
const postman = new Postman();
postman.setAuth(bearerAuth);

// router
const router = routing()
  .get({
    path: '/something',
    auth: true,
    parameters: {
      // add security requirements for this route
      security: bearerAuth
    }
  }, function (req, res) {
    // ...
  });
```

#### Context

You can wrap the instance with a context to define some properties (e.g.: `scope`) depending on the route. You do that with `ContextAuthUtil`.

Example:
```ts
import routing from '@novice1/routing';
import {
  OpenAPI, 
  Postman,
  ContextAuthUtil,
  OAuth2Util,
  GrantType
} from '@novice1/api-doc-generator';

// OAuth2 specifications
const oauth2 = new OAuth2Util('oAuth2AuthCode');
oauth2
  .setDescription('For more information, see https://api.slack.com/docs/oauth')
  .setGrantType(GrantType.authorizationCode)
  .setAuthUrl('https://slack.com/oauth/authorize')
  .setAccessTokenUrl('https://slack.com/api/oauth.access')
  .setScopes({
    'users:read': 'Read user information',
    'users:write': 'Modify user information',
    'im:read': 'Read messages',
    'im:write': 'Write messages',
    'im:history': 'Access the message archive',
    'search:read': 'Search messages, files, and so on'
  });
 
// add it to OpenAPI security schemes
const openapi = new OpenAPI();
openapi.addSecuritySchemes(oauth2);

// add it to Postman global authentication
const postman = new Postman();
postman.setAuth(oauth2);

// router
const router = routing()
  .get({
    path: '/messages',
    auth: true,
    parameters: {
      // add security requirements for this route
      security: new ContextAuthUtil(
        oauth2,
        // OAuth2 scopes for this route
        ['im:read']
      )
    }
  }, function (req, res) {
    // ...
  });
```

#### Group

You can group security schemes at your convenience with `GroupAuthUtil` and `GroupContextAuthUtil`.

Exemple:
```ts
import {
  OpenAPI,
  Postman,
  BasicAuthUtil,
  BearerUtil,
  GroupAuthUtil,
  GroupContextAuthUtil
} from '@novice1/api-doc-generator';

const basicAuth = new BasicAuthUtil('basicAuthName');
const bearerAuth = new BearerUtil('bearerName');

const groupAuth = new GroupAuthUtil([
  basicAuth,
  bearerAuth
]);

// add it to OpenAPI security schemes
const openapi = new OpenAPI();
openapi.addSecuritySchemes(groupAuth);

// add it to Postman global authentication
const postman = new Postman();
postman.setAuth(groupAuth);

const router = routing()
  .get({
    path: '/something',
    auth: true,
    parameters: {
      // add security requirements for this route
      security: new GroupContextAuthUtil([
        basicAuth,
        bearerAuth,
      ])
    }
  }, function (req, res) {
    // ...
  });
```

### Responses

Classes:
- `ResponseUtil`
- `GroupResponseUtil`

Example:
```ts
import {
  ResponseUtil,
  GroupResponseUtil
} from '@novice1/api-doc-generator';

const generalError = new ResponseUtil('GeneralError');
generalError
  .setDescription('General Error')
  .addMediaType('application/json', {
    schema: {
      $ref: '#/components/schemas/GeneralError'
    }
  })
  .setCode(500);

const illegalInput = new ResponseUtil('IllegalInput');
illegalInput
  .setDescription('Illegal input for operation.')
  .setCode(400);

const responses = new GroupResponseUtil([
  generalError,
  illegalInput
]);

openapi.setResponses(responses);
// or 
openapi.addResponse(responses);
// or
openapi
  .addResponse(generalError)
  .addResponse(illegalInput);

// router
const router = routing()
  .post({
    path: '/something',
    auth: true,
    parameters: {
      body: {
        something: Joi.string().max(14)
      },
      responses
    }
  }, function (req, res) {
    // ...
  });
```

#### Context

You can wrap the instance with a context if you want to define `default`, `code`, `ref` and/or `links` differently depending on the route. You do that with `ContextResponseUtil`.

```ts
const generalError = new ResponseUtil('GeneralError');
generalError
  .setDescription('General Error')
  .addMediaType('application/json', {
    schema: {
      $ref: '#/components/schemas/GeneralError'
    }
  });

const illegalInput = new ResponseUtil('IllegalInput');
illegalInput
  .setDescription('Illegal input for operation.');

// router
const router = routing()
  .get({
    path: '/something',
    auth: true,
    parameters: {
      responses: new GroupResponseUtil([
        (new ContextResponseUtil(generalError))
          .setCode(500).setDefault(),
        (new ContextResponseUtil(illegalInput))
          .setCode(400)
      ])
    }
  }, function (req, res) {
    // ...
  });
```

## References

- [@novice1/api-doc-generator documentation](https://novice1.000webhostapp.com/api-doc-generator/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Postman Collection Format v2.1.0](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html)
- [@novice1/routing](https://www.npmjs.com/package/@novice1/routing)
- [@novice1/validator-joi](https://www.npmjs.com/package/@novice1/validator-joi)
- [joi](https://www.npmjs.com/package/joi)