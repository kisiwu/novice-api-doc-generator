export type AdditionalProperties = boolean | SchemaObject | ReferenceObject;

export enum ParameterLocation {
  cookie = 'cookie',
  header = 'header',
  path = 'path',
  query = 'query',
}

export interface SecurityRequirementObject {
  [key: string]: string[];
}

export interface ContactObject {
  name?: string; // The identifying name of the contact person/organization.
  url?: string; // The URL pointing to the contact information. MUST be in the format of a URL.
  email?: string; // The email address of the contact person/organization. MUST be in the format of an email address.
  [key: string]: unknown;
}

export interface LicenseObject {
  name: string; // REQUIRED. The license name used for the API.
  url?: string; // A URL to the license used for the API. MUST be in the format of a URL.
  [key: string]: unknown;
}

export interface InfoObject {
  title: string; // REQUIRED. The title of the API.
  description?: string; // A short description of the API. CommonMark syntax MAY be used for rich text representation.
  termsOfService?: string; // A URL to the Terms of Service for the API. MUST be in the format of a URL.
  contact?: ContactObject; // The contact information for the exposed API.
  license?: LicenseObject; // The license information for the exposed API.
  version: string; // REQUIRED. The version of the OpenAPI document (which is distinct from the OpenAPI Specification version or the API implementation version).
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
  propertyName: string; // REQUIRED. The name of the property in the payload that will hold the discriminator value.
  mapping?: Record<string, string>; // An object to hold mappings between payload values and schema names or references.
}

export interface ExternalDocObject {
  description?: string; // A short description of the target documentation. CommonMark syntax MAY be used for rich text representation.
  url: string; // REQUIRED. The URL for the target documentation. Value MUST be in the format of a URL.
}

export interface TagObject {
  name: string;
  description?: string;
  externalDocs?: ExternalDocObject;
}

export interface OAuthFlowObject {
  authorizationUrl?: string; // oauth2 ("implicit", "authorizationCode") | REQUIRED. The authorization URL to be used for this flow. This MUST be in the form of a URL.
  tokenUrl?: string; // oauth2 ("password", "clientCredentials", "authorizationCode") | REQUIRED. The token URL to be used for this flow. This MUST be in the form of a URL.
  refreshUrl?: string; // oauth2 | The URL to be used for obtaining refresh tokens. This MUST be in the form of a URL.
  scopes?: Record<string, string>; // oauth2 | REQUIRED. The available scopes for the OAuth2 security scheme. A map between the scope name and a short description for it. The map MAY be empty.
}

export interface OAuthFlowsObject {
  implicit?: OAuthFlowObject; // Configuration for the OAuth Implicit flow
  password?: OAuthFlowObject; // Configuration for the OAuth Resource Owner Password flow
  clientCredentials?: OAuthFlowObject; // Configuration for the OAuth Client Credentials flow. Previously called application in OpenAPI 2.0.
  authorizationCode?: OAuthFlowObject; // Configuration for the OAuth Authorization Code flow. Previously called accessCode in OpenAPI 2.0.
}

export interface SecuritySchemeObject {
  type: string;	// Any | REQUIRED. The type of the security scheme. Valid values are "apiKey", "http", "oauth2", "openIdConnect".
  description?: string; // Any | A short description for security scheme. CommonMark syntax MAY be used for rich text representation.
  name?: string; // apiKey | REQUIRED. The name of the header, query or cookie parameter to be used.
  in?: string;	// apiKey | REQUIRED. The location of the API key. Valid values are "query", "header" or "cookie".
  scheme?: string; // http |	REQUIRED. The name of the HTTP Authorization scheme to be used in the Authorization header as defined in RFC7235. The values used SHOULD be registered in the IANA Authentication Scheme registry.
  bearerFormat?: string; // http ("bearer") | A hint to the client to identify how the bearer token is formatted. Bearer tokens are usually generated by an authorization server, so this information is primarily for documentation purposes.
  flows?: OAuthFlowsObject; // oauth2 | REQUIRED. An object containing configuration information for the flow types supported.
  openIdConnectUrl?: string; // openIdConnect | REQUIRED. OpenId Connect URL to discover OAuth2 configuration values. This MUST be in the form of a URL.
}

