import { OpenAPI, Postman } from '@novice1/api-doc-generator';
import { OpenAPIJsonHelper, PostmanJsonHelper } from '@novice1/api-doc-json-helper';
import routing from '@novice1/routing';
import Vine, { VineObject } from '@vinejs/vine';
import type { JSONSchema7 } from 'json-schema';

function hasToJSONSchema(value: unknown): value is { toJSONSchema: () => JSONSchema7 } {
  return !!(value && typeof value === 'object' && 'toJSONSchema' in value && typeof value.toJSONSchema === 'function');
}

class OpenAPIVineHelper extends OpenAPIJsonHelper {
  constructor(
    {
      value: schema,
    }: {
      value?: object | unknown;
      isRoot?: boolean;
    },
    isRequired?: boolean
  ) {
    let jsonSchema: JSONSchema7;
    if (hasToJSONSchema(schema)) {
      jsonSchema = schema.toJSONSchema();
    } else {
      jsonSchema = schema as JSONSchema7;
    }

    super({ value: jsonSchema }, isRequired);
  }
}

class PostmanVineHelper extends PostmanJsonHelper {
  constructor(
    {
      value: schema,
    }: {
      value?: object | unknown;
      isRoot?: boolean;
    },
    isRequired?: boolean
  ) {
    let jsonSchema: JSONSchema7;
    if (hasToJSONSchema(schema)) {
      jsonSchema = schema.toJSONSchema();
    } else {
      jsonSchema = schema as JSONSchema7;
    }

    super({ value: jsonSchema }, isRequired);
  }
}

const openapi = new OpenAPI({
  helperClass: OpenAPIVineHelper,
  helperSchemaProperty: 'schema',
});
const postman = new Postman({
  helperClass: PostmanVineHelper,
  helperSchemaProperty: 'schema',
});

const querySchema = Vine.object({
  version: Vine.enum([1, 2, 3]).meta({ description: 'version number', default: 2 }).optional(),
});

const validatorVine: routing.RequestHandler = async (req, res, next) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let schema: VineObject<any, any, any, any> | undefined = undefined;
  if (req.meta.parameters?.schema) {
    const tmpSchema = req.meta.parameters.schema;
    if (tmpSchema instanceof VineObject) {
      schema = tmpSchema;
    } else {
      schema = Vine.object(tmpSchema);
    }
  }
  if (!schema) {
    return next();
  }

  try {
    const result = await Vine.validate({
      schema,
      data: {
        query: req.query,
        body: req.body,
        params: req.params,
        headers: req.headers,
        cookies: req.cookies,
        files: (req as { files?: unknown }).files,
      },
    });
    req.validated = () => result;
  } catch (err) {
    return res.status(400).json({ error: err });
  }

  next();
};

// create a router
export const router = routing()
  .setValidators(validatorVine)
  .get(
    {
      name: 'Main app',
      path: '/app',
      tags: ['default'],
      parameters: {
        schema: {
          query: querySchema,
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
export const vineDoc = {
  openapi: openapi.result(),
  postman: postman.result(),
};
