import { FullResponseUtil, IOpenAPIResponseContext } from './baseResponseUtils';
import {
  ResponseObject as PostmanResponseObject
} from '../../generators/postman/definitions';
import {
  ResponseObject as OpenAPIResponseObject,
  ReferenceObject,
  LinkObject,
  MediaTypeObject,
  HeaderObject
} from '../../generators/openapi/definitions';
import { MediaTypeUtil } from './mediaTypeUtil';

export class ResponseUtil extends FullResponseUtil {

  setDescription(description: string): ResponseUtil {
    this.description = description;
    return this;
  }

  setCode(code: number): ResponseUtil {
    this.code = code;
    return this;
  }

  getCode(): number | undefined {
    return this.code;
  }

  setDefault(isDefault: boolean): ResponseUtil {
    this.default = isDefault;
    return this;
  }

  isDefault(): boolean {
    return this.default ? this.default : false;
  }

  setRef(ref: string): ResponseUtil {
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

  setHeaders(headers: Record<string, HeaderObject | ReferenceObject>): ResponseUtil {
    this.headers = headers;
    return this;
  }
  addHeader(key: string, header: HeaderObject): ResponseUtil;
  addHeader(key: string, header: ReferenceObject): ResponseUtil;
  addHeader(key: string): ResponseUtil;
  addHeader(key: string, header: HeaderObject | ReferenceObject = {}): ResponseUtil {
    this.headers = this.headers || {};
    this.headers[key] = header;
    return this;
  }
  removeHeaders(): Record<string, HeaderObject | ReferenceObject> | undefined {
    const r = this.headers;
    this.headers = undefined;
    return r;
  }
  removeHeader(key: string): HeaderObject | ReferenceObject | undefined {
    let r;
    if(this.headers) {
      r = this.headers[key];
      delete this.headers[key];
    }
    return r;
  }

  setMediaTypes(mediaTypes: Record<string, MediaTypeObject>): ResponseUtil {
    this.content = mediaTypes;
    return this;
  }
  addMediaType(contentType: string, mediaType: MediaTypeObject): ResponseUtil;
  addMediaType(contentType: string, mediaType: MediaTypeUtil): ResponseUtil;
  addMediaType(contentType: string): ResponseUtil;
  addMediaType(contentType: string, mediaType: MediaTypeObject | MediaTypeUtil = {}): ResponseUtil {
    this.content = this.content || {};
    if (mediaType instanceof MediaTypeUtil) {
      this.content[contentType] = mediaType.toObject();
    } else {
      this.content[contentType] = mediaType;
    }
    return this;
  }
  removeMediaTypes(): Record<string, MediaTypeObject> | undefined {
    const r = this.content;
    this.content = undefined;
    return r;
  }
  removeMediaType(contentType: string): MediaTypeObject | undefined {
    let r;
    if(this.content) {
      r = this.content[contentType];
      delete this.content[contentType];
    }
    return r;
  }

  setLinks(links: Record<string, LinkObject | ReferenceObject>): ResponseUtil {
    this.links = links;
    return this;
  }
  addLink(key: string, link: LinkObject): ResponseUtil;
  addLink(key: string, link: ReferenceObject): ResponseUtil;
  addLink(key: string): ResponseUtil;
  addLink(key: string, link: LinkObject | ReferenceObject = {}): ResponseUtil {
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
    return [];
  }

  toOpenAPI(): Record<string, OpenAPIResponseObject | ReferenceObject>;
  toOpenAPI(ctxt: IOpenAPIResponseContext): Record<string, OpenAPIResponseObject | ReferenceObject>;
  toOpenAPI(ctxt: IOpenAPIResponseContext = {}): Record<string, OpenAPIResponseObject | ReferenceObject> {
    let name = `${this.code}`;
    if (ctxt.default) {
      name = 'default';
    }
    if (this.default) {
      name = 'default';
    }
    if (ctxt.ref) {
      return {
        [name]: {
          $ref: ctxt.ref
        }
      };
    }
    if (this.ref) {
      return {
        [name]: {
          $ref: this.ref
        }
      };
    }
    const res: OpenAPIResponseObject | ReferenceObject = {
      description: this.description || ''
    };
    if (this.headers) {
      res.headers = this.headers;
    }
    if (this.content) {
      res.content = this.content;
    }
    if (this.links) {
      res.links = this.links;
    }
    if (ctxt.links) {
      res.links = ctxt.links;
    }
    return {
      [name]: res
    };
  }
}