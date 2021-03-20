/*
const Log = require('./_log').extend('openapi');
*/
/**
 * @todo: type "alternative" (oneOf)
 * @todo: remove useless methods
 * @todo: change var, method names (eg: _fillBodyPropertySchema, ...)
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
 */

import { GeneratorHelperInterface } from '../utils/generatorHelper'
import { JoiGeneratorHelper } from '../utils/joiGeneratorHelper';
import { PropertySchema, PropertySchemaObject } from './openapi/propertySchema';
import { 
  SecuritySchemeObject, 
  
  /*ComponentsObject,
  HeaderObject,
  ParameterObject,
  ResponseObject,
  ReferenceObject*/
} from './openapi/definitions';


interface TagObject {
  name: string;
  description?: string;
  externalDocs?: {
    url: string;
    description?: string;
  }
}

interface OpenAPIResultExplicit {
  info: Record<string, unknown>;
  servers: unknown[];
  //components: ComponentsObject;
  components: {
    schemas?: {
      [key: string]: PropertySchemaObject;
    },
    requestBodies?: {
      [key: string]: RequestBody;
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
}

interface OpenAPIResult extends OpenAPIResultExplicit {
  [key: string]: unknown;
}

interface RouteParametersExplicit {
  params?: Record<string, unknown>;
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
  files?: Record<string, unknown>;
  headers?: Record<string, unknown>;
  cookies?: Record<string, unknown>;
}

interface RouteParameters extends RouteParametersExplicit {
  [key: string]: unknown;
}

interface Route {
  path: string;
  methods: Record<string, unknown>;
  [key: string]: unknown;
}

interface RouteSchemaExplicit {
  path: string;
  method: string;
  name?: string;
  description?: string;
  parameters?: RouteParameters;
  responses?: ResponseSchema;
  auth?: unknown;
  tags?: unknown;

  operationId?: string;
  consumes?: unknown;
  produces?: unknown;
  security?: unknown;
  undoc?: boolean;
}

interface RouteSchema extends RouteSchemaExplicit {
  [key: string]: unknown;
}

interface MimeContentExplicit {
  schema?: PropertySchemaObject;
  $ref?: string; // should be string
}

interface MimeContent extends MimeContentExplicit{
  [key: string]: unknown;
}

interface RequestBodyExplicit {
  content?: Record<string, MimeContent>;
}

interface RequestBody extends RequestBodyExplicit {
  [key: string]: unknown;
}

interface ResponseSchema {
  default?: {description?: string, [key: string]: unknown};
  [key: string]: unknown;
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
    t.format = type
  }

  return t;
}

export class OpenApi {
  #consumes: string[];
  #result: OpenAPIResult;
  #security: unknown[];
  #helperClass: { new(args: unknown): GeneratorHelperInterface };

  responsesProperty?: string;

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

