export type Description = string | DescriptionObject | null;

export type FormParameter = ValueFormParameter | SrcFormParameter;

export interface DescriptionObject {
  content?: string; // The content of the description goes here, as a raw string.
  type?: string; // Holds the mime type of the raw description content. E.g: 'text/markdown' or 'text/html'.
  version?: unknown;
}

export interface CollectionVersion {
  major: number;
  minor: number;
  patch: number;
  identifier?: string; // E.g: 'beta-3'
  meta?: unknown;
}

export interface InfoObject {
  name: string;
  schema: string; // This should ideally hold a link to the Postman schema that is used to validate this collection. E.g: https://schema.getpostman.com/collection/v1
  _postman_id?: string;
  description?: Description;
  version?: string | CollectionVersion;
  [key: string]: unknown;
}

export interface QueryParam {
  key?: string | null;
  value?: string | null;
  disabled?: boolean; // default false. If set to true, the current query parameter will not be sent with the request.
  description?: Description;
}

export interface Variable {
  id?: string;
  key?: string;
  value?: unknown;
  type?: string; // string boolean any number
  name?: string;
  description?: Description;
  system?: boolean; // default false. When set to true, indicates that this variable has been set by Postman
  disabled?: boolean;
}

export interface UrlObject {
  raw?: string;
  hash?: string;
  host?: string | string[];
  href?: string;
  path?: string | string[];
  protocol?: string;
  variable?: Variable[];
  port?: string; //  An empty value implies 80/443 depending on whether the protocol field contains http/https.
  query?: QueryParam[];
}

export interface ScriptObject {
  id?: string; // A unique, user defined identifier that can be used to refer to this script from requests.
  type?: string; // Type of the script. E.g: 'text/javascript'
  exec?: string[] | string;
  src?: UrlObject | string;
  name?: string; // Script name
}

export interface EventObject {
  id?: string; // A unique identifier for the enclosing event.
  listen: string; // Can be set to test or prerequest for test scripts or pre-request scripts respectively.
  script?: ScriptObject;
  disabled?: boolean; // default false Indicates whether the event is disabled. If absent, the event is assumed to be enabled
}

export interface AuthMethod {
  key: string;
  value?: unknown;
  type?: string;
}

export interface Auth {
  type?: string; // apikey awsv4 basic bearer digest edgegrid hawk noauth oauth1 oauth2 ntlm
  noauth?: unknown;
  apikey?: AuthMethod[];
  awsv4?: AuthMethod[];
  basic?: AuthMethod[];
  bearer?: AuthMethod[];
  digest?: AuthMethod[];
  edgegrid?: AuthMethod[];
  hawk?: AuthMethod[];
  ntlm?: AuthMethod[];
  oauth1?: AuthMethod[];
  oauth2?: AuthMethod[];
}


// --- item

export interface ProxyConfig {
  match?: string; //The Url match for which the proxy config is defined
  host?: string;
  port?: number;
  tunnel?: boolean;
  disabled?: boolean;
}

export interface CertificateObject {
  name?: string;
  matches?: string[];
  key?: {
    src?: string;
  };
  cert?: {
    src?: string;
  };
  passphrase?: string;
}

export interface HeaderObject {
  key: string;
  value: string;
  disabled?: boolean;
  description?: Description;
}

export interface UrlEncodedParameter {
  key: string;
  value?: string;
  disabled?: boolean;
  description?: Description;
}

export interface ValueFormParameter {
  key: string;
  value?: string;
  disabled?: boolean;
  type?: string;
  contentType?: string;
  description?: Description;
}

export interface SrcFormParameter {
  key: string;
  src?: string[] | string | null;
  disabled?: boolean;
  type?: string;
  contentType?: string;
  description?: Description;
}

export interface RequestBodyObject {
  mode?: string; // raw urlencoded formdata file graphql
  raw?: string;
  graphql?: Record<string, unknown>;
  urlencoded?: UrlEncodedParameter[];
  formdata?: FormParameter[];
  file?: {
    src?: string | null;
    content?: string;
  },
  options?: Record<string, unknown>;
  disabled?: boolean;
}

export interface RequestObject {
  url?: UrlObject;
  auth?: Auth | null;
  proxy?: ProxyConfig;
  certificate?: CertificateObject;
  method?: string; // GET PUT POST PATCH DELETE COPY HEAD OPTIONS LINK UNLINK PURGE LOCK UNLOCK PROPFIND VIEW
  description?: Description;
  header?: string | HeaderObject[];
  body?: null | RequestBodyObject;
}

export interface CookieObject {
  domain: string;
  expires?: null | string;
  maxAge?: string;
  hostOnly?: boolean;
  httpOnly?: boolean;
  name?: string;
  path: string;
  secure?: boolean;
  session?: boolean;
  value?: string;
  extensions?: unknown[];
}

export interface ResponseObject {
  id?: string; // A unique, user defined identifier that can be used to refer to this response from requests.
  originalRequest?: RequestObject;
  responseTime?: null | string | number;
  timings?: Record<string, unknown> | null; // Set of timing information related to request and response in milliseconds
  header?: string[] | null;
  cookie?: CookieObject[];
  body?: null | string; // The raw text of the response.
  status?: string; // The response status, e.g: '200 OK'
  code?: number; // The numerical response code, example: 200, 201, 404, etc
}

export interface Item {
  id?: string;
  name?: string;
  description?: Description;
  variable?: Variable[];
  event?: EventObject[];
  request: RequestObject | string;
  response?: ResponseObject[];
  protocolProfileBehavior?: unknown;
}

export interface Folder {
  item: (Item | Folder)[];
  name?: string;
  description?: Description;
  variable?: Variable[];
  event?: EventObject[];
  auth?: Auth | null;
  protocolProfileBehavior?: unknown;
}