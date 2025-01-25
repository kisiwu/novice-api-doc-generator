import extend from 'extend';
import { RouteMeta } from '@novice1/routing';
import {
  DocGenerator,
  ProcessedRoute
} from '../commons';
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
  RequestBodyObject,
  ResponseObject,
  UrlObject,
  Variable
} from './postman/definitions';

import { PostmanHelperInterface } from './postman/helpers/interfaces';
import { PostmanJoiHelper } from './postman/helpers/joiHelper';

import { formatPath, /*formatType,*/ Log } from './postman/utils';
import { RequestBodyCreator } from './postman/services/requestBodyService';
import { BasePostmanAuthUtil } from '../utils/auth/baseAuthUtils';
import { BasePostmanResponseUtil, BaseResponseUtil } from '../utils/responses/baseResponseUtils';


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

export interface PostmanCollection {
  info: InfoObject;
  item: (Item | Folder)[];
  event?: EventObject[];
  variable?: Variable[];
  auth?: Auth | null;
  protocolProfileBehavior?: unknown;
  [key: string]: unknown;
}

export enum GenerateFoldersRule {
  siblings = 'siblings',
  levels = 'levels'
}

/**
 * 
 * Postman collection generator.
 * 
 * @note For now it is not possible to only
 * send files outside of object property (multipart). 
 * Well, at least not tried yet
 * but it definitely doesn't work with alternatives 
 */
export class Postman implements DocGenerator {
  #consumes: string[];
  #result: PostmanCollection;
  #security?: Auth;
  #helperClass: { new(args: unknown): PostmanHelperInterface };

  #responsesProperty?: string;

  #generateFoldersRule = GenerateFoldersRule.levels;
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

  setGenerateFoldersRule(v: GenerateFoldersRule): Postman {
    const value: GenerateFoldersRule = GenerateFoldersRule[v];
    if (value) {
      this.#generateFoldersRule = value;
    }
    return this;
  }

