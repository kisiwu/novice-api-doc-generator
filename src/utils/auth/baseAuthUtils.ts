import { SecurityRequirementObject, SecuritySchemeObject } from '../../generators/openapi/definitions';
import { Auth } from '../../generators/postman/definitions';

interface IPostmanAuthUtil {
  toPostman(): Auth;
}

interface IContextOpenAPIAuthUtil {
  toOpenAPISecurity(): SecurityRequirementObject[];
}

interface ISchemeOpenAPIAuthUtil {
  toOpenAPI(): Record<string, SecuritySchemeObject>;
}

interface IFullOpenAPIAuthUtil 
  extends IContextOpenAPIAuthUtil, ISchemeOpenAPIAuthUtil {
}

export interface IContextAuthUtil 
  extends IPostmanAuthUtil, IContextOpenAPIAuthUtil {
}

interface IAuthUtil extends IFullOpenAPIAuthUtil, IPostmanAuthUtil {
  setDescription(description: string): unknown;
  getDescription(): string | undefined;
}

export abstract class BaseOpenAPIAuthUtil implements IFullOpenAPIAuthUtil {
  abstract toOpenAPI(): Record<string, SecuritySchemeObject>;
  abstract toOpenAPISecurity(scopes?: string[]): SecurityRequirementObject[];
}

export abstract class BasePostmanAuthUtil implements IPostmanAuthUtil {
  abstract toPostman(scopes?: string[]): Auth;
}

export abstract class BaseContextAuthUtil 
  extends BasePostmanAuthUtil
  implements IContextAuthUtil {
  abstract toOpenAPISecurity(scopes?: string[]): SecurityRequirementObject[];
}

/**
 * {@include ../../../typedocIncludes/auth/baseAuthUtil.md}
 */
export abstract class BaseAuthUtil 
  extends BaseContextAuthUtil
  implements IPostmanAuthUtil, IFullOpenAPIAuthUtil {
  abstract toOpenAPI(): Record<string, SecuritySchemeObject>;
}

export abstract class FullAuthUtil extends BaseAuthUtil implements IAuthUtil {
  protected description?: string;
  protected securitySchemeName: string;

  /**
   * 
   * @param description A short description for security scheme.
   * CommonMark syntax MAY be used for rich text representation.
   */
  abstract setDescription(description: string): this;

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

  toOpenAPISecurity(scopes: string[] = []): SecurityRequirementObject[] {
    return [{
      [this.securitySchemeName]: scopes
    }];
  }
}