  private _getResponsesSchema(responses?: ResponseSchema): ResponseSchema {
    let r: ResponseSchema = {};
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
    const formattedRequestBody: RequestBody = this._formatRequestBody(parameters, consumes);
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

  private _formatResponses(routeResponses: Record<string, unknown>): ResponseSchema {
    // format responses
    const responses: ResponseSchema = {};
  
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
      /*
      switch (key) {
        case 'files':
          defaultSchemaObject['in'] = 'formData';
          break;
        default:
          defaultSchemaObject['in'] = key;
          break;
      }*/
      const propSchema = (this._createPropertySchema(key, helper, defaultSchemaObject)).toObject();

      let parameterObject = propSchema;

      if(helper.getRef && helper.hasRef && helper.hasRef()) {
        const ref = helper.getRef();
        if (ref && typeof ref === 'string') {
          const innerSchemaPrefix = '#/components/parameters/'; 
          if (ref.startsWith(innerSchemaPrefix)) {
            const refName: string = ref.substring(innerSchemaPrefix.length);
            if (refName) {
              this.addParameter(refName, propSchema);
              parameterObject = {
                $ref: ref
              };
            }
          }
        }
      }

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
  
  private _createPropertySchema(
    key: string, 
    helper: GeneratorHelperInterface,
    defaultSchemaObject?: PropertySchemaObject): PropertySchema {
    const prop = new PropertySchema(defaultSchemaObject)
      .setRequired(helper.isRequired())
      .setSchema(formatType(helper.getType()));
  
    this._fillPropertySchema(prop, helper);
  
    /*
    switch (key) {
      case 'files':
        prop.setType('file');
        break;
      default:
        break;
    }*/

    // handle deprecated
    if(helper.isDeprecated()) {
      prop.setDeprecated(true);
    }
    // handle style
    if(!prop.hasStyle()
      && helper.getStyle
      && helper.hasStyle
      && helper.hasStyle()) {
      prop.setStyle(helper.getStyle());
    }
  
    // allowEmptyValue
    if (key !== 'path' && helper.allowsEmptyValue()) {
      prop.setAllowEmptyValue(
        helper.allowsEmptyValue()
      );
    }
  
    // array items
    if (prop.getSchemaProp('type') === 'array') {
      if (key === 'query') {
        // allowing multiple values by repeating the query parameter
        prop.setExplode(true);
      }
      // schema item
      const firstItem = helper.getFirstItem();
      if (firstItem && firstItem.isValid()) {
        prop.setSchemaProp('items', formatType(firstItem.getType()));
      } else {
        prop.setSchemaProp('items', formatType('any'));
      }
    }

    // object items
    if (prop.getSchemaProp('type') === 'object') {
      // check if it has defined keys
      const children = helper.getChildren();
      if (Object.keys(children).length) {
        const propSchema = new PropertySchema({
          type: 'object',
          required: [],
          properties: {},
        }).setRequiredToArray();
        Object.keys(children).forEach((k) => {
          this._fillBodyPropertySchema(k, children[k], propSchema);
        });
        prop.setSchema(propSchema.toObject());
      }

      // additional properties ?
      if(helper.getAdditionalProperties
        && helper.hasAdditionalProperties
        && helper.hasAdditionalProperties()) {
        prop.setSchemaProp('additionalProperties', helper.getAdditionalProperties());
      }

      // style ?
      if(!prop.hasStyle()) {
        prop.setStyle('deepObject');
      }
    }
  
    // min, max, ...
    if (helper.hasMin()) {
      prop.setSchemaProp('minimum', helper.getMin());
    }
    if (helper.hasMax()) {
      prop.setSchemaProp('maximum', helper.getMax());
    }

    if(helper.getRef && helper.hasRef && helper.hasRef()) {
      const ref = helper.getRef();
      if (ref && typeof ref === 'string') {
        const innerSchemaPrefix = '#/components/schemas/';
        if (ref.startsWith(innerSchemaPrefix)) {
          const refName: string = ref.substring(innerSchemaPrefix.length);
          const propSchema = prop.toObject().schema;
          if (refName && propSchema) {
            propSchema.description = prop.getDescription();
            this.addSchema(refName, propSchema)
            prop.setSchema({
              $ref: ref
            });
          }
        }
      }
    } 
  
    return prop;
  }

  // format body methods
  private _formatRequestBody(parameters: RouteParameters, consumes: string[]) {
    // format body
    let res: RequestBody = {};
  
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
        if(bodyHelper.getRef && bodyHelper.hasRef && bodyHelper.hasRef()) {
          const ref = bodyHelper.getRef();
          if (ref && typeof ref === 'string') {
            const innerSchemaPrefix = '#/components/requestBodies/';
            if (ref.startsWith(innerSchemaPrefix)) {
              const refName: string = ref.substring(innerSchemaPrefix.length);
              if (refName) {
                if (bodyHelper.getDescription()) {
                  res.description = bodyHelper.getDescription();
                }
                this.addRequestBody(refName, res);
                res = {
                  $ref: ref
                };
              }
            }
          }
        }
      }
    }
  
    return res;  
  }

  private _pushRequestBody(
    bodyProps: Record<string, unknown> | GeneratorHelperInterface | undefined, 
    fileProps: Record<string, unknown> | GeneratorHelperInterface | undefined, 
    consumes: string[], 
    res: RequestBody) {

    const prop = new PropertySchema({
      type: 'object',
      required: [],
      properties: {},
    }).setRequiredToArray();
  
    const params = [bodyProps, fileProps]
  
    let ref: unknown = '';

    params.forEach(
      (value, i) => {
        if (value) {
          const valueHelper = value instanceof this.#helperClass ? value : new this.#helperClass(value);
          let children: Record<string, GeneratorHelperInterface>;
          if(valueHelper.isValid()) {
            children = valueHelper.getChildren();

            // description
            if (valueHelper.getDescription()) {
              prop.setDescription(valueHelper.getDescription());
            }

            // check ref
            if (valueHelper.getRef && valueHelper.hasRef && valueHelper.hasRef()) {
              if (ref && ref !== valueHelper.getRef()) {
                ref = '';
              } else {
                ref = valueHelper.getRef();
              }
            }
          }
      
          const getChildrenNames = () => {
            if(children) {
              return Object.keys(children);
            }
            return Object.keys(value);
          }
      
          const getChild = (name: string) => {
            if(children) {
              return children[name];
            }
            if (value instanceof this.#helperClass) {
              return;
            }
            return new this.#helperClass(value[name]);
          }

          getChildrenNames().forEach((name: string) => {
            const helper = getChild(name);
        
            if (!helper || !helper.isValid()) return;
            
            this._fillBodyPropertySchema(
              name, 
              helper,
              prop,
              i ? 'binary': undefined);
          });
        }
    })

    res.content = {};

    if (prop.isRequired()) {
      res.required = true
    }

    if (ref && typeof ref === 'string') {
      const innerSchemaPrefix = '#/components/schemas/';
      if (ref.startsWith(innerSchemaPrefix)) {
        const refName: string = ref.substring(innerSchemaPrefix.length);
        if (refName) {
          this.addSchema(refName, prop.toObject())
        } else {
          ref = '';
        }
      } else {
        ref = '';
      }
    } else {
      ref = '';
    }

    consumes.forEach((mime: string) => {
      if (res.content) {
        if (ref && typeof ref === 'string') {
          res.content[mime] = {
            schema: {
              $ref: ref
            }
          }; 
        } else {
          res.content[mime] = {
            schema: prop.toObject()
          }; 
        }
      }
    });    
  }

