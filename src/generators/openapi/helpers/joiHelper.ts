/**
 * @module openapi-helpers-joi
 */

import { JoiHelper, JoiSchema } from '../../../helpers/joiHelper';
import { AdditionalProperties, DiscriminatorObject, EncodingObject, ExampleObject, ReferenceObject, XMLObject } from '../definitions';
import { OpenAPIHelperInterface } from './interfaces';

export class OpenAPIJoiHelper extends JoiHelper implements OpenAPIHelperInterface {
  getFirstItem(): OpenAPIJoiHelper | undefined {
    if (!this.isJoi()) {
      return;
    }
    let r: OpenAPIJoiHelper | undefined;
    if (this._joi.$_terms
      && this._joi.$_terms.items
      && this._joi.$_terms.items[0]) {
      r = new OpenAPIJoiHelper(this._joi.$_terms.items[0]);
    }
    return r;
  }

  getChildren(): Record<string, OpenAPIJoiHelper> {
    const r: Record<string, OpenAPIJoiHelper> = {};
    if (!this.isJoi()) {
      return r;
    }
    if (this._joi.$_terms
      && this._joi.$_terms.keys && this._joi.$_terms.keys.length) {
      this._joi.$_terms.keys.forEach(
        (c: { key: string, schema?: Record<string, JoiSchema> }) => r[c.key] = new OpenAPIJoiHelper(c.schema));
    }
    return r;
  }

  getAlternatives(): OpenAPIJoiHelper[] {
    const r: OpenAPIJoiHelper[] = [];
    if (!this.isJoi()) {
      return r;
    }
    if (this._joi.$_terms
      && this._joi.$_terms.matches && this._joi.$_terms.matches.length) {
      this._joi.$_terms.matches.forEach(
        (c: {schema?: JoiSchema;}) => {
          if(c.schema) {
            r.push(new OpenAPIJoiHelper(c.schema))
          }
        }
      );
    }
    return r;
  }

  hasStyle(): boolean {
    if (!this.isJoi()) {
      return false;
    }
    return this._joi['$_terms']
      && this._joi['$_terms'].metas
      && this._joi['$_terms'].metas[0]
      && this._joi['$_terms'].metas[0].style
      && typeof this._joi['$_terms'].metas[0].style === 'string' ? true : false;
  }

  getStyle(): string {
    if (!this.isJoi()) {
      return '';
    }
    return this._joi['$_terms']
      && this._joi['$_terms'].metas
      && this._joi['$_terms'].metas[0]
      && this._joi['$_terms'].metas[0].style;
  }

  hasAdditionalProperties(): boolean {
    if (!this.isJoi()) {
      return false;
    }
    return this._joi['$_terms']
      && this._joi['$_terms'].metas
      && this._joi['$_terms'].metas[0]
      && (typeof this._joi['$_terms'].metas[0].additionalProperties === 'boolean' 
        || (this._joi['$_terms'].metas[0].additionalProperties 
          && typeof this._joi['$_terms'].metas[0].additionalProperties === 'object'))
      ? true : false;
  }

  getAdditionalProperties(): AdditionalProperties {
    if (!this.isJoi()) {
      return false;
    }
    return this._joi['$_terms']
      && this._joi['$_terms'].metas
      && this._joi['$_terms'].metas[0]
      && this._joi['$_terms'].metas[0].additionalProperties;
  }

  hasRef(): boolean {
    if (!this.isJoi()) {
      return false;
    }
    return this._joi['$_terms']
      && this._joi['$_terms'].metas
      && this._joi['$_terms'].metas[0]
      && this._joi['$_terms'].metas[0].ref
      && typeof this._joi['$_terms'].metas[0].ref === 'string' ? true : false;
  }

  getRef(): string | undefined {
    if (!this.isJoi()) {
      return;
    }
    return this._joi['$_terms']
      && this._joi['$_terms'].metas
      && this._joi['$_terms'].metas[0]
      && this._joi['$_terms'].metas[0].ref;
  }

  hasDiscriminator(): boolean {
    if (!this.isJoi()) {
      return false;
    }
    return this._joi['$_terms']
      && this._joi['$_terms'].metas
      && this._joi['$_terms'].metas[0]
      && this._joi['$_terms'].metas[0].discriminator
      && typeof this._joi['$_terms'].metas[0].discriminator === 'object' ? true : false;
  }

  getDiscriminator(): DiscriminatorObject | undefined {
    if (!this.isJoi()) {
      return;
    }
    return this._joi['$_terms']
      && this._joi['$_terms'].metas
      && this._joi['$_terms'].metas[0]
      && this._joi['$_terms'].metas[0].discriminator;
  }

  hasXml(): boolean {
    if (!this.isJoi()) {
      return false;
    }
    return this._joi['$_terms']
      && this._joi['$_terms'].metas
      && this._joi['$_terms'].metas[0]
      && this._joi['$_terms'].metas[0].xml
      && typeof this._joi['$_terms'].metas[0].xml === 'object' ? true : false;
  }

  getXml(): XMLObject | undefined {
    if (!this.isJoi()) {
      return;
    }
    return this._joi['$_terms']
      && this._joi['$_terms'].metas
      && this._joi['$_terms'].metas[0]
      && this._joi['$_terms'].metas[0].xml;
  }

  hasExamples(): boolean {
    if (!this.isJoi()) {
      return false;
    }
    return this._joi['$_terms']
      && this._joi['$_terms'].metas
      && this._joi['$_terms'].metas[0]
      && this._joi['$_terms'].metas[0].examples
      && typeof this._joi['$_terms'].metas[0].examples === 'object' ? true : false;
  }

  getExamples(): Record<string, ExampleObject | ReferenceObject> | undefined {
    if (!this.isJoi()) {
      return;
    }
    return this._joi['$_terms']
      && this._joi['$_terms'].metas
      && this._joi['$_terms'].metas[0]
      && this._joi['$_terms'].metas[0].examples;
  }

  hasEncoding(): boolean {
    if (!this.isJoi()) {
      return false;
    }
    return this._joi['$_terms']
      && this._joi['$_terms'].metas
      && this._joi['$_terms'].metas[0]
      && this._joi['$_terms'].metas[0].encoding
      && typeof this._joi['$_terms'].metas[0].encoding === 'object' ? true : false;
  }

  getEncoding(): Record<string, EncodingObject> | undefined {
    if (!this.isJoi()) {
      return;
    }
    return this._joi['$_terms']
      && this._joi['$_terms'].metas
      && this._joi['$_terms'].metas[0]
      && this._joi['$_terms'].metas[0].encoding;
  }
}