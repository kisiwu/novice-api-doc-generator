import type { BaseHelperInterface } from '@novice1/api-doc-definitions/helpers';

/**
 * JSON schema (draft-07) helper for \@novice1/api-doc-generator
 */
export abstract class BaseJsonHelper implements BaseHelperInterface {
  protected _schema: object;
  protected _isRequired = false;

  constructor({ value: schema = {} }: { value?: object | unknown; isRoot?: boolean }, isRequired?: boolean) {
    this._schema = {};
    if (schema && typeof schema === 'object') {
      const s = schema as Record<string, unknown>;
      this._schema = s;
    }
    if (isRequired) {
      this._isRequired = isRequired;
    }
  }

  protected hasMeta(v: string): boolean {
    if (!this.isValid()) {
      return false;
    }
    return 'meta' in this._schema &&
      this._schema.meta &&
      typeof this._schema.meta === 'object' &&
      v in this._schema.meta &&
      typeof (this._schema.meta as Record<PropertyKey, unknown>)[v] !== 'undefined'
      ? true
      : false;
  }

  protected getMeta(v: string): unknown {
    if (!this.hasMeta(v)) {
      return;
    }
    return (
      'meta' in this._schema &&
      this._schema.meta &&
      typeof this._schema.meta === 'object' &&
      v in this._schema.meta &&
      (this._schema.meta as Record<PropertyKey, unknown>)[v]
    );
  }

  isValid(): boolean {
    return !!(
      this._schema &&
      typeof this._schema === 'object' &&
      (('type' in this._schema && typeof this._schema.type === 'string') ||
        ('oneOf' in this._schema && Array.isArray(this._schema.oneOf)) ||
        ('anyOf' in this._schema && Array.isArray(this._schema.anyOf)))
    );
  }
  getType(): string {
    let r = '';

    if ('type' in this._schema && typeof this._schema.type === 'string') {
      r = this._schema.type;
    }

    if ('format' in this._schema && typeof this._schema.format === 'string') {
      r = this._schema.format;
    }

    return r;
  }
  getDescription(): string {
    let r = '';

    if ('description' in this._schema && typeof this._schema.description === 'string') {
      r = this._schema.description;
    }

    return r;
  }
  isRequired(): boolean {
    return this._isRequired;
  }
  isUnique(): boolean {
    return !!('uniqueItems' in this._schema && this._schema.uniqueItems);
  }
  hasDefaultValue(): boolean {
    return !!('default' in this._schema && typeof this._schema.default != 'undefined');
  }
  getDefaultValue(): unknown {
    return 'default' in this._schema ? this._schema.default : undefined;
  }
  hasExampleValue(): boolean {
    const schema = this._schema;
    return !!('examples' in schema && Array.isArray(schema.examples) && schema.examples.length);
  }
  getExampleValue(): unknown {
    const schema = this._schema;
    if ('examples' in schema && Array.isArray(schema.examples) && schema.examples.length) {
      return schema.examples[0];
    }
    return;
  }
  isDeprecated(): boolean {
    return !!('deprecated' in this._schema && this._schema.deprecated);
  }
  allowsEmptyValue(): boolean {
    let r = false;
    if ('enum' in this._schema && Array.isArray(this._schema.enum)) {
      const enume = this._schema.enum;
      r = ['', null].some((v) => enume.includes(v));
    }
    return r;
  }
  getEnum(): unknown[] {
    let r: unknown[] = [];
    if ('enum' in this._schema && Array.isArray(this._schema.enum)) {
      r = this._schema.enum;
    } else if ('anyOf' in this._schema && Array.isArray(this._schema.anyOf)) {
      for (const p of this._schema.anyOf) {
        if (p && typeof p === 'object' && 'const' in p) {
          r.push(p.const);
        }
      }
    }
    return r;
  }
  hasMin(): boolean {
    return (
      'minProperties' in this._schema ||
      'minItems' in this._schema ||
      'minimum' in this._schema ||
      'minLength' in this._schema
    );
  }
  hasMax(): boolean {
    return (
      'maxProperties' in this._schema ||
      'maxItems' in this._schema ||
      'maximum' in this._schema ||
      'maxLength' in this._schema
    );
  }
  getMin(): number | undefined {
    if ('minProperties' in this._schema && typeof this._schema.minProperties === 'number') {
      return this._schema.minProperties;
    }
    if ('minItems' in this._schema && typeof this._schema.minItems === 'number') {
      return this._schema.minItems;
    }
    if ('minimum' in this._schema && typeof this._schema.minimum === 'number') {
      return this._schema.minimum;
    }
    if ('minLength' in this._schema && typeof this._schema.minLength === 'number') {
      return this._schema.minLength;
    }
    return;
  }
  getMax(): number | undefined {
    if ('maxProperties' in this._schema && typeof this._schema.maxProperties === 'number') {
      return this._schema.maxProperties;
    }
    if ('maxItems' in this._schema && typeof this._schema.maxItems === 'number') {
      return this._schema.maxItems;
    }
    if ('maximum' in this._schema && typeof this._schema.maximum === 'number') {
      return this._schema.maximum;
    }
    if ('maxLength' in this._schema && typeof this._schema.maxLength === 'number') {
      return this._schema.maxLength;
    }
    return;
  }
  getUnit(): string {
    const unit: unknown = this.getMeta('unit');
    if (typeof unit === 'string') {
      return unit;
    }
    return '';
  }
}
