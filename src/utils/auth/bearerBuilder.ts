import { FullAuthBuilder } from './baseAuthBuilder';
import { Auth } from '../../generators/postman/definitions';
import { SecuritySchemeObject } from '../../generators/openapi/definitions';

function isDefined(v: unknown) {
  return typeof v !== 'undefined';
}

export class BearerBuilder extends FullAuthBuilder {
  protected token?: string;
  protected bearerFormat?: string;

  setDescription(description: string): BearerBuilder {
    this.description = description;
    return this;
  }

  setToken(token: string): BearerBuilder {
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

  setBearerFormat(bearerFormat: string): BearerBuilder {
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

  toOpenAPI(): SecuritySchemeObject {
    return {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: this.bearerFormat,
      description: this.description
    };
  }
}