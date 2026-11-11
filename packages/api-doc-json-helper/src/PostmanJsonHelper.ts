import { BaseJsonHelper } from './BaseJsonHelper';
import type { PostmanHelperInterface } from '@novice1/api-doc-definitions/helpers';
import type { XMLObject } from '@novice1/api-doc-definitions/openapi';

export class PostmanJsonHelper extends BaseJsonHelper implements PostmanHelperInterface {
  getFirstItem(): PostmanJsonHelper | undefined {
    const schema = this._schema;

    if ('items' in schema && typeof schema.items === 'object') {
      return new PostmanJsonHelper({ value: schema.items });
    }

    return;
  }
  getChildren(): Record<string, PostmanJsonHelper> {
    const r: Record<string, PostmanJsonHelper> = {};
    const schema = this._schema;
    if ('properties' in schema && typeof schema.properties === 'object' && schema.properties) {
      const properties: Record<string, unknown> = schema.properties as Record<string, unknown>;
      for (const p in properties) {
        const isRequired: boolean =
          'required' in schema && Array.isArray(schema.required) && schema.required.includes(p);
        r[p] = new PostmanJsonHelper({ value: properties[p] }, isRequired);
      }
    }
    return r;
  }
  getAlternatives(): PostmanJsonHelper[] {
    const r: PostmanJsonHelper[] = [];
    const schema = this._schema;
    if ('oneOf' in schema && Array.isArray(schema.oneOf)) {
      for (const p of schema.oneOf) {
        r.push(new PostmanJsonHelper({ value: p }));
      }
    }
    return r;
  }

  hasContentType(): boolean {
    return typeof this.getMeta('contentType') === 'string';
  }

  getContentType(): string | undefined {
    const contentType = this.getMeta('contentType');
    if (typeof contentType === 'string') {
      return contentType;
    }
    return;
  }

  hasDescriptionType(): boolean {
    return typeof this.getMeta('descriptionType') === 'string';
  }

  getDescriptionType(): string | undefined {
    const descriptionType = this.getMeta('descriptionType');
    if (typeof descriptionType === 'string') {
      return descriptionType;
    }
    return;
  }

  hasXml(): boolean {
    const xmlMeta = this.getMeta('xml');
    return !!(xmlMeta && typeof xmlMeta === 'object');
  }
  getXml(): XMLObject | undefined {
    return this.getMeta('xml') as XMLObject | undefined;
  }
}
