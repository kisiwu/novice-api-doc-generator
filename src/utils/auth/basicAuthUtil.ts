import { FullAuthUtil } from './baseAuthUtils';
import { Auth } from '../../generators/postman/definitions';
import { SecuritySchemeObject } from '../../generators/openapi/definitions';

function isDefined(v: unknown) {
  return typeof v !== 'undefined';
}

/**
 * [[include:auth/basicAuthUtil.md]]
 */
export class BasicAuthUtil extends FullAuthUtil {
  protected password?: string;
  protected username?: string;

  setDescription(description: string): BasicAuthUtil {
    this.description = description;
    return this;
  }

  setPassword(password: string): BasicAuthUtil {
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

  setUsername(username: string): BasicAuthUtil {
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

  toPostman(): Auth {
    const r: Auth = {
      type: 'basic',
      basic: []
    };
    if (isDefined(this.password)) {
      r.basic?.push({
        key: 'password',
        value: this.password,
        type: 'string'
      });
    }
    if (isDefined(this.username)) {
      r.basic?.push({
        key: 'username',
        value: this.username,
        type: 'string'
      });
    }
    return r;
  }

  toOpenAPI(): Record<string, SecuritySchemeObject> {
    return {
      [this.securitySchemeName]: {
        type: 'http',
        scheme: 'basic',
        description: this.description
      }
    };
  }
}