  private _fillBodyPropertySchema(
    name: string, 
    helper: GeneratorHelperInterface, 
    propSchema: PropertySchema,
    defaultFormat?: string
  ) {
    const prop = new PropertySchema(formatType(helper.getType()));
  
    this._fillPropertySchema(prop, helper, true);
  
    // required
    if (helper.isRequired()) {
      if (propSchema.isType('object')) {
        propSchema.setRequiredToArray();
        propSchema.pushIntoRequired(name);
      } else if (propSchema.isType('array')) {
        propSchema.setMin(propSchema.getMin() || 1);
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
  
    // only for "array"
    if (prop.isType('array')) {
      if (defaultFormat === 'binary') {
        prop.setItems({
          type: 'string',
          format: defaultFormat
        });
      } else {
        if(defaultFormat) {
          prop.setFormat(defaultFormat);
        }
        
        // unique
        prop.setUniqueItems(helper.hasRule('unique'));
        
        // items
        const firstItem = helper.getFirstItem();
        if (firstItem && firstItem.isValid()) {
          //@todo: fill items validation if array
          prop.setItems({});
          this._fillBodyPropertySchema('items', firstItem, prop);
        } else {
          prop.setItems(formatType('any'));
        }
      }
    } else if(defaultFormat) {
      prop.setFormat(defaultFormat);
      if (defaultFormat === 'binary') {
        prop.setType('string');
      }
    }

    // only for "object"
    if (prop.isType('object')) {
      // check if it has defined keys
      const children = helper.getChildren();
      if (Object.keys(children).length) {
        prop.setProperties({});
        Object.keys(children).forEach((k) => {
          this._fillBodyPropertySchema(k, children[k], prop);
        });
      }
    }


    let schemaObject = prop.toObject();

    // reference object ?
    if(helper.getRef && helper.hasRef && helper.hasRef()) {
      const ref = helper.getRef();
      if (ref && typeof ref === 'string') {
        const innerSchemaPrefix = '#/components/schemas/';
        if (ref.startsWith(innerSchemaPrefix)) {
          const refName: string = ref.substring(innerSchemaPrefix.length);
          const newSchema = prop.toObject();
          if (refName && newSchema) {
            this.addSchema(refName, newSchema)
            schemaObject = {
              $ref: ref
            };
          }
        }
      }
    }

    // store "prop" into "propSchema"
    if (propSchema.isType('object') && propSchema.hasProperties()) {
      propSchema.setProperty(name, schemaObject);
    } else {
      propSchema.set(name, schemaObject);
    }
  }


  // other format methods
  private _fillPropertySchema(
    prop: PropertySchema, 
    helper: GeneratorHelperInterface, 
    forBody?: boolean) {
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

    if (description) {
      prop.setDescription(
        description
      );
    }
    
  
    // default
    if (helper.hasDefaultValue()) {
      if (forBody) {
        prop.setDefault(
          helper.getDefaultValue()
        );
      } else {
        prop.setSchemaProp(
          'default',
          helper.getDefaultValue()
        );
      }
    }

    // example
    if (helper.hasExampleValue()) {
      if (forBody) {
        prop.setExample(
          helper.getExampleValue()
        );
      } else {
        prop.setSchemaProp(
          'example',
          helper.getExampleValue()
        );
      }
    }
  
    // enum
    if (helper.getEnum().length) {
      if (forBody) {
        prop.setEnum(helper.getEnum());
      } else {
        prop.setSchemaProp(
          'enum',
          helper.getEnum()
        );
      }
    }
  }

  result(): Record<string, unknown> {
    return this.#result;
  }
}
