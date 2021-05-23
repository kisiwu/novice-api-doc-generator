/**
 * @module utils-auth-groupAuthUtil
 */

import extend from 'extend';
import { SecurityRequirementObject, SecuritySchemeObject } from '../../generators/openapi/definitions';
import { Auth } from '../../generators/postman/definitions';
import { BaseAuthUtil } from './baseAuthUtils';

/**
 * [[include:auth/openapi/groupAuthUtil.md]]
 * [[include:auth/postman/groupAuthUtil.md]]
 */
export class GroupAuthUtil extends BaseAuthUtil {
  protected authUtils: BaseAuthUtil[] = [];

  constructor(authUtils: BaseAuthUtil[]) {
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

  toOpenAPI(): Record<string, SecuritySchemeObject> {
    let r: Record<string, SecuritySchemeObject> = {};
    this.authUtils.forEach(builder => {
      r = extend(r, builder.toOpenAPI());
    });
    return r;
  }
}