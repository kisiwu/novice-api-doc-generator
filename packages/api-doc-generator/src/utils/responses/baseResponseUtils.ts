import type {
  HeaderObject,
  LinkObject,
  MediaTypeObject,
  ReferenceObject,
  ResponseObject as OpenAPIResponseObject,
} from '@novice1/api-doc-definitions/openapi';
import type { ResponseObject as PostmanResponseObject } from '@novice1/api-doc-definitions/postman';

export interface IOpenAPIResponseContext {
  code?: number;
  default?: boolean;
  links?: Record<string, LinkObject | ReferenceObject>;
  ref?: string;
}

export interface IPostmanResponseContext {
  code?: number;
}

interface IPostmanResponseUtil {
  toPostman(ctxt?: IPostmanResponseContext): PostmanResponseObject[];
}

interface IOpenAPIResponseUtil {
  toOpenAPI(ctxt?: IOpenAPIResponseContext): Record<string, OpenAPIResponseObject | ReferenceObject>;
}

interface IResponseUtil extends IPostmanResponseUtil, IOpenAPIResponseUtil {}

export abstract class BaseOpenAPIResponseUtil implements IOpenAPIResponseUtil {
  abstract toOpenAPI(ctxt: IOpenAPIResponseContext): Record<string, OpenAPIResponseObject | ReferenceObject>;
  abstract toOpenAPI(): Record<string, OpenAPIResponseObject | ReferenceObject>;
}

export abstract class BasePostmanResponseUtil implements IPostmanResponseUtil {
  abstract toPostman(ctxt: IPostmanResponseContext): PostmanResponseObject[];
  abstract toPostman(): PostmanResponseObject[];
}

/**
 * {@include ../../../typedocIncludes/responses/responseUtil.md}
 */
export abstract class BaseResponseUtil implements IResponseUtil {
  abstract toPostman(ctxt: IPostmanResponseContext): PostmanResponseObject[];
  abstract toPostman(): PostmanResponseObject[];
  abstract toOpenAPI(ctxt: IOpenAPIResponseContext): Record<string, OpenAPIResponseObject | ReferenceObject>;
  abstract toOpenAPI(): Record<string, OpenAPIResponseObject | ReferenceObject>;
}

/**
 * {@include ../../../typedocIncludes/responses/responseUtil.md}
 */
export abstract class FullResponseUtil extends BaseResponseUtil {
  protected name: string;
  protected code?: number;
  protected headers?: Record<string, HeaderObject | ReferenceObject>;

  // body
  protected content?: Record<string, MediaTypeObject>;

  protected description?: string;

  // for context
  protected default?: boolean;
  protected links?: Record<string, LinkObject | ReferenceObject>;
  protected ref?: string;

  /**
   *
   * @param description A short description of the response.
   * CommonMark syntax MAY be used for rich text representation.
   */
  abstract setDescription(description: string): this;

  constructor(name?: string) {
    super();
    this.name = name || this.constructor.name;
  }

  getDescription(): string | undefined {
    return this.description;
  }

  getName(): string {
    return this.name;
  }
}
