# @novice1/api-doc-json-helper

JSON schemas helpers for `@novice1/api-doc-generator` enabling compatibility with `@novice1/validator-json`.

## Installation

```bash
npm install @novice1/api-doc-json-helper
```

## OpenAPI Specification

```ts
import { 
  OpenAPI 
} from '@novice1/api-doc-generator';
import { 
    OpenAPIJsonHelper 
} from '@novice1/api-doc-json-helper';
import routing from '@novice1/routing';

const openapi = new OpenAPI({ helperClass: OpenAPIJsonHelper });

const router = routing()
  .get({
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
                    enum: ['1','2','3'],
                    default: '2',
                    nullable: true
                }
            }
        }
    }
}, function (req, res) {
    res.json(req.query.version)
});

// ...
```

### Recommended

It's [recommended](https://github.com/kisiwu/novice-validator-json?tab=readme-ov-file#best-practices) to keep your schemas isolated from other properties of `parameters`.

```ts
import { 
  OpenAPI 
} from '@novice1/api-doc-generator';
import { 
    OpenAPIJsonHelper 
} from '@novice1/api-doc-json-helper';
import routing from '@novice1/routing';

const openapi = new OpenAPI({ 
    helperClass: OpenAPIJsonHelper, 
    helperSchemaProperty: 'schema' // recommended 
});

const router = routing()
  .get({
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
                        enum: ['1','2','3'],
                        default: '2',
                        nullable: true
                    }
                }
            }
        }
    }
}, function (req, res) {
    res.json(req.query.version)
});

// ...
```

## Postman Specification

```ts
import { 
  Postman 
} from '@novice1/api-doc-generator';
import { 
    PostmanJsonHelper 
} from '@novice1/api-doc-json-helper';
import routing from '@novice1/routing';

const postman = new Postman({ 
    helperClass: PostmanJsonHelper, 
    helperSchemaProperty: 'schema' 
});

const router = routing()
  .get({
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
                        enum: ['1','2','3'],
                        default: '2',
                        nullable: true
                    }
                }
            }
        }

    }
}, function (req, res) {
    res.json(req.query.version)
});

// ...
```

## References

- [@novice1/api-doc-generator](https://kisiwu.github.io/novice-api-doc-generator/latest/)
- [@novice1/validator-json](https://kisiwu.github.io/novice-validator-json/latest/)