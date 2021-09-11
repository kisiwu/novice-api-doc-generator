import extend from 'extend';
import { BaseAuthUtil, BaseContextAuthUtil, IContextAuthUtil } from './baseAuthUtils';
import { Auth } from '../../generators/postman/definitions';
import { SecurityRequirementObject } from '../../generators/openapi/definitions';

/**
 * Helps defining scopes for security requirements
 * of a route.
 * 
 * [[include:auth/oAuth2Util.md]]
 */
export class ContextAuthUtil extends BaseContextAuthUtil {
  protected authUtil: BaseAuthUtil;
  protected contextScopes: string[] = [];

  constructor(authUtil: BaseAuthUtil, scopes: string[] = []) {
    super();
    this.authUtil = authUtil;
    this.contextScopes = scopes;
  }

  toPostman(): Auth {
    const r = this.authUtil.toPostman(this.contextScopes);
    return r;
  }

  toOpenAPISecurity(): SecurityRequirementObject[] {
    return this.authUtil.toOpenAPISecurity(this.contextScopes);
  }
}

/**
 * [[include:auth/groupContextAuthUtil.md]]
 */
export class GroupContextAuthUtil extends BaseContextAuthUtil {
  protected authUtils: IContextAuthUtil[] = [];

  constructor(authUtils: IContextAuthUtil[]) {
    super();
    this.authUtils = authUtils;
  }

  toPostman(): Auth {
    let r: Auth = {
      type: 'noauth'
    };
    this.authUtils.forEach((builder, i) => {
      const auth = builder.toPostman();
      if (i !== 0) {
        auth.type = r.type;
      }
      r = extend(r, auth);
    });
    return r;
  }

  toOpenAPISecurity(): SecurityRequirementObject[] {
    let r: SecurityRequirementObject[] = [];
    this.authUtils.forEach(builder => {
      r = r.concat(builder.toOpenAPISecurity());
    });
    return r;
  }
}