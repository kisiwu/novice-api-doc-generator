import { SecurityRequirementObject, SecuritySchemeObject } from '../../generators/openapi/definitions';
import { Auth } from '../../generators/postman/definitions';

interface IPostmanAuthBuilder {
  toPostman(): Auth;
}

interface IContextOpenAPIAuthBuilder {
  toOpenAPISecurity(): SecurityRequirementObject;
}

interface ISchemeOpenAPIAuthBuilder {
  toOpenAPI(): SecuritySchemeObject;
}

interface IFullOpenAPIAuthBuilder 
  extends IContextOpenAPIAuthBuilder, ISchemeOpenAPIAuthBuilder {
}

interface IAuthBuilder {
  toPostman(): Auth;
  toOpenAPI(): SecuritySchemeObject;
  toOpenAPISecurity(): SecurityRequirementObject;

  getSecuritySchemeName(): string;
  setDescription(description: string): unknown;
  getDescription(): string | undefined;
}

export abstract class BaseOpenAPIAuthBuilder implements IFullOpenAPIAuthBuilder {
  abstract toOpenAPI(): SecuritySchemeObject;
  abstract toOpenAPISecurity(scopes?: string[]): SecurityRequirementObject;
}

export abstract class BasePostmanAuthBuilder implements IPostmanAuthBuilder {
  abstract toPostman(scopes?: string[]): Auth;
}

export abstract class BaseContextAuthBuilder 
  extends BasePostmanAuthBuilder
  implements IPostmanAuthBuilder, IContextOpenAPIAuthBuilder {
  abstract toOpenAPISecurity(scopes?: string[]): SecurityRequirementObject;
}

export abstract class BaseAuthBuilder 
  extends BaseContextAuthBuilder
  implements IPostmanAuthBuilder, IFullOpenAPIAuthBuilder {
  abstract toOpenAPI(): SecuritySchemeObject;
}

export abstract class FullAuthBuilder extends BaseAuthBuilder implements IAuthBuilder {
  protected description?: string;
  protected securitySchemeName: string;

  abstract setDescription(description: string): FullAuthBuilder;

  constructor(securitySchemeName: string) {
    super();
    this.securitySchemeName = securitySchemeName;
  }

  getSecuritySchemeName(): string {
    return this.securitySchemeName;
  }

  getDescription(): string | undefined {
    return this.description;
  }

  removeDescription(): string | undefined {
    const r = this.description;
    this.description = undefined;
    return r;
  }

  toOpenAPISecurity(scopes: string[] = []): SecurityRequirementObject {
    return {
      [this.securitySchemeName]: scopes
    };
  }
}