  getGenerateFoldersRule(): GenerateFoldersRule {
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

  /**
   * Example:
   * ```ts
   * postman.setAuth({
   *  type: 'basic',
   *  basic: []
   * });
   * ```
   */
  setAuth(auth: Auth | null): Postman;
  /**
   * Example:
   * ```ts
   * postman.setAuth('basic', []);
   * ```
   */
  setAuth(type: string, auth?: AuthAttribute[]): Postman;
  /**
   * {@include ../../typedocIncludes/postman.setAuth.1.md}
   */
  setAuth(auth: BasePostmanAuthUtil): Postman;
  setAuth(type: string | Auth | null | BasePostmanAuthUtil, authAttributes?: AuthAttribute[]): Postman {
    if (type instanceof BasePostmanAuthUtil) {
      this.#result.auth = type.toPostman();
    } else if (typeof type === 'string') {
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

  /**
   * {@include ../../typedocIncludes/postman.setDefaultSecurity.1.md}
   */
  setDefaultSecurity(auth: BasePostmanAuthUtil): Postman;
  /**
   * Example:
   * ```ts
   * postman.setDefaultSecurity({
   *  type: 'basic',
   *  basic: []
   * });
   * ```
   */
  setDefaultSecurity(auth: Auth): Postman;
  /**
   * Example:
   * ```ts
   * postman.setDefaultSecurity('basic');
   * ```
   */
  setDefaultSecurity(type: string): Postman;
  setDefaultSecurity(v: Auth | string | BasePostmanAuthUtil): Postman {
    if (v instanceof BasePostmanAuthUtil) {
      this.#security = v.toPostman();
    } else if (typeof v === 'string') {
      const authTypes: string[] = Object.values(AuthType);
      if (authTypes.includes(v)) {
        this.#security = {
          type: v
        };
      } else {
        this.#security = {
          type: 'noauth'
        };
      }
    } else {
      this.#security = v;
    }
    return this;
  }

  getDefaultSecurity(): Auth | undefined {
    return this.#security;
  }

  removeDefaultSecurity(): Auth | undefined {
    const r = this.#security;
    this.#security = undefined;
    return r;
  }

  /**
   * @example
   * ```typescript
   * import routing from '@novice1/routing';
   * import { Postman } from '@novice1/api-doc-generator';
   * 
   * const router = routing().post(...);
   * const postman = new Postman();
   * const routes = postman.add(router.getMeta());
   * const { path, method, schema } = routes[0];
   * ```
   * @returns The added/updated routes
   */
  add(routes: RouteMeta[]): ProcessedRoute[];
  add(routes: RouteMeta): ProcessedRoute[];
  add(routes: RouteMeta[] | RouteMeta): ProcessedRoute[] {

    let routes2: RouteMeta[] = [];

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
        if (typeof route.path !== 'string') {
          return;
        }
        const r: RouteSchema = {
          path: route.path,
          method,
          name: route.name,
          description: route.description,
          tags: route.tags,
          auth: route.auth,
          parameters: route.parameters,
          responses: route.responses
        };
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

  /**
   * remove all routes
   * @returns The removed routes
   */
  removeAll(): ProcessedRoute[] {
    const r: ProcessedRoute[] = [];

    const removeItem = (item: Item) => {
      let path = '/'
        const requestpath = item.request.url?.path || '/'
        if (Array.isArray(requestpath)) {
          path = requestpath.join('/')
        } else if (requestpath) {
          path = requestpath
        }
        r.push({
          path: path,
          method: item.request.method || 'GET',
          schema: item
        })
    }

    const loopThroughResultItem = (item: Item | Folder) => {
      if ('request' in item) {
        removeItem(item)
      } else {
        item.item.forEach(subItem => {
          loopThroughResultItem(subItem)
        })
      }
    }

    this.#result.item.forEach(loopThroughResultItem)

    this.#result.item = []
    this.#folders = []

    return r;
  }

  private _getResponsesSchema(responses?: ResponsesRecord): ResponseObject[] {
    let r: ResponseObject[] = [];
    let tmp: unknown;
    if (responses
      && this.#responsesProperty) {
      tmp = responses[this.#responsesProperty];
    } else {
      tmp = responses;
    }
    if (tmp instanceof BasePostmanResponseUtil 
      || tmp instanceof BaseResponseUtil) {
        r = tmp.toPostman();
    } else if (Array.isArray(tmp)) {
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
    if(parameters.security instanceof BasePostmanAuthUtil) {
      security = parameters.security.toPostman();
    } else if (!Array.isArray(parameters.security)) {
      if (parameters.security 
        && typeof parameters.security === 'object') {
        const securityObject = parameters.security as unknown;
        const v: Record<string, unknown> = extend({}, securityObject);
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
    } else if (auth === false) {
      schema.request.auth = {
        type: 'noauth'
      };
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
    // format header (headers)
    const formattedHeader = this._formatHeader(parameters, consumes);
    if(formattedHeader.length) {
      schema.request.header = formattedHeader;
    }
    // format body (body, files)
    const formattedBody = this._formatRequestBody(parameters, consumes);
    if(formattedBody) {
      schema.request.body = formattedBody;
    }

    const folders: Folder[] = [];
    if (Array.isArray(tags) && tags.length) {
      let currentFolder: Folder | undefined;
      tags.forEach(tag => {
        if (typeof tag === 'string') {
          let tmpFolder: Folder | undefined;
          if (this.#generateFoldersRule === GenerateFoldersRule.siblings) {
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

  private _formatRequestBody(
    parameters: RouteParameters,
    consumes: string[]
  ): RequestBodyObject | undefined {
    let res: RequestBodyObject | undefined;
    // body|files
    if (parameters.body || parameters.files) {
      Log.debug('handle body and/or files');
      const rq = new RequestBodyCreator();
      this._pushRequestBody(parameters.body, parameters.files, consumes, rq);
      res = rq.toObject();
    } else {
      const bodyHelper = new this.#helperClass(parameters);
      if (bodyHelper.isValid()) {
        const children = bodyHelper.getChildren();
        if (children.body || children.files) {
          Log.debug('handle body and/or files');
          const rq = new RequestBodyCreator();
          this._pushRequestBody(children.body, children.files, consumes, rq);
          res = rq.toObject();
        }
      }
    }
    return res;
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

    if (parameters.query) {
      Log.debug('handle query');
      this._pushQueryParam(parameters.query, res);
    } else if (children && children.query) {
      Log.debug('handle query');
      this._pushQueryParam(children.query, res);
    }

    return res;
  }

  private _pushRequestBody(
    body: Record<string, unknown> | PostmanHelperInterface | undefined,
    files: Record<string, unknown> | PostmanHelperInterface | undefined,
    consumes: string[],
    res: RequestBodyCreator) {

    let contentIsRequired = false;

    if (body) {
      Log.debug('handle body');
      const bodyHelper = body instanceof this.#helperClass ? body : new this.#helperClass(body);
      if (bodyHelper.isValid()) {
        res.setFieldsBody(bodyHelper);
        if (bodyHelper.getType() === 'object') {
          const bodyFields = bodyHelper.getChildren();
          Object.keys(bodyFields).forEach(
            name => {
              const childHelper = bodyFields[name];
              if (!childHelper.isValid()) {
                return;
              }
              res.setField(name, childHelper);
            }
          );
        } else {
          res.setMode('raw');
          res.setBody(bodyHelper);
        }
        contentIsRequired = contentIsRequired || bodyHelper.isRequired();
      } else if (!(body instanceof this.#helperClass)) {
        Object.keys(body).forEach(
          name => {
            const childHelper = new this.#helperClass(body[name]);
            if (!childHelper.isValid()) {
              return;
            }
            res.setField(name, childHelper);
          }
        );
      }
    }

    if (files && !res.hasBody()) {
      Log.debug('handle files');
      const filesHelper = files instanceof this.#helperClass ? files : new this.#helperClass(files);
      if (filesHelper.isValid()) {
        if(!res.hasFieldsBody()) {
          res.setFieldsBody(filesHelper);
        }
        if (!res.hasFields() && filesHelper.getType() !== 'object') {
          res.setMode('file');
          res.setFile(filesHelper);
        } else if (filesHelper.getType() === 'object') {
          const filesFields = filesHelper.getChildren();
          Object.keys(filesFields).forEach(
            name => {
              const childHelper = filesFields[name];
              if (!childHelper.isValid()) {
                return;
              }
              res.setMode('formdata');
              res.setFileField(name, childHelper);
            }
          );
        }
        contentIsRequired = contentIsRequired || filesHelper.isRequired();
      } else if (!(files instanceof this.#helperClass)) {
        Object.keys(files).forEach(
          name => {
            const childHelper = new this.#helperClass(files[name]);
            if (!childHelper.isValid()) {
              return;
            }
            res.setMode('formdata');
            res.setFileField(name, childHelper);
          }
        );
      }
    }

    res.setRequired(contentIsRequired);

    if(consumes.length && !res.getMode()) {
      res.setFormat(consumes[0]);
    }
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

  result(): PostmanCollection {
    const result: PostmanCollection = extend(true, {}, this.#result);
    const folders: Folder[] = [];
    this.#folders.forEach(folder => {
      folders.push(extend(true, {}, folder));
    });
    result.item.push(...folders);
    return result;
  }
}
