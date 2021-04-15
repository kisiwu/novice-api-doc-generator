/**
 * @module postman
 */

/**
 * @todo: change var, method names ...
 */

import {
  Auth,
  AuthAttribute,
  AuthType,
  CollectionVersion,
  Description,
  EventObject,
  Folder,
  HeaderObject,
  InfoObject,
  Item,
  QueryParam,
  ResponseObject,
  UrlObject,
  Variable
} from './postman/definitions';

import { PostmanHelperInterface } from './postman/helpers/interfaces';
import { PostmanJoiHelper } from './postman/helpers/joiHelper';

import { formatPath, /*formatType,*/ Log } from './postman/utils';
import extend from 'extend';


interface ResponsesRecord {
  [key: string]: unknown;
}

interface RouteParameters {
  // validate
  params?: Record<string, unknown>;
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
  files?: Record<string, unknown>;
  headers?: Record<string, unknown>;
  cookies?: Record<string, unknown>;

  // others
  operationId?: string;
  consumes?: unknown;
  produces?: unknown;
  security?: unknown;
  undoc?: boolean;
  descriptionType?: unknown;
  variableList?: unknown;
  eventList?: unknown;
  protocolProfileBehavior?: unknown;
  proxy?: unknown;
  certificate?: unknown;
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
  [key: string]: unknown;
}

export interface Route {
  path: string;
  methods: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ProcessedRoute {
  path: string;
  method: string;
  schema?: unknown;
}

export interface PostmanCollection {
  info: InfoObject;
  item: (Item | Folder)[];
  event?: EventObject[];
  variable?: Variable[];
  auth?: Auth | null;
  protocolProfileBehavior?: unknown;
  [key: string]: unknown;
}

export enum GenerateFoldersRules {
  siblings = 'siblings',
  tree = 'tree'
}

/**
 * @note For now it is not possible to only
 * send files outside of object property (multipart). 
 * Well, at least not tried yet
 * but it definitely doesn't work with alternatives 
 */
export class Postman {
  #consumes: string[];
  #result: PostmanCollection;
  #security?: Auth;
  #helperClass: { new(args: unknown): PostmanHelperInterface };

  #responsesProperty?: string;

  #generateFoldersRule = GenerateFoldersRules.tree;
  #host: string[];
  #folders: Folder[];

  constructor(helperClass: { new(args: unknown): PostmanHelperInterface } = PostmanJoiHelper) {
    this.#consumes = [];
    this.#folders = [];
    this.#helperClass = helperClass;
    this.#host = [];
    this.#result = {
      info: {
        //version: '1.0.0',
        name: '@novice1 API',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: [],
     /* variable: [
        {
          id: 'host',
          key: 'host',
          value: 'http://0.0.0.0',
          type: 'string'
        }
      ],
      */
      protocolProfileBehavior: {}
    };
  }

  setGenerateFoldersRule(v: GenerateFoldersRules): Postman {
    const value: GenerateFoldersRules = GenerateFoldersRules[v];
    if (value) {
      this.#generateFoldersRule = value;
    }
    return this;
  }

  getGenerateFoldersRule(): GenerateFoldersRules {
    return this.#generateFoldersRule;
  }

  setResponsesProperty(v: string): Postman {
    this.#responsesProperty = v;
    return this;
  }

  getResponsesProperty(): string | undefined {
    return this.#responsesProperty;
  }

  setConsumes(consumes: string[]): Postman {
    this.#consumes = consumes;
    return this;
  }

  getConsumes(): string[] {
    return this.#consumes;
  }

  setHost(host: string): Postman;
  setHost(host: string[]): Postman;
  setHost(host: string[] | string): Postman {
    if (Array.isArray(host)) {
      this.#host = host;
    } else {
      this.#host = [host];
    }
    return this;
  }

  getHost(): string[] {
    return this.#host;
  }

  addHost(host: string): Postman {
    this.#host.push(host);
    return this;
  }

  setInfo(info: InfoObject): Postman {
    this.#result.info = info;
    return this;
  }

  getInfo(): InfoObject {
    return this.#result.info;
  }

  setInfoProperty(prop: string, v: unknown): Postman {
    this.#result.info[prop] = v;
    return this;
  }

  setName(name: string): Postman {
    this.#result.info.name = name;
    return this;
  }

  getName(): string {
    return this.#result.info.name;
  }

  setPostmanId(postmanId: string): Postman {
    this.#result.info._postman_id = postmanId;
    return this;
  }

  getPostmanId(): string | undefined {
    return this.#result.info._postman_id;
  }

  setDescription(description: Description): Postman {
    this.#result.info.description = description;
    return this;
  }

