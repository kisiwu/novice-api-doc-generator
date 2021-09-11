import { JoiHelper, JoiSchema } from '../../../helpers/joiHelper';
import { XMLObject } from '../../openapi/definitions';
 import { PostmanHelperInterface } from './interfaces';
 
 export class PostmanJoiHelper extends JoiHelper implements PostmanHelperInterface {
   getFirstItem(): PostmanJoiHelper | undefined {
     if (!this.isJoi()) {
       return;
     }
     let r: PostmanJoiHelper | undefined;
     if (this._joi.$_terms
       && this._joi.$_terms.items
       && this._joi.$_terms.items[0]) {
       r = new PostmanJoiHelper(this._joi.$_terms.items[0]);
     }
     return r;
   }
 
   getChildren(): Record<string, PostmanJoiHelper> {
     const r: Record<string, PostmanJoiHelper> = {};
     if (!this.isJoi()) {
       return r;
     }
     if (this._joi.$_terms
       && this._joi.$_terms.keys && this._joi.$_terms.keys.length) {
       this._joi.$_terms.keys.forEach(
         (c: { key: string, schema?: Record<string, JoiSchema> }) => r[c.key] = new PostmanJoiHelper(c.schema));
     }
     return r;
   }
 
   getAlternatives(): PostmanJoiHelper[] {
     const r: PostmanJoiHelper[] = [];
     if (!this.isJoi()) {
       return r;
     }
     if (this._joi.$_terms
       && this._joi.$_terms.matches && this._joi.$_terms.matches.length) {
       this._joi.$_terms.matches.forEach(
         (c: {schema?: JoiSchema;}) => {
           if(c.schema) {
             r.push(new PostmanJoiHelper(c.schema))
           }
         }
       );
     }
     return r;
   }
 
   hasContentType(): boolean {
     if (!this.isJoi()) {
       return false;
     }
     return this._joi['$_terms']
       && this._joi['$_terms'].metas
       && this._joi['$_terms'].metas[0]
       && this._joi['$_terms'].metas[0].contentType
       && typeof this._joi['$_terms'].metas[0].contentType === 'string' ? true : false;
   }
 
   getContentType(): string | undefined {
     if (!this.isJoi()) {
       return;
     }
     return this._joi['$_terms']
       && this._joi['$_terms'].metas
       && this._joi['$_terms'].metas[0]
       && this._joi['$_terms'].metas[0].contentType;
   }

   hasDescriptionType(): boolean {
    if (!this.isJoi()) {
      return false;
    }
    return this._joi['$_terms']
      && this._joi['$_terms'].metas
      && this._joi['$_terms'].metas[0]
      && this._joi['$_terms'].metas[0].descriptionType
      && typeof this._joi['$_terms'].metas[0].descriptionType === 'string' ? true : false;
  }

  getDescriptionType(): string | undefined {
    if (!this.isJoi()) {
      return;
    }
    return this._joi['$_terms']
      && this._joi['$_terms'].metas
      && this._joi['$_terms'].metas[0]
      && this._joi['$_terms'].metas[0].descriptionType;
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
 }