export interface ReferenceObject {
  $ref: string;
  [key: string]: unknown;
}

export interface ServerVariableObject {
  enum?: string[]; // An enumeration of string values to be used if the substitution options are from a limited set. The array SHOULD NOT be empty.
  default: string; // REQUIRED. The default value to use for substitution, which SHALL be sent if an alternate value is not supplied. Note this behavior is different than the Schema Object's treatment of default values, because in those cases parameter values are optional. If the enum is defined, the value SHOULD exist in the enum's values.
  description?: string; // An optional description for the server variable. CommonMark syntax MAY be used for rich text representation.
  [x: string]: unknown;
}

export interface ServerObject {
  url: string; // REQUIRED. A URL to the target host. This URL supports Server Variables and MAY be relative, to indicate that the host location is relative to the location where the OpenAPI document is being served. Variable substitutions will be made when a variable is named in {brackets}.
  description?: string; // An optional string describing the host designated by the URL. CommonMark syntax MAY be used for rich text representation.
  variables?: Record<string, ServerVariableObject>; // A map between a variable name and its value. The value is used for substitution in the server's URL template.
  [x: string]: unknown;
}

export interface LinkObject {
  operationRef?: string; // A relative or absolute URI reference to an OAS operation. This field is mutually exclusive of the operationId field, and MUST point to an Operation Object. Relative operationRef values MAY be used to locate an existing Operation Object in the OpenAPI definition.
  operationId?: string; // The name of an existing, resolvable OAS operation, as defined with a unique operationId. This field is mutually exclusive of the operationRef field.
  parameters?: Record<string, unknown>; // A map representing parameters to pass to an operation as specified with operationId or identified via operationRef. The key is the parameter name to be used, whereas the value can be a constant or an expression to be evaluated and passed to the linked operation. The parameter name can be qualified using the parameter location [{in}.]{name} for operations that use the same parameter name in different locations (e.g. path.id).
  requestBody?: unknown; // A literal value or {expression} to use as a request body when calling the target operation.
  description?: string; // A description of the link. CommonMark syntax MAY be used for rich text representation.
  server?: ServerObject; // A server object to be used by the target operation.
  [x: string]: unknown;
}

export interface ExampleObject {
  summary?: string; //	Short description for the example.
  description?: string; //	Long description for the example. CommonMark syntax MAY be used for rich text representation.
  value?: unknown; //	Embedded literal example. The value field and externalValue field are mutually exclusive. To represent examples of media types that cannot naturally represented in JSON or YAML, use a string value to contain the example, escaping where necessary.
  externalValue?: string; //	A URL that points to the literal example. This provides the capability to reference examples that cannot easily be included in JSON or YAML documents. The value field and externalValue field are mutually exclusive.
}

export interface HeaderObject {
  description?: string; // A brief description of the parameter. This could contain examples of use. CommonMark syntax MAY be used for rich text representation.
  required?: boolean; // Determines whether this parameter is mandatory. If the parameter location is "path", this property is REQUIRED and its value MUST be true. Otherwise, the property MAY be included and its default value is false.
  deprecated?: boolean; // Specifies that a parameter is deprecated and SHOULD be transitioned out of usage. Default value is false.
  style?: string; // Describes how the parameter value will be serialized depending on the type of the parameter value. Default values (based on value of in): for query - form; for path - simple; for header - simple; for cookie - form.
  explode?: boolean; // When this is true, parameter values of type array or object generate separate parameters for each value of the array or key-value pair of the map. For other types of parameters this property has no effect. When style is form, the default value is true. For all other styles, the default value is false.
  allowReserved?: boolean; // Determines whether the parameter value SHOULD allow reserved characters, as defined by RFC3986 :/?#[]@!$&'()*+,;= to be included without percent-encoding. This property only applies to parameters with an in value of query. The default value is false.
  schema?: SchemaObject | ReferenceObject; // The schema defining the type used for the parameter.
  example?: unknown; // Example of the parameter's potential value. The example SHOULD match the specified schema and encoding properties if present. The example field is mutually exclusive of the examples field. Furthermore, if referencing a schema that contains an example, the example value SHALL override the example provided by the schema. To represent examples of media types that cannot naturally be represented in JSON or YAML, a string value can contain the example with escaping where necessary.
  examples?: Record<string, ExampleObject | ReferenceObject>; // Examples of the parameter's potential value. Each example SHOULD contain a value in the correct format as specified in the parameter encoding. The examples field is mutually exclusive of the example field. Furthermore, if referencing a schema that contains an example, the examples value SHALL override the example provided by the schema.
  content?: Record<string, MediaTypeObject>; // A map containing the representations for the parameter. The key is the media type and the value describes it. The map MUST only contain one entry.
}

