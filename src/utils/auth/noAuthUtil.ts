import { Auth } from '../../generators/postman/definitions';
import { SecurityRequirementObject } from '../../generators/openapi/definitions';
import { BaseContextAuthUtil } from './baseAuthUtils';

export class NoAuthUtil extends BaseContextAuthUtil {

  toPostman(): Auth {
    const r: Auth = {
      type: 'noauth'
    };
    return r;
  }

  toOpenAPISecurity(): SecurityRequirementObject[] {
    return [{}];
  }
}