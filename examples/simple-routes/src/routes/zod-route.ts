import { OpenAPI, Postman } from '@novice1/api-doc-generator';
import { OpenAPIZodHelper, PostmanZodHelper } from '@novice1/api-doc-zod-helper';
import routing from '@novice1/routing';
import { validatorZod } from '@novice1/validator-zod';
import { z } from 'zod';

const openapi = new OpenAPI({
  helperClass: OpenAPIZodHelper, // here
  helperSchemaProperty: 'schema',
});
const postman = new Postman({
  helperClass: PostmanZodHelper, // here
  helperSchemaProperty: 'schema',
});

// create a router
const router = routing()
  .setValidators(validatorZod({}, undefined, 'schema'))
  .get(
    {
      name: 'Main app',
      path: '/app',
      tags: ['default'],
      parameters: {
        schema: {
          query: {
            version: z
              .preprocess(
                (x) => Number(x),
                z
                  .enum({
                    one: 1,
                    two: 2,
                    three: 3,
                  })
                  .meta({
                    description: 'version number',
                  })
              )
              .optional()
              .default(2),
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
export const zodDoc = {
  openapi: openapi.result(),
  postman: postman.result(),
};
