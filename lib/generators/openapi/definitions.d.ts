/**
 * @module openapi-definitions
 */
export declare type AdditionalProperties = boolean | SchemaObject | ReferenceObject;
export declare enum ParameterLocations {
    cookie = "cookie",
    header = "header",
    path = "path",
    query = "query"
}
export interface SecurityRequirementObject {
    [key: string]: string[];
}
export interface ContactObject {
    name?: string;
    url?: string;
    email?: string;
    [key: string]: unknown;
}
export interface LicenseObject {
    name: string;
    url?: string;
    [key: string]: unknown;
}
export interface InfoObject {
    title: string;
    description?: string;
    termsOfService?: string;
    contact?: ContactObject;
    license?: LicenseObject;
    version: string;
    [key: string]: unknown;
}
/**
 * @links
 *  - https://swagger.io/specification/#schema-object
 *  - https://tools.ietf.org/html/draft-wright-json-schema-validation-00
 */
export interface SchemaObject {
    title?: string;
    /**
     * CommonMark syntax MAY be used for rich text representation.
     */
    description?: string;
    type?: string;
    format?: string;
    pattern?: RegExp | string;
    default?: unknown;
    enum?: unknown[];
    multipleOf?: number;
    allOf?: Array<SchemaObject | ReferenceObject>;
    anyOf?: Array<SchemaObject | ReferenceObject>;
    oneOf?: Array<SchemaObject | ReferenceObject>;
    not?: SchemaObject | ReferenceObject;
    items?: SchemaObject | ReferenceObject;
    uniqueItems?: boolean;
    properties?: Record<string, SchemaObject | ReferenceObject>;
    additionalProperties?: AdditionalProperties;
    required?: string[];
    maxLength?: number;
    minLength?: number;
    maxItems?: number;
    minItems?: number;
    maxProperties?: number;
    minProperties?: number;
    maximum?: number;
    minimum?: number;
    exclusiveMaximum?: boolean;
    exclusiveMinimum?: boolean;
    nullable?: boolean;
    discriminator?: DiscriminatorObject;
    readOnly?: boolean;
    writeOnly?: boolean;
    xml?: unknown;
    externalDocs?: ExternalDocObject;
    example?: unknown;
    deprecated?: boolean;
    [key: string]: unknown;
}
export interface XMLObject {
    name?: string;
    namespace?: string;
    prefix?: string;
    attribute?: boolean;
    wrapped?: boolean;
}
export interface DiscriminatorObject {
    propertyName: string;
    mapping?: Record<string, string>;
}
export interface ExternalDocObject {
    description?: string;
    url: string;
}
export interface TagObject {
    name: string;
    description?: string;
    externalDocs?: ExternalDocObject;
}
export interface OAuthFlowObject {
    authorizationUrl?: string;
    tokenUrl?: string;
    refreshUrl?: string;
    scopes?: Record<string, string>;
}
export interface OAuthFlowsObject {
    implicit?: OAuthFlowObject;
    password?: OAuthFlowObject;
    clientCredentials?: OAuthFlowObject;
    authorizationCode?: OAuthFlowObject;
}
export interface SecuritySchemeObject {
    type: string;
    description?: string;
    name?: string;
    in?: string;
    scheme?: string;
    bearerFormat?: string;
    flows?: OAuthFlowsObject;
    openIdConnectUrl?: string;
}
export interface ReferenceObject {
    $ref: string;
    [key: string]: unknown;
}
export interface ServerVariableObject {
    enum?: string[];
    default: string;
    description?: string;
    [x: string]: unknown;
}
export interface ServerObject {
    url: string;
    description?: string;
    variables?: Record<string, ServerVariableObject>;
    [x: string]: unknown;
}
export interface LinkObject {
    operationRef?: string;
    operationId?: string;
    parameters?: Record<string, unknown>;
    requestBody?: unknown;
    description?: string;
    server?: ServerObject;
    [x: string]: unknown;
}
export interface ExampleObject {
    summary?: string;
    description?: string;
    value?: unknown;
    externalValue?: string;
}
export interface HeaderObject {
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
    schema?: SchemaObject | ReferenceObject;
    example?: unknown;
    examples?: Record<string, ExampleObject | ReferenceObject>;
    content?: Record<string, MediaTypeObject>;
}
export interface ParameterObject extends HeaderObject {
    name: string;
    in: string;
    allowEmptyValue?: boolean;
}
export interface EncodingObject {
    contentType?: string;
    headers?: Record<string, HeaderObject | ReferenceObject>;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
}
export interface MediaTypeObject {
    schema?: SchemaObject | ReferenceObject;
    example?: unknown;
    examples?: Record<string, ExampleObject | ReferenceObject>;
    encoding?: Record<string, EncodingObject>;
}
export interface RequestBodyObject {
    content?: Record<string, MediaTypeObject>;
    [key: string]: unknown;
}
export interface ResponseObject {
    description: string;
    headers?: Record<string, HeaderObject | ReferenceObject>;
    content?: Record<string, MediaTypeObject>;
    links?: Record<string, LinkObject | ReferenceObject>;
    [key: string]: unknown;
}
export interface ComponentsObject {
    schemas?: Record<string, SchemaObject | ReferenceObject>;
    requestBodies?: Record<string, RequestBodyObject | ReferenceObject>;
    headers?: Record<string, HeaderObject | ReferenceObject>;
    parameters?: Record<string, ParameterObject | ReferenceObject>;
    responses?: Record<string, ResponseObject | ReferenceObject>;
    examples?: Record<string, ExampleObject | ReferenceObject>;
    securitySchemes?: Record<string, SecuritySchemeObject | ReferenceObject>;
    links?: Record<string, LinkObject | ReferenceObject>;
    callbacks?: Record<string, unknown>;
    [key: string]: unknown;
}
