import { joiDoc } from '../src/routes/joi-route';
import { jsonDoc } from '../src/routes/json-route';
import { zodDoc } from '../src/routes/zod-route';
import { Folder, Item, ParameterObject, QueryParam } from '@novice1/api-doc-generator';
import { expect } from 'chai';

describe('Schema Tests', () => {
  //// OpenAPI

  describe('OpenAPI Route standard properties', () => {
    it('should have the correct OpenAPI JSON standard route properties', () => {
      const jsonPath = jsonDoc.openapi.paths['/app'].get as { parameters?: unknown[] };
      expect(jsonPath).to.be.not.undefined;
      const assertPath = expect(jsonPath).to.be.a('object');
      assertPath.to.have.property('summary').that.is.a('string').that.is.eq('');
      assertPath.to.have.property('tags').that.is.an('array').that.is.deep.equal(['default']);
      assertPath.to.have
        .property('responses')
        .that.is.an('object')
        .that.is.deep.equal({ default: { description: 'none' } });
      assertPath.to.have.property('parameters').that.is.an('array').that.has.lengthOf(1);
      // make sure it has no other properties
      assertPath.to.have.keys(['summary', 'tags', 'responses', 'parameters']);
    });

    it('should have the correct OpenAPI Joi standard route properties', () => {
      const joiPath = joiDoc.openapi.paths['/app'].get as { parameters?: unknown[] };
      expect(joiPath).to.be.not.undefined;
      const assertPath = expect(joiPath).to.be.a('object');
      assertPath.to.have.property('summary').that.is.a('string').that.is.eq('');
      assertPath.to.have.property('tags').that.is.an('array').that.is.deep.equal(['default']);
      assertPath.to.have
        .property('responses')
        .that.is.an('object')
        .that.is.deep.equal({ default: { description: 'none' } });
      assertPath.to.have.property('parameters').that.is.an('array').that.has.lengthOf(1);
      // make sure it has no other properties
      assertPath.to.have.keys(['summary', 'tags', 'responses', 'parameters']);
    });

    it('should have the correct OpenAPI Zod standard route properties', () => {
      const zodPath = zodDoc.openapi.paths['/app'].get as { parameters?: unknown[] };
      expect(zodPath).to.be.not.undefined;
      const assertPath = expect(zodPath).to.be.a('object');
      assertPath.to.have.property('summary').that.is.a('string').that.is.eq('');
      assertPath.to.have.property('tags').that.is.an('array').that.is.deep.equal(['default']);
      assertPath.to.have
        .property('responses')
        .that.is.an('object')
        .that.is.deep.equal({ default: { description: 'none' } });
      assertPath.to.have.property('parameters').that.is.an('array').that.has.lengthOf(1);
      // make sure it has no other properties
      assertPath.to.have.keys(['summary', 'tags', 'responses', 'parameters']);
    });
  });

  describe('OpenAPI Query Parameters', () => {
    it('should have the correct OpenAPI JSON parameters', () => {
      const paramsSchema: ParameterObject = {
        name: 'version',
        in: 'query',
        required: false,
        schema: {
          type: 'string',
          description: 'version number',
          default: '2',
          enum: ['1', '2', '3'],
        },
        description: 'version number',
      };
      const jsonParams = (jsonDoc.openapi.paths['/app'].get as { parameters?: unknown[] })?.parameters?.[0];
      expect(jsonParams).to.be.not.undefined;
      expect(jsonParams).to.be.a('object').that.is.deep.equal(paramsSchema);
    });

    it('should have the correct OpenAPI Joi parameters', () => {
      const paramsSchema: ParameterObject = {
        name: 'version',
        in: 'query',
        required: false,
        schema: {
          type: 'number',
          description: 'version number',
          default: 2,
          enum: [1, 2, 3],
        },
        description: 'version number',
      };
      const joiParams = (joiDoc.openapi.paths['/app'].get as { parameters?: unknown[] })?.parameters?.[0];
      expect(joiParams).to.be.not.undefined;
      expect(joiParams).to.be.a('object').that.is.deep.equal(paramsSchema);
    });

    it('should have the correct OpenAPI Zod parameters', () => {
      const paramsSchema: ParameterObject = {
        name: 'version',
        in: 'query',
        required: false,
        schema: {
          type: 'number',
          description: 'version number',
          default: 2,
          enum: [1, 2, 3],
        },
        description: 'version number',
      };
      const zodParams = (zodDoc.openapi.paths['/app'].get as { parameters?: unknown[] })?.parameters?.[0];
      expect(zodParams).to.be.not.undefined;
      expect(zodParams).to.be.a('object').that.is.deep.equal(paramsSchema);
    });
  });

  //// Postman

  describe('Postman Route standard properties', () => {
    it('should have the correct Postman JSON standard route properties', () => {
      const jsonPath = (jsonDoc.postman.item[0] as Folder).item[0] as Item;
      expect(jsonPath).to.be.not.undefined;

      const assertPath = expect(jsonPath).to.be.a('object');
      assertPath.to.have.property('name').that.is.a('string').that.is.eq('Main app');
      assertPath.to.have.property('description').that.is.a('string').that.is.eq('');

      const assertPathRequest = assertPath.to.have.property('request').that.is.an('object');
      assertPathRequest.to.have.property('method').that.is.a('string').that.is.eq('GET');
      assertPathRequest.to.have.property('url').that.is.an('object');

      const assertPathRequestUrl = assertPathRequest.to.have.property('url').that.is.an('object');
      assertPathRequestUrl.to.have.property('host').that.is.an('array').that.is.deep.equal([]);
      assertPathRequestUrl.to.have.property('path').that.is.an('array').that.is.deep.equal(['app']);
      assertPathRequestUrl.to.have.property('query').that.is.an('array');
      assertPathRequestUrl.to.have.keys(['host', 'path', 'query']);

      assertPathRequest.to.have
        .property('header')
        .that.is.an('array')
        .that.is.deep.equal([{ key: 'Content-Type', value: 'application/json' }]);
      assertPathRequest.to.have.keys(['method', 'url', 'header']);

      assertPath.to.have.property('response').that.is.an('array').that.has.lengthOf(0);
      assertPath.to.have.keys(['name', 'description', 'request', 'response']);
    });

    it('should have the correct Postman Joi standard route properties', () => {
      const joiPath = (joiDoc.postman.item[0] as Folder).item[0] as Item;
      expect(joiPath).to.be.not.undefined;

      const assertPath = expect(joiPath).to.be.a('object');
      assertPath.to.have.property('name').that.is.a('string').that.is.eq('Main app');
      assertPath.to.have.property('description').that.is.a('string').that.is.eq('');

      const assertPathRequest = assertPath.to.have.property('request').that.is.an('object');
      assertPathRequest.to.have.property('method').that.is.a('string').that.is.eq('GET');
      assertPathRequest.to.have.property('url').that.is.an('object');

      const assertPathRequestUrl = assertPathRequest.to.have.property('url').that.is.an('object');
      assertPathRequestUrl.to.have.property('host').that.is.an('array').that.is.deep.equal([]);
      assertPathRequestUrl.to.have.property('path').that.is.an('array').that.is.deep.equal(['app']);
      assertPathRequestUrl.to.have.property('query').that.is.an('array');
      assertPathRequestUrl.to.have.keys(['host', 'path', 'query']);

      assertPathRequest.to.have
        .property('header')
        .that.is.an('array')
        .that.is.deep.equal([{ key: 'Content-Type', value: 'application/json' }]);
      assertPathRequest.to.have.keys(['method', 'url', 'header']);

      assertPath.to.have.property('response').that.is.an('array').that.has.lengthOf(0);
      assertPath.to.have.keys(['name', 'description', 'request', 'response']);
    });

    it('should have the correct Postman Zod standard route properties', () => {
      const zodPath = (zodDoc.postman.item[0] as Folder).item[0] as Item;
      expect(zodPath).to.be.not.undefined;

      const assertPath = expect(zodPath).to.be.a('object');
      assertPath.to.have.property('name').that.is.a('string').that.is.eq('Main app');
      assertPath.to.have.property('description').that.is.a('string').that.is.eq('');

      const assertPathRequest = assertPath.to.have.property('request').that.is.an('object');
      assertPathRequest.to.have.property('method').that.is.a('string').that.is.eq('GET');
      assertPathRequest.to.have.property('url').that.is.an('object');

      const assertPathRequestUrl = assertPathRequest.to.have.property('url').that.is.an('object');
      assertPathRequestUrl.to.have.property('host').that.is.an('array').that.is.deep.equal([]);
      assertPathRequestUrl.to.have.property('path').that.is.an('array').that.is.deep.equal(['app']);
      assertPathRequestUrl.to.have.property('query').that.is.an('array');
      assertPathRequestUrl.to.have.keys(['host', 'path', 'query']);

      assertPathRequest.to.have
        .property('header')
        .that.is.an('array')
        .that.is.deep.equal([{ key: 'Content-Type', value: 'application/json' }]);
      assertPathRequest.to.have.keys(['method', 'url', 'header']);

      assertPath.to.have.property('response').that.is.an('array').that.has.lengthOf(0);
      assertPath.to.have.keys(['name', 'description', 'request', 'response']);
    });
  });

  describe('Postman Query Parameters', () => {
    it('should have the correct Postman JSON parameters', () => {
      const paramsSchema: QueryParam = {
        key: 'version',
        description: {
          content: 'version number',
        },
        disabled: true,
        value: '2',
      };
      const jsonParams = ((jsonDoc.postman.item[0] as Folder).item[0] as Item).request.url?.query?.[0];
      expect(jsonParams).to.be.not.undefined;
      expect(jsonParams).to.be.a('object').that.is.deep.equal(paramsSchema);
    });

    it('should have the correct Postman Joi parameters', () => {
      const paramsSchema: QueryParam = {
        key: 'version',
        description: {
          content: 'version number',
        },
        disabled: true,
        value: '2',
      };
      const joiParams = ((joiDoc.postman.item[0] as Folder).item[0] as Item).request.url?.query?.[0];
      expect(joiParams).to.be.not.undefined;
      expect(joiParams).to.be.a('object').that.is.deep.equal(paramsSchema);
    });

    it('should have the correct Postman Zod parameters', () => {
      const paramsSchema: QueryParam = {
        key: 'version',
        description: {
          content: 'version number',
        },
        disabled: true,
        value: '2',
      };
      const zodParams = ((zodDoc.postman.item[0] as Folder).item[0] as Item).request.url?.query?.[0];
      expect(zodParams).to.be.not.undefined;
      expect(zodParams).to.be.a('object').that.is.deep.equal(paramsSchema);
    });
  });
});
