import { FullAuthBuilder } from './baseAuthBuilder';
import { Auth } from '../../generators/postman/definitions';
import { SecuritySchemeObject } from '../../generators/openapi/definitions';

function isDefined(v: unknown) {
  return typeof v !== 'undefined';
}

export class BasicAuthBuilder extends FullAuthBuilder {
  protected password?: string;
  protected username?: string;

  setDescription(description: string): BasicAuthBuilder {
    this.description = description;
    return this;
  }

  setPassword(password: string): BasicAuthBuilder {
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

  setUsername(username: string): BasicAuthBuilder {
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

  toOpenAPI(): SecuritySchemeObject {
    return {
      type: 'http',
      scheme: 'basic',
      description: this.description
    };
  }
}