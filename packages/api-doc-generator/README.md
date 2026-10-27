# @novice1/api-doc-generator

Generate API documentation directly from application.

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [OpenAPI](#openapi)
- [Postman](#postman)
- [Schema helpers](#schema-helpers)
  - [Default helper (`json`)](#default-helper-json)
  - [Custom helper](#custom-helper)
- [Utils](#utils)
  - [Auth](#auth)
  - [Responses](#responses)
- [References](#references)

## Installation

```bash
npm install @novice1/api-doc-generator
```

## Usage

Two generators are available:

| Generator | Specification                                                                                                  | Reference                                                                                       |
| --------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `OpenAPI` | [OpenAPI Specification 3.1.0](https://spec.openapis.org/oas/v3.1.0)                                            | [API](https://kisiwu.github.io/novice-api-doc-generator/latest/modules/generators_openapi.html) |
| `Postman` | [Postman Collection Format v2.1.0](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html) | [API](https://kisiwu.github.io/novice-api-doc-generator/latest/modules/generators_postman.html) |

Both follow the same steps:

1. Create and configure the generator.
2. Add the metadata of your routes with `add(router.getMeta())`.
3. Get the documentation with `result()`.

## OpenAPI

By default it handles `json` schemas (see [Schema helpers](#schema-helpers)).

```ts
import { GenerateComponentsRule, OpenAPI } from '@novice1/api-doc-generator';
import routing from '@novice1/routing';

const openapi = new OpenAPI({ helperSchemaProperty: 'schema' }); // the config is optional but recommended for handling schemas correctly

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
              examples: ['2'],
              nullable: true,
            },
          },
        },
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
    res.json(
      typeof req.query.version === 'string' && !isNaN(Number(req.query.version)) ? parseInt(req.query.version) : 2
    );
  }
);

// add router metadata
openapi.add(router.getMeta());

// get OpenAPI Object (json)
const doc = openapi.result();
```

## Postman

By default it handles `json` schemas (see [Schema helpers](#schema-helpers)).

```ts
import { GenerateFoldersRule, Postman } from '@novice1/api-doc-generator';
import routing from '@novice1/routing';

const postman = new Postman({ helperSchemaProperty: 'schema' });

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
              examples: ['2'],
              nullable: true,
            },
          },
        },
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

The generator uses a helper to process the schemas provided in the API documentation.
The properties evaluated by the helper include `params`, `query`, `body`, `files`, `headers`, and `cookies` parameters.

### Default helper (`json`)

By default, the generator provides a helper for handling `json` schemas.

The `helperSchemaProperty` configuration allows the generator to correctly interpret and handle JSON schemas within the documentation. The value should match the property name used in your route definitions to define the schema, which in the examples above is `schema`. If it is not configured, by default the generator will read the schema from the `parameters` property directly.

### Custom helper

You can create your own helper to handle another schema than `json`.
The helper

- needs to be a class that implements
  - [`OpenAPIHelperInterface`](https://kisiwu.github.io/novice-api-doc-generator/latest/interfaces/generators_openapi_helpers_interfaces.OpenAPIHelperInterface.html) (for `OpenAPI`)
  - or [`PostmanHelperInterface`](https://kisiwu.github.io/novice-api-doc-generator/latest/interfaces/generators_postman_helpers_interfaces.PostmanHelperInterface.html) (for `Postman`)
- should be given to the generator's constructor.

Example:

```ts
import { CustomOpenAPIHelperClass, CustomPostmanHelperClass } from './custom';
import { OpenAPI, Postman } from '@novice1/api-doc-generator';

const openapi = new OpenAPI({ helperClass: CustomOpenAPIHelperClass });

const postman = new Postman({ helperClass: CustomPostmanHelperClass });
```

## Utils

As the format differs between specifications, some classes can help you generate the documentation following multiple specifications.

- [Auth](#auth): security schemes and requirements
- [Responses](#responses): reusable responses

### Auth

Classes:

- [`ApiKeyUtil`](https://kisiwu.github.io/novice-api-doc-generator/latest/classes/utils_auth_apiKeyUtil.ApiKeyUtil.html)
- [`BasicAuthUtil`](https://kisiwu.github.io/novice-api-doc-generator/latest/classes/utils_auth_basicAuthUtil.BasicAuthUtil.html)
- [`BearerUtil`](https://kisiwu.github.io/novice-api-doc-generator/latest/classes/utils_auth_bearerUtil.BearerUtil.html)
- [`NoAuthUtil`](https://kisiwu.github.io/novice-api-doc-generator/latest/classes/utils_auth_noAuthUtil.NoAuthUtil.html)
- [`OAuth2Util`](https://kisiwu.github.io/novice-api-doc-generator/latest/classes/utils_auth_oAuth2Util.OAuth2Util.html)

Example:

```ts
import { OpenAPI, Postman, BearerUtil } from '@novice1/api-doc-generator';
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
const router = routing().get(
  {
    path: '/something',
    auth: true,
    parameters: {
      // add security requirements for this route
      security: bearerAuth,
    },
  },
  function (req, res) {
    // ...
  }
);
```

#### Auth context

You can wrap the instance with a context to define a `scope` depending on the route. You do that with [`ContextAuthUtil`](https://kisiwu.github.io/novice-api-doc-generator/latest/classes/utils_auth_contextAuthUtils.ContextAuthUtil.html).

Example:

```ts
import { OpenAPI, Postman, ContextAuthUtil, OAuth2Util, GrantType } from '@novice1/api-doc-generator';
import routing from '@novice1/routing';

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
    'search:read': 'Search messages, files, and so on',
  });

// add it to OpenAPI security schemes
const openapi = new OpenAPI();
openapi.addSecuritySchemes(oauth2);

// add it to Postman global authentication
const postman = new Postman();
postman.setAuth(oauth2);

// router
const router = routing().get(
  {
    path: '/messages',
    auth: true,
    parameters: {
      // add security requirements for this route
      security: new ContextAuthUtil(
        oauth2,
        // OAuth2 scopes for this route
        ['im:read']
      ),
    },
  },
  function (req, res) {
    // ...
  }
);
```

#### Auth group

You can group security schemes at your convenience with [`GroupAuthUtil`](https://kisiwu.github.io/novice-api-doc-generator/latest/classes/utils_auth_groupAuthUtil.GroupAuthUtil.html) and [`GroupContextAuthUtil`](https://kisiwu.github.io/novice-api-doc-generator/latest/classes/utils_auth_contextAuthUtils.GroupContextAuthUtil.html).

Example:

```ts
import {
  OpenAPI,
  Postman,
  BasicAuthUtil,
  BearerUtil,
  GroupAuthUtil,
  GroupContextAuthUtil,
} from '@novice1/api-doc-generator';

const basicAuth = new BasicAuthUtil('basicAuthName');
const bearerAuth = new BearerUtil('bearerName');

const groupAuth = new GroupAuthUtil([basicAuth, bearerAuth]);

// add it to OpenAPI security schemes
const openapi = new OpenAPI();
openapi.addSecuritySchemes(groupAuth);

// add it to Postman global authentication
const postman = new Postman();
postman.setAuth(groupAuth);

const router = routing().get(
  {
    path: '/something',
    auth: true,
    parameters: {
      // add security requirements for this route
      security: new GroupContextAuthUtil([basicAuth, bearerAuth]),
    },
  },
  function (req, res) {
    // ...
  }
);
```

### Responses

Classes:

- [`ResponseUtil`](https://kisiwu.github.io/novice-api-doc-generator/latest/classes/utils_responses_responseUtil.ResponseUtil.html)
- [`GroupResponseUtil`](https://kisiwu.github.io/novice-api-doc-generator/latest/classes/utils_responses_responseUtil.GroupResponseUtil.html)

Example:

```ts
import { ResponseUtil, GroupResponseUtil } from '@novice1/api-doc-generator';

const generalError = new ResponseUtil('GeneralError');
generalError
  .setDescription('General Error')
  .addMediaType('application/json', {
    schema: {
      $ref: '#/components/schemas/GeneralError',
    },
  })
  .setCode(500);

const illegalInput = new ResponseUtil('IllegalInput');
illegalInput.setDescription('Illegal input for operation.').setCode(400);

const responses = new GroupResponseUtil([generalError, illegalInput]);

openapi.setResponses(responses);
// or
openapi.addResponse(responses);
// or
openapi.addResponse(generalError).addResponse(illegalInput);

// router
const router = routing().post(
  {
    path: '/something',
    auth: true,
    parameters: {
      schema: {
        body: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'object',
          properties: {
            something: {
              type: 'string',
              maxLength: 14,
            },
          },
        },
      },
      responses,
    },
  },
  function (req, res) {
    // ...
  }
);
```

#### Responses context

You can wrap the instance with a context if you want to define `default`, `code`, `ref` and/or `links` depending on the route. You do that with [`ContextResponseUtil`](https://kisiwu.github.io/novice-api-doc-generator/latest/classes/utils_responses_contextResponseUtils.ContextResponseUtil.html).

Example:

```ts
const generalError = new ResponseUtil('GeneralError');
generalError.setDescription('General Error').addMediaType('application/json', {
  schema: {
    $ref: '#/components/schemas/GeneralError',
  },
});

const illegalInput = new ResponseUtil('IllegalInput');
illegalInput.setDescription('Illegal input for operation.');

// router
const router = routing().get(
  {
    path: '/something',
    auth: true,
    parameters: {
      responses: new GroupResponseUtil([
        new ContextResponseUtil(generalError).setCode(500).setDefault(),
        new ContextResponseUtil(illegalInput).setCode(400),
      ]),
    },
  },
  function (req, res) {
    // ...
  }
);
```

## References

- [@novice1/api-doc-generator](https://kisiwu.github.io/novice-api-doc-generator/latest/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Postman Collection Format v2.1.0](https://schema.postman.com/collection/json/v2.1.0/draft-07/docs/index.html)
- [@novice1/routing](https://www.npmjs.com/package/@novice1/routing)
