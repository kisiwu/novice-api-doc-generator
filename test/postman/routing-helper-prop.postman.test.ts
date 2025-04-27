//import fs from 'fs';
import routing from '@novice1/routing';
import { GenerateFoldersRule, Postman } from '../../src';
import Joi from 'joi';

import {
  GroupCtxtResponse,
  GroupCtxtAuth
} from '../testutils';

describe('api doc testpostman (helper class property)', function () {
  const { logger } = this.ctx.kaukau;

  it('postman doc', () => {
    // generator
    const postman = new Postman({ helperSchemaProperty: 'joiSchema' });
    postman
      .setName('api doc testpostman')
      .setHost('http://test.kaukau.tst')
      .setConsumes(['multipart/form-data', 'application/json'])
      //.setProduces(['application/json', 'text/html', 'text/plain'])
      .setFolders([
        {
          name: 'Test',
          description: 'Testing purpose',
          item: [],
        }
      ]).setGenerateFoldersRule(GenerateFoldersRule.siblings);
    //.setResponsesProperty('postman');

    /*
    postman.addExample('simple-lang-example',{
      summary: 'lang example',
      value: 'fr'
    }).addExample('lang-country-example', {
      summary: 'lang country example',
      value: 'fr_BE'
    });
    */

    /*
    // add components/schema
    postman.addSchema('Coule', {
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
      parameters: {
        joiSchema: Joi.object({
          headers: {
            'X-postman': Joi.string().description('custom header b')
          },
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
                  password: Joi.string().meta({ format: 'password' }).example('pass'),
                  timestamp: Joi.date().meta({ format: 'datetime' }).min(new Date(0)),
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
            password: Joi.string().meta({ format: 'password' }).example('pass'),
            timestamp: Joi.date().meta({ format: 'datetime' }).min(new Date(0)),
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
            }).example([8, 9])
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
        })
      },
      path: '/app',
      responses: GroupCtxtResponse
      /*
      responses: {
        postman: 
        [
          {
            header: [
              {
                key: 'Content-Type',
                value: 'text/plain'
              },
              {
                key: 'X-Rate-Limit-Limit'
              },
              {
                key: 'X-Rate-Limit-Remaining'
              },
              {
                key: 'X-Rate-Limit-Reset'
              } 
            ],
            body: 'whoa!',
            code: 200,
            status: 'OK',
            name: 'Black Rob'
          },
        ]
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
          joiSchema: {
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
              })
          }
          ,
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
          joiSchema: {
            body: Joi.object()
              .keys({
                id: Joi.number()
                  .meta({
                    format: 'int32',
                    xml: {
                      attribute: true
                    }
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
                xml: {
                  name: 'Person'
                },
                ref: '#/components/schemas/Person',
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
              })
          },
          consumes: 'application/xml',
          security: GroupCtxtAuth
        },
        path: '/app/xml',
        auth: true
      }, function (req: { meta: unknown }, res: { json(arg: unknown): void }) {
        res.json(req.meta)
      });

    // add router
    postman.add(router.getMeta());

    // remove unused definitions
    //logger.log(postman.cleanupComponents());

    // generate result
    const result = postman.result();

    logger.silly('postman:', result.info.name);

    // uncomment to test locally
    /*
    const wStream = fs.createWriteStream('private/postman4-prop.json', { flags: 'w+' });
    wStream.write(JSON.stringify(result, null, ' '), (err: unknown) => {
      if (err) {
        logger.error(err);
      }
      wStream.close();
    });
    */

    //logger.silly(postman.remove('/app', 'post'));
  });
});