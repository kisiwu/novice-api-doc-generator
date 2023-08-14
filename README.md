# @novice1/api-doc-generator

Generate API documentation directly from application.

## Installation

```bash
$ npm install @novice1/api-doc-generator
```

## OpenAPI Specification

[Reference](https://kisiwu.github.io/novice-api-doc-generator/latest/modules/generators_openapi.html).

[OpenAPI Specification 3.0.3](https://spec.openapis.org/oas/v3.0.3).

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

[Reference](https://kisiwu.github.io/novice-api-doc-generator/latest/modules/generators_postman.html).

[Postman Collection Format v2.1.0](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html).

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

#### Types

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

#### Joi.meta

You can configure multiple elements in `Joi.meta` like a [reference](https://swagger.io/specification/#reference-object) to a component. For example:
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
  - [`OpenAPIHelperInterface`](https://kisiwu.github.io/novice-api-doc-generator/latest/interfaces/generators_openapi_helpers_interfaces.OpenAPIHelperInterface.html) (for `OpenAPI`)
  - or [`PostmanHelperInterface`](https://kisiwu.github.io/novice-api-doc-generator/latest/interfaces/generators_postman_helpers_interfaces.PostmanHelperInterface.html) (for `Postman`)
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

As the format differs between specifications, some classes can help you generate the documentation following multiple specifications. 

### Auth

Classes:
- [`ApiKeyUtil`](https://kisiwu.github.io/novice-api-doc-generator/latest/classes/utils_auth_apiKeyUtil.ApiKeyUtil.html)
- [`BasicAuthUtil`](https://kisiwu.github.io/novice-api-doc-generator/latest/classes/utils_auth_basicAuthUtil.BasicAuthUtil.html)
- [`BearerUtil`](https://kisiwu.github.io/novice-api-doc-generator/latest/classes/utils_auth_bearerUtil.BearerUtil.html)
- [`NoAuthUtil`](https://kisiwu.github.io/novice-api-doc-generator/latest/classes/utils_auth_noAuthUtil.NoAuthUtil.html)
- [`OAuth2Util`](https://kisiwu.github.io/novice-api-doc-generator/latest/classes/utils_auth_oAuth2Util.OAuth2Util.html)

Example:
```ts
import {
  OpenAPI,
  Postman,
  BearerUtil
} from '@novice1/api-doc-generator';
import routing from '@novice1/routing';

// security scheme
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

You can wrap the instance with a context to define a `scope` depending on the route. You do that with [`ContextAuthUtil`](https://kisiwu.github.io/novice-api-doc-generator/latest/classes/utils_auth_contextAuthUtils.ContextAuthUtil.html).

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

You can group security schemes at your convenience with [`GroupAuthUtil`](https://kisiwu.github.io/novice-api-doc-generator/latest/classes/utils_auth_groupAuthUtil.GroupAuthUtil.html) and [`GroupContextAuthUtil`](https://kisiwu.github.io/novice-api-doc-generator/latest/classes/utils_auth_contextAuthUtils.GroupContextAuthUtil.html).

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
- [`ResponseUtil`](https://kisiwu.github.io/novice-api-doc-generator/latest/classes/utils_responses_responseUtil.ResponseUtil.html)
- [`GroupResponseUtil`](https://kisiwu.github.io/novice-api-doc-generator/latest/classes/utils_responses_responseUtil.GroupResponseUtil.html)

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

You can wrap the instance with a context if you want to define `default`, `code`, `ref` and/or `links` depending on the route. You do that with [`ContextResponseUtil`](https://kisiwu.github.io/novice-api-doc-generator/latest/classes/utils_responses_contextResponseUtils.ContextResponseUtil.html).

Example:
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

- [@novice1/api-doc-generator](https://kisiwu.github.io/novice-api-doc-generator/latest/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Postman Collection Format v2.1.0](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html)
- [@novice1/routing](https://www.npmjs.com/package/@novice1/routing)
- [@novice1/validator-joi](https://www.npmjs.com/package/@novice1/validator-joi)
- [joi](https://www.npmjs.com/package/joi)