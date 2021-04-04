/**
 * @module openapi
 */

/**
 * @todo add debug logs
 * @todo: change var, method names ...
 */

import {
  SchemaObject,
  SecuritySchemeObject,
  MediaTypeObject,
  ReferenceObject,
  RequestBodyObject,
  ResponseObject,
  TagObject,
  EncodingObject,
  ExampleObject,
  ComponentsObject,
  ParameterObject,
  ParameterLocations,
  LinkObject,
  HeaderObject,
  InfoObject,
  LicenseObject,
  ContactObject,
  ExternalDocObject,
  ServerObject,
  SecurityRequirementObject
} from './openapi/definitions';
import { OpenApiHelperInterface } from './openapi/helpers/interfaces';
import { OpenApiJoiHelper } from './openapi/helpers/joiHelper';
import { SchemaCreator } from './openapi/services/schemaService';
import { ParameterCreator } from './openapi/services/parameterService';
import { MediaTypeCreator } from './openapi/services/mediaTypeService';
import { formatPath, formatType, Log } from './openapi/utils';
import extend from 'extend';


interface ResponsesRecord {
  [key: string]: ResponseObject | ReferenceObject;
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

export interface OpenAPIResult {
  openapi: string;
  info: InfoObject;
  servers: ServerObject[];
  components: ComponentsObject;
  paths: Record<string, Record<string, unknown>>;
  security?: SecurityRequirementObject[];
  tags: TagObject[];
  externalDocs?: ExternalDocObject;
  [key: string]: unknown;
}

export enum GenerateComponentsRules {
  always = 'always',
  ifUndefined = 'ifUndefined',
  never = 'never',
}

/**
 * @note For now it is not possible to only
 * send files outside of object property (multipart). 
 * Well, at least not tried yet
 * but it definitely doesn't work with alternatives 
 */
export class OpenApi {
  #consumes: string[];
  #result: OpenAPIResult;
  #security: SecurityRequirementObject[];
  #helperClass: { new(args: unknown): OpenApiHelperInterface };

  #responsesProperty?: string;
  #generateComponentsRule = GenerateComponentsRules.always;

