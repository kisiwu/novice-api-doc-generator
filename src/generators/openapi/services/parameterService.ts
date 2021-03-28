import extend from 'extend';
import { 
  ExampleObject, 
  MediaTypeObject, 
  ParameterObject, 
  ReferenceObject, 
  SchemaObject 
} from '../definitions';

export class ParameterCreator {
  #param: ParameterObject;

  constructor(param: ParameterObject) {
    this.#param = param;
  }

  isRequired(): boolean {
    let res = false;
    if(this.#param.required) {
      res = true;
    }
    return res;
  }

  setRequired(bool: boolean): ParameterCreator{
    this.#param.required = bool;
    return this;
  }

  setContent(content: Record<string, MediaTypeObject>): ParameterCreator {
    this.#param.content = content;
    return this;
  }

  getSchemaProp(prop: string): unknown {
    const schema = this.#param.schema || {};
    return schema[prop];
  }

  setSchemaProp(prop: string, value: unknown): ParameterCreator {
    this.#param.schema = this.#param.schema || {};
    this.#param.schema[prop] = value;
    return this;
  }

  setSchema(value: SchemaObject | ReferenceObject): ParameterCreator {
    this.#param.schema = value;
    return this;
  }

  setDescription(value: string): ParameterCreator {
    this.#param.description = value;
    return this;
  }

  getDescription(): string | undefined {
    return this.#param.description;
  }

  setAllowEmptyValue(bool: boolean): ParameterCreator {
    this.#param.allowEmptyValue = bool;
    return this;
  }

  setAllowReserved(bool: boolean): ParameterCreator {
    this.#param.allowReserved = bool;
    return this;
  }

  setExample(value: unknown): ParameterCreator {
    this.#param.example = value;
    return this;
  }

  setExamples(value: Record<string, ExampleObject | ReferenceObject>): ParameterCreator {
    this.#param.examples = value;
    return this;
  }

  setExplode(bool: boolean): ParameterCreator {
    this.#param.explode = bool;
    return this;
  }

  setDeprecated(bool: boolean): ParameterCreator {
    this.#param.deprecated = bool;
    return this;
  }

  setStyle(style: string): ParameterCreator {
    this.#param.style = style;
    return this;
  }

  hasStyle(): boolean {
    return typeof this.#param.style === 'undefined' ? false : true;
  }

  toObject(): ParameterObject{
    const copy: ParameterObject = extend(true, {}, this.#param);
    return copy;
  }
} 