  getDescription(): Description | undefined {
    return this.#result.info.description;
  }

  setVersion(version: CollectionVersion | string | undefined): Postman {
    this.#result.info.version = version;
    return this;
  }

  getVersion(): CollectionVersion | string | undefined {
    return this.#result.info.version;
  }

  setSchema(schema: string): Postman {
    this.#result.info.schema = schema;
    return this;
  }

  getSchema(): string {
    return this.#result.info.schema;
  }

  setVariableList(variableList: Variable[]): Postman {
    this.#result.variable = variableList;
    return this;
  }

  getVariableList(): Variable[] | undefined {
    return this.#result.variable;
  }

  addVariable(variable: Variable): Postman {
    if(!this.#result.variable) {
      this.#result.variable = [];
    }
    this.#result.variable.push(variable);
    return this;
  }

  setEventList(eventList: EventObject[]): Postman {
    this.#result.event = eventList;
    return this;
  }

  getEventList(): EventObject[] | undefined {
    return this.#result.event;
  }

  addEvent(event: EventObject): Postman {
    if(!this.#result.event) {
      this.#result.event = [];
    }
    this.#result.event.push(event);
    return this;
  }

  setAuth(auth: Auth | null): Postman;
  setAuth(type: string, auth?: AuthAttribute[]): Postman;
  setAuth(type: string | Auth | null, authAttributes?: AuthAttribute[]): Postman {
    if (typeof type === 'string') {
      const v: Auth = { type };
      if (authAttributes) {
        v[type] = authAttributes;
      }
      this.#result.auth = v;
    } else {
      this.#result.auth = type;
    }
    return this;
  }

  getAuth(): Auth | null | undefined {
    return this.#result.auth;
  }

  setProtocolProfileBehavior(protocolProfileBehavior: unknown): Postman {
    this.#result.protocolProfileBehavior = protocolProfileBehavior;
    return this;
  }

  getProtocolProfileBehavior(): unknown {
    return this.#result.protocolProfileBehavior;
  }

  setFolders(folders: Folder[]): Postman {
    this.#folders = folders;
    return this;
  }

  getFolders(): Folder[] {
    return this.#folders;
  }

  addFolder(name: string): Postman;
  addFolder(folder: Folder): Postman;
  addFolder(folder: Folder | string): Postman {
    if (typeof folder === 'string') {
      this.addFolders(folder);
    } else {
      this.addFolders(folder);
    }
    return this;
  }

  addFolders(name: string): Postman;
  addFolders(folder: Folder): Postman;
  addFolders(folders: Folder[]): Postman;
  addFolders(folders: Folder[] | Folder | string): Postman {
    let v: Folder[];
    if (typeof folders === 'string') {
      v = [{
        name: folders,
        item: []
      }];
    } else if (!Array.isArray(folders)) {
      v = [folders];
    } else {
      v = folders;
    }
    v.forEach(folder => {
      const f = this.#folders.find(f => f.name === folder.name);
      if (f) {
        Object.assign(f, folder);
      } else {
        this.#folders.push(folder);
      }
    });
    return this;
  }

  /*
  setTags(tags: TagObject[]): Postman {
    this.#result.tags = tags;
    return this;
  }

  getTags(): TagObject[] {
    return this.#result.tags;
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

  addTag(tag: TagObject): Postman {
    return this.addTags(tag);
  }

  addTags(tags: TagObject): Postman
  addTags(tags: TagObject[]): Postman;
  addTags(tags: TagObject[] | TagObject): Postman {
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

  setDefaultSecurity(securityObjects: SecurityRequirementObject[]): Postman;
  setDefaultSecurity(securityObject: SecurityRequirementObject): Postman;
  setDefaultSecurity(security: string[]): Postman;
  setDefaultSecurity(security: string): Postman;
  setDefaultSecurity(v: SecurityRequirementObject[] | SecurityRequirementObject | string[] | string): Postman {
    this.#security = [];
    if (Array.isArray(v)) {
      v.forEach((value: SecurityRequirementObject | string) => this.addDefaultSecurity(value));
    } else {
      this.addDefaultSecurity(v);
    }
    return this;
  }

  addDefaultSecurity(security: SecurityRequirementObject | string): Postman;
  addDefaultSecurity(security: SecurityRequirementObject): Postman;
  addDefaultSecurity(security: string): Postman;
  addDefaultSecurity(v: SecurityRequirementObject | string): Postman {
    if (v) {
      if(typeof v === 'string') {
        this.#security.push({
          [v]: []
        });
      } else {
        this.#security.push(v);
      }
    }
    return this;
  }

  getDefaultSecurity(): SecurityRequirementObject[] {
    return this.#security;
  }

  setServers(servers: ServerObject[]): Postman;
  setServers(server: ServerObject): Postman;
  setServers(v: ServerObject[] | ServerObject): Postman {
    this.#result.servers = [];
    let v2: ServerObject[] = [];
    if (!Array.isArray(v)) {
      v2 = [v]
    } else {
      v2 = v
    }
    v2.forEach(el => this.addServer(el))
    return this;
  }

  getServers(): ServerObject[] {
    return this.#result.servers;
  }

  addServer(server: ServerObject): Postman;
  addServer(url: string): Postman;
  addServer(v: ServerObject | string): Postman {
    if (typeof v === 'string') {
      v = { url: v }
    }
    this.#result.servers.push(v);
    return this;
  }
  */

