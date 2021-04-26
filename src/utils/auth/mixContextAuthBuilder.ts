import extend from 'extend';
import { BaseContextAuthBuilder } from './baseAuthBuilder';
import { Auth } from '../../generators/postman/definitions';
import { SecurityRequirementObject } from '../../generators/openapi/definitions';


export class MixContextAuthBuilder extends BaseContextAuthBuilder {
  protected authBuilders: BaseContextAuthBuilder[] = [];

  constructor(authBuilders: BaseContextAuthBuilder[]) {
    super();
    this.authBuilders = authBuilders;
  }

  toPostman(): Auth {
    let r: Auth = {
      type: 'noauth'
    };
    this.authBuilders.forEach((builder, i) => {
      const auth = builder.toPostman();
      if (i !== 0) {
        auth.type = r.type;
      }
      r = extend(r, auth);
    });
    return r;
  }

  toOpenAPISecurity(): SecurityRequirementObject {
    let r: SecurityRequirementObject = {};
    this.authBuilders.forEach(builder => {
      r = extend(r, builder.toOpenAPISecurity());
    });
    return r;
  }
}