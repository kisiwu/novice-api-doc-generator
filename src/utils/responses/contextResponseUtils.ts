import {
  LinkObject, 
  ReferenceObject, 
  ResponseObject as OpenAPIResponseObject
} from '../../generators/openapi/definitions';
import {
  ResponseObject as PostmanResponseObject
} from '../../generators/postman/definitions';
import { BaseResponseUtil, IOpenAPIResponseContext, IPostmanResponseContext } from './baseResponseUtils';

/**
 * {@include ../../../typedocIncludes/responses/contextResponseUtil.md}
 */
export class ContextResponseUtil extends BaseResponseUtil {
  protected responseUtil: BaseResponseUtil;
  protected code?: number;
  protected default?: boolean;
  protected links?: Record<string, LinkObject | ReferenceObject>;
  protected ref?: string;

  constructor(responseUtil: BaseResponseUtil) {
    super();
    this.responseUtil = responseUtil;
  }

  setDefault(isDefault: boolean): ContextResponseUtil {
    this.default = isDefault;
    return this;
  }

  isDefault(): boolean {
    return this.default ? this.default : false;
  }

  setCode(code: number): ContextResponseUtil {
    this.code = code;
    return this;
  }

  getCode(): number | undefined {
    return this.code;
  }

  removeCode(): number | undefined {
    const r = this.code;
    this.code = undefined;
    return r;
  }

  setRef(ref: string): ContextResponseUtil {
    this.ref = ref;
    return this;
  }

  getRef(): string | undefined {
    return this.ref;
  }

  removeRef(): string | undefined {
    const r = this.ref;
    this.ref = undefined;
    return r;
  }

  setLinks(links: Record<string, LinkObject | ReferenceObject>): ContextResponseUtil {
    this.links = links;
    return this;
  }
  addLink(key: string, link: LinkObject): ContextResponseUtil;
  addLink(key: string, link: ReferenceObject): ContextResponseUtil;
  addLink(key: string): ContextResponseUtil;
  addLink(key: string, link: LinkObject | ReferenceObject = {}): ContextResponseUtil {
    this.links = this.links || {};
    this.links[key] = link;
    return this;
  }
  removeLinks(): Record<string, LinkObject | ReferenceObject> | undefined {
    const r = this.links;
    this.links = undefined;
    return r;
  }
  removeLink(key: string): LinkObject | ReferenceObject | undefined {
    let r;
    if(this.links) {
      r = this.links[key];
      delete this.links[key];
    }
    return r;
  }

  toPostman(): PostmanResponseObject[] {
    const ctxt: IPostmanResponseContext = {};
    if (this.code) {
      ctxt.code = this.code;
    }
    return this.responseUtil.toPostman(ctxt);
  }

  toOpenAPI(): Record<string, OpenAPIResponseObject | ReferenceObject> {
    const ctxt: IOpenAPIResponseContext = {};
    if (this.code) {
      ctxt.code = this.code;
    }
    if (this.ref) {
      ctxt.ref = this.ref;
    }
    if (this.links){
      ctxt.links = this.links;
    }
    if (this.default) {
      ctxt.default = this.default;
    }
    return this.responseUtil.toOpenAPI(ctxt); 
  }
}
