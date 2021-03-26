/*
const Log = require('./_log').extend('openapi');
*/

/**
 * @note : for now it is not possible to only
 * send files outside of object property. Well, at least not tried yet
 * but it definitely doesn't work with alternatives 
 */

/**
 * @todo: remove useless methods
 * @todo: change var, method names ...
 * @todo: use openapi/defintions + robust code
 */

/**
 * Archive
 * todo: dynamically create schema ref ? e.g: if GeneratorHelperInterface.getRef() starts with #/components/schema, 
 *  check if components.schema[X] exists otherwise create it from generated schema and set $ref @done
 * todo: do the above for:
 *  - body @done
 *  - files @done
 *  - query @done
 *  - path @done
 *  - header @done
 *  - cookie @done
 * todo: allow $ref #/components/schemas/... for object properties
 * todo: cleanupComponents to remove unused entities (#/components/...) 
 * todo: requestBody is not necesserly an object
 * todo: type "alternative" (oneOf)
 * todo alternative discriminator (meta.discriminator)
 * todo: (de)activate auto generation of component
 */

import { GeneratorHelperInterface } from '../utils/generatorHelper'
import { JoiGeneratorHelper } from '../utils/joiGeneratorHelper';
import { PropertySchema, PropertySchemaObject } from './openapi/propertySchema';
import { 
  SecuritySchemeObject, 
  MediaTypeObject,
  ResponseObject,
  ReferenceObject,
  RequestBodyObject,
  TagObject,
} from './openapi/definitions';


interface OpenAPIResult {
  info: Record<string, unknown>;
  servers: unknown[];
  components: {
    schemas?: {
      [key: string]: PropertySchemaObject;
    },
    requestBodies?: {
      [key: string]: RequestBodyObject;
    },
    headers?: {
      [key: string]: PropertySchemaObject;
    },
    parameters?: {
      [key: string]: PropertySchemaObject;
    },
    responses?: {
      [key: string]: PropertySchemaObject;
    },
    examples?: {
      [key: string]: unknown;
    },
    securitySchemes?: Record<string, SecuritySchemeObject>,
    links?: {
      [key: string]: unknown;
    },
    callbacks?: {
      [key: string]: unknown;
    },
    [key: string]: unknown;
  };
  paths: Record<string, Record<string, unknown>>;
  tags: TagObject[];
  [key: string]: unknown;
}

interface RouteParameters {
  params?: Record<string, unknown>;
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
  files?: Record<string, unknown>;
  headers?: Record<string, unknown>;
  cookies?: Record<string, unknown>;
  [key: string]: unknown;
}

interface Route {
  path: string;
  methods: Record<string, unknown>;
  [key: string]: unknown;
}

interface RouteSchema {
  path: string;
  method: string;
  name?: string;
  description?: string;
  parameters?: RouteParameters;
  responses?: ResponsesRecord;
  auth?: unknown;
  tags?: unknown;
  operationId?: string;
  consumes?: unknown;
  produces?: unknown;
  security?: unknown;
  undoc?: boolean;
  [key: string]: unknown;
}

interface ResponsesRecord {
  [key: string]: ResponseObject | ReferenceObject;
}


function formatPath(path: string, params?: Record<string, unknown>): string {
  if (params) {
    let pos: number = path.indexOf('/:');

    // found express parameters notation
    if (pos > -1) {
      let pathEnd: string = path;
      path = '';

      while (pos > -1) {
        const fromParamPath: string = pathEnd.substr(pos + 2);
        const endPos: number = fromParamPath.indexOf('/');

        // path param name
        let variableName = fromParamPath;
        if (endPos > -1) {
          variableName = fromParamPath.substring(0, endPos);
        }

        // if * after var name
        if (variableName.endsWith('*')) {
          variableName = variableName.substring(0, variableName.length - 1)
        }

        path += pathEnd.substring(0, pos + 1);

        // if path param name is found in route meta parameters
        if (params[variableName]) {
          path += '{' + variableName + '}';
        } else {
          path += ':' + variableName;
        }

        if (endPos > -1) {
          pathEnd = fromParamPath.substring(endPos);
        } else {
          pathEnd = '';
        }
        pos = pathEnd.indexOf('/:');
      }
      path += pathEnd;
    }
  }
  return path;
}

function formatType(type: string): {type: string, format?: string} {
  const t: {type: string, format?: string} = {
    type,
  };
  if (type === 'any') {
    t.type = 'object';
  }
  else if (type === 'uuid' || type === 'guid') {
    t.type = 'string';
    t.format = 'uuid';
  }
  else if (type === 'date-time' || type === 'datetime') {
    t.type = 'string'
    t.format = 'date-time'
  }
  else if (type === 'password' 
    || type === 'email' 
    || type === 'uri' 
    || type === 'url'
    || type === 'date'
    || type === 'byte'
    || type === 'binary') {
    t.type = 'string';
    t.format = type;
  }
  else if (type === 'float' || type === 'double') {
    t.type = 'number'
    t.format = type;
  } else if (type === 'int32' || type === 'int64') {
    t.type = 'integer'
    t.format = type;
  }

  return t;
}

export enum GenerateComponentsRules {
  always = 'always',
  undefined = 'undefined',
  never = 'never',
}

export class OpenApi {
  #consumes: string[];
  #result: OpenAPIResult;
  #security: unknown[];
  #helperClass: { new(args: unknown): GeneratorHelperInterface };

  responsesProperty?: string;
  #generateComponentsRule = GenerateComponentsRules.always;

  // useless
  _produces?: unknown[]; 

