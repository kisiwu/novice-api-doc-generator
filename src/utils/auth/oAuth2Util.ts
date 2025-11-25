import extend from 'extend';
import { FullAuthUtil } from './baseAuthUtils';
import { Auth } from '../../generators/postman/definitions';
import { 
  OAuthFlowObject, 
  OAuthFlowsObject, 
  SecurityRequirementObject, 
  SecuritySchemeObject 
} from '../../generators/openapi/definitions';

function isDefined(v: unknown) {
  return typeof v !== 'undefined';
}

export enum ClientAuthentication {
  body = 'body',
  header = 'header'
}

export enum GrantType {
  authorizationCode = 'authorization_code',
  authorizationCodeWithPkce = 'authorization_code_with_pkce',
  implicit = 'implicit',
  passwordCredentials = 'password_credentials',
  clientCredentials = 'client_credentials'
}

export enum TokenLocation {
  queryParams = 'queryParams',
  header = 'header'
}

export enum ChallengeAlgorithm {
  plain = 'plain',
  S256 = 'S256'
}

/**
 * {@include ../../../typedocIncludes/auth/oAuth2Util.md}
 */
export class OAuth2Util extends FullAuthUtil {

  protected clientAuthentication?: string; // client_authentication
  protected state?: string;
  protected scopes: Record<string, string> = {};
  protected clientSecret?: string;
  protected clientId?: string;
  protected accessTokenUrl?: string;
  protected authUrl?: string;
  protected useBrowser?: boolean;
  protected redirectUri?: string; // redirect_uri
  protected grantType?: string; // grant_type
  protected tokenLocation?: string; // addTokenTo
  protected tokenName?: string;
  protected headerPrefix?: string;
  protected codeVerifier?: string; // code_verifier
  protected challengeAlgorithm?: string;
  protected password?: string;
  protected username?: string; 
  protected refreshUrl?: string;

  /**
   * Very optional.
   * If set, it will be used for postman, concatenating accessTokenUrl and authUrl.
   */
  protected host?: string;

  setDescription(description: string): this {
    this.description = description;
    return this;
  }

  /**
   * Send as Basic Auth header
   */
  clientAuthenticationToHeader(): this {
    this.clientAuthentication = ClientAuthentication.header;
    return this;
  }

  /**
   * Send client credentials to body
   */
  clientAuthenticationToBody(): this {
    this.clientAuthentication = ClientAuthentication.body;
    return this;
  }

  /**
   * 
   * @param clientAuthentication Send client credentials to body
   * or as Basic Auth header
   * @returns 
   */
  setClientAuthentication(
    clientAuthentication: ClientAuthentication): this;
  setClientAuthentication(
    clientAuthentication: string): this;
  setClientAuthentication(
    clientAuthentication: ClientAuthentication): this {
    this.clientAuthentication = clientAuthentication;
    return this;
  }

  getClientAuthentication(): string | undefined {
    return this.clientAuthentication;
  }

  removeClientAuthentication(): string | undefined {
    const r = this.clientAuthentication;
    this.clientAuthentication = undefined;
    return r;
  }

  /**
   * 
   * @param state An opaque value that is used for
   * preventing cross-site request forgery.
   * @returns 
   */
  setState(state: string): this {
    this.state = state;
    return this;
  }

  getState(): string | undefined {
    return this.state;
  }

  removeState(): string | undefined {
    const r = this.state;
    this.state = undefined;
    return r;
  }

  /**
   * 
   * @param scopes The scopes of the access request.
   * A map between the scope name and a short description for it. The map MAY be empty.
   * @returns 
   */
  setScopes(scopes: Record<string, string>): this {
    this.scopes = scopes;
    return this;
  }

  getScopes(): Record<string, string> {
    return this.scopes;
  }

  removeScopes(): Record<string, string> {
    const r = this.scopes;
    this.scopes = {};
    return r;
  }

  addScope(scope: string, description = ''): this {
    this.scopes[scope] = description;
    return this;
  }

  getScopesNames(): string[] {
    return Object.keys(this.scopes);
  }

  setClientSecret(clientSecret: string): this {
    this.clientSecret = clientSecret;
    return this;
  }

  getClientSecret(): string | undefined {
    return this.clientSecret;
  }

  removeClientSecret(): string | undefined {
    const r = this.clientSecret;
    this.clientSecret = undefined;
    return r;
  }

  setClientId(clientId: string): this {
    this.clientId = clientId;
    return this;
  }

  getClientId(): string | undefined {
    return this.clientId;
  }

  removeClientId(): string | undefined {
    const r = this.clientId;
    this.clientId = undefined;
    return r;
  }

  setHost(host: string): this {
    this.host = host;
    return this;
  }

  getHost(): string | undefined {
    return this.host;
  }

  removeHost(): string | undefined {
    const r = this.host;
    this.host = undefined;
    return r;
  }

  /**
   * 
   * @param accessTokenUrl The endpoint for authentication server.
   * This is used to exchange the authorization code for an access token.
   * @returns 
   */
  setAccessTokenUrl(accessTokenUrl: string): this {
    this.accessTokenUrl = accessTokenUrl;
    return this;
  }

