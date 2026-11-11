import { BaseContextAuthUtil } from './baseAuthUtils';
import type { SecurityRequirementObject } from '@novice1/api-doc-definitions/openapi';
import type { Auth } from '@novice1/api-doc-definitions/postman';

/**
 * Define authentication as optional.

 *
 * {@include ../../../typedocIncludes/auth/noAuthUtil.md}
 */
export class NoAuthUtil extends BaseContextAuthUtil {
  toPostman(): Auth {
    const r: Auth = {
      type: 'noauth',
    };
    return r;
  }

  toOpenAPISecurity(): SecurityRequirementObject[] {
    return [{}];
  }
}