export interface ParameterObject extends HeaderObject {
  name: string;
  in: string;//ParameterLocation;
  //in: string; // Possible values are "query", "header", "path" or "cookie".
  allowEmptyValue?: boolean; // Sets the ability to pass empty-valued parameters. This is valid only for query parameters and allows sending a parameter with an empty value. Default value is false. If style is used, and if behavior is n/a (cannot be serialized), the value of allowEmptyValue SHALL be ignored. Use of this property is NOT RECOMMENDED, as it is likely to be removed in a later revision.
}

export interface EncodingObject {
  contentType?: string; // The Content-Type for encoding a specific property. Default value depends on the property type: for string with format being binary – application/octet-stream; for other primitive types – text/plain; for object - application/json; for array – the default is defined based on the inner type. The value can be a specific media type (e.g. application/json), a wildcard media type, or a comma-separated list of the two types.
  headers?: Record<string, HeaderObject | ReferenceObject>; // A map allowing additional information to be provided as headers, for example Content-Disposition. Content-Type is described separately and SHALL be ignored in this section. This property SHALL be ignored if the request body media type is not a multipart.
  style?: string; // Describes how a specific property value will be serialized depending on its type. See Parameter Object for details on the style property. The behavior follows the same values as query parameters, including default values. This property SHALL be ignored if the request body media type is not application/x-www-form-urlencoded.
  explode?: boolean; // When this is true, property values of type array or object generate separate parameters for each value of the array, or key-value-pair of the map. For other types of properties this property has no effect. When style is form, the default value is true. For all other styles, the default value is false. This property SHALL be ignored if the request body media type is not application/x-www-form-urlencoded.
  allowReserved?: boolean; // Determines whether the parameter value SHOULD allow reserved characters, as defined by RFC3986 :/?#[]@!$&'()*+,;= to be included without percent-encoding. The default value is false. This property SHALL be ignored if the request body media type is not application/x-www-form-urlencoded.
}

export interface MediaTypeObject {
  schema?: SchemaObject | ReferenceObject; // The schema defining the content of the request, response, or parameter.
  example?: unknown; //	Example of the media type. The example object SHOULD be in the correct format as specified by the media type. The example field is mutually exclusive of the examples field. Furthermore, if referencing a schema which contains an example, the example value SHALL override the example provided by the schema.
  examples?: Record<string, ExampleObject | ReferenceObject> // Examples of the media type. Each example object SHOULD match the media type and specified schema if present. The examples field is mutually exclusive of the example field. Furthermore, if referencing a schema which contains an example, the examples value SHALL override the example provided by the schema.
  encoding?: Record<string, EncodingObject> //	A map between a property name and its encoding information. The key, being the property name, MUST exist in the schema as a property. The encoding object SHALL only apply to requestBody objects when the media type is multipart or application/x-www-form-urlencoded.
}

export interface RequestBodyObject {
  content?: Record<string, MediaTypeObject>;
  [key: string]: unknown;
}

export interface ResponseObject {
  description: string; // REQUIRED. A short description of the response. CommonMark syntax MAY be used for rich text representation.
  headers?: Record<string, HeaderObject | ReferenceObject>; // Maps a header name to its definition. RFC7230 states header names are case insensitive. If a response header is defined with the name "Content-Type", it SHALL be ignored.
  content?: Record<string, MediaTypeObject>; // A map containing descriptions of potential response payloads. The key is a media type or media type range and the value describes it. For responses that match multiple keys, only the most specific key is applicable.
  links?: Record<string, LinkObject | ReferenceObject>; // A map of operations links that can be followed from the response. The key of the map is a short name for the link, following the naming constraints of the names for Component Objects.
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
