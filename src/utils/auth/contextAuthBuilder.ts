import { BaseAuthBuilder, BaseContextAuthBuilder } from './baseAuthBuilder';
import { Auth } from '../../generators/postman/definitions';
import { SecurityRequirementObject } from '../../generators/openapi/definitions';


export class ContextAuthBuilder extends BaseContextAuthBuilder {
  protected authBuilder: BaseAuthBuilder;
  protected contextScopes: string[] = [];

  constructor(authBuilder: BaseAuthBuilder, scopes: string[] = []) {
    super();
    this.authBuilder = authBuilder;
    this.contextScopes = scopes;
  }

  toPostman(): Auth {
    const r = this.authBuilder.toPostman(this.contextScopes);
    return r;
  }

  toOpenAPISecurity(): SecurityRequirementObject {
    return this.authBuilder.toOpenAPISecurity(this.contextScopes);
  }
}