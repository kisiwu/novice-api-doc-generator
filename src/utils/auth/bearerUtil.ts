import { FullAuthUtil } from './baseAuthUtils';
import { Auth } from '../../generators/postman/definitions';
import { SecuritySchemeObject } from '../../generators/openapi/definitions';

function isDefined(v: unknown) {
  return typeof v !== 'undefined';
}

/**
 * {@include ../../../typedocIncludes/auth/bearerUtil.md}
 */
export class BearerUtil extends FullAuthUtil {
  protected token?: string;
  protected bearerFormat?: string;

  setDescription(description: string): BearerUtil {
    this.description = description;
    return this;
  }

  setToken(token: string): BearerUtil {
    this.token = token;
    return this;
  }

  getToken(): string | undefined {
    return this.token;
  }

  removeToken(): string | undefined {
    const r = this.token;
    this.token = undefined;
    return r;
  }

  /**
   * 
   * @param bearerFormat A hint to the client to identify 
   * how the bearer token is formatted. Bearer tokens are usually 
   * generated by an authorization server, 
   * so this information is primarily for documentation purposes.
   */
  setBearerFormat(bearerFormat: string): BearerUtil {
    this.bearerFormat = bearerFormat;
    return this;
  }

  getBearerFormat(): string | undefined {
    return this.bearerFormat;
  }

  removeBearerFormat(): string | undefined {
    const r = this.bearerFormat;
    this.bearerFormat = undefined;
    return r;
  }

  toPostman(): Auth {
    const r: Auth = {
      type: 'bearer',
      bearer: []
    };
    if (isDefined(this.token)) {
      r.bearer?.push({
        key: 'token',
        value: this.token,
        type: 'string'
      });
    }
    return r;
  }

  toOpenAPI(): Record<string, SecuritySchemeObject> {
    return {
      [this.securitySchemeName]: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: this.bearerFormat,
        description: this.description
      }
    };
  }
}