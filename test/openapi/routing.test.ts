//import fs from 'fs';
import routing from '@novice1/routing';
import { GenerateComponentsRule, OpenAPI } from '../../src';
import Joi from 'joi';

import {
  /*apiKeyAuth,
  bearerAuth,*/
  GroupCtxtAuth,
  GroupCtxtResponse,
  simpleResponse,
  GroupAuth
} from '../testutils';

describe('api doc', function () {
  const { logger } = this.ctx.kaukau;

  it('oas doc', () => {
    // generator
    const openapi = new OpenAPI();
    openapi
      .setTitle('api doc')
      .setHost('http://test.kaukau.tst')
      .setConsumes(['multipart/form-data', 'application/json'])
      //.setProduces(['application/json', 'text/html', 'text/plain'])
      .setTags([
        {
          name: 'Test',
          description: 'Testing purpose',
          externalDocs: { description: 'Find more info here', url: 'https://swagger.io/specification/' }
        }
      ]).setGenerateComponentsRule(GenerateComponentsRule.ifUndefined)
      .setSecuritySchemes(GroupAuth);
      //.setResponsesProperty('openapi');

    openapi.addRequestBody('AppBody', {
       required: true,
       content: {
        'multipart/form-data': {
         schema: {
          $ref: '#/components/schemas/Mikamika'
         }
        },
        'application/json': {
         schema: {
          $ref: '#/components/schemas/Mikamika'
         }
        }
       },
       description: 'Jojo vs DIO'
      });

    //openapi.addExample('Versions', {value: [8, 9]})
    openapi.addExample('simple-lang-example',{
      summary: 'lang example',
      value: 'fr'
    }).addExample('lang-country-example', {
      summary: 'lang country example',
      value: 'fr_BE'
    });

    // add components/response
    openapi.addResponse(simpleResponse);

    /*
    // add components/schema
    openapi.addSchema('Coule', {
      type: 'array',
      example: [
        'well',
        'livin'
      ],
      items: {
        type: 'string'
      }
     });
     */

    // router
    const router = routing().post({
      name: 'Test app',
      description: 'testing purpose',
      tags: ['Test'],
      // set parameters
      /*
      parameters: {
        headers: {
          token: Joi.array()
            .items(Joi.number())
            .description('token to be passed as a header')
            .required()
            .example([128, 256])
        },
        body: Joi.object().keys({
          id: Joi.number().integer().required().example(6),
          custom: Joi.object().keys({
            lava: Joi.string().description('thunder').required().example('ewf'),
            lamp: Joi.binary().description('cat')
          }).description('shark'),
          email: Joi.string().email().required(),
          password: Joi.string().meta({format: 'password'}).example('pass'),
          timestamp: Joi.date().meta({format: 'datetime'}).min(new Date(0)),
          versions: Joi.array().items(
            Joi.number()
            .description('version number').example(4).positive()
          ).meta({
            allowReserved: false,
            explode: true,
            encoding: {
              headers: {
                'X-Rate-Limit-Limit': {
                  description: 'The number of allowed requests in the current period',
                  schema: {
                    type: 'integer'
                  }
                }
              }
            },
            deprecated: true,
            style: 'form'
          }).example([7])
          .max(2)
          .description('version numbers')
          .single()
          .unique()
        }).description('anything description').meta({
          additionalProperties: {
            type: 'number'
          },
          ref: '#/components/schemas/Mikamika'
        })
        .max(6).unknown(true),
        files: Joi.object()
        .keys({
          file: Joi.array()
            .items(
              Joi.object()
                .keys({
                  mimetype: Joi.string()
                    .required(),
                })
                .options({ stripUnknown: false, allowUnknown: true })
            )
            .length(1)
            .description('File to upload')
            .required(),
        })
        .required(),
      },*/
      parameters: Joi.object({
        query: Joi.object().keys({
          obj: Joi.object()
            .keys({
              ele: Joi.string().example('slow flow').required(),
              customPlus: Joi.object().keys({
                id: Joi.number().integer().required().example(6),
                custom: Joi.object().keys({
                  lava: Joi.string().description('thunder').required().example('ewf'),
                  lamp: Joi.binary().description('cat')
                }).description('shark'),
                email: Joi.string().email().required(),
                password: Joi.string().meta({format: 'password'}).example('pass'),
                timestamp: Joi.date().meta({format: 'datetime'}).min(new Date(0)),
              }).meta({
                ref: '#/components/schemas/CustomPlus'
              }),
              tokenTwo: Joi.array()
              .items(Joi.number())
              .description('token to be passed as a header')
              .example([128, 256])
              .meta({
                ref: '#/components/schemas/RandomTokenCooks'
              })
            })
            .description('obj')
            .meta({
              //ref: '#/components/schemas/Couwery'
              ref: '#/components/parameters/Couwery'
            })
        }),
        cookies: {
          token: Joi.array()
            .items(Joi.number())
            .description('token to be passed as a header')
            .required()
            .example([128, 256])
            .meta({
              ref: '#/components/schemas/RandomTokenCooks'
            })
        },
        body: Joi.object().keys({
          id: Joi.number().integer().required().example(6),
          custom: Joi.object().keys({
            lava: Joi.string().description('thunder').required().example('ewf'),
            lamp: Joi.binary().description('cat')
          }).description('shark'),
          email: Joi.string().email().required(),
          password: Joi.string().meta({format: 'password'}).example('pass'),
          timestamp: Joi.date().meta({format: 'datetime'}).min(new Date(0)),
          versions: Joi.array().items(
            Joi.number()
            .description('version number').example(4).positive()
          ).meta({
            ref: '#/components/schemas/Versions',
            allowReserved: false,
            explode: true,
            encoding: {
              headers: {
                'X-Rate-Limit-Limit': {
                  description: 'The number of allowed requests in the current period',
                  schema: {
                    type: 'integer'
                  }
                }
              }
            },
            deprecated: true,
            style: 'form'
          }).example([8,9])
          //.example({$ref: '#/components/examples/Versions'})
          .max(2)
          .description('version numbers')
          .single()
          .unique()
        }).description('anything description').meta({
          additionalProperties: {
            type: 'number'
          },
          ref: '#/components/schemas/Mikamika'
        })
        .max(10).unknown(true),
        files: Joi.object()
        .keys({
          file: Joi.array()
            .items(
              Joi.object()
                .keys({
                  mimetype: Joi.string()
                    .required(),
                })
                .options({ stripUnknown: false, allowUnknown: true })
            )
            .length(1)
            .description('File to upload')
            .required(),
        })
        .required(),
      }).description('Damn my G').meta({
        ref: '#/components/requestBodies/AppBody'
      }),
      path: '/app',
      responses: GroupCtxtResponse
      /*
      responses: {
        openapi: {
          default: {
            description: 'A simple string response',
            content: {
              'text/plain': {
                schema: {
                  type: 'string',
                  example: 'whoa!'
                }
              }
            },
            headers: {
              'X-Rate-Limit-Limit': {
                description: 'The number of allowed requests in the current period',
                schema: {
                  type: 'integer'
                }
              },
              'X-Rate-Limit-Remaining': {
                description: 'The number of remaining requests in the current period',
                schema: {
                  type: 'integer'
                }
              },
              'X-Rate-Limit-Reset': {
                description: 'The number of seconds left in the current period',
                schema: {
                  type: 'integer'
                }
              }
            }
          }
        }
      }
      */
    }, function (req: { meta: unknown }, res: { json(arg: unknown): void }) {
      res.json(req.meta)
    })
    .post({
      name: 'Test alternatives',
      description: 'testing purpose... again',
      tags: ['Test'],
      parameters: {
        story: `## Test alt
We are just testing stuff like
\`\`\`js
const test = new Test();
test.run();
\`\`\`
1. Instanciate test
2. Run test
3. **Go go go!**
`,        
        query: Joi.object({
          lang: Joi.string().example('en').meta({
            examples: {
              'simple-lang': {
                $ref: '#/components/examples/simple-lang-example'
              },
              'lang-country': {
                $ref: '#/components/examples/lang-country-example'
              }
            }
          })
        }),
        body: Joi.alternatives().try(
          Joi.object().keys({
            type: Joi.string()//.valid('sheep').required()
            .description('type of animal'),
            size: Joi.number().positive().unit('cm')
          }).description('Sheep')
          .meta({
            ref: '#/components/schemas/Sheep'
          }),
          Joi.object().keys({
            type: Joi.string()//.valid('dog').required()
            .description('type of animal'),
            size: Joi.number().positive().unit('cm')
          }).description('Dog')
          .meta({
            ref: '#/components/schemas/Dog'
          })
        ).required()
        .description('Animal')
        .meta({
          ref: '#/components/schemas/Wanimal',
          discriminator: {
            propertyName: 'type',
            mapping: {
              dog: '#/components/schemas/Dog',
              sheep: '#/components/schemas/Sheep'
            }
          }
        }),
        consumes: 'application/json',
      },
      path: '/app/alternatives',
    }, function (req: { meta: unknown }, res: { json(arg: unknown): void }) {
      res.json(req.meta)
    })
    .post({
      name: 'Test xml',
      description: 'testing purpose... again',
      tags: ['Test'],
      parameters: {
        body: Joi.object()
          .keys({
            id: Joi.number()
            .meta({
              format: 'int32',
              /*xml: {
                attribute: true
              }*/
            }),
            name: Joi.string()
            .meta({
              xml: {
                namespace: 'http://example.com/schema/sample',
                prefix: 'sample'
              }
            }),
            animals: Joi.array()
              .items(Joi.string().meta({
                xml: {
                  name: 'animal'
                }
              }))
          }).required()
          .meta({
            ref: '#/components/schemas/Person',
            xml: {
              name: 'element'
            },
            encoding: {
              profileImage: {
                contentType: 'application/xml',
                headers: {
                  'X-Rate-Limit-Limit': {
                    description: 'The number of allowed requests in the current period',
                    schema: {
                      type: 'integer'
                    }
                  }
                }
              }
            }
          }),
        consumes: 'application/xml',
        security: GroupCtxtAuth,
      },
      path: '/app/xml',
      auth: true
    }, function (req: { meta: unknown }, res: { json(arg: unknown): void }) {
      res.json(req.meta)
    });

    // add router
    openapi.add(router.getMeta());

    // remove unused definitions
    logger.log(openapi.cleanupComponents());

    // generate result
    const result = openapi.result();

    logger.silly('openapi:', result.openapi);

    // uncomment to test locally
    /*
    const wStream = fs.createWriteStream('private/result2.json', { flags: 'w+' });
    wStream.write(JSON.stringify(result, null, ' '), (err: unknown) => {
      if (err) {
        logger.error(err);
      }
      wStream.close();
    });
    */

    //logger.silly(openapi.remove('/app', 'post'));
  });
});