  constructor(helperClass: { new(args: unknown): OpenApiHelperInterface } = OpenApiJoiHelper) {
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

  setResponsesProperty(v: string): OpenApi {
    this.#responsesProperty = v;
    return this;
  }

  getResponsesProperty(): string | undefined {
    return this.#responsesProperty;
  }

  setConsumes(consumes: string[]): OpenApi {
    this.#consumes = consumes;
    return this;
  }

  getConsumes(): string[] {
    return this.#consumes;
  }

  setCallbacks(callbacks: Record<string, unknown>): OpenApi {
    this.#result.components.callbacks = callbacks;
    return this;
  }

  getCallbacks(): Record<string, unknown> | undefined {
    return this.#result.components.callbacks;
  }

  removeCallback(name: string): unknown {
    let r: unknown;
    if (this.#result.components.callbacks) {
      r = this.#result.components.callbacks[name];
      delete this.#result.components.callbacks[name];
    }
    return r;
  }

  hasCallback(name: string): boolean {
    let r = false;
    if (this.#result.components?.callbacks?.[name]) {
      r = true;
    }
    return r;
  }

  addCallback(name: string, callback: unknown): OpenApi {
    if (!this.#result.components.callbacks) {
      this.#result.components.callbacks = {};
    }
    this.#result.components.callbacks[name] = callback;
    return this;
  }

  /**
   * 
   * @returns removed callbacks
   */
  cleanupCallbacks(): Record<string, unknown> {
    const r: Record<string, unknown> = {};
    const refs = JSON.stringify(this.#result).match(/#\/components\/callbacks\/[^/"]*/g);
    if (this.#result.components.callbacks) {
      Object.keys(this.#result.components.callbacks).forEach(name => {
        if (!refs?.includes(`#/components/callbacks/${name}`)) {
          if (this.#result.components?.callbacks?.[name]) {
            r[name] = this.#result.components.callbacks[name];
            delete this.#result.components.callbacks[name];
          }
        }
      });
    }
    return r;
  }

  setLinks(links: Record<string, ReferenceObject | LinkObject>): OpenApi {
    this.#result.components.links = links;
    return this;
  }

  getLinks(): Record<string, ReferenceObject | LinkObject> | undefined {
    return this.#result.components.links;
  }

  removeLink(name: string): ReferenceObject | LinkObject | undefined {
    let r: ReferenceObject | LinkObject | undefined;
    if (this.#result.components.links) {
      r = this.#result.components.links[name];
      delete this.#result.components.links[name];
    }
    return r;
  }

  hasLink(name: string): boolean {
    let r = false;
    if (this.#result.components?.links?.[name]) {
      r = true;
    }
    return r;
  }

  addLink(name: string, link: ReferenceObject | LinkObject): OpenApi {
    if (!this.#result.components.links) {
      this.#result.components.links = {};
    }
    this.#result.components.links[name] = link;
    return this;
  }

  /**
   * 
   * @returns removed links
   */
  cleanupLinks(): Record<string, ReferenceObject | LinkObject> {
    const r: Record<string, ReferenceObject | LinkObject> = {};
    const refs = JSON.stringify(this.#result).match(/#\/components\/links\/[^/"]*/g);
    if (this.#result.components.links) {
      Object.keys(this.#result.components.links).forEach(name => {
        if (!refs?.includes(`#/components/links/${name}`)) {
          if (this.#result.components?.links?.[name]) {
            r[name] = this.#result.components.links[name];
            delete this.#result.components.links[name];
          }
        }
      });
    }
    return r;
  }

  setExamples(examples: Record<string, ReferenceObject | ExampleObject>): OpenApi {
    this.#result.components.examples = examples;
    return this;
  }

  getExamples(): Record<string, ReferenceObject | ExampleObject> | undefined {
    return this.#result.components.examples;
  }

  removeExample(name: string): ReferenceObject | ExampleObject | undefined {
    let r: ReferenceObject | ExampleObject | undefined;
    if (this.#result.components.examples) {
      r = this.#result.components.examples[name];
      delete this.#result.components.examples[name];
    }
    return r;
  }

  hasExample(name: string): boolean {
    let r = false;
    if (this.#result.components?.examples?.[name]) {
      r = true;
    }
    return r;
  }

  addExample(name: string, example: ReferenceObject | ExampleObject): OpenApi {
    if (!this.#result.components.examples) {
      this.#result.components.examples = {};
    }
    this.#result.components.examples[name] = example;
    return this;
  }

  /**
   * 
   * @returns removed examples
   */
  cleanupExamples(): Record<string, ReferenceObject | ExampleObject> {
    const r: Record<string, ReferenceObject | ExampleObject> = {};
    const refs = JSON.stringify(this.#result).match(/#\/components\/examples\/[^/"]*/g);
    if (this.#result.components.examples) {
      Object.keys(this.#result.components.examples).forEach(name => {
        if (!refs?.includes(`#/components/examples/${name}`)) {
          if (this.#result.components?.examples?.[name]) {
            r[name] = this.#result.components.examples[name];
            delete this.#result.components.examples[name];
          }
        }
      });
    }
    return r;
  }

  setSchemas(schemas: Record<string, SchemaObject | ReferenceObject>): OpenApi {
    this.#result.components.schemas = schemas;
    return this;
  }

  getSchemas(): Record<string, SchemaObject | ReferenceObject> | undefined {
    return this.#result.components.schemas;
  }

  removeSchema(name: string): SchemaObject | ReferenceObject | undefined {
    let r: SchemaObject | undefined;
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

  addSchema(name: string, schema: SchemaObject | ReferenceObject): OpenApi {
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
  cleanupSchemas(): Record<string, SchemaObject | ReferenceObject> {
    const r: Record<string, SchemaObject | ReferenceObject> = {};
    const refs = JSON.stringify(this.#result).match(/#\/components\/schemas\/[^/"]*/g);
    if (this.#result.components.schemas) {
      Object.keys(this.#result.components.schemas).forEach(name => {
        if (!refs?.includes(`#/components/schemas/${name}`)) {
          if (this.#result.components?.schemas?.[name]) {
            r[name] = this.#result.components.schemas[name];
            delete this.#result.components.schemas[name];
          }
        }
      });
    }
    return r;
  }

  setHeaders(headers: Record<string, ReferenceObject | HeaderObject>): OpenApi {
    this.#result.components.headers = headers;
    return this;
  }

  getHeaders(): Record<string, ReferenceObject | HeaderObject> | undefined {
    return this.#result.components.headers;
  }

  removeHeader(name: string): ReferenceObject | HeaderObject | undefined {
    let r: ReferenceObject | HeaderObject | undefined;
    if (this.#result.components.headers) {
      r = this.#result.components.headers[name];
      delete this.#result.components.headers[name];
    }
    return r;
  }

  hasHeader(name: string): boolean {
    let r = false;
    if (this.#result.components?.headers?.[name]) {
      r = true;
    }
    return r;
  }

  addHeader(name: string, header: ReferenceObject | HeaderObject): OpenApi {
    if (!this.#result.components.headers) {
      this.#result.components.headers = {};
    }
    this.#result.components.headers[name] = header;
    return this;
  }

  /**
   * 
   * @returns removed headers
   */
  cleanupHeaders(): Record<string, ReferenceObject | HeaderObject> {
    const r: Record<string, ReferenceObject | HeaderObject> = {};
    const refs = JSON.stringify(this.#result).match(/#\/components\/headers\/[^/"]*/g);
    if (this.#result.components.headers) {
      Object.keys(this.#result.components.headers).forEach(name => {
        if (!refs?.includes(`#/components/headers/${name}`)) {
          if (this.#result.components?.headers?.[name]) {
            r[name] = this.#result.components.headers[name];
            delete this.#result.components.headers[name];
          }
        }
      });
    }
    return r;
  }

  setParameters(parameters: Record<string, ReferenceObject | ParameterObject>): OpenApi {
    this.#result.components.parameters = parameters;
    return this;
  }

  getParameters(): Record<string, ReferenceObject | ParameterObject> | undefined {
    return this.#result.components.parameters;
  }

  removeParameter(name: string): ReferenceObject | ParameterObject | undefined {
    let r: ReferenceObject | ParameterObject | undefined;
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

  addParameter(name: string, param: ParameterObject): OpenApi {
    if (!this.#result.components.parameters) {
      this.#result.components.parameters = {};
    }
    this.#result.components.parameters[name] = param;
    return this;
  }

  /**
   * 
   * @returns removed parameters
   */
  cleanupParameters(): Record<string, ReferenceObject | ParameterObject> {
    const r: Record<string, ReferenceObject | ParameterObject> = {};
    const refs = JSON.stringify(this.#result).match(/#\/components\/parameters\/[^/"]*/g);
    if (this.#result.components.parameters) {
      Object.keys(this.#result.components.parameters).forEach(name => {
        if (!refs?.includes(`#/components/parameters/${name}`)) {
          if (this.#result.components?.parameters?.[name]) {
            r[name] = this.#result.components.parameters[name];
            delete this.#result.components.parameters[name];
          }
        }
      });
    }
    return r;
  }

  setRequestBodies(requestBodies: Record<string, ReferenceObject | RequestBodyObject>): OpenApi {
    this.#result.components.requestBodies = requestBodies;
    return this;
  }

  getRequestBodies(): Record<string, ReferenceObject | RequestBodyObject> | undefined {
    return this.#result.components.requestBodies;
  }

  removeRequestBody(name: string): ReferenceObject | RequestBodyObject | undefined {
    let r: ReferenceObject | RequestBodyObject | undefined;
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

  addRequestBody(name: string, requestBody: ReferenceObject | RequestBodyObject): OpenApi {
    if (!this.#result.components.requestBodies) {
      this.#result.components.requestBodies = {};
    }
    this.#result.components.requestBodies[name] = requestBody;
    return this;
  }

  /**
   * 
   * @returns removed requestBodies
   */
  cleanupRequestBodies(): Record<string, ReferenceObject | RequestBodyObject> {
    const r: Record<string, ReferenceObject | RequestBodyObject> = {};
    const refs = JSON.stringify(this.#result).match(/#\/components\/requestBodies\/[^/"]*/g);
    if (this.#result.components.requestBodies) {
      Object.keys(this.#result.components.requestBodies).forEach(name => {
        if (!refs?.includes(`#/components/requestBodies/${name}`)) {
          if (this.#result.components?.requestBodies?.[name]) {
            r[name] = this.#result.components.requestBodies[name];
            delete this.#result.components.requestBodies[name];
          }
        }
      });
    }
    return r;
  }

  setResponses(responses: Record<string, ReferenceObject | ResponseObject>): OpenApi {
    this.#result.components.responses = responses;
    return this;
  }

  getResponses(): Record<string, ReferenceObject | ResponseObject> | undefined {
    return this.#result.components.responses;
  }

  removeResponse(name: string): ReferenceObject | ResponseObject | undefined {
    let r: ReferenceObject | ResponseObject | undefined;
    if (this.#result.components.responses) {
      r = this.#result.components.responses[name];
      delete this.#result.components.responses[name];
    }
    return r;
  }

  hasResponse(name: string): boolean {
    let r = false;
    if (this.#result.components?.responses?.[name]) {
      r = true;
    }
    return r;
  }

  addResponse(name: string, response: ReferenceObject | ResponseObject): OpenApi {
    if (!this.#result.components.responses) {
      this.#result.components.responses = {};
    }
    this.#result.components.responses[name] = response;
    return this;
  }

  /**
   * 
   * @returns removed responses
   */
  cleanupResponses(): Record<string, ReferenceObject | ResponseObject> {
    const r: Record<string, ReferenceObject | ResponseObject> = {};
    const refs = JSON.stringify(this.#result).match(/#\/components\/responses\/[^/"]*/g);
    if (this.#result.components.responses) {
      Object.keys(this.#result.components.responses).forEach(name => {
        if (!refs?.includes(`#/components/responses/${name}`)) {
          if (this.#result.components?.responses?.[name]) {
            r[name] = this.#result.components.responses[name];
            delete this.#result.components.responses[name];
          }
        }
      });
    }
    return r;
  }

  setSecuritySchemes(v: Record<string, ReferenceObject | SecuritySchemeObject>): OpenApi {
    this.#result.components.securitySchemes = v;
    return this;
  }

  getSecuritySchemes(): Record<string, ReferenceObject | SecuritySchemeObject> | undefined {
    return this.#result.components.securitySchemes;
  }

  removeSecurityScheme(name: string): ReferenceObject | SecuritySchemeObject | undefined {
    let r: ReferenceObject | SecuritySchemeObject | undefined;
    if (this.#result.components.securitySchemes) {
      r = this.#result.components.securitySchemes[name];
      delete this.#result.components.securitySchemes[name];
    }
    return r;
  }

  hasSecurityScheme(name: string): boolean {
    let r = false;
    if (this.#result.components?.securitySchemes?.[name]) {
      r = true;
    }
    return r;
  }

  addSecurityScheme(name: string, schema: ReferenceObject | SecuritySchemeObject): OpenApi {
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
  cleanupSecuritySchemes(): Record<string, SecuritySchemeObject | ReferenceObject> {
    const r: Record<string, SecuritySchemeObject | ReferenceObject> = {};
    const refs = JSON.stringify(this.#result).match(/#\/components\/securitySchemes\/[^/"]*/g);
    if (this.#result.components.securitySchemes) {
      Object.keys(this.#result.components.securitySchemes).forEach(name => {
        if (!refs?.includes(`#/components/securitySchemes/${name}`)) {
          if (this.#result.components?.securitySchemes?.[name]) {
            r[name] = this.#result.components.securitySchemes[name];
            delete this.#result.components.securitySchemes[name];
          }
        }
      });
    }
    return r;
  }

  setComponents(components: ComponentsObject): OpenApi {
    this.#result.components = components;
    return this;
  }

  getComponents(): ComponentsObject {
    return this.#result.components;
  }

  /**
   * remove unused entities (possibly auto-generated) from components:
   * - headers
   * - responses
   * - requestBodies
   * - parameters
   * - schemas
   */
  cleanupComponents(): ComponentsObject {
    const r: ComponentsObject = {};
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

  setTags(tags: TagObject[]): OpenApi {
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

  addTag(tag: TagObject): OpenApi {
    return this.addTags(tag);
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

  setDefaultSecurity(securityObjects: SecurityRequirementObject[]): OpenApi;
  setDefaultSecurity(securityObject: SecurityRequirementObject): OpenApi;
  setDefaultSecurity(security: string[]): OpenApi;
  setDefaultSecurity(security: string): OpenApi;
  setDefaultSecurity(v: SecurityRequirementObject[] | SecurityRequirementObject | string[] | string): OpenApi {
    this.#security = [];
    if (Array.isArray(v)) {
      v.forEach((value: SecurityRequirementObject | string) => this.addDefaultSecurity(value));
    } else {
      this.addDefaultSecurity(v);
    }
    return this;
  }

  addDefaultSecurity(security: SecurityRequirementObject | string): OpenApi;
  addDefaultSecurity(security: SecurityRequirementObject): OpenApi;
  addDefaultSecurity(security: string): OpenApi;
  addDefaultSecurity(v: SecurityRequirementObject | string): OpenApi {
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

  setInfo(v: InfoObject): OpenApi {
    this.#result.info = v;
    return this;
  }

  getInfo(): InfoObject {
    return this.#result.info;
  }

  setInfoProperty(prop: string, v: unknown): OpenApi {
    this.#result.info[prop] = v;
    return this;
  }

  setTitle(title: string): OpenApi {
    this.#result.info.title = title;
    return this;
  }

  getTitle(): string {
    return this.#result.info.title;
  }

  setDescription(description: string): OpenApi {
    this.#result.info.description = description;
    return this;
  }

  getDescription(): string | undefined {
    return this.#result.info.description;
  }

  setTermsOfService(termsOfService: string): OpenApi {
    this.#result.info.termsOfService = termsOfService;
    return this;
  }

  getTermsOfService(): string | undefined {
    return this.#result.info.termsOfService;
  }

  setVersion(version: string): OpenApi {
    this.#result.info.version = version;
    return this;
  }

  getVersion(): string {
    return this.#result.info.version;
  }

  setContact(contact: ContactObject): OpenApi {
    this.#result.info.contact = contact;
    return this;
  }

  getContact(): ContactObject | undefined {
    return this.#result.info.contact;
  }

  setLicense(license: string): OpenApi;
  setLicense(license: LicenseObject): OpenApi;
  setLicense(license: LicenseObject | string): OpenApi {
    if (typeof license === 'string') {
      this.#result.info.license = {
        name: license
      };
    } else {
      this.#result.info.license = license;
    }
    return this;
  }

  getLicense(): LicenseObject | undefined {
    return this.#result.info.license;
  }

  setServers(servers: ServerObject[]): OpenApi;
  setServers(server: ServerObject): OpenApi;
  setServers(v: ServerObject[] | ServerObject): OpenApi {
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

  addServer(server: ServerObject): OpenApi;
  addServer(url: string): OpenApi;
  addServer(v: ServerObject | string): OpenApi {
    if (typeof v === 'string') {
      v = { url: v }
    }
    this.#result.servers.push(v);
    return this;
  }

  /**
   * 
   * OpenApi.setServers({ url })
   */
  setHost(url: string): OpenApi {
    return this.setServers({
      url
    });
  }

  setExternalDoc(externalDoc: ExternalDocObject): OpenApi;
  setExternalDoc(url: string): OpenApi
  setExternalDoc(externalDoc: ExternalDocObject | string): OpenApi {
    if (typeof externalDoc === 'string') {
      this.#result.externalDocs = { url: externalDoc };
    } else {
      this.#result.externalDocs = externalDoc;
    }
    return this;
  } 

  getExternalDoc(): ExternalDocObject | undefined {
    return this.#result.externalDocs;
  }

  /**
   * @example
   * ```typescript
   * import routing from '@novice1/routing';
   * import { OpenApi } from '@novice1/api-doc-generator';
   * 
   * const router = routing().post(...);
   * const openapi = new OpenApi();
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

  private _getResponsesSchema(responses?: ResponsesRecord): ResponsesRecord {
    let r: ResponsesRecord = {};
    if (responses
      && this.#responsesProperty) {
      const tmp = responses[this.#responsesProperty];
      if (tmp && typeof tmp === 'object') {
        Object.assign(r, tmp);
      }
    } else {
      r = responses || r;
    }
    return r;
  }

  private _add(route: RouteSchema): ProcessedRoute | undefined {

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
    let security: unknown[] = this.#security;

    // if it shouldn't be documented
    if (undoc) {
      Log.debug('"undoc" route [%s %s]', method, path);
      return {
        path,
        method
      };
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
        Log.warn('Missing "security" for route: %s %s', method, path);
      } else {
        schema.security = security;
      }
    }

    // format parameters, requestBody, responses
    const formattedParameters: (ParameterObject | ReferenceObject)[] = this._formatParameters(parameters);
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

    Log.debug('added route [%s %s]: %O', method, path, schema);

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
  private _formatParameters(parameters: RouteParameters): (ParameterObject | ReferenceObject)[] {
    // format parameters
    const res: (ParameterObject | ReferenceObject)[] = [];

    const paramsHelper = new this.#helperClass(parameters);
    let children: Record<string, OpenApiHelperInterface> | undefined;
    if (paramsHelper.isValid()) {
      children = paramsHelper.getChildren();
    }

    if (parameters.headers) {
      this._pushPathParameters(
        ParameterLocations.header, parameters.headers, res);
    } else if (children && children.headers) {
      this._pushPathParameters(
        ParameterLocations.header, children.headers, res);
    }
    if (parameters.params) {
      this._pushPathParameters(ParameterLocations.path, parameters.params, res);
    } else if (children && children.params) {
      this._pushPathParameters(
        ParameterLocations.path, children.params, res);
    }
    if (parameters.query) {
      this._pushPathParameters(
        ParameterLocations.query, parameters.query, res);
    } else if (children && children.query) {
      this._pushPathParameters(ParameterLocations.query, children.query, res);
    }
    if (parameters.cookies) {
      this._pushPathParameters(
        ParameterLocations.cookie, parameters.cookies, res);
    } else if (children && children.cookies) {
      this._pushPathParameters(
        ParameterLocations.cookie, children.cookies, res);
    }

    return res;
  }

  private _pushPathParameters(
    location: ParameterLocations,
    value: Record<string, unknown> | OpenApiHelperInterface,
    res: Array<ReferenceObject | ParameterObject>) {
    const valueHelper = value instanceof this.#helperClass ? value : new this.#helperClass(value);
    let valueHelperType: string | undefined;

    let children: Record<string, OpenApiHelperInterface>;
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

    const getChild = (name: string): OpenApiHelperInterface | undefined => {
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
      helper: OpenApiHelperInterface,
      style?: string) => {
      if (!helper.isValid()) return;

      const defaultParamObject: ParameterObject = {
        name,
        in: location
      };

      if (style) {
        defaultParamObject.style = style;
      }

      const parameterObject = this._createParameterObject(location, helper, defaultParamObject);

      // ReferenceObject | ParameterObject
      const pObject = this._autoParameterObjectToRef(helper, parameterObject);
      res.push(pObject);
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
        && valueHelper.hasAdditionalProperties?.()) {
        let style: string | undefined;
        if (valueHelper.getStyle
          && valueHelper.hasStyle?.()) {
          style = 'form';
        }
        handleChild(location, valueHelper, style);
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
    helper: OpenApiHelperInterface,
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
      this._pushRequestBody(parameters.body, parameters.files, consumes, res);
    } else {
      const bodyHelper = new this.#helperClass(parameters);
      if (bodyHelper.isValid()) {
        const children = bodyHelper.getChildren();
        if (children.body || children.files) {
          this._pushRequestBody(children.body, children.files, consumes, res);
        }
        // ReferenceObject | RequestBodyObject
        res = this._autoRequestBodyObjectToRef(bodyHelper, res);
      }
    }

    return res;
  }

  private _pushRequestBody(
    body: Record<string, unknown> | OpenApiHelperInterface | undefined,
    files: Record<string, unknown> | OpenApiHelperInterface | undefined,
    consumes: string[],
    res: RequestBodyObject) {

    let schemaObject: SchemaObject | undefined;

    let bodySchema: SchemaCreator | undefined;
    let filesSchema: SchemaCreator | undefined;

    let helperWithRef: OpenApiHelperInterface | undefined;

    let examples: Record<string, ExampleObject | ReferenceObject> | undefined;
    let encoding: Record<string, EncodingObject> | undefined;

    let contentIsRequired = false;

    if (body) {
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


  /**
   * create non-alternative schema
   * @param helper
   * @param parentProp used for required children/items
   * @param name used for required children
   * @param format used for 'binary' format
   * @returns 
   */
  private _createBasicSchema(
    helper: OpenApiHelperInterface,
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

  /**
   * 
   * @param helper 
   * @param parentProp used for required children/items
   * @param name used for required children
   * @param format used for 'binary' format
   * @returns 
   */
  private _createSchema(
    helper: OpenApiHelperInterface,
    parentProp?: SchemaCreator,
    name?: string,
    format?: string
  ): SchemaCreator {
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
    helper: OpenApiHelperInterface,
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
    altHelper: OpenApiHelperInterface,
    parentProp?: SchemaCreator,
    name?: string
  ): SchemaCreator {
    return new SchemaCreator(this._createAlternativeSchemaObject(altHelper, parentProp, name));
  }

  private _createAlternativeSchemaObject(
    altHelper: OpenApiHelperInterface,
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

  private _fillArraySchemaObject(
    helper: OpenApiHelperInterface,
    propSchema: SchemaCreator,
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
        if (format) {
          propSchema.setFormat(format);
        }

        // unique
        propSchema.setUniqueItems(helper.isUnique());

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
    helper: OpenApiHelperInterface,
    propSchema: SchemaCreator
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
      if (helper.hasAdditionalProperties?.()) {
        const additionalProperties = helper.getAdditionalProperties?.();
        if (additionalProperties) {
          propSchema.setAdditionalProperties(additionalProperties);
        }
      }
    }
  }

  private _autoSchemaObjectToRef(
    helper: OpenApiHelperInterface,
    schemaObject: SchemaObject
  ): SchemaObject {
    let newSchema = schemaObject;
    const ref: string | undefined = this._getLocalRef(helper, 'schemas');
    const remoteRef: string | undefined = this._getRemoteRef(helper);
    if (ref) {
      const entityName: string = this._localRefToEntityName(ref);
      if (entityName && newSchema) {
        if (this.#generateComponentsRule === GenerateComponentsRules.always) {
          this.addSchema(entityName, newSchema);
        } else if (this.#generateComponentsRule === GenerateComponentsRules.ifUndefined) {
          if (!this.hasSchema(entityName)) {
            this.addSchema(entityName, newSchema);
          }
        }
        newSchema = {
          $ref: ref
        };
      }
    } else if (remoteRef) {
      newSchema = {
        $ref: remoteRef
      };
    }
    return newSchema;
  }

  private _autoParameterObjectToRef(
    helper: OpenApiHelperInterface,
    paramObject: ParameterObject
  ): ReferenceObject | ParameterObject {
    let newParamObject: ReferenceObject | ParameterObject = paramObject;
    const ref: string | undefined = this._getLocalRef(helper, 'parameters');
    const remoteRef: string | undefined = this._getRemoteRef(helper);
    if (ref) {
      const entityName: string = this._localRefToEntityName(ref);
      if (entityName && newParamObject) {
        if (this.#generateComponentsRule === GenerateComponentsRules.always) {
          this.addParameter(entityName, newParamObject);
        } else if (this.#generateComponentsRule === GenerateComponentsRules.ifUndefined) {
          if (!this.hasParameter(entityName)) {
            this.addParameter(entityName, newParamObject);
          }
        }
        newParamObject = {
          $ref: ref
        };
      }
    } else if (remoteRef) {
      newParamObject = {
        $ref: remoteRef
      };
    }
    return newParamObject;
  }

  private _autoRequestBodyObjectToRef(
    helper: OpenApiHelperInterface,
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
        } else if (this.#generateComponentsRule === GenerateComponentsRules.ifUndefined) {
          if (!this.hasRequestBody(entityName)) {
            this.addRequestBody(entityName, newSchema);
          }
        }
        newSchema = {
          $ref: ref
        };
      }
    } else if (remoteRef) {
      newSchema = {
        $ref: remoteRef
      };
    }
    return newSchema;
  }

  private _getLocalRef(
    helper: OpenApiHelperInterface,
    componentCategory = 'schemas'
  ): string | undefined {
    let r: string | undefined;
    if (helper.hasRef?.()) {
      const ref = helper.getRef?.();
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
    helper: OpenApiHelperInterface
  ): string | undefined {
    let r: string | undefined;
    if (helper.hasRef?.()) {
      const ref = helper.getRef?.();
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
    return extend(true, {}, this.#result);
  }
}
