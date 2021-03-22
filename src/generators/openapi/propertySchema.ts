
interface PropertySchemaObjectExplicit {
  required?: boolean | string[];
  schema?: Record<string, unknown>;
  properties?: Record<string, unknown>;
  items?: Record<string, unknown>;
  type?: string;
  description?: string;
  allowEmptyValue?: boolean;
  default?: unknown;
  enum?: unknown[];
  minItems?: number;
  maxItems?: number;
  minimum?: number;
  maximum?: number;
  format?: string;
  uniqueItems?: boolean;
  style?: unknown;
  oneOf?: unknown[];
}

export interface PropertySchemaObject extends PropertySchemaObjectExplicit {
  [key: string]: unknown;
}

export class PropertySchema {
  #param: PropertySchemaObject;
  #requiredAs: string;

  #min?: number;
  #max?: number;

  #oneOf: PropertySchemaObject[];

  constructor(defaultValue: PropertySchemaObject = {}) {
    this.#param = defaultValue;
    this.#requiredAs = 'boolean';
    this.#oneOf = [];
  }

  addOneOf(schema: PropertySchemaObject): PropertySchema {
    this.#oneOf.push(schema);
    return this;
  }

  getOneOf(): PropertySchemaObject[] {
    return this.#oneOf;
  }

  setRequiredToArray(): PropertySchema {
    this.#requiredAs = 'array';
    if(!Array.isArray(this.#param.required)) {
      this.#param.required = [];
    }
    return this;
  }

  setRequiredToBoolean(): PropertySchema {
    this.#requiredAs = 'boolean';
    if (typeof this.#param.required !== 'boolean') {
      delete this.#param.required;
    }
    return this;
  }

  requiredShouldBeArray(): boolean {
    return this.#requiredAs === 'array';
  }

  isRequired(): boolean {
    let res = false;
    if (Array.isArray(this.#param.required) && this.#param.required.length) {
      res = true;
    } else if(this.#param.required) {
      res = true;
    }
    return res;
  }

  isType(value: string): boolean {
    return value === this.#param.type;
  }

  hasProperties(): boolean {
    return this.#param.properties ? true : false;
  }

  getSchemaProp(prop: string): unknown {
    const schema = this.#param.schema || {};
    return schema[prop];
  }

  getProperty(prop: string): unknown {
    const props = this.#param.properties || {};
    return props[prop];
  }

  getType(): string | undefined {
    return this.#param.type;
  }

  getMin(): number | undefined {
    return this.#min;
  }

  getMax(): number | undefined {
    return this.#max;
  }

  getRequired(): boolean | string[] |undefined {
    return this.#param.required;
  }

  getRequiredAsArray(): string[] {
    let res: string[] = [];
    if (Array.isArray(this.#param.required)) {
      res = this.#param.required;
    }
    return res;
  }

  pushIntoRequired(value: string): PropertySchema {
    if (Array.isArray(this.#param.required) && this.#param.required.indexOf(value) == -1) {
      this.#param.required.push(value);
    }
    return this;
  }

  setRequired(value: boolean): PropertySchema;
  setRequired(value: string[]): PropertySchema;
  setRequired(value: boolean | string[]): PropertySchema {
    if (this.#requiredAs === 'array') {
      if (Array.isArray(value)) {
        this.#param.required = value;
      }
    } else if (!Array.isArray(value)) {
      this.#param.required = value;
    }
    return this;
  }

  setSchemaProp(prop: string, value: unknown): PropertySchema {
    this.#param.schema = this.#param.schema || {};
    this.#param.schema[prop] = value;
    return this;
  }

  setProperty(prop: string, value: unknown): PropertySchema {
    this.#param.properties = this.#param.properties || {};
    this.#param.properties[prop] = value;
    return this;
  }

  setSchema(value: Record<string, unknown>): PropertySchema {
    this.#param.schema = value;
    return this;
  }

  setProperties(value: Record<string, unknown>): PropertySchema {
    this.#param.properties = value;
    return this;
  }

  setType(value: string): PropertySchema {
    this.#param.type = value;
    return this;
  }

  setDescription(value: string): PropertySchema {
    this.#param.description = value;
    return this;
  }

  getDescription(): string | undefined {
    return this.#param.description;
  }

  setAllowEmptyValue(value: boolean): PropertySchema {
    this.#param.allowEmptyValue = value;
    return this;
  }

  setDefault(value: unknown): PropertySchema {
    this.#param.default = value;
    return this;
  }

  setExample(value: unknown): PropertySchema {
    this.#param.example = value;
    return this;
  }

  setEnum(value: unknown[]): PropertySchema {
    this.#param.enum = value;
    return this;
  }

  setMin(value: number | undefined): PropertySchema {
    this.#min = value;
    return this;
  }

  setMax(value: number | undefined): PropertySchema {
    this.#max = value;
    return this;
  }

  setItem(prop: string, value: unknown): PropertySchema {
    this.#param.items = this.#param.items || {};
    this.#param.items[prop] = value;
    return this;
  }

  setItems(value: Record<string, unknown>): PropertySchema {
    this.#param.items = value;
    return this;
  }

  setFormat(value: string): PropertySchema {
    this.#param.format = value;
    return this;
  }

  setUniqueItems(value: boolean | undefined): PropertySchema {
    this.#param.uniqueItems = value;
    return this;
  }

  setAdditionalProperties(value: unknown): PropertySchema {
    this.#param.additionalProperties = value;
    return this;
  }

  setExplode(value: boolean): PropertySchema {
    this.#param.explode = value;
    return this;
  }

  setDeprecated(value: boolean): PropertySchema {
    this.#param.deprecated = value;
    return this;
  }

  setStyle(value: unknown): PropertySchema {
    this.#param.style = value;
    return this;
  }

  hasStyle(): boolean {
    return typeof this.#param.style === 'undefined' ? false : true;
  }

  set(prop: string, value: unknown): PropertySchema {
    this.#param[prop] = value;
    return this;
  }

  toObject(): PropertySchemaObject{
    const copy: PropertySchemaObject = {};
    for(const key in this.#param) {
      copy[key] = this.#param[key];
    }

    if(typeof this.#min !== 'undefined') {
      if (copy.type === 'array') {
        copy.minItems = this.#min;
      } else {
        copy.minimum = this.#min;
      }
    }
    if(typeof this.#max !== 'undefined') {
      if (copy.type === 'array') {
        copy.maxItems = this.#max;
      } else {
        copy.maximum = this.#max;
      }
    }

    if (Array.isArray(copy.required) && !copy.required.length){
      delete copy.required;
    }

    return copy;
  }
} 