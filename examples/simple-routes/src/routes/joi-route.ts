import { OpenAPI, Postman } from '@novice1/api-doc-generator';
import { OpenAPIJoiHelper, PostmanJoiHelper } from '@novice1/api-doc-joi-helper';
import routing from '@novice1/routing';
import { validatorJoi } from '@novice1/validator-joi';
import Joi from 'joi';

const openapi = new OpenAPI({
  helperClass: OpenAPIJoiHelper, // here
  helperSchemaProperty: 'schema',
});
const postman = new Postman({
  helperClass: PostmanJoiHelper, // here
  helperSchemaProperty: 'schema',
});

// create a router
const router = routing()
  .setValidators(validatorJoi({}, undefined, 'schema'))
  .get(
    {
      name: 'Main app',
      path: '/app',
      tags: ['default'],
      parameters: {
        schema: {
          query: {
            version: Joi.number().valid(1, 2, 3).description('version number').optional().default(2),
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
postman.add(router.getMeta());

// get OpenAPI Object (json)
export const joiDoc = {
  openapi: openapi.result(),
  postman: postman.result(),
};