  getAccessTokenUrl(): string | undefined {
    return this.accessTokenUrl;
  }

  removeAccessTokenUrl(): string | undefined {
    const r = this.accessTokenUrl;
    this.accessTokenUrl = undefined;
    return r;
  }

  /**
   * 
   * @param authUrl The endpoint for the authorization server.
   * This is used to get the authorization code.
   * @returns 
   */
  setAuthUrl(authUrl: string): this {
    this.authUrl = authUrl;
    return this;
  }

  getAuthUrl(): string | undefined {
    return this.authUrl;
  }

  removeAuthUrl(): string | undefined {
    const r = this.authUrl;
    this.authUrl = undefined;
    return r;
  }

  /**
   * 
   * @param useBrowser If true, authorize using browser.
   * @returns 
   */
  setUseBrowser(useBrowser: boolean): this {
    this.useBrowser = useBrowser;
    return this;
  }

  getUseBrowser(): boolean | undefined {
    return this.useBrowser;
  }

  removeUseBrowser(): boolean | undefined {
    const r = this.useBrowser;
    this.useBrowser = undefined;
    return r;
  }

  /**
   * 
   * @param redirectUri This is the callback URL that you will be
   * redirected to, after your application is authorized.
   * @returns 
   */
  setRedirectUri(redirectUri: string): this {
    this.redirectUri = redirectUri;
    return this;
  }

  getRedirectUri(): string | undefined {
    return this.redirectUri;
  }

  removeRedirectUri(): string | undefined {
    const r = this.redirectUri;
    this.redirectUri = undefined;
    return r;
  }

  setGrantType(grantType: GrantType): this;
  setGrantType(grantType: string): this;
  setGrantType(grantType: string): this {
    this.grantType = grantType;
    return this;
  }

  getGrantType(): string | undefined {
    return this.grantType;
  }

  removeGrantType(): string | undefined {
    const r = this.grantType;
    this.grantType = undefined;
    return r;
  }

  setTokenLocation(tokenLocation: TokenLocation): this;
  setTokenLocation(tokenLocation: string): this;
  setTokenLocation(tokenLocation: string): this {
    this.tokenLocation = tokenLocation;
    return this;
  }

  getTokenLocation(): string | undefined {
    return this.tokenLocation;
  }

  removeTokenLocation(): string | undefined {
    const r = this.tokenLocation;
    this.tokenLocation = undefined;
    return r;
  }

  setTokenName(tokenName: string): this {
    this.tokenName = tokenName;
    return this;
  }

  getTokenName(): string | undefined {
    return this.tokenName;
  }

  removeTokenName(): string | undefined {
    const r = this.tokenName;
    this.tokenName = undefined;
    return r;
  }

  /**
   * 
   * @param headerPrefix Added to the Authorization header before the access token.
   * @returns 
   */
  setHeaderPrefix(headerPrefix: string): this {
    this.headerPrefix = headerPrefix;
    return this;
  }

  getHeaderPrefix(): string | undefined {
    return this.headerPrefix;
  }

  removeHeaderPrefix(): string | undefined {
    const r = this.headerPrefix;
    this.headerPrefix = undefined;
    return r;
  }

  /**
   * 
   * @param codeVerifier A random, 43-128 character string used to 
   * connect the authorization request to the token request.
   * @returns 
   */
  setCodeVerifier(codeVerifier: string): this {
    this.codeVerifier = codeVerifier;
    return this;
  }

  getCodeVerifier(): string | undefined {
    return this.codeVerifier;
  }

  removeCodeVerifier(): string | undefined {
    const r = this.codeVerifier;
    this.codeVerifier = undefined;
    return r;
  }

  /**
   * 
   * @param challengeAlgorithm Algoritm used for generating the Code Challenge.
   */
  setChallengeAlgorithm(challengeAlgorithm: ChallengeAlgorithm): this
  setChallengeAlgorithm(challengeAlgorithm: string): this;
  setChallengeAlgorithm(challengeAlgorithm: string): this {
    this.challengeAlgorithm = challengeAlgorithm;
    return this;
  }

  getChallengeAlgorithm(): string | undefined {
    return this.challengeAlgorithm;
  }

  removeChallengeAlgorithm(): string | undefined {
    const r = this.challengeAlgorithm;
    this.challengeAlgorithm = undefined;
    return r;
  }

  setPassword(password: string): this {
    this.password = password;
    return this;
  }

  getPassword(): string | undefined {
    return this.password;
  }

  removePassword(): string | undefined {
    const r = this.password;
    this.password = undefined;
    return r;
  }

  setUsername(username: string): this {
    this.username = username;
    return this;
  }

  getUsername(): string | undefined {
    return this.username;
  }

  removeUsername(): string | undefined {
    const r = this.username;
    this.username = undefined;
    return r;
  }

  setRefreshUrl(refreshUrl: string): this {
    this.refreshUrl = refreshUrl;
    return this;
  }

