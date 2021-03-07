/*
const Log = require('./_log').extend('openapi');
const JoiUtils = require('./parameters/joiUtils');
*/

/**
 * @todo: removeRoute(method: string, path: string): boolean
 * @todo: handle "header" (as "params" and "query")
 * @todo: types date, date-time, password, ...
 * @todo: format email, uuid, ...
 */

import { GeneratorHelperInterface } from '../utils/generatorHelper'
import { JoiGeneratorHelper } from '../utils/joiGeneratorHelper';
import { PropertySchema, PropertySchemaObject } from './openapi/propertySchema';


interface OpenAPIResultExplicit {
  info: Record<string, unknown>;
  servers: unknown[];
  components: Record<string, unknown>;
  paths: Record<string, Record<string, unknown>>;
}

interface OpenAPIResult extends OpenAPIResultExplicit {
  [key: string]: unknown;
}

interface RouteParametersExplicit {
  params?: Record<string, unknown>;
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
  files?: Record<string, unknown>;
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
  schema: PropertySchemaObject;
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

function formatType(type: string): string {
  return type === 'any' ? 'object' : type;
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
      components: {}
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

  setDefinitions(v: Record<string, unknown>): OpenApi {
    this.#result.definitions = v;
    return this;
  }

  setSecuritySchemes(v: unknown): OpenApi {
    this.#result.components.securitySchemes = v;
    return this;
  }

  setSecurityDefinitions(v: unknown): OpenApi {
    return this.setSecuritySchemes(v);
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

    if(parameters.params) {
      this._pushPathParameters('params', parameters.params, res);
    }
    if(parameters.query) {
      this._pushPathParameters('query', parameters.query, res);
    }
  
    return res;
  }

  private _pushPathParameters(key: string, value: Record<string, unknown>, res: PropertySchemaObject[]) {
    const valueHelper = new this.#helperClass(value);
    let valueHelperType = '';
    
    let psChildren: Record<string, GeneratorHelperInterface>;
    if (valueHelper.isValid()) {
      valueHelperType = valueHelper.getType();
      psChildren = valueHelper.getChildren();
    }
  
    const psKeys = () => {
      if (psChildren) {
        return Object.keys(psChildren);
      }
      return Object.keys(value);
    };
  
    const psChild = (name: string): GeneratorHelperInterface => {
      if (psChildren) {
        return psChildren[name];
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
      switch (key) {
        case 'params':
          defaultSchemaObject['in'] = 'path';
          break;
        case 'files':
          defaultSchemaObject['in'] = 'formData';
          break;
        default:
          defaultSchemaObject['in'] = key;
          break;
      }
      const propSchema = this._createPropertySchema(key, helper, defaultSchemaObject);
      res.push(propSchema.toObject());
    };


    psKeys().forEach((name: string) => {
      const helper = psChild(name);
      handleChild(name, helper);
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
      .setSchema({
        type: helper.getType(),
      });
  
    this._fillPropertySchema(prop, helper);
  
    switch (key) {
      case 'files':
        prop.setType('file');
        break;
      default:
        break;
    }

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
    if (key !== 'params' && helper.allowsEmptyValue()) {
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
        prop.setSchemaProp('items', {
          type: formatType(firstItem.getType()),
        });
      } else {
        prop.setSchemaProp('items', {
          type: formatType('any'),
        });
      }
    }

    // object items
    if (prop.getSchemaProp('type') === 'object') {
      if(helper.getAdditionalProperties
        && helper.hasAdditionalProperties
        && helper.hasAdditionalProperties()) {
        prop.setSchemaProp('additionalProperties', helper.getAdditionalProperties());
      }
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
  
    return prop;
  }

  // format body methods
  private _formatRequestBody(parameters: RouteParameters, consumes: string[]) {
    // format body
    const res: RequestBody = {};
  
    // body|files
    if (parameters.body || parameters.files) {
      this._pushRequestBody(parameters.body, parameters.files, consumes, res);
    }
  
    return res;  
  }

  private _pushRequestBody(
    bodyProps: Record<string, unknown> | undefined, 
    fileProps: Record<string, unknown> | undefined, 
    consumes: string[], 
    res: RequestBody) {

    const prop = new PropertySchema({
      type: 'object',
      required: [],
      properties: {},
    }).setRequiredToArray();
  
    const params = [bodyProps, fileProps]
  
    params.forEach(
      (value, i) => {
        if (value) {
          const valueHelper = new this.#helperClass(value);
          let psChildren: Record<string, GeneratorHelperInterface>;
          if(valueHelper.isValid()) {
            psChildren = valueHelper.getChildren();
          }
      
          const psKeys = () => {
            if(psChildren) {
              return Object.keys(psChildren);
            }
            return Object.keys(value);
          }
      
          const psChild = (name: string) => {
            if(psChildren) {
              return psChildren[name];
            }
            return new this.#helperClass(value[name]);
          }

          psKeys().forEach((name: string) => {
            const helper = psChild(name);
        
            if (!helper.isValid()) return;
            
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

    consumes.forEach((mime: string) => {
      if (res.content) {
        res.content[mime] = {
          schema: prop.toObject()
        };
      }
    });    
  }

  private _fillBodyPropertySchema(
    name: string, 
    helper: GeneratorHelperInterface, 
    propSchema: PropertySchema,
    defaultFormat?: string
  ) {
    const prop = new PropertySchema({
      type: formatType(helper.getType())
    });
  
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
          prop.setItems({
            type: formatType('any')
          });
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

    // store "prop" into "propSchema"
    if (propSchema.isType('object') && propSchema.hasProperties()) {
      propSchema.setProperty(name, prop.toObject());
    } else {
      propSchema.set(name, prop.toObject());
    }
  }


  // other format methods
  private _fillPropertySchema(prop: PropertySchema, helper: GeneratorHelperInterface, forBody?: boolean) {
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

    // default
    if (helper.hasExampleValue()) {
      if (forBody) {
        prop.setDefault(
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