  constructor( helperClass: { new(args: unknown): GeneratorHelperInterface } = JoiGeneratorHelper) {
    this.#consumes = [];
    this.#helperClass = helperClass;
    this.#result = {
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: '@novice1 API',
        license: {
          name: 'MIT',
        },
      },
      servers: [],
      paths: {},
      components: {},
      tags: []
    };
    this.#security = [];
  }

  setGenerateComponentsRule(v: GenerateComponentsRules): OpenApi {
    const value: GenerateComponentsRules = GenerateComponentsRules[v];
    if (value) {
      this.#generateComponentsRule = value;
    }
    return this;
  }

  getGenerateComponentsRule(): GenerateComponentsRules {
    return this.#generateComponentsRule;
  }

  setConsumes(v: string[]): OpenApi {
    this.#consumes = v;
    return this;
  }

  setProduces(v: unknown[]): OpenApi {
    this._produces = v;
    return this;
  }


  removeCallback(name: string): unknown {
    let r: unknown;
    if (this.#result.components.callbacks) {
      r = this.#result.components.callbacks[name];
      delete this.#result.components.callbacks[name];
    }
    return r;
  }

  addCallback(name: string, schema: unknown): OpenApi {
    if (!this.#result.components.callbacks) {
      this.#result.components.callbacks = {}; 
    }
    this.#result.components.callbacks[name] = schema;
    return this;
  }

  /**
   * 
   * @returns removed callbacks
   */
   cleanupCallbacks(): {[x: string]: unknown;} {
    const r: {[x: string]: unknown;} = {};
    const refs = JSON.stringify(this.#result).match(/#\/components\/callbacks\/[^/"]*/g);
    if (this.#result.components.callbacks) {
      Object.keys(this.#result.components.callbacks).forEach(name => {
        if(!refs?.includes(`#/components/callbacks/${name}`)) {
          if (this.#result.components?.callbacks?.[name]) {
            r[name] = this.#result.components.callbacks[name];
            delete this.#result.components.callbacks[name];
          }
        }
      });
    }
    return r;
  }

  removeLink(name: string): unknown {
    let r: unknown;
    if (this.#result.components.links) {
      r = this.#result.components.links[name];
      delete this.#result.components.links[name];
    }
    return r;
  }

  addLink(name: string, schema: unknown): OpenApi {
    if (!this.#result.components.links) {
      this.#result.components.links = {}; 
    }
    this.#result.components.links[name] = schema;
    return this;
  }

  /**
   * 
   * @returns removed links
   */
   cleanupLinks(): {[x: string]: unknown;} {
    const r: {[x: string]: unknown;} = {};
    const refs = JSON.stringify(this.#result).match(/#\/components\/links\/[^/"]*/g);
    if (this.#result.components.links) {
      Object.keys(this.#result.components.links).forEach(name => {
        if(!refs?.includes(`#/components/links/${name}`)) {
          if (this.#result.components?.links?.[name]) {
            r[name] = this.#result.components.links[name];
            delete this.#result.components.links[name];
          }
        }
      });
    }
    return r;
  }

  removeExample(name: string): unknown {
    let r: unknown;
    if (this.#result.components.examples) {
      r = this.#result.components.examples[name];
      delete this.#result.components.examples[name];
    }
    return r;
  }

  addExample(name: string, schema: unknown): OpenApi {
    if (!this.#result.components.examples) {
      this.#result.components.examples = {}; 
    }
    this.#result.components.examples[name] = schema;
    return this;
  }

  /**
   * 
   * @returns removed examples
   */
   cleanupExamples(): {[x: string]: unknown;} {
    const r: {[x: string]: unknown;} = {};
    const refs = JSON.stringify(this.#result).match(/#\/components\/examples\/[^/"]*/g);
    if (this.#result.components.examples) {
      Object.keys(this.#result.components.examples).forEach(name => {
        if(!refs?.includes(`#/components/examples/${name}`)) {
          if (this.#result.components?.examples?.[name]) {
            r[name] = this.#result.components.examples[name];
            delete this.#result.components.examples[name];
          }
        }
      });
    }
    return r;
  }

  removeSchema(name: string): PropertySchemaObject | undefined {
    let r: PropertySchemaObject | undefined;
    if (this.#result.components.schemas) {
      r = this.#result.components.schemas[name];
      delete this.#result.components.schemas[name];
    }
    return r;
  }

  hasSchema(name: string): boolean {
    let r = false;
    if (this.#result.components?.schemas?.[name]) {
      r = true;
    }
    return r;
  }

  addSchema(name: string, schema: PropertySchemaObject): OpenApi {
    if (!this.#result.components.schemas) {
      this.#result.components.schemas = {}; 
    }
    this.#result.components.schemas[name] = schema;
    return this;
  }

  /**
   * 
   * @returns removed schemas
   */
  cleanupSchemas(): {[x: string]: PropertySchemaObject;} {
    const r: {[x: string]: PropertySchemaObject;} = {};
    const refs = JSON.stringify(this.#result).match(/#\/components\/schemas\/[^/"]*/g);
    if (this.#result.components.schemas) {
      Object.keys(this.#result.components.schemas).forEach(name => {
        if(!refs?.includes(`#/components/schemas/${name}`)) {
          if (this.#result.components?.schemas?.[name]) {
            r[name] = this.#result.components.schemas[name];
            delete this.#result.components.schemas[name];
          }
        }
      });
    }
    return r;
  }

 /*
  removeHeader(name: string): HeaderObject | ReferenceObject | undefined {
    let r: HeaderObject | ReferenceObject | undefined;
    if (this.#result.components.headers) {
      r = this.#result.components.headers[name];
      delete this.#result.components.headers[name];
    }
    return r;
  }

  addHeader(name: string, schema: HeaderObject | ReferenceObject): OpenApi {
    if (!this.#result.components.headers) {
      this.#result.components.headers = {}; 
    }
    this.#result.components.headers[name] = schema;
    return this;
  }
  */
 
  removeHeader(name: string): PropertySchemaObject | undefined {
    let r: PropertySchemaObject | undefined;
    if (this.#result.components.headers) {
      r = this.#result.components.headers[name];
      delete this.#result.components.headers[name];
    }
    return r;
  }

  addHeader(name: string, schema: PropertySchemaObject): OpenApi {
    if (!this.#result.components.headers) {
      this.#result.components.headers = {}; 
    }
    this.#result.components.headers[name] = schema;
    return this;
  }

   cleanupHeaders(): {[x: string]: PropertySchemaObject;} {
    const r: {[x: string]: PropertySchemaObject;} = {};
    const refs = JSON.stringify(this.#result).match(/#\/components\/headers\/[^/"]*/g);
    if (this.#result.components.headers) {
      Object.keys(this.#result.components.headers).forEach(name => {
        if(!refs?.includes(`#/components/headers/${name}`)) {
          if (this.#result.components?.headers?.[name]) {
            r[name] = this.#result.components.headers[name];
            delete this.#result.components.headers[name];
          }
        }
      });
    }
    return r;
  }

  removeParameter(name: string): PropertySchemaObject | undefined {
    let r: PropertySchemaObject | undefined;
    if (this.#result.components.parameters) {
      r = this.#result.components.parameters[name];
      delete this.#result.components.parameters[name];
    }
    return r;
  }

  hasParameter(name: string): boolean {
    let r = false;
    if (this.#result.components?.parameters?.[name]) {
      r = true;
    }
    return r;
  }

  addParameter(name: string, schema: PropertySchemaObject): OpenApi {
    if (!this.#result.components.parameters) {
      this.#result.components.parameters = {}; 
    }
    this.#result.components.parameters[name] = schema;
    return this;
  }

  /**
   * 
   * @returns removed parameters
   */
   cleanupParameters(): {[x: string]: PropertySchemaObject;} {
    const r: {[x: string]: PropertySchemaObject;} = {};
    const refs = JSON.stringify(this.#result).match(/#\/components\/parameters\/[^/"]*/g);
    if (this.#result.components.parameters) {
      Object.keys(this.#result.components.parameters).forEach(name => {
        if(!refs?.includes(`#/components/parameters/${name}`)) {
          if (this.#result.components?.parameters?.[name]) {
            r[name] = this.#result.components.parameters[name];
            delete this.#result.components.parameters[name];
          }
        }
      });
    }
    return r;
  }

  removeRequestBody(name: string): PropertySchemaObject | undefined {
    let r: PropertySchemaObject | undefined;
    if (this.#result.components.requestBodies) {
      r = this.#result.components.requestBodies[name];
      delete this.#result.components.requestBodies[name];
    }
    return r;
  }

  hasRequestBody(name: string): boolean {
    let r = false;
    if (this.#result.components?.requestBodies?.[name]) {
      r = true;
    }
    return r;
  }

  addRequestBody(name: string, schema: PropertySchemaObject): OpenApi {
    if (!this.#result.components.requestBodies) {
      this.#result.components.requestBodies = {}; 
    }
    this.#result.components.requestBodies[name] = schema;
    return this;
  }

  /**
   * 
   * @returns removed requestBodies
   */
   cleanupRequestBodies(): {[x: string]: PropertySchemaObject;} {
    const r: {[x: string]: PropertySchemaObject;} = {};
    const refs = JSON.stringify(this.#result).match(/#\/components\/requestBodies\/[^/"]*/g);
    if (this.#result.components.requestBodies) {
      Object.keys(this.#result.components.requestBodies).forEach(name => {
        if(!refs?.includes(`#/components/requestBodies/${name}`)) {
          if (this.#result.components?.requestBodies?.[name]) {
            r[name] = this.#result.components.requestBodies[name];
            delete this.#result.components.requestBodies[name];
          }
        }
      });
    }
    return r;
  }

  removeResponse(name: string): PropertySchemaObject | undefined {
    let r: PropertySchemaObject | undefined;
    if (this.#result.components.responses) {
      r = this.#result.components.responses[name];
      delete this.#result.components.responses[name];
    }
    return r;
  }

  addResponse(name: string, schema: PropertySchemaObject): OpenApi {
    if (!this.#result.components.responses) {
      this.#result.components.responses = {}; 
    }
    this.#result.components.responses[name] = schema;
    return this;
  }

  /**
   * 
   * @returns removed responses
   */
   cleanupResponses(): {[x: string]: PropertySchemaObject;} {
    const r: {[x: string]: PropertySchemaObject;} = {};
    const refs = JSON.stringify(this.#result).match(/#\/components\/responses\/[^/"]*/g);
    if (this.#result.components.responses) {
      Object.keys(this.#result.components.responses).forEach(name => {
        if(!refs?.includes(`#/components/responses/${name}`)) {
          if (this.#result.components?.responses?.[name]) {
            r[name] = this.#result.components.responses[name];
            delete this.#result.components.responses[name];
          }
        }
      });
    }
    return r;
  }

  /**
   * remove unused entities (possibly auto-generated) from components:
   * - headers
   * - responses
   * - requestBodies
   * - parameters
   * - schemas
   */
  cleanupComponents(): {
    [x: string]: {[x: string]: PropertySchemaObject;}
  } {
    const r: {
      [x: string]: {[x: string]: PropertySchemaObject;}
    } = {};
    const headers = this.cleanupHeaders();
    const responses = this.cleanupResponses();
    const requestBodies = this.cleanupRequestBodies();
    const parameters = this.cleanupParameters();
    const schemas = this.cleanupSchemas();
    if (Object.keys(headers).length) {
      r.header = headers;
    }
    if (Object.keys(responses).length) {
      r.responses = responses;
    }
    if (Object.keys(requestBodies).length) {
      r.requestBodies = requestBodies;
    }
    if (Object.keys(parameters).length) {
      r.parameters = parameters;
    }
    if (Object.keys(schemas).length) {
      r.schemas = schemas;
    }
    return r;
  }

  setComponent(k: string, v: unknown): OpenApi {
    this.#result.components[k] = v;
    return this;
  }

  setComponents(k: Record<string, unknown>): OpenApi {
    this.#result.components = k;
    return this;
  }

  setDefinitions(v: Record<string, unknown>): OpenApi {
    return this.setComponents(v);
  }

  setSecuritySchemes(v: Record<string, SecuritySchemeObject>): OpenApi {
    this.#result.components.securitySchemes = v;
    return this;
  }

  setSecurityDefinitions(v: Record<string, SecuritySchemeObject>): OpenApi {
    return this.setSecuritySchemes(v);
  }

  removeSecurityScheme(name: string): unknown {
    let r: unknown;
    if (this.#result.components.securitySchemes) {
      r = this.#result.components.securitySchemes[name];
      delete this.#result.components.securitySchemes[name];
    }
    return r;
  }

  addSecurityScheme(name: string, schema: SecuritySchemeObject): OpenApi {
    if (!this.#result.components.securitySchemes) {
      this.#result.components.securitySchemes = {}; 
    }
    this.#result.components.securitySchemes[name] = schema;
    return this;
  }

  /**
   * 
   * @returns removed securitySchemes
   */
   cleanupSecuritySchemes(): {[x: string]: unknown;} {
    const r: {[x: string]: unknown;} = {};
    const refs = JSON.stringify(this.#result).match(/#\/components\/securitySchemes\/[^/"]*/g);
    if (this.#result.components.securitySchemes) {
      Object.keys(this.#result.components.securitySchemes).forEach(name => {
        if(!refs?.includes(`#/components/securitySchemes/${name}`)) {
          if (this.#result.components?.securitySchemes?.[name]) {
            r[name] = this.#result.components.securitySchemes[name];
            delete this.#result.components.securitySchemes[name];
          }
        }
      });
    }
    return r;
  }
  
  setDefaultSecurity(v: Record<string, unknown>): OpenApi;
  setDefaultSecurity(v: unknown[]): OpenApi;
  setDefaultSecurity(v: unknown): OpenApi {
    if (Array.isArray(v)) {
      this.#security = v;
    } else if (v && typeof v == 'object') {
      this.#security = [v];
    } else {
      this.#security = [];
    }
    return this;
  }

  setInfo(v: Record<string, unknown>): OpenApi {
    this.#result.info = v;
    return this;
  }
  
  setInfoProperty(prop: string, v: unknown): OpenApi {
    this.#result.info[prop] = v;
    return this;
  }

  setTitle(v: unknown): OpenApi {
    return this.setInfoProperty('title', v);
  }

  setVersion(v: unknown): OpenApi {
    return this.setInfoProperty('version', v);
  }

  setLicense(v: unknown): OpenApi {
    return this.setInfoProperty('license', v);
  }

  setServers(v: unknown[]): OpenApi;
  setServers(v: unknown): OpenApi;
  setServers(v: unknown): OpenApi {
    this.#result.servers = [];
    let v2: unknown[] = [];
    if (!Array.isArray(v)) {
      v2 = [v]
    } else {
      v2 = v
    }
    v2.forEach( el => this.addServer(el) )
    return this;
  }

  setHost(v: unknown[]): OpenApi;
  setHost(v: unknown): OpenApi;
  setHost(v: unknown): OpenApi {
    return this.setServers(v);
  }
  
  setSchemes(v: string[] | unknown): OpenApi {
    if (Array.isArray(v)) {
      this.#result.schemes = v;
    } else if (v && typeof v === 'string') {
      this.#result.schemes = [v];
    } else {
      this.#result.schemes = [];
    }
    return this;
  }

  setTags(tags: TagObject[]): OpenApi {
    this.#result.tags = tags;
    return this;
  }

  removeTag(tagName: string): TagObject | undefined {
    let r: TagObject | undefined;
    const idx = this.#result.tags.findIndex(t => t.name === tagName);
    if (idx > -1) {
      r = this.#result.tags[idx];
      this.#result.tags.slice(idx, 1);
    }
    return r;
  }

  addTags(tags: TagObject): OpenApi
  addTags(tags: TagObject[]): OpenApi;
  addTags(tags: TagObject[] | TagObject): OpenApi {
    if (!Array.isArray(tags)) {
      tags = [tags];
    }
    tags.forEach(tag => {
      const t = this.#result.tags.find(t => t.name === tag.name);
      if (t) {
        Object.assign(t, tag);
      } else {
        this.#result.tags.push(tag);
      }
    });
    return this;
  }
  addTag(tag: TagObject): OpenApi {
    return this.addTags(tag);
  }

  /**
   * useless getter
   */
  getConsumes(): string[] {
    return this.#consumes;
  }

  /**
   * useless getter
   */
  getSecurity(): unknown[] {
    return this.#security;
  }

  addServer(v: string): OpenApi;
  addServer(v: unknown): OpenApi;
  addServer(v: unknown): OpenApi {
    if (typeof v === 'string') {
      v = {url: v}
    }
    this.#result.servers.push(v);
    return this;
  }

  add(routes: Route[]): unknown[];
  add(routes: Route): unknown[]; 
  add(routes: Route[] | Route): unknown[] {

    let routes2: Route[] = [];

    if (!Array.isArray(routes)) {
      routes2 = [routes];
    } else {
      routes2 = routes;
    }

    const results: unknown[] = [];
  
    routes2.forEach((route) => {
      // format route to add by methods
      Object.keys(route.methods).forEach((method: string) => {
        if (!route.methods[method]) {
          return;
        }
        const r: RouteSchema = {
          path: route.path,
          method,
        };
        Object.keys(route).forEach((p) => {
          r[p] = route[p];
        });
        results.push(this._add(r));
      });
    });
  
    return results.filter((r) => r);
  }

  remove(path: string, method?: string): unknown[] {
    const r: unknown[] = [];
    if(this.#result.paths[path]) {
      if (method) {
        if (this.#result.paths[path][method]) {
          r.push({
            path,
            method,
            schema: this.#result.paths[path][method]
          });
          delete this.#result.paths[path][method];
        }
        if (!Object.keys(this.#result.paths[path]).length) {
          delete this.#result.paths[path];
        }
      } else {
        Object.keys(this.#result.paths[path]).forEach(m => {
          r.push({
            path,
            method: m,
            schema: this.#result.paths[path][m]
          });
        });
        delete this.#result.paths[path];
      }
    }
    return r;
  }

  private _getResponsesSchema(responses?: ResponsesRecord): ResponsesRecord {
    let r: ResponsesRecord = {};
    if (responses
      && this.responsesProperty) {
      const tmp = responses[this.responsesProperty];
      if (tmp && typeof tmp === 'object') {
        Object.assign(r, tmp);
      }
    } else {
      r = responses || r;
    }
    return r;
  }

  private _add(route: RouteSchema): unknown {

    const parameters = route.parameters || {};
    const responses = this._getResponsesSchema(route.responses);

    const path = formatPath(route.path, parameters.params);
    const method = route.method;
    const description = route.description || '';
    const tags = route.tags || [];
    const auth = route.auth;

    const operationId = parameters.operationId;
    const undoc = parameters.undoc;

    let consumes: string[] = ['application/json'];
    let produces: unknown = parameters.produces;
    let security: unknown[] = this.#security;

    // if it shouldn't be documented
    if (undoc) {
      return;
    }

    // format consumes
    if (!Array.isArray(parameters.consumes)) {
      if (parameters.consumes && typeof parameters.consumes === 'string') {
        consumes = [parameters.consumes];
      } else {
        if (this.#consumes.length) {
          consumes = this.#consumes;
        }
      }
    } else {
      consumes = parameters.consumes;
    }

    // format produces
    if (!Array.isArray(produces)) {
      if (produces && typeof produces == 'string') {
        produces = [produces];
      } else {
        produces = undefined;
      }
    }

    // format security
    if (!Array.isArray(parameters.security)) {
      if (parameters.security && typeof parameters.security == 'object') {
        security = [security];
      } else if (parameters.security && typeof parameters.security == 'string') {
        security = [{ [parameters.security]: [] }];
      } else {
        security = this.#security;
      }
    } else {
      security = parameters.security.map((s) => {
        if (s && typeof s == 'string') {
          s = { [s]: [] };
        }
        return s;
      });
    }

    const schema: Record<string, unknown> = {
      summary: description,
      tags: tags,
    };

    if (operationId) {
      schema.operationId = operationId;
    }

    if (auth) {
      if (!security.length) {
        // Log.warn("Missing 'security' for route: %s %s", method, path);
      } else {
        schema.security = security;
      }
    }

    // format parameters, requestBody, responses
    const formattedParameters: PropertySchemaObject[] = this._formatParameters(parameters);
    const formattedRequestBody: RequestBodyObject = this._formatRequestBody(parameters, consumes);
    schema.responses = this._formatResponses(responses);

    if (formattedRequestBody && Object.keys(formattedRequestBody).length) {
      schema.requestBody = formattedRequestBody;
    }
    if (formattedParameters && formattedParameters.length) {
      schema.parameters = formattedParameters;
    }

    this.#result.paths[path] = this.#result.paths[path] || {};
    this.#result.paths[path][method] = schema;

    // Log.info('added route [%s %s]: %O', method, path, schema);

    return {
      path,
      method,
      schema: this.#result.paths[path][method],
    };
  }

  private _formatResponses(routeResponses: ResponsesRecord): ResponsesRecord {
    // format responses
    const responses: ResponsesRecord = {};
  
    Object.keys(routeResponses).forEach((p) => {
      responses[p] = routeResponses[p];
    });
  
    // if none
    if (!Object.keys(responses).length) {
      responses.default = {
        description: 'none',
      };
    }
  
    return responses;
  }

  // format parameters methods
  private _formatParameters(parameters: RouteParameters): PropertySchemaObject[] {
    // format parameters
    const res: PropertySchemaObject[] = [];

    const paramsHelper = new this.#helperClass(parameters);
    let children: Record<string, GeneratorHelperInterface> | undefined;
    if (paramsHelper.isValid()) {
      children = paramsHelper.getChildren();
    }

    if(parameters.headers) {
      this._pushPathParameters('header', parameters.headers, res);
    } else if(children && children.headers) {
      this._pushPathParameters('header', children.headers, res);
    }
    if(parameters.params) {
      this._pushPathParameters('path', parameters.params, res);
    } else if(children && children.params) {
      this._pushPathParameters('path', children.params, res);
    }
    if(parameters.query) {
      this._pushPathParameters('query', parameters.query, res);
    } else if(children && children.query) {
      this._pushPathParameters('query', children.query, res);
    }
    if(parameters.cookies) {
      this._pushPathParameters('cookie', parameters.cookies, res);
    } else if(children && children.cookies) {
      this._pushPathParameters('cookie', children.cookies, res);
    }
  
    return res;
  }

  private _pushPathParameters(key: string, value: Record<string, unknown> | GeneratorHelperInterface, res: PropertySchemaObject[]) {
    const valueHelper = value instanceof this.#helperClass ? value : new this.#helperClass(value);
    let valueHelperType = '';
    
    let children: Record<string, GeneratorHelperInterface>;
    if (valueHelper.isValid()) {
      valueHelperType = formatType(valueHelper.getType()).type;
      children = valueHelper.getChildren();
    }
  
    const getChildrenNames = () => {
      if (children) {
        return Object.keys(children);
      }
      return Object.keys(value);
    };
  
    const getChild = (name: string): GeneratorHelperInterface | undefined => {
      if (children) {
        return children[name];
      }
      if (value instanceof this.#helperClass) {
        return;
      }
      return new this.#helperClass(value[name]);
    };

    const handleChild = (name: string, helper: GeneratorHelperInterface, schemaObject?: PropertySchemaObject) => {
      if (!helper.isValid()) return;
  
      const defaultSchemaObject: PropertySchemaObject = {};

      if(schemaObject) {
        Object.keys(schemaObject).forEach(k => {
          defaultSchemaObject[k] = schemaObject[k];
        });
      }

      defaultSchemaObject['name'] = name;
      defaultSchemaObject['in'] = key;

      let parameterObject = this._createParameterObject(key, helper, defaultSchemaObject);

      // ReferenceObject | ParameterObject
      parameterObject = this._autoParameterObjectToRef(helper, parameterObject);

      res.push(parameterObject);
    };


    getChildrenNames().forEach((name: string) => {
      const helper = getChild(name);
      if (helper) {
        handleChild(name, helper);
      }
    });

    // e.g.: enable additional query
    if (valueHelperType === 'object') {
      if (valueHelper.getAdditionalProperties
        && valueHelper.hasAdditionalProperties 
        && valueHelper.hasAdditionalProperties()) {
          const schemaObject: PropertySchemaObject = {};
          if (!(valueHelper.getStyle 
            && valueHelper.hasStyle 
            && valueHelper.hasStyle())) {
              schemaObject.style = 'form';
            }
          handleChild(key, valueHelper, schemaObject);
      }
    }
  }

  /**
   * 
   * @param location path, query, header or cookie
   * @param helper 
   * @param defaultParameterObject 
   * @returns 
   */
  private _createParameterObject(
    location: string, 
    helper: GeneratorHelperInterface,
    defaultParameterObject?: PropertySchemaObject): PropertySchemaObject {
    const parameterObject = new PropertySchema(defaultParameterObject)
      .setRequired(helper.isRequired())
      .setSchema(formatType(helper.getType()));

    
    const propSchema = this._createBasicSchema(helper);
    const description = propSchema.getDescription();

    if (description) {
      parameterObject.setDescription(
        description
      );
    }

    if (propSchema.isType('array')) {
      // allowing multiple values by repeating the query parameter
      if (location === 'query') {
        parameterObject.setExplode(true);
      }
    }

    if (propSchema.isType('object')) {
      // style ?
      if(!parameterObject.hasStyle()) {
        parameterObject.setStyle('deepObject');
      }
    }

    // examples
    if(helper?.hasExamples?.()
      && helper.getExamples) {
        parameterObject.setExamples(helper.getExamples());
    }

    // handle deprecated
    if(helper.isDeprecated()) {
      parameterObject.setDeprecated(true);
    }
    // handle style
    if(!parameterObject.hasStyle()
      && helper.getStyle
      && helper.hasStyle
      && helper.hasStyle()) {
        parameterObject.setStyle(helper.getStyle());
    }
  
    // allowEmptyValue
    if (location !== 'path' && helper.allowsEmptyValue()) {
      parameterObject.setAllowEmptyValue(
        helper.allowsEmptyValue()
      );
    }

    let schemaObject = propSchema.toObject();
    if (!Array.isArray(schemaObject.required)) {
      delete schemaObject.required;
    }
  
    // ReferenceObject | SchemaObject
    schemaObject = this._autoSchemaObjectToRef(helper, schemaObject);
    parameterObject.setSchema(schemaObject);
  
    return parameterObject.toObject();
  }
  
  // format body methods
  private _formatRequestBody(parameters: RouteParameters, consumes: string[]) {
    // format body
    let res: RequestBodyObject = {};
  
    // body|files
    if (parameters.body || parameters.files) {
      this._pushRequestBody(parameters.body, parameters.files, consumes, res);
    } else {
      const bodyHelper = new this.#helperClass(parameters);
      if(bodyHelper.isValid()) {
        const children = bodyHelper.getChildren();
        if( children.body || children.files ) {
          this._pushRequestBody(children.body, children.files, consumes, res);
        }
        // ReferenceObject | RequestBodyObject
        res = this._autoRequestBodyObjectToRef(bodyHelper, res);
      }
    }
  
    return res;  
  }

  private _pushRequestBody(
    body: Record<string, unknown> | GeneratorHelperInterface | undefined, 
    files: Record<string, unknown> | GeneratorHelperInterface | undefined, 
    consumes: string[], 
    res: RequestBodyObject) {

    let schemaObject: PropertySchemaObject | undefined;

    let bodySchema: PropertySchema | undefined; 
    let filesSchema: PropertySchema | undefined;

    let helperWithRef: GeneratorHelperInterface | undefined;

    let examples: Record<string, Record<string, unknown>> | undefined;
    let encoding: Record<string, Record<string, unknown>> | undefined;

    if (body) {
      const bodyHelper = body instanceof this.#helperClass ? body : new this.#helperClass(body);
      if(bodyHelper.isValid()) {
        bodySchema = this._createSchema(bodyHelper);
        if(this._getLocalRef(bodyHelper)){
          helperWithRef = bodyHelper;
        }
        if (bodyHelper?.hasExamples?.()
          && bodyHelper.getExamples) {
            examples = bodyHelper.getExamples();
          }
        if (bodyHelper?.hasEncoding?.()
          && bodyHelper.getEncoding) {
            encoding = bodyHelper.getEncoding();
          }

        schemaObject = bodySchema.toObject();
      } else if(!(body instanceof this.#helperClass)) {
        bodySchema = new PropertySchema({
          type: 'object',
          required: [],
          properties: {},
        }).setRequiredToArray();
        Object.keys(body).forEach(
          name => {
            const childHelper = new this.#helperClass(body[name]);
            if(!childHelper.isValid()) {
              return;
            }
            const propertySchemaObject = this._createSchemaObject(
              childHelper, 
              bodySchema, 
              name
            );
            bodySchema?.setProperty(name, propertySchemaObject);
          }
        );
        schemaObject = bodySchema.toObject();
      }
    }

    if (files && (!schemaObject || bodySchema?.isType('object'))) {
      const filesHelper = files instanceof this.#helperClass ? files : new this.#helperClass(files);
      
      // mix with bodySchema or create new
      const prop = bodySchema || new PropertySchema({
        type: 'object',
        required: [],
        properties: {},
      }).setRequiredToArray();
      
      if(filesHelper.isValid()) {
        if (!bodySchema && filesHelper.getType() !== 'object') {
          filesSchema = this._createSchema(filesHelper, undefined, undefined, 'binary');
          if(this._getLocalRef(filesHelper)){
            helperWithRef = filesHelper;
          }
          schemaObject = filesSchema.toObject();
        } else if(filesHelper.getType() === 'object'){
          const filesFields = filesHelper.getChildren();
          Object.keys(filesFields).forEach(
            name => {
              const childHelper = filesFields[name];
              if(!childHelper.isValid()) {
                return;
              }
              const propertySchemaObject = this._createSchemaObject(
                childHelper, 
                prop, 
                name,
                'binary'
              );
              prop.setProperty(name, propertySchemaObject);
            }
          );
          schemaObject = prop.toObject();
        }
      } else if(!(files instanceof this.#helperClass)) {
        Object.keys(files).forEach(
          name => {
            const childHelper = new this.#helperClass(files[name]);
            if(!childHelper.isValid()) {
              return;
            }
            const propertySchemaObject = this._createSchemaObject(
              childHelper, 
              prop, 
              name,
              'binary'
            );
            prop.setProperty(name, propertySchemaObject);
          }
        );
        schemaObject = prop.toObject();
      }
    }

    if (schemaObject && schemaObject.required) {
      res.required = true;
      if(!Array.isArray(schemaObject.required)) {
        delete schemaObject.required;
      }
    }

    if (helperWithRef && schemaObject) {
      // ReferenceObject | SchemaObject
      schemaObject = this._autoSchemaObjectToRef(helperWithRef, schemaObject);
    }

    res.content = {};

    const content: MediaTypeObject = {};

    if(schemaObject) {
      content.schema = schemaObject;
    }

    if (examples) {
      content.examples = examples;
    }
    if (encoding) {
      content.encoding = encoding;
    }

    consumes.forEach((mime: string) => {
      if (res.content) {
        res.content[mime] = content;
      }
    });   
  }

  // -- schema object creation methods


  /**
   * create non-alternative schema
   * @param helper
   * @param parentProp used for required children/items
   * @param name used for required children
   * @param format used for 'binary' format
   * @returns 
   */
  private _createBasicSchema(
    helper: GeneratorHelperInterface,
    parentProp?: PropertySchema,
    name?: string,
    format?: string
  ): PropertySchema {
    const prop = new PropertySchema(formatType(helper.getType()));

    let description = '';
    // description
    if (helper.getDescription()) {
      description = helper.getDescription();
    }
  
    // unit
    if (helper.getUnit()) {
      if (description) {
        description += ` (${helper.getUnit()})`
      } else {
        description = `(${helper.getUnit()})`
      }
    }

    // description
    if (description) {
      prop.setDescription(
        description
      );
    }

    // default
    if (helper.hasDefaultValue()) {
      prop.setDefault(
        helper.getDefaultValue()
      );
    }

    // example
    if (helper.hasExampleValue()) {
      prop.setExample(
        helper.getExampleValue()
      );
    }
  
    // enum
    if (helper.getEnum().length) {
      prop.setEnum(helper.getEnum());
    }

    // required
    if (helper.isRequired()) {
      if (parentProp?.isType('object') && name) {
        parentProp.setRequiredToArray();
        parentProp.pushIntoRequired(name);
      } else if (parentProp?.isType('array')) {
        parentProp.setMin(
          typeof parentProp.getMin() !== 'undefined' ?
            parentProp.getMin() : 1
        );
      } else {
        prop.setRequired(true);
      }
    }

    // min, max, ...
    if (helper.hasMin()) {
      prop.setMin(helper.getMin());
    }
    if (helper.hasMax()) {
      prop.setMax(helper.getMax());
    }

    if (prop.isType('array')) {
      this._fillArraySchemaObject(helper, prop, format);
    } else if(format) {
      prop.setFormat(format);
      if (format === 'binary') {
        prop.setType('string');
      }
    }

    if (prop.isType('object')) {
      this._fillObjectSchemaObject(helper, prop);
    }

    if(helper.getXml
      && helper.hasXml
      && helper.hasXml()) {
        prop.setXml(helper.getXml());
    }
  
    return prop;
  }

  /**
   * 
   * @param helper 
   * @param parentProp used for required children/items
   * @param name used for required children
   * @param format used for 'binary' format
   * @returns 
   */
  private _createSchema(
    helper: GeneratorHelperInterface,
    parentProp?: PropertySchema,
    name?: string,
    format?: string
  ): PropertySchema {
    if (helper.getType() === 'alternatives') {
      return this._createAlternativeSchema(helper, parentProp, name);
    }

    return this._createBasicSchema(helper, parentProp, name, format);
  }

  /**
   * 
   * @param helper 
   * @param parentProp used for required children/items
   * @param name used for required children
   * @param format used for 'binary' format
   * @returns 
   */
  private _createSchemaObject(
    helper: GeneratorHelperInterface,
    parentProp?: PropertySchema,
    name?: string,
    format?: string
  ): PropertySchemaObject {

    if (helper.getType() === 'alternatives') {
      return this._createAlternativeSchemaObject(helper, parentProp, name);
    }

    const prop = this._createBasicSchema(helper, parentProp, name, format);

    // ReferenceObject | SchemaObject
    const schemaObject = this._autoSchemaObjectToRef(helper, prop.toObject());
    return schemaObject;
  }

  private _createAlternativeSchema(
    altHelper: GeneratorHelperInterface,
    parentProp?: PropertySchema,
    name?: string
  ): PropertySchema {
    return new PropertySchema(this._createAlternativeSchemaObject(altHelper, parentProp, name));
  }

  private _createAlternativeSchemaObject(
    altHelper: GeneratorHelperInterface,
    parentProp?: PropertySchema,
    name?: string
  ): PropertySchemaObject {
    const prop = new PropertySchema({oneOf: []});

    let description = '';
    // description
    if (altHelper.getDescription()) {
      description = altHelper.getDescription();
    }
  
    // unit
    if (altHelper.getUnit()) {
      if (description) {
        description += ` (${altHelper.getUnit()})`
      } else {
        description = `(${altHelper.getUnit()})`
      }
    }

    // description
    if (description) {
      prop.setDescription(
        description
      );
    }

    // default
    if (altHelper.hasDefaultValue()) {
      prop.setDefault(
        altHelper.getDefaultValue()
      );
    }

    // example
    if (altHelper.hasExampleValue()) {
      prop.setExample(
        altHelper.getExampleValue()
      );
    }

    // required
    if (altHelper.isRequired()) {
      if (parentProp?.isType('object') && name) {
        parentProp.setRequiredToArray();
        parentProp.pushIntoRequired(name);
      } else if (parentProp?.isType('array')) {
        parentProp.setMin(parentProp.getMin() || 1);
      } else {
        prop.setRequired(true);
      }
    }

    // discriminator
    if (altHelper.hasDiscriminator
      && altHelper.getDiscriminator
      && altHelper.hasDiscriminator()) {
        prop.setDiscriminator(altHelper.getDiscriminator());
      }

    const altSchemaObject = prop.toObject();
    altHelper.getAlternatives().forEach(
      helper => {
        if (helper.isValid()){
          altSchemaObject?.oneOf?.push(this._createSchemaObject(helper));
        }
      }
    );
    return altSchemaObject;
  }

  private _fillArraySchemaObject(
    helper: GeneratorHelperInterface,
    propSchema: PropertySchema,
    format?: string
  ) {
    // only for "array"
    if (propSchema.isType('array')) {
      if (format === 'binary') {
        propSchema.setItems({
          type: 'string',
          format: format
        });
      } else {
        if(format) {
          propSchema.setFormat(format);
        }
        
        // unique
        propSchema.setUniqueItems(helper.hasRule('unique'));
        
        // items
        const firstItem = helper.getFirstItem();
        if (firstItem && firstItem.isValid()) {
          const schemaObject = this._createSchemaObject(firstItem, propSchema, 'items');
          propSchema.setItems(schemaObject);
        } else {
          propSchema.setItems(formatType('any'));
        }
      }
    }
  }

  private _fillObjectSchemaObject(
    helper: GeneratorHelperInterface,
    propSchema: PropertySchema
  ) {
    // only for "object"
    if (propSchema.isType('object')) {
      // check if it has defined keys
      const children = helper.getChildren();
      if (Object.keys(children).length) {
        propSchema.setProperties({});
        Object.keys(children).forEach((k) => {
          const schemaObject = this._createSchemaObject(children[k], propSchema, k);
          propSchema.setProperty(k, schemaObject);
        });
      }

      // additional properties ?
      if(helper.getAdditionalProperties
        && helper.hasAdditionalProperties
        && helper.hasAdditionalProperties()) {
          propSchema.setAdditionalProperties(helper.getAdditionalProperties());
      }
    }
  }

  private _autoSchemaObjectToRef(
    helper: GeneratorHelperInterface,
    schemaObject: PropertySchemaObject
  ): PropertySchemaObject {
    let newSchema = schemaObject;
    const ref: string | undefined = this._getLocalRef(helper, 'schemas');
    const remoteRef: string | undefined = this._getRemoteRef(helper);
    if (ref) {
      const entityName: string = this._localRefToEntityName(ref);
      if (entityName && newSchema) {
        if (this.#generateComponentsRule === GenerateComponentsRules.always) {
          this.addSchema(entityName, newSchema);
        } else if(this.#generateComponentsRule === GenerateComponentsRules.undefined) {
          if (!this.hasSchema(entityName)) {
            this.addSchema(entityName, newSchema);
          }
        }
        newSchema = {
          $ref: ref
        };
      }
    } else if(remoteRef) {
      newSchema = {
        $ref: remoteRef
      };
    }
    return newSchema;
  }

  private _autoParameterObjectToRef(
    helper: GeneratorHelperInterface,
    schemaObject: PropertySchemaObject
  ): PropertySchemaObject {
    let newSchema = schemaObject;
    const ref: string | undefined = this._getLocalRef(helper, 'parameters');
    const remoteRef: string | undefined = this._getRemoteRef(helper);
    if (ref) {
      const entityName: string = this._localRefToEntityName(ref);
      if (entityName && newSchema) {
        if (this.#generateComponentsRule === GenerateComponentsRules.always) {
          this.addParameter(entityName, newSchema);
        } else if(this.#generateComponentsRule === GenerateComponentsRules.undefined) {
          if (!this.hasParameter(entityName)) {
            this.addParameter(entityName, newSchema);
          }
        }
        newSchema = {
          $ref: ref
        };
      }
    } else if(remoteRef) {
      newSchema = {
        $ref: remoteRef
      };
    }
    return newSchema;
  }

  private _autoRequestBodyObjectToRef(
    helper: GeneratorHelperInterface,
    schemaObject: RequestBodyObject
  ): RequestBodyObject {
    let newSchema = schemaObject;
    const ref: string | undefined = this._getLocalRef(helper, 'requestBodies');
    const remoteRef: string | undefined = this._getRemoteRef(helper);
    if (ref) {
      const entityName: string = this._localRefToEntityName(ref);
      if (entityName && newSchema) {
        if (helper.getDescription()) {
          newSchema.description = helper.getDescription();
        }
        if (this.#generateComponentsRule === GenerateComponentsRules.always) {
          this.addRequestBody(entityName, newSchema);
        } else if(this.#generateComponentsRule === GenerateComponentsRules.undefined) {
          if (!this.hasRequestBody(entityName)) {
            this.addRequestBody(entityName, newSchema);
          }
        }
        newSchema = {
          $ref: ref
        };
      }
    } else if(remoteRef) {
      newSchema = {
        $ref: remoteRef
      };
    }
    return newSchema;
  }

  private _getLocalRef(
    helper: GeneratorHelperInterface,
    componentCategory = 'schemas'
  ): string | undefined {
    let r: string | undefined;
    if(helper.getRef && helper.hasRef && helper.hasRef()) {
      const ref = helper.getRef();
      if (ref && typeof ref === 'string') {
        const innerSchemaRefPrefix = `#/components/${componentCategory}/`;
        if (ref.startsWith(innerSchemaRefPrefix)) {
          r = ref;
        }
      }
    }
    return r;
  }

  private _getRemoteRef(
    helper: GeneratorHelperInterface
  ): string | undefined {
    let r: string | undefined;
    if(helper.getRef && helper.hasRef && helper.hasRef()) {
      const ref = helper.getRef();
      if (ref && typeof ref === 'string') {
        if (!ref.startsWith('#/')) {
          r = ref;
        }
      }
    }
    return r;
  }

  private _localRefToEntityName(ref: string): string {
    const entityName = ref.substring(ref.lastIndexOf('/') + 1);
    return entityName;
  }

  result(): Record<string, unknown> {
    return this.#result;
  }
}
