import { OpenAPI } from '@novice1/api-doc-generator';
import { before, describe, it } from 'node:test';
import routing from '@novice1/routing';
import { OpenAPIJsonHelper } from '../src'
import { expect } from 'chai';

const openapi = new OpenAPI({ helperClass: OpenAPIJsonHelper, helperSchemaProperty: 'json' })
let result = openapi.result()

function getFirstItem(path: string, method = 'get') {
    const parameters: Array<Record<string, unknown>> | undefined = (result.paths[path][method] as Record<string, unknown>)?.parameters as Array<Record<string, unknown>> | undefined
    const item: Record<string, unknown> | undefined = parameters?.[0]
    const itemSchema: Record<string, unknown> | undefined = item?.schema as Record<string, unknown> | undefined
    return {
        item,
        itemSchema
    }
}

describe(() => {

    before(() => {
        const router = routing()
            .get({
                name: 'Main app',
                path: '/app',
                auth: true,
                tags: ['default'],
                parameters: {
                    // recommended (property 'json')
                    json: {
                        query: {
                            //$schema: 'http://json-schema.org/draft-07/schema#',
                            //type: 'object',
                            //properties: {
                                version: {
                                    type: 'string',
                                    description: 'version number',
                                    enum: ['1', '2', '3'],
                                    default: '2',
                                    nullable: true
                                }
                            //}
                        }
                    }
                }
            }, function (req, res) {
                res.json(req.query.version)
            });

        openapi.add(router.getMeta())

        result = openapi.result()
    })

    it('should have the name', () => {


        console.log(JSON.stringify(openapi.result(), null, ' '))

        const { item } = getFirstItem('/app')

        expect(item?.name).to.be.a('string').that.equals('version')
    })

    it('should have the parameter\'s location ("query")', () => {
        const { item } = getFirstItem('/app')

        expect(item?.in).to.be.a('string').that.equals('query')
    })

    it('should have the description', () => {
        const { item } = getFirstItem('/app')

        expect(item?.description).to.be.a('string').that.equals('version number')
    })

    it('should have the type of the parameter', () => {
        const { itemSchema } = getFirstItem('/app')

        expect(itemSchema?.type).to.be.a('string').that.equals('string')
    })

    it('should have the default value of the parameter', () => {
        const { itemSchema } = getFirstItem('/app')

        expect(itemSchema?.default).to.be.a('string').that.equals('2')
    })

    it('should have the enum of the parameter', () => {
        const { itemSchema } = getFirstItem('/app')

        expect(itemSchema?.enum).to.be.an('array').with.lengthOf(3)
    })
})