  /**
   * @example
   * ```typescript
   * import routing from '@novice1/routing';
   * import { Postman } from '@novice1/api-doc-generator';
   * 
   * const router = routing().post(...);
   * const openapi = new Postman();
   * const routes = openapi.add(router.getMeta());
   * const { path, method, schema } = routes[0];
   * ```
   * @returns The added/updated routes
   */
  add(routes: Route[]): ProcessedRoute[];
  add(routes: Route): ProcessedRoute[];
  add(routes: Route[] | Route): ProcessedRoute[] {

    let routes2: Route[] = [];

    if (!Array.isArray(routes)) {
      routes2 = [routes];
    } else {
      routes2 = routes;
    }

    const results: ProcessedRoute[] = [];

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
        const added = this._add(r);
        if (added) {
          results.push(added);
        }
      });
    });
  
    return results;
  }

  /*
  remove(path: string, method?: string): ProcessedRoute[] {
    const r: ProcessedRoute[] = [];
    if (this.#result.paths[path]) {
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
  */

  private _getResponsesSchema(responses?: ResponsesRecord): ResponseObject[] {
    let r: ResponseObject[] = [];
    let tmp: unknown;
    if (responses
      && this.#responsesProperty) {
      tmp = responses[this.#responsesProperty];
    } else {
      tmp = responses;
    }
    if (Array.isArray(tmp)) {
      r = tmp;
    }
    return r;
  }

  private _add(route: RouteSchema): ProcessedRoute | undefined {

    const parameters = route.parameters || {};
    const responses: ResponseObject[] = this._getResponsesSchema(route.responses);

    const path = formatPath(route.path, parameters.params);
    const method = route.method;
    const name = route.name || '';
    const description = route.description || '';
    const tags = route.tags || [];
    const auth = route.auth;

    const operationId = parameters.operationId;
    const undoc = parameters.undoc;

    const descriptionType = parameters.descriptionType || ''; // e.g. 'text/markdown'
    const variableList = parameters.variableList;
    const eventList = parameters.eventList;
    const protocolProfileBehavior = parameters.protocolProfileBehavior;
    const proxy = parameters.proxy;
    const certificate = parameters.certificate;

    let consumes: string[] = ['application/json'];
    let security: Auth | undefined = this.#security;

    // if it shouldn't be documented
    if (undoc) {
      Log.info('"undoc" route [%s %s]', method, path);
      return {
        path,
        method
      };
    }

    Log.debug('adding route [%s %s]', method, path);

    // format consumes
    if (!Array.isArray(parameters.consumes)) {
      if (parameters.consumes && typeof parameters.consumes === 'string') {
        consumes = [parameters.consumes];
        Log.debug('overwrite "consumes": %O', consumes);
      } else {
        if (this.#consumes.length) {
          consumes = this.#consumes;
        }
      }
    } else {
      consumes = parameters.consumes;
      Log.debug('overwrite "consumes": %O', consumes);
    }

    // format security
    const authTypes: string[] = Object.values(AuthType);
    if (!Array.isArray(parameters.security)) {
      if (parameters.security 
        && typeof parameters.security === 'object') {
        const v: Record<string, unknown> = extend({}, parameters.security);
        if (typeof v.type === 'string' && authTypes.find(t => t === v.type)) {
          const authType: string = v.type;
          const vauth: Auth = {type: authType, [authType]: []};
          const authAttributes = v[authType];
          if (Array.isArray(authAttributes)) {
            authAttributes.forEach(attr => {
              if (typeof attr?.key === 'string') {
                const a: AuthAttribute = {key: attr.key};
                if (attr.value) {
                  a.value = attr.value;
                }
                if (typeof attr.type === 'string') {
                  a.type = attr.type;
                }
              }
            });
          }
          security = vauth;
        } else {
          const types: string[] = Object.keys(v);
          const authType = authTypes.find(t => {
            return types.includes(t);
          });
          if (authType) {
            security = {
              type: authType
            };
          }
        }
      } else if (parameters.security 
        && typeof parameters.security == 'string'
        && authTypes.find(t => t === parameters.security)) {
        security = { type: parameters.security };
      }
    } else {
      const authType: string = parameters.security.find((s) => {
        return authTypes.includes(s);
      });
      if (authType) {
        security = {type: authType};
      }
    }


    // build item
    const schema: Item = {
      name,
      description,
      request: {}
    };

    if (descriptionType 
      && typeof descriptionType === 'string'
      && typeof description === 'string') {
      schema.description = {
        content: description,
        type: descriptionType
      };
    }

    if (operationId) {
      schema.id = operationId;
    }

    if (Array.isArray(eventList)) {
      schema.event = eventList;
    }

    if (Array.isArray(variableList)) {
      schema.variable = variableList;
    }

    if (protocolProfileBehavior) {
      schema.protocolProfileBehavior = protocolProfileBehavior;
    }

    // format response
    schema.response = this._formatResponses(responses);

    // format request
    if (auth) {
      if (!security) {
        Log.warn('Missing "security" for "auth" route: %s %s', method, path);
      } else {
        schema.request.auth = security;
        Log.debug('security:', security);
      }
    }
    if (proxy && typeof proxy === 'object') {
      schema.request.proxy = proxy;
    }
    if (certificate && typeof certificate === 'object') {
      schema.request.certificate = certificate;
    }
    schema.request.method = method.toUpperCase();
    if (schema.description) {
      schema.request.description = schema.description;
    }

    // format url (params, query)
    schema.request.url= this._formatUrl(path, parameters);
    // format header
    const formattedHeader = this._formatHeader(parameters, consumes);
    if(formattedHeader.length) {
      schema.request.header = formattedHeader;
    }
    // @todo: format body
    /*
    const formattedBody = this._formatBody(parameters, consumes);
    if(formattedBody) {
      schema.request.body = formattedBody;
    }
    */
    

    const folders: Folder[] = [];
    if (Array.isArray(tags) && tags.length) {
      let currentFolder: Folder | undefined;
      tags.forEach(tag => {
        if (typeof tag === 'string') {
          let tmpFolder: Folder | undefined;
          if (this.#generateFoldersRule === GenerateFoldersRules.siblings) {
            tmpFolder = this.#folders.find(f => f.name === tag);
            if (!tmpFolder) {
              tmpFolder = {
                name: tag,
                item: []
              };
            }
            folders.push(tmpFolder);
          } else {
            if(!currentFolder) {
              tmpFolder = this.#folders.find(f => f.name === tag);
              if (!tmpFolder) {
                tmpFolder = {
                  name: tag,
                  item: []
                };
                this.#folders.push(tmpFolder);
              }
            } else {
              tmpFolder = <Folder | undefined>currentFolder.item.find(f => f.name === tag);
              if(!tmpFolder) {
                tmpFolder = {
                  name: tag,
                  item: []
                };
              }
            }
            currentFolder = tmpFolder;
            folders[0] = currentFolder;
          }
        }
      });
    }

    if (!folders.length) {
      this.#result.item.push(schema);
    } else {
      folders.forEach(folder => {
        folder.item.push(schema);
      });
    }

    Log.debug('added route [%s %s]: %O', method, path, schema);

    return {
      path,
      method,
      schema
    };
  }


  private _formatResponses(routeResponses: ResponseObject[]): ResponseObject[] {
    // if empty
    if (!routeResponses.length) {
      Log.debug('empty responses object');
    }
    return routeResponses;
  }

  private _formatHeader(
    parameters: RouteParameters,
    consumes: string[]
  ): HeaderObject[] {
    const res: HeaderObject[] = [];

    const paramsHelper = new this.#helperClass(parameters);
    let children: Record<string, PostmanHelperInterface> | undefined;
    if (paramsHelper.isValid()) {
      children = paramsHelper.getChildren();
    }

    if (parameters.headers) {
      Log.debug('handle headers');
      this._pushHeader(parameters.headers, res);
    } else if (children && children.headers) {
      Log.debug('handle headers');
      this._pushHeader(children.headers, res);
    }

    // add default Content-Type
    if(consumes.length && !res.find(h => h.key === 'Content-Type')) {
      res.push({
        key: 'Content-Type',
        value: consumes[0]
      });
    }

    return res;
  }

  private _formatUrl(
    path: string, 
    parameters: RouteParameters
  ): UrlObject {
   const url: UrlObject = {
			host: this.#host,
			path: path.substring(1).split('/'),
   };

   const variables = this._formatUrlVariable(parameters);
   if (variables.length) {
     url.variable = variables;
   }

   const queryParams = this._formatUrlQuery(parameters);
   if (queryParams.length) {
     url.query = queryParams;
   }

   return url;
  }

  private _formatUrlVariable(parameters: RouteParameters): Variable[] {
    const res: Variable[] = [];

    const paramsHelper = new this.#helperClass(parameters);
    let children: Record<string, PostmanHelperInterface> | undefined;
    if (paramsHelper.isValid()) {
      children = paramsHelper.getChildren();
    }

    if (parameters.params) {
      Log.debug('handle params');
      this._pushVariable(parameters.params, res);
    } else if (children && children.params) {
      Log.debug('handle params');
      this._pushVariable(children.params, res);
    }

    return res;
  }

  // format parameters methods
  private _formatUrlQuery(parameters: RouteParameters): QueryParam[] {
    // format parameters
    const res: QueryParam[] = [];

    const paramsHelper = new this.#helperClass(parameters);
    let children: Record<string, PostmanHelperInterface> | undefined;
    if (paramsHelper.isValid()) {
      children = paramsHelper.getChildren();
    }

    //if (parameters.headers) {
    //  Log.debug('handle headers');
    //  this._pushPathParameters(
    //    ParameterLocations.header, parameters.headers, res);
    //} else if (children && children.headers) {
    //  Log.debug('handle headers');
    //  this._pushPathParameters(
    //    ParameterLocations.header, children.headers, res);
    //}
    //if (parameters.params) {
    //  Log.debug('handle params');
    //  this._pushPathParameters(ParameterLocations.path, parameters.params, res);
    //} else if (children && children.params) {
    //  Log.debug('handle params');
    //  this._pushPathParameters(
    //    ParameterLocations.path, children.params, res);
    //}
    if (parameters.query) {
      Log.debug('handle query');
      this._pushQueryParam(parameters.query, res);
    } else if (children && children.query) {
      Log.debug('handle query');
      this._pushQueryParam(children.query, res);
    }

    return res;
  }

  private _pushHeader(
    value: Record<string, unknown> | PostmanHelperInterface,
    res: HeaderObject[]) {
    const valueHelper = value instanceof this.#helperClass ? value : new this.#helperClass(value);

    let children: Record<string, PostmanHelperInterface>;
    if (valueHelper.isValid()) {
      children = valueHelper.getChildren();
    }

    const getChildrenNames = () => {
      if (children) {
        return Object.keys(children);
      }
      return Object.keys(value);
    };

    const getChild = (name: string): PostmanHelperInterface | undefined => {
      if (children) {
        return children[name];
      }
      if (value instanceof this.#helperClass) {
        return;
      }
      return new this.#helperClass(value[name]);
    };

    const handleChild = (
      key: string,
      helper: PostmanHelperInterface) => {
      if (!helper.isValid()) return;

      let value = '';

      if(helper.hasDefaultValue()) {
        const defaultValue = helper.getDefaultValue();
        if (typeof defaultValue === 'string') {
          value = defaultValue;
        } else if(defaultValue && typeof defaultValue === 'object'){
          value = JSON.stringify(defaultValue);
        } else {
          value = `${defaultValue}`;
        }
      } else if(helper.hasExampleValue()) {
        const exampleValue = helper.getExampleValue();
        if (typeof exampleValue === 'string') {
          value = exampleValue;
        } else if(exampleValue && typeof exampleValue === 'object'){
          value = JSON.stringify(exampleValue);
        } else {
          value = `${exampleValue}`;
        }
      } else {
        value = `<${helper.getType()}>`;
      }

      const header: HeaderObject = {
        key,
        value
      };

      const description: string = helper.getDescription(); 
      const unit: string = helper.getUnit();

      if (description) {
        header.description = {
          content: description
        };
        if (helper.hasDescriptionType?.()
          && helper.getDescriptionType) {
            header.description.type = helper.getDescriptionType();
        } else if(unit) {
          header.description.content = `${description} (${unit})`;
        }
      } else if(unit) {
        header.description = `(${unit})`;
      }

      if (!helper.isRequired()) {
        header.disabled = true;
      }

      Log.debug('HeaderObject: %O', header);

      res.push(header);
    };


    getChildrenNames().forEach((name: string) => {
      const helper = getChild(name);
      if (helper) {
        handleChild(name, helper);
      }
    });
  }

  private _pushVariable(
    value: Record<string, unknown> | PostmanHelperInterface,
    res: Variable[]) {

    const VALID_VARIABLE_TYPES = ['string', 'boolean', 'any', 'number'];
    const valueHelper = value instanceof this.#helperClass ? value : new this.#helperClass(value);

    let children: Record<string, PostmanHelperInterface>;
    if (valueHelper.isValid()) {
      children = valueHelper.getChildren();
    }

    const getChildrenNames = () => {
      if (children) {
        return Object.keys(children);
      }
      return Object.keys(value);
    };

    const getChild = (name: string): PostmanHelperInterface | undefined => {
      if (children) {
        return children[name];
      }
      if (value instanceof this.#helperClass) {
        return;
      }
      return new this.#helperClass(value[name]);
    };

    const handleChild = (
      name: string,
      helper: PostmanHelperInterface) => {
      if (!helper.isValid()) return;

      const variable: Variable = {
        name,
        type: helper.getType()
      };

      if (!variable.type || !VALID_VARIABLE_TYPES.includes(variable.type)) {
        variable.type = 'any';
      }

      const description: string = helper.getDescription();
      const unit: string = helper.getUnit();

      if (description) {
        variable.description = {
          content: description
        };
        if (helper.hasDescriptionType?.()
          && helper.getDescriptionType) {
          variable.description.type = helper.getDescriptionType();
        } else if (unit) {
          variable.description.content = `${description} (${unit})`;
        }
      } else if (unit) {
        variable.description = `(${unit})`;
      }

      if (helper.hasDefaultValue()) {
        const defaultValue = helper.getDefaultValue();
        variable.value = defaultValue;
      } else if (helper.hasExampleValue()) {
        const exampleValue = helper.getExampleValue();
        variable.value = exampleValue;
      }

      Log.debug('Variable: %O', variable);

      res.push(variable);
    };


    getChildrenNames().forEach((name: string) => {
      const helper = getChild(name);
      if (helper) {
        handleChild(name, helper);
      }
    });
  }

  private _pushQueryParam(
    value: Record<string, unknown> | PostmanHelperInterface,
    res: QueryParam[]) {
    const valueHelper = value instanceof this.#helperClass ? value : new this.#helperClass(value);

    let children: Record<string, PostmanHelperInterface>;
    if (valueHelper.isValid()) {
      children = valueHelper.getChildren();
    }

    const getChildrenNames = () => {
      if (children) {
        return Object.keys(children);
      }
      return Object.keys(value);
    };

    const getChild = (name: string): PostmanHelperInterface | undefined => {
      if (children) {
        return children[name];
      }
      if (value instanceof this.#helperClass) {
        return;
      }
      return new this.#helperClass(value[name]);
    };

    const handleChild = (
      key: string,
      helper: PostmanHelperInterface) => {
      if (!helper.isValid()) return;

      const queryParam: QueryParam = {
        key
      };

      const description: string = helper.getDescription(); 
      const unit: string = helper.getUnit();

      if (description) {
        queryParam.description = {
          content: description
        };
        if (helper.hasDescriptionType?.()
          && helper.getDescriptionType) {
          queryParam.description.type = helper.getDescriptionType();
        } else if(unit) {
          queryParam.description.content = `${description} (${unit})`;
        }
      } else if(unit) {
        queryParam.description = `(${unit})`;
      }

      if (!helper.isRequired()) {
        queryParam.disabled = true;
      }

      if(helper.hasDefaultValue()) {
        const defaultValue = helper.getDefaultValue();
        if (typeof defaultValue === 'string') {
          queryParam.value = defaultValue;
        } else if(defaultValue && typeof defaultValue === 'object'){
          queryParam.value = JSON.stringify(defaultValue);
        } else {
          queryParam.value = `${defaultValue}`;
        }
      } else if(helper.hasExampleValue()) {
        const exampleValue = helper.getExampleValue();
        if (typeof exampleValue === 'string') {
          queryParam.value = exampleValue;
        } else if(exampleValue && typeof exampleValue === 'object'){
          queryParam.value = JSON.stringify(exampleValue);
        } else {
          queryParam.value = `${exampleValue}`;
        }
      } else {
        queryParam.value = `<${helper.getType()}>`;
      }

      Log.debug('QueryParam: %O', queryParam);

      res.push(queryParam);
    };


    getChildrenNames().forEach((name: string) => {
      const helper = getChild(name);
      if (helper) {
        handleChild(name, helper);
      }
    });
  }

  /*
  private _createParameterObject(
    location: string,
    helper: PostmanHelperInterface,
    defaultParameterObject: ParameterObject): ParameterObject {
    const parameter = new ParameterCreator(defaultParameterObject)
      .setRequired(helper.isRequired())
      .setSchema(formatType(helper.getType()));


    const schema = this._createBasicSchema(helper);
    const description = schema.getDescription();

    if (description) {
      parameter.setDescription(
        description
      );
    }

    if (schema.isType('array')) {
      // allowing multiple values by repeating the query parameter
      if (location === 'query') {
        parameter.setExplode(true);
      }
    }

    if (schema.isType('object')) {
      // style ?
      if (!parameter.hasStyle()) {
        parameter.setStyle('deepObject');
      }
    }

    // examples
    if (helper.hasExamples?.()) {
      const examples = helper.getExamples?.();
      if (examples) {
        parameter.setExamples(examples);
      }
    }

    // handle deprecated
    if (helper.isDeprecated()) {
      parameter.setDeprecated(true);
    }
    // handle style
    if (!parameter.hasStyle()
      && helper.hasStyle?.()) {
      const style = helper.getStyle?.();
      if (style) {
        parameter.setStyle(style);
      }
    }

    // allowEmptyValue
    if (location !== 'path' && helper.allowsEmptyValue()) {
      parameter.setAllowEmptyValue(
        helper.allowsEmptyValue()
      );
    }

    let schemaObject = schema.toObject();

    // ReferenceObject | SchemaObject
    schemaObject = this._autoSchemaObjectToRef(helper, schemaObject);
    parameter.setSchema(schemaObject);

    return parameter.toObject();
  }

  // format body methods
  private _formatRequestBody(parameters: RouteParameters, consumes: string[]) {
    // format body
    let res: RequestBodyObject = {};

    // body|files
    if (parameters.body || parameters.files) {
      Log.debug('handle body and/or files');
      this._pushRequestBody(parameters.body, parameters.files, consumes, res);
    } else {
      const bodyHelper = new this.#helperClass(parameters);
      if (bodyHelper.isValid()) {
        const children = bodyHelper.getChildren();
        if (children.body || children.files) {
          Log.debug('handle body and/or files');
          this._pushRequestBody(children.body, children.files, consumes, res);
        }
        // ReferenceObject | RequestBodyObject
        res = this._autoRequestBodyObjectToRef(bodyHelper, res);
      }
    }

    return res;
  }

  private _pushRequestBody(
    body: Record<string, unknown> | PostmanHelperInterface | undefined,
    files: Record<string, unknown> | PostmanHelperInterface | undefined,
    consumes: string[],
    res: RequestBodyObject) {

    let schemaObject: SchemaObject | undefined;

    let bodySchema: SchemaCreator | undefined;
    let filesSchema: SchemaCreator | undefined;

    let helperWithRef: PostmanHelperInterface | undefined;

    let examples: Record<string, ExampleObject | ReferenceObject> | undefined;
    let encoding: Record<string, EncodingObject> | undefined;

    let contentIsRequired = false;

    if (body) {
      Log.debug('handle body');
      const bodyHelper = body instanceof this.#helperClass ? body : new this.#helperClass(body);
      if (bodyHelper.isValid()) {
        bodySchema = this._createSchema(bodyHelper);
        if (this._getLocalRef(bodyHelper)) {
          helperWithRef = bodyHelper;
        }
        if (bodyHelper.hasExamples?.()) {
          examples = bodyHelper.getExamples?.();
        }
        if (bodyHelper.hasEncoding?.()) {
          encoding = bodyHelper.getEncoding?.();
        }

        contentIsRequired = contentIsRequired || bodyHelper.isRequired();
        schemaObject = bodySchema.toObject();
      } else if (!(body instanceof this.#helperClass)) {
        bodySchema = new SchemaCreator({
          type: 'object',
          required: [],
          properties: {},
        });
        Object.keys(body).forEach(
          name => {
            const childHelper = new this.#helperClass(body[name]);
            if (!childHelper.isValid()) {
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
        contentIsRequired = contentIsRequired || bodySchema.isRequired();
        schemaObject = bodySchema.toObject();
      }
    }

    if (files && (!schemaObject || bodySchema?.isType('object'))) {
      Log.debug('handle files');
      const filesHelper = files instanceof this.#helperClass ? files : new this.#helperClass(files);

      // mix with bodySchema or create new
      const prop = bodySchema || new SchemaCreator({
        type: 'object',
        required: [],
        properties: {},
      });

      if (filesHelper.isValid()) {
        if (!bodySchema && filesHelper.getType() !== 'object') {
          filesSchema = this._createSchema(filesHelper, undefined, undefined, 'binary');
          if (this._getLocalRef(filesHelper)) {
            helperWithRef = filesHelper;
          }
          if (filesHelper.hasExamples?.()) {
            examples = filesHelper.getExamples?.();
          }
          if (filesHelper.hasEncoding?.()) {
            encoding = filesHelper.getEncoding?.();
          }
          schemaObject = filesSchema.toObject();
        } else if (filesHelper.getType() === 'object') {
          const filesFields = filesHelper.getChildren();
          Object.keys(filesFields).forEach(
            name => {
              const childHelper = filesFields[name];
              if (!childHelper.isValid()) {
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
        contentIsRequired = contentIsRequired || filesHelper.isRequired();
      } else if (!(files instanceof this.#helperClass)) {
        Object.keys(files).forEach(
          name => {
            const childHelper = new this.#helperClass(files[name]);
            if (!childHelper.isValid()) {
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
        contentIsRequired = contentIsRequired || prop.isRequired();
        schemaObject = prop.toObject();
      }
    }

    if (helperWithRef && schemaObject) {
      // ReferenceObject | SchemaObject
      schemaObject = this._autoSchemaObjectToRef(helperWithRef, schemaObject);
    }

    const mediaType: MediaTypeCreator = new MediaTypeCreator();

    if (schemaObject) {
      mediaType.setSchema(schemaObject);
    }

    if (examples) {
      mediaType.setExamples(examples);
    }

    if (encoding) {
      mediaType.setEncoding(encoding);
    }

    res.content = {};
    res.required = contentIsRequired;
    const content: MediaTypeObject = mediaType.toObject();

    consumes.forEach((mime: string) => {
      if (res.content) {
        res.content[mime] = content;
      }
    });
  }

  // -- schema object creation methods

  private _createBasicSchema(
    helper: PostmanHelperInterface,
    parentProp?: SchemaCreator,
    name?: string,
    format?: string
  ): SchemaCreator {
    const prop = new SchemaCreator(formatType(helper.getType()));

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
        parentProp.addRequired(name);
      } else if (parentProp?.isType('array')) {
        parentProp.setMin(
          typeof parentProp.getMin() !== 'undefined' ?
            parentProp.getMin() : 1
        );
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
    } else if (format) {
      prop.setFormat(format);
      if (format === 'binary') {
        prop.setType('string');
      }
    }

    if (prop.isType('object')) {
      this._fillObjectSchemaObject(helper, prop);
    }

    if (helper.hasXml?.()) {
      const xml = helper.getXml?.();
      if (xml) {
        prop.setXml(xml);
      }
    }

    return prop;
  }

  private _createSchema(
    helper: PostmanHelperInterface,
    parentProp?: SchemaCreator,
    name?: string,
    format?: string
  ): SchemaCreator {
    if (helper.getType() === 'alternatives') {
      return this._createAlternativeSchema(helper, parentProp, name);
    }

    return this._createBasicSchema(helper, parentProp, name, format);
  }

  private _createSchemaObject(
    helper: PostmanHelperInterface,
    parentProp?: SchemaCreator,
    name?: string,
    format?: string
  ): SchemaObject {

    if (helper.getType() === 'alternatives') {
      return this._createAlternativeSchemaObject(helper, parentProp, name);
    }

    const prop = this._createBasicSchema(helper, parentProp, name, format);

    // ReferenceObject | SchemaObject
    const schemaObject = this._autoSchemaObjectToRef(helper, prop.toObject());
    return schemaObject;
  }

  private _createAlternativeSchema(
    altHelper: PostmanHelperInterface,
    parentProp?: SchemaCreator,
    name?: string
  ): SchemaCreator {
    return new SchemaCreator(this._createAlternativeSchemaObject(altHelper, parentProp, name));
  }

  private _createAlternativeSchemaObject(
    altHelper: PostmanHelperInterface,
    parentProp?: SchemaCreator,
    name?: string
  ): SchemaObject {
    const prop = new SchemaCreator({ oneOf: [] });

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
        parentProp.addRequired(name);
      } else if (parentProp?.isType('array')) {
        parentProp.setMin(parentProp.getMin() || 1);
      }
    }

    // discriminator
    if (altHelper.hasDiscriminator?.()) {
      const discriminator = altHelper.getDiscriminator?.();
      if (discriminator) {
        prop.setDiscriminator(discriminator);
      }
    }

    const altSchemaObject = prop.toObject();
    altHelper.getAlternatives().forEach(
      helper => {
        if (helper.isValid()) {
          altSchemaObject?.oneOf?.push(this._createSchemaObject(helper));
        }
      }
    );
    return altSchemaObject;
  }
  */

  result(): PostmanCollection {
    const result: PostmanCollection = extend(true, {}, this.#result);
    const folders: Folder[] = [];
    this.#folders.forEach(folder => {
      folders.push(extend(true, {}, folder));
    });
    console.log(`FOLDERS: ${folders.length}`);
    result.item.push(...folders);
    console.log(`items: ${result.item.length}`);
    return result;
  }
}
