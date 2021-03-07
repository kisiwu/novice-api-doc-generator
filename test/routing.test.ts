import fs from 'fs';
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
      .setProduces(['application/json', 'text/html', 'text/plain']);

    openapi.responsesProperty = 'openapi';

    // router
    const router = routing().get({
      name: 'Test app',
      description: 'testing purpose',
      tags: ['Test'],
      // set parameters
      parameters: {
        query: Joi.object().keys({
          versions: Joi.array().items(
            Joi.number()
            .description('version number').example(4).positive()
          ).meta({
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
          }
        })
        .max(6).unknown(true)
      },
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

    const wStream = fs.createWriteStream('private/result.json', { flags: 'w+' });

    wStream.write(JSON.stringify(result, null, ' '), (err: unknown) => {
      if (err) {
        logger.error(err);
      }
      wStream.close();
    });

    //logger.silly(result);
  });
});