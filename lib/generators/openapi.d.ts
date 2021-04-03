/**
 * @module openapi
 */
/**
 * @todo: getters
 * @todo: change var, method names ...
 * @todo add debug logs
 */
import { SchemaObject, SecuritySchemeObject, ReferenceObject, RequestBodyObject, ResponseObject, TagObject, ExampleObject, ComponentsObject, ParameterObject, LinkObject, HeaderObject, InfoObject, LicenseObject, ContactObject, ExternalDocObject, ServerObject, SecurityRequirementObject } from './openapi/definitions';
import { OpenApiHelperInterface } from './openapi/helpers/interfaces';
export interface Route {
    path: string;
    methods: Record<string, unknown>;
    [key: string]: unknown;
}
export interface ProcessedRoute {
    path: string;
    method?: string;
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
export declare enum GenerateComponentsRules {
    always = "always",
    ifUndefined = "ifUndefined",
    never = "never"
}
/**
 * @note For now it is not possible to only
 * send files outside of object property (multipart).
 * Well, at least not tried yet
 * but it definitely doesn't work with alternatives
 */
export declare class OpenApi {
    #private;
    constructor(helperClass?: {
        new (args: unknown): OpenApiHelperInterface;
    });
    setGenerateComponentsRule(v: GenerateComponentsRules): OpenApi;
    getGenerateComponentsRule(): GenerateComponentsRules;
    setResponsesProperty(v: string): OpenApi;
    getResponsesProperty(): string | undefined;
    setConsumes(v: string[]): OpenApi;
    getConsumes(): string[];
    removeCallback(name: string): unknown;
    hasCallback(name: string): boolean;
    addCallback(name: string, callback: unknown): OpenApi;
    /**
     *
     * @returns removed callbacks
     */
    cleanupCallbacks(): Record<string, unknown>;
    removeLink(name: string): ReferenceObject | LinkObject | undefined;
    hasLink(name: string): boolean;
    addLink(name: string, link: ReferenceObject | LinkObject): OpenApi;
    /**
     *
     * @returns removed links
     */
    cleanupLinks(): Record<string, ReferenceObject | LinkObject>;
    removeExample(name: string): ReferenceObject | ExampleObject | undefined;
    hasExample(name: string): boolean;
    addExample(name: string, example: ReferenceObject | ExampleObject): OpenApi;
    /**
     *
     * @returns removed examples
     */
    cleanupExamples(): Record<string, ReferenceObject | ExampleObject>;
    removeSchema(name: string): SchemaObject | ReferenceObject | undefined;
    hasSchema(name: string): boolean;
    addSchema(name: string, schema: SchemaObject | ReferenceObject): OpenApi;
    /**
     *
     * @returns removed schemas
     */
    cleanupSchemas(): Record<string, SchemaObject | ReferenceObject>;
    removeHeader(name: string): ReferenceObject | HeaderObject | undefined;
    hasHeader(name: string): boolean;
    addHeader(name: string, header: ReferenceObject | HeaderObject): OpenApi;
    /**
     *
     * @returns removed headers
     */
    cleanupHeaders(): Record<string, ReferenceObject | HeaderObject>;
    removeParameter(name: string): ReferenceObject | ParameterObject | undefined;
    hasParameter(name: string): boolean;
    addParameter(name: string, param: ParameterObject): OpenApi;
    /**
     *
     * @returns removed parameters
     */
    cleanupParameters(): Record<string, ReferenceObject | ParameterObject>;
    removeRequestBody(name: string): ReferenceObject | RequestBodyObject | undefined;
    hasRequestBody(name: string): boolean;
    addRequestBody(name: string, requestBody: ReferenceObject | RequestBodyObject): OpenApi;
    /**
     *
     * @returns removed requestBodies
     */
    cleanupRequestBodies(): Record<string, ReferenceObject | RequestBodyObject>;
    removeResponse(name: string): ReferenceObject | ResponseObject | undefined;
    hasResponse(name: string): boolean;
    addResponse(name: string, response: ReferenceObject | ResponseObject): OpenApi;
    /**
     *
     * @returns removed responses
     */
    cleanupResponses(): Record<string, ReferenceObject | ResponseObject>;
    setSecuritySchemes(v: Record<string, ReferenceObject | SecuritySchemeObject>): OpenApi;
    removeSecurityScheme(name: string): ReferenceObject | SecuritySchemeObject | undefined;
    hasSecurityScheme(name: string): boolean;
    addSecurityScheme(name: string, schema: ReferenceObject | SecuritySchemeObject): OpenApi;
    /**
     *
     * @returns removed securitySchemes
     */
    cleanupSecuritySchemes(): Record<string, SecuritySchemeObject | ReferenceObject>;
    setComponents(k: Record<string, ComponentsObject>): OpenApi;
    /**
     * remove unused entities (possibly auto-generated) from components:
     * - headers
     * - responses
     * - requestBodies
     * - parameters
     * - schemas
     */
    cleanupComponents(): ComponentsObject;
    setTags(tags: TagObject[]): OpenApi;
    removeTag(tagName: string): TagObject | undefined;
    addTag(tag: TagObject): OpenApi;
    addTags(tags: TagObject): OpenApi;
    addTags(tags: TagObject[]): OpenApi;
    setDefaultSecurity(securityObjects: SecurityRequirementObject[]): OpenApi;
    setDefaultSecurity(securityObject: SecurityRequirementObject): OpenApi;
    setDefaultSecurity(security: string[]): OpenApi;
    setDefaultSecurity(security: string): OpenApi;
    addDefaultSecurity(security: SecurityRequirementObject | string): OpenApi;
    addDefaultSecurity(security: SecurityRequirementObject): OpenApi;
    addDefaultSecurity(security: string): OpenApi;
    getDefaultSecurity(): SecurityRequirementObject[];
    setInfo(v: InfoObject): OpenApi;
    getInfo(): InfoObject;
    setInfoProperty(prop: string, v: unknown): OpenApi;
    setTitle(title: string): OpenApi;
    setDescription(description: string): OpenApi;
    setTermsOfService(termsOfService: string): OpenApi;
    setVersion(version: string): OpenApi;
    setContact(contact: ContactObject): OpenApi;
    setLicense(license: string): OpenApi;
    setLicense(license: LicenseObject): OpenApi;
    setServers(servers: ServerObject[]): OpenApi;
    setServers(server: ServerObject): OpenApi;
    getServers(): ServerObject[];
    addServer(server: ServerObject): OpenApi;
    addServer(url: string): OpenApi;
    /**
     *
     * OpenApi.setServers({ url })
     */
    setHost(url: string): OpenApi;
    setExternalDoc(externalDoc: ExternalDocObject): OpenApi;
    setExternalDoc(url: string): OpenApi;
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
    remove(path: string, method?: string): ProcessedRoute[];
    private _getResponsesSchema;
    private _add;
    private _formatResponses;
    private _formatParameters;
    private _pushPathParameters;
    /**
     *
     * @param location path, query, header or cookie
     * @param helper
     * @param defaultParameterObject
     * @returns
     */
    private _createParameterObject;
    private _formatRequestBody;
    private _pushRequestBody;
    /**
     * create non-alternative schema
     * @param helper
     * @param parentProp used for required children/items
     * @param name used for required children
     * @param format used for 'binary' format
     * @returns
     */
    private _createBasicSchema;
    /**
     *
     * @param helper
     * @param parentProp used for required children/items
     * @param name used for required children
     * @param format used for 'binary' format
     * @returns
     */
    private _createSchema;
    /**
     *
     * @param helper
     * @param parentProp used for required children/items
     * @param name used for required children
     * @param format used for 'binary' format
     * @returns
     */
    private _createSchemaObject;
    private _createAlternativeSchema;
    private _createAlternativeSchemaObject;
    private _fillArraySchemaObject;
    private _fillObjectSchemaObject;
    private _autoSchemaObjectToRef;
    private _autoParameterObjectToRef;
    private _autoRequestBodyObjectToRef;
    private _getLocalRef;
    private _getRemoteRef;
    private _localRefToEntityName;
    result(): Record<string, unknown>;
}
