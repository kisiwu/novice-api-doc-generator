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

export class Oauth2Util extends FullAuthUtil {

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

  setDescription(description: string): Oauth2Util {
    this.description = description;
    return this;
  }

  /**
   * Send as Basic Auth header
   */
  clientAuthenticationToHeader(): Oauth2Util {
    this.clientAuthentication = ClientAuthentication.header;
    return this;
  }

  /**
   * Send client credentials to body
   */
  clientAuthenticationToBody(): Oauth2Util {
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
    clientAuthentication: ClientAuthentication): Oauth2Util;
  setClientAuthentication(
    clientAuthentication: string): Oauth2Util;
  setClientAuthentication(
    clientAuthentication: ClientAuthentication): Oauth2Util {
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
  setState(state: string): Oauth2Util {
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
  setScopes(scopes: Record<string, string>): Oauth2Util {
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

  addScope(scope: string, description = ''): Oauth2Util {
    this.scopes[scope] = description;
    return this;
  }

  getScopesNames(): string[] {
    return Object.keys(this.scopes);
  }

  setClientSecret(clientSecret: string): Oauth2Util {
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

  setClientId(clientId: string): Oauth2Util {
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

  /**
   * 
   * @param accessTokenUrl The endpoint for authentication server.
   * This is used to exchange the authorization code for an access token.
   * @returns 
   */
  setAccessTokenUrl(accessTokenUrl: string): Oauth2Util {
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
  setAuthUrl(authUrl: string): Oauth2Util {
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
  setUseBrowser(useBrowser: boolean): Oauth2Util {
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
  setRedirectUri(redirectUri: string): Oauth2Util {
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

  setGrantType(grantType: GrantType): Oauth2Util;
  setGrantType(grantType: string): Oauth2Util;
  setGrantType(grantType: string): Oauth2Util {
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

  setTokenLocation(tokenLocation: TokenLocation): Oauth2Util;
  setTokenLocation(tokenLocation: string): Oauth2Util;
  setTokenLocation(tokenLocation: string): Oauth2Util {
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

  setTokenName(tokenName: string): Oauth2Util {
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
  setHeaderPrefix(headerPrefix: string): Oauth2Util {
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
  setCodeVerifier(codeVerifier: string): Oauth2Util {
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
  setChallengeAlgorithm(challengeAlgorithm: ChallengeAlgorithm): Oauth2Util
  setChallengeAlgorithm(challengeAlgorithm: string): Oauth2Util;
  setChallengeAlgorithm(challengeAlgorithm: string): Oauth2Util {
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

  setPassword(password: string): Oauth2Util {
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

  setUsername(username: string): Oauth2Util {
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

  setRefreshUrl(refreshUrl: string): Oauth2Util {
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
        value: this.accessTokenUrl,
        type: 'string'
      });
    }
    if (isDefined(this.authUrl)) {
      r.oauth2?.push({
        key: 'authUrl',
        value: this.authUrl,
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

  toOpenAPI(): SecuritySchemeObject {
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

    return r;
  }

  toOpenAPISecurity(scopes?: string[]): SecurityRequirementObject {
    return {
      [this.securitySchemeName]: scopes || Object.keys(this.scopes)
    };
  }
}