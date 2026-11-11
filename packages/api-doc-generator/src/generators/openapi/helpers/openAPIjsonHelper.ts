import { BaseJsonHelper } from '../../../helpers/baseJsonHelper';
import type { OpenAPIHelperInterface } from '@novice1/api-doc-definitions/helpers';
import type {
  AdditionalProperties,
  DiscriminatorObject,
  XMLObject,
  ExampleObject,
  ReferenceObject,
  EncodingObject,
  SchemaObject,
} from '@novice1/api-doc-definitions/openapi';

/**
 * JSON schema (draft-07) helper for \@novice1/api-doc-generator
 */
export class OpenAPIJsonHelper extends BaseJsonHelper implements OpenAPIHelperInterface {
  getFirstItem(): OpenAPIJsonHelper | undefined {
    const schema = this._schema;

    if ('items' in schema && typeof schema.items === 'object') {
      return new OpenAPIJsonHelper({ value: schema.items });
    }

    return;
  }
  getChildren(): Record<string, OpenAPIJsonHelper> {
    const r: Record<string, OpenAPIJsonHelper> = {};
    const schema = this._schema;
    if ('properties' in schema && typeof schema.properties === 'object' && schema.properties) {
      const properties: Record<string, unknown> = schema.properties as Record<string, unknown>;
      for (const p in properties) {
        const isRequired: boolean =
          'required' in schema && Array.isArray(schema.required) && schema.required.includes(p);
        r[p] = new OpenAPIJsonHelper({ value: properties[p] }, isRequired);
      }
    }
    return r;
  }
  getAlternatives(): OpenAPIJsonHelper[] {
    const r: OpenAPIJsonHelper[] = [];
    const schema = this._schema;
    if ('oneOf' in schema && Array.isArray(schema.oneOf)) {
      for (const p of schema.oneOf) {
        r.push(new OpenAPIJsonHelper({ value: p }));
      }
    }
    return r;
  }
  hasStyle(): boolean {
    return typeof this.getMeta('style') === 'string';
  }
  getStyle(): string {
    const style = this.getMeta('style');
    if (typeof style === 'string') {
      return style;
    }
    return '';
  }
  hasAdditionalProperties(): boolean {
    const schema = this._schema;
    return !!('additionalProperties' in schema && schema.additionalProperties);
  }
  getAdditionalProperties(): AdditionalProperties {
    const schema = this._schema;
    return 'additionalProperties' in schema && (schema.additionalProperties as AdditionalProperties);
  }
  hasRef(): boolean {
    const schema = this._schema;
    return (
      !!('$ref' in schema && typeof schema.$ref === 'string') || !!('$id' in schema && typeof schema.$id === 'string')
    );
  }
  getRef(): string | undefined {
    const schema = this._schema;
    return '$ref' in schema && typeof schema.$ref === 'string'
      ? schema.$ref
      : '$id' in schema && typeof schema.$id === 'string'
        ? schema.$id
        : undefined;
  }
  hasDiscriminator(): boolean {
    return !!(
      'discriminator' in this._schema &&
      this._schema.discriminator &&
      typeof this._schema.discriminator === 'object' &&
      'propertyName' in this._schema.discriminator &&
      this._schema.discriminator.propertyName &&
      typeof this._schema.discriminator.propertyName === 'string'
    );
  }
  getDiscriminator(): DiscriminatorObject | undefined {
    return 'discriminator' in this._schema &&
      this._schema.discriminator &&
      typeof this._schema.discriminator === 'object' &&
      'propertyName' in this._schema.discriminator &&
      this._schema.discriminator.propertyName &&
      typeof this._schema.discriminator.propertyName === 'string'
      ? (this._schema.discriminator as DiscriminatorObject)
      : undefined;
  }
  hasXml(): boolean {
    const xmlMeta = this.getMeta('xml');
    return !!(xmlMeta && typeof xmlMeta === 'object');
  }
  getXml(): XMLObject | undefined {
    return this.getMeta('xml') as XMLObject | undefined;
  }
  hasExamples(): boolean {
    const schema = this._schema;
    return !!('examples' in schema && Array.isArray(schema.examples));
  }
  getExamples(): Record<string, ExampleObject | ReferenceObject> | undefined {
    const schema = this._schema;
    if ('examples' in schema && Array.isArray(schema.examples)) {
      const r: Record<string, ExampleObject | ReferenceObject> = {};
      let i = 1;
      for (const value of schema.examples) {
        r[`${i}`] = {
          value,
        };
        i++;
      }
      return r;
    }
    return;
  }
  hasEncoding(): boolean {
    const encodingMeta = this.getMeta('encoding');
    return !!(encodingMeta && typeof encodingMeta === 'object');
  }
  getEncoding(): Record<string, EncodingObject> | undefined {
    return this.getMeta('encoding') as Record<string, EncodingObject> | undefined;
  }
  getAnyOf(): SchemaObject[] {
    const r: SchemaObject[] = [];
    if ('anyOf' in this._schema && Array.isArray(this._schema.anyOf)) {
      for (const p of this._schema.anyOf) {
        if (p && typeof p === 'object') {
          r.push(p);
        }
      }
    }
    return r;
  }
}
