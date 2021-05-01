import {
  HeaderObject,
  LinkObject, 
  MediaTypeObject, 
  ReferenceObject, 
  ResponseObject as OpenAPIResponseObject
} from '../../generators/openapi/definitions';
import {
  ResponseObject as PostmanResponseObject
} from '../../generators/postman/definitions';

export interface IOpenAPIResponseContext {
  default?: boolean;
  links?: Record<string, LinkObject | ReferenceObject>;
  ref?: string;
}

interface IPostmanResponseUtil {
  toPostman(): PostmanResponseObject[];
}

interface IOpenAPIResponseUtil {
  toOpenAPI(ctxt?: IOpenAPIResponseContext): Record<string, OpenAPIResponseObject | ReferenceObject>;
}

interface IResponseUtil 
  extends IPostmanResponseUtil, IOpenAPIResponseUtil {}

export abstract class BaseOpenAPIResponseUtil implements IOpenAPIResponseUtil {
  abstract toOpenAPI(ctxt: IOpenAPIResponseContext): Record<string, OpenAPIResponseObject | ReferenceObject>;
  abstract toOpenAPI(): Record<string, OpenAPIResponseObject | ReferenceObject>;
}

export abstract class BasePostmanResponseUtil implements IPostmanResponseUtil {
  abstract toPostman(): PostmanResponseObject[];
}

export abstract class BaseResponseUtil 
  implements IResponseUtil {
  abstract toPostman(): PostmanResponseObject[];
  abstract toOpenAPI(ctxt: IOpenAPIResponseContext): Record<string, OpenAPIResponseObject | ReferenceObject>;
  abstract toOpenAPI(): Record<string, OpenAPIResponseObject | ReferenceObject>;
}

export abstract class FullResponseUtil extends BaseResponseUtil {
  protected code: number;
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
  abstract setDescription(description: string): FullResponseUtil;

  constructor(code: number) {
    super();
    this.code = code;
  }

  getDescription(): string | undefined {
    return this.description;
  }
}
