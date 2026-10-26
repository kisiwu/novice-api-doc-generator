import { OpenAPI, Postman } from '@novice1/api-doc-generator';
import routing from '@novice1/routing';

const openapi = new OpenAPI({
  helperSchemaProperty: 'schema', // recommended
});
const postman = new Postman({
  helperSchemaProperty: 'schema',
});

export const router = routing().get(
  {
    name: 'Main app',
    path: '/app',
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
    res.json(
      typeof req.query.version === 'string' && !isNaN(Number(req.query.version)) ? parseInt(req.query.version) : 2
    );
  }
);

// add router metadata
openapi.add(router.getMeta());
postman.add(router.getMeta());

// get OpenAPI Object (json)
export const jsonDoc = {
  openapi: openapi.result(),
  postman: postman.result(),
};