  getRefreshUrl(): string | undefined {
    return this.refreshUrl;
  }

  removeRefreshUrl(): string | undefined {
    const r = this.refreshUrl;
    this.refreshUrl = undefined;
    return r;
  }

  toPostman(scopes?: string[]): Auth {
    const r: Auth = {
      type: 'oauth2',
      oauth2: []
    };

    if (isDefined(this.clientAuthentication)) {
      r.oauth2?.push({
        key: 'client_authentication',
        value: this.clientAuthentication,
        type: 'string'
      });
    }
    if (isDefined(this.state)) {
      r.oauth2?.push({
        key: 'state',
        value: this.state,
        type: 'string'
      });
    }
    const scope = (scopes ? scopes : Object.keys(this.scopes))
      .join(' ').trim();
    if (scope) {
      r.oauth2?.push({
        key: 'scope',
        value: scope,
        type: 'string'
      });
    }
    if (isDefined(this.clientSecret)) {
      r.oauth2?.push({
        key: 'clientSecret',
        value: this.clientSecret,
        type: 'string'
      });
    }
    if (isDefined(this.clientId)) {
      r.oauth2?.push({
        key: 'clientId',
        value: this.clientId,
        type: 'string'
      });
    }
    if (isDefined(this.accessTokenUrl)) {
      r.oauth2?.push({
        key: 'accessTokenUrl',
        value: isDefined(this.host) ? `${this.host}${this.accessTokenUrl}` : this.accessTokenUrl,
        type: 'string'
      });
    }
    if (isDefined(this.refreshUrl)) {
      r.oauth2?.push({
        key: 'refreshTokenUrl',
        value: isDefined(this.host) ? `${this.host}${this.refreshUrl}` : this.refreshUrl,
        type: 'string'
      });
    }
    if (isDefined(this.authUrl)) {
      r.oauth2?.push({
        key: 'authUrl',
        value: isDefined(this.host) ? `${this.host}${this.authUrl}` : this.authUrl,
        type: 'string'
      });
    }
    if (isDefined(this.useBrowser)) {
      r.oauth2?.push({
        key: 'useBrowser',
        value: this.useBrowser,
        type: 'boolean'
      });
    }
    if (isDefined(this.redirectUri)) {
      r.oauth2?.push({
        key: 'redirect_uri',
        value: this.redirectUri,
        type: 'string'
      });
    }
    if (isDefined(this.grantType)) {
      r.oauth2?.push({
        key: 'grant_type',
        value: this.grantType,
        type: 'string'
      });
    }
    if (isDefined(this.tokenLocation)) {
      r.oauth2?.push({
        key: 'addTokenTo',
        value: this.tokenLocation,
        type: 'string'
      });
    }
    if (isDefined(this.tokenName)) {
      r.oauth2?.push({
        key: 'tokenName',
        value: this.tokenName,
        type: 'string'
      });
    }
    if (isDefined(this.headerPrefix)) {
      r.oauth2?.push({
        key: 'headerPrefix',
        value: this.headerPrefix,
        type: 'string'
      });
    }
    if (isDefined(this.codeVerifier)) {
      r.oauth2?.push({
        key: 'code_verifier',
        value: this.codeVerifier,
        type: 'string'
      });
    }
    if (isDefined(this.challengeAlgorithm)) {
      r.oauth2?.push({
        key: 'challengeAlgorithm',
        value: this.challengeAlgorithm,
        type: 'string'
      });
    }
    if (isDefined(this.password)) {
      r.oauth2?.push({
        key: 'password',
        value: this.password,
        type: 'string'
      });
    }
    if (isDefined(this.username)) {
      r.oauth2?.push({
        key: 'username',
        value: this.username,
        type: 'string'
      });
    }

    return r;
  }
  
  // @TODO: if defined, set host in URLs
  toOpenAPI(): Record<string, SecuritySchemeObject> {
    const flows: OAuthFlowsObject = {};
    const flow: OAuthFlowObject = {
      authorizationUrl: this.authUrl,
      scopes: extend({}, this.scopes),
      tokenUrl: this.accessTokenUrl,
      refreshUrl: this.refreshUrl
    };
    const r: SecuritySchemeObject = {
      type: 'oauth2',
      flows,
      description: this.description
    };
    if (this.grantType === GrantType.authorizationCode
      || this.grantType === GrantType.authorizationCodeWithPkce) {
      flows.authorizationCode = flow;
    }
    if (this.grantType === GrantType.clientCredentials) {
      flows.clientCredentials = flow;
    }
    if (this.grantType === GrantType.implicit) {
      flows.implicit = flow;
    }
    if (this.grantType === GrantType.passwordCredentials) {
      flows.password = flow;
    }

    return {
      [this.securitySchemeName]: r
    };
  }

  toOpenAPISecurity(scopes?: string[]): SecurityRequirementObject[] {
    return [{
      [this.securitySchemeName]: scopes || Object.keys(this.scopes)
    }];
  }
}