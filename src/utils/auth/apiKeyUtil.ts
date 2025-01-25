import { FullAuthUtil } from './baseAuthUtils';
import { Auth } from '../../generators/postman/definitions';
import { SecuritySchemeObject } from '../../generators/openapi/definitions';

function isDefined(v: unknown) {
  return typeof v !== 'undefined';
}

export enum ApiKeyLocation {
  query = 'query',
  header = 'header',
  cookie = 'cookie'
}

/**
 * {@include ../../../typedocIncludes/auth/apiKeyUtil.md}
 */
export class ApiKeyUtil extends FullAuthUtil {

  protected key?: string;
  protected value?: string;
  protected apiKeyLocation?: string; // in

  setDescription(description: string): ApiKeyUtil {
    this.description = description;
    return this;
  }

  setKey(key: string): ApiKeyUtil {
    this.key = key;
    return this;
  }

  getKey(): string | undefined {
    return this.key;
  }

  removeKey(): string | undefined {
    const r = this.key;
    this.key = undefined;
    return r;
  }

  setName(key: string): ApiKeyUtil {
    this.key = key;
    return this;
  }

  getName(): string | undefined {
    return this.key;
  }

  removeName(): string | undefined {
    const r = this.key;
    this.key = undefined;
    return r;
  }

  setValue(value: string): ApiKeyUtil {
    this.value = value;
    return this;
  }

  getValue(): string | undefined {
    return this.value;
  }

  removeValue(): string | undefined {
    const r = this.value;
    this.value = undefined;
    return r;
  }

  setApiKeyLocation(apiKeyLocation: ApiKeyLocation): ApiKeyUtil;
  setApiKeyLocation(apiKeyLocation: string): ApiKeyUtil;
  setApiKeyLocation(apiKeyLocation: string): ApiKeyUtil {
    this.apiKeyLocation = apiKeyLocation;
    return this;
  }

  getApiKeyLocation(): string | undefined {
    return this.apiKeyLocation;
  }

  removeApiKeyLocation(): string | undefined {
    const r = this.apiKeyLocation;
    this.apiKeyLocation = undefined;
    return r;
  }

  toPostman(): Auth {
    const r: Auth = {
      type: 'apikey',
      apikey: []
    };

    if (isDefined(this.key)) {
      r.apikey?.push({
        key: 'key',
        value: this.key,
        type: 'string'
      });
    }
    if (isDefined(this.value)) {
      r.apikey?.push({
        key: 'value',
        value: this.value,
        type: 'string'
      });
    }
    if (isDefined(this.apiKeyLocation) 
      && this.apiKeyLocation !== ApiKeyLocation.cookie) {
      r.apikey?.push({
        key: 'in',
        value: this.apiKeyLocation,
        type: 'string'
      });
    }

    return r;
  }

  toOpenAPI(): Record<string, SecuritySchemeObject> {
    const r: SecuritySchemeObject = {
      type: 'apiKey',
      description: this.description
    };
    if (isDefined(this.apiKeyLocation)) {
      r.in = this.apiKeyLocation;
    }
    if (isDefined(this.key)) {
      r.name = this.key;
    }
    return {
      [this.securitySchemeName]: r
    };
  }
}