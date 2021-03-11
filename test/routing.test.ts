//import fs from 'fs';
import routing from '@novice1/routing';
import { OpenApi } from '../src';
import Joi from 'joi';

describe('api doc', function () {
  const { logger } = this.ctx.kaukau;

  it('oas doc', () => {
    // generator
    const openapi = new OpenApi();
    openapi
      .setTitle('api doc')
      .setHost('http://test.kaukau.tst')
      .setConsumes(['multipart/form-data', 'application/json'])
      .setProduces(['application/json', 'text/html', 'text/plain'])
      .setTags([
        {
          name: 'Test',
          description: 'Testing purpose',
          externalDocs: { description: 'Find more info here', url: 'https://swagger.io/specification/' }
        }
      ])

    openapi.responsesProperty = 'openapi';

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
        query: {
          obj: Joi.object()
            .keys({
              ele: Joi.string().example('slow flow')
            })
            .description('obj')
            .meta({
              ref: '#/components/schemas/Couwery'
            })
        },
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
      }).description('Damn my G').meta({
        ref: '#/components/requestBodies/AppBody'
      }),
      path: '/app',
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
    }, function (req: { meta: unknown }, res: { json(arg: unknown): void }) {
      res.json(req.meta)
    });

    // add router
    openapi.add(router.getMeta());

    // generate result
    const result = openapi.result();

    logger.silly('openapi:', result.openapi);

    // uncomment to test locally
    /*
    const wStream = fs.createWriteStream('private/result.json', { flags: 'w+' });
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