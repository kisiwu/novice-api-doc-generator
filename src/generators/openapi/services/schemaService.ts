import extend from 'extend';
import {
  AdditionalProperties,
  DiscriminatorObject,
  OpenAPISupportedVersion,
  ReferenceObject,
  SchemaObject,
  SchemaObject3_0,
  SchemaObject3_1,
  XMLObject
} from '../definitions';

// @todo: add contentMediaType and contentEncoding
export class SchemaCreator {

  #openapi: OpenAPISupportedVersion = '3.1.1'

  #schema: SchemaObject;

  #min?: number;
  #max?: number;

  #oneOf: Array<SchemaObject | ReferenceObject>;

  #example?: unknown;

  #format?: string

  constructor(schema: SchemaObject = {}, v?: OpenAPISupportedVersion) {
    if (v) {
      this.#openapi = v
    }
    this.#schema = schema;
    this.#oneOf = [];
  }

  addOneOf(schema: SchemaObject | ReferenceObject): SchemaCreator {
    this.#oneOf.push(schema);
    return this;
  }

  getOneOf(): (SchemaObject | ReferenceObject)[] {
    return this.#oneOf;
  }

  isRequired(): boolean {
    let res = false;
    if (this.#schema.required?.length) {
      res = true;
    }
    return res;
  }

  isType(typeName: string): boolean {
    return typeName === this.#schema.type;
  }

  hasProperties(): boolean {
    return this.#schema.properties ? true : false;
  }

  getProperty(propertyName: string): SchemaObject | ReferenceObject | undefined {
    const props = this.#schema.properties || {};
    return props[propertyName];
  }

  getType(): string | string[] | undefined {
    return this.#schema.type;
  }

  getMin(): number | undefined {
    return this.#min;
  }

  getMax(): number | undefined {
    return this.#max;
  }

  getRequired(): string[] | undefined {
    return this.#schema.required;
  }

  addRequired(propertyName: string): SchemaCreator {
    this.#schema.required = this.#schema.required || [];
    if (!this.#schema.required.includes(propertyName)) {
      this.#schema.required.push(propertyName);
    }
    return this;
  }

  setRequired(properties: string[]): SchemaCreator {
    this.#schema.required = properties;
    return this;
  }

  setProperty(propertyName: string, schema: SchemaObject | ReferenceObject): SchemaCreator {
    this.#schema.properties = this.#schema.properties || {};
    this.#schema.properties[propertyName] = schema;
    return this;
  }

  setProperties(properties: Record<string, SchemaObject | ReferenceObject>): SchemaCreator {
    this.#schema.properties = properties;
    return this;
  }

  setSchema(schema: SchemaObject): SchemaCreator {
    this.#schema = schema;
    return this;
  }

  setDiscriminator(discriminator: DiscriminatorObject): SchemaCreator {
    this.#schema.discriminator = discriminator;
    return this;
  }

  setXml(xml: XMLObject): SchemaCreator {
    this.#schema.xml = xml;
    return this;
  }

  setType(typeName: string): SchemaCreator {
    this.#schema.type = typeName;
    return this;
  }

  setFormat(format: string): SchemaCreator {
    this.#format = format;
    return this;
  }

  setDescription(value: string): SchemaCreator {
    this.#schema.description = value;
    return this;
  }

  getDescription(): string | undefined {
    return this.#schema.description;
  }

  setAllowEmptyValue(bool: boolean): SchemaCreator {
    this.#schema.allowEmptyValue = bool;
    return this;
  }

  setDefault(value: unknown): SchemaCreator {
    this.#schema.default = value;
    return this;
  }

  setExample(value: unknown): SchemaCreator {
    this.#example = value;
    return this;
  }

  setEnum(value: unknown[]): SchemaCreator {
    this.#schema.enum = value;
    return this;
  }

  setAnyOf(value: Array<SchemaObject | ReferenceObject>): SchemaCreator {
    this.#schema.anyOf = value;
    return this;
  }

  setMin(value: number | undefined): SchemaCreator {
    this.#min = value;
    return this;
  }

  setMax(value: number | undefined): SchemaCreator {
    this.#max = value;
    return this;
  }

  setItems(schema: SchemaObject | ReferenceObject): SchemaCreator {
    this.#schema.items = schema;
    return this;
  }

  setUniqueItems(bool: boolean | undefined): SchemaCreator {
    this.#schema.uniqueItems = bool;
    return this;
  }

  setAdditionalProperties(value: AdditionalProperties): SchemaCreator {
    this.#schema.additionalProperties = value;
    return this;
  }

  setDeprecated(bool: boolean): SchemaCreator {
    this.#schema.deprecated = bool;
    return this;
  }

  toObject(): SchemaObject {
    const copy: SchemaObject = extend(true, {}, this.#schema);

    // format
    if (this.#format) {
      if (this.#format === 'binary' || this.#format.includes('/')) {
        if (this.#openapi === '3.0.4') {
          (copy as SchemaObject3_0).format = 'binary'
        } else {
          (copy as SchemaObject3_1).contentMediaType = this.#format === 'binary' ? 'application/octet-stream' : this.#format
        }
      } else {
        copy.format = this.#format
      }
    }

    // min
    if (typeof this.#min !== 'undefined') {
      if (copy.type === 'array') {
        copy.minItems = this.#min;
      } else if (copy.type === 'object') {
        copy.minProperties = this.#min;
      } else if (copy.type === 'string') {
        copy.minLength = this.#min;
      } else {
        copy.minimum = this.#min;
      }
    }
    // max
    if (typeof this.#max !== 'undefined') {
      if (copy.type === 'array') {
        copy.maxItems = this.#max;
      } else if (copy.type === 'object') {
        copy.maxProperties = this.#max;
      } else if (copy.type === 'string') {
        copy.maxLength = this.#max;
      } else {
        copy.maximum = this.#max;
      }
    }

    // example
    if (typeof this.#example !== 'undefined') {
      if (this.#openapi === '3.0.4') {
        (copy as SchemaObject3_0).example = this.#example
      } else {
        (copy as SchemaObject3_1).examples = /*Array.isArray(this.#example) ? this.#example :*/ [this.#example]
      }
    }

    // required
    if (Array.isArray(copy.required) && !copy.required.length) {
      delete copy.required;
    }

    return copy;
  }
}