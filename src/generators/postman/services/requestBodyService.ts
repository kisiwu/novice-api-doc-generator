/**
 * @todo: finish toObject method
 */
import jsontoxml from 'jsontoxml';
import { XMLObject } from '../../openapi/definitions';
import { FormParameter, RequestBodyObject, SrcFormParameter, ValueFormParameter } from '../definitions';
import { PostmanHelperInterface } from '../helpers/interfaces';
import { formatType } from '../utils';

interface JsontoxmlObject {
  name: string;
  text?: string;
  attrs?: Record<string, string>;
  children?: JsontoxmlObject[];
}

    /**
     * mode?: string; // raw urlencoded formdata file graphql
  raw?: string;
  graphql?: Record<string, unknown>;
  urlencoded?: UrlEncodedParameter[];
  formdata?: FormParameter[];
  file?: {
    src?: string | null;
    content?: string;
  },
  options?: Record<string, unknown>;
  disabled?: boolean;
     */

export class RequestBodyCreator {
  protected mode: string | undefined;

  protected body: PostmanHelperInterface | undefined;
  protected file: PostmanHelperInterface | undefined;
  protected fields: Record<string, PostmanHelperInterface> = {};
  protected fileFields: Record<string, PostmanHelperInterface> = {};
  protected fieldsBody: PostmanHelperInterface | undefined;
  protected required: boolean;
  protected format: string;

  constructor() {
    this.required = false;
    this.format = '';
  }

  setMode(mode: string): RequestBodyCreator {
    this.mode = mode;
    return this;
  }

  getMode(): string | undefined {
    return this.mode;
  }

  setRequired(bool: boolean): RequestBodyCreator {
    this.required = bool;
    return this;
  }

  isRequired(): boolean {
    return this.required;
  }

  setFormat(format: string): RequestBodyCreator {
    switch(format) {
      case 'json':
      case 'application/json':
        this.format = 'json';
        break;
      case 'xml':
      case 'application/xml':
        this.format = 'xml';
        break;
      case 'multipart/form-data':
        this.format = '';
        this.setMode('formdata');
        break;
      default:
        break;
    }
    return this;
  }

  setFile(file: PostmanHelperInterface): RequestBodyCreator {
    this.file= file;
    return this;
  }

  hasFile(): boolean {
    return this.file ? true : false;
  }

  setBody(body: PostmanHelperInterface): RequestBodyCreator {
    this.body= body;
    return this;
  }

  hasBody(): boolean {
    return this.body ? true : false;
  }

  getBody(): PostmanHelperInterface | undefined {
    return this.body;
  }

  setField(name: string, field: PostmanHelperInterface): RequestBodyCreator {
    this.fields[name] = field;
    return this;
  }

  hasFields(): boolean {
    return Object.keys(this.fields).length ? true : false;
  }

  setFileField(name: string, field: PostmanHelperInterface): RequestBodyCreator {
    this.fileFields[name] = field;
    return this;
  }

  hasFileFields(): boolean {
    return Object.keys(this.fileFields).length ? true : false;
  }

  setFieldsBody(fieldsBody: PostmanHelperInterface): RequestBodyCreator {
    this.fieldsBody= fieldsBody;
    return this;
  }

  hasFieldsBody(): boolean {
    return this.fieldsBody ? true : false;
  }

  getFieldsBody(): PostmanHelperInterface | undefined {
    return this.fieldsBody;
  }

  toObject(): RequestBodyObject {
    const mode = this.mode;
    const res: RequestBodyObject = {
      disabled: !this.required
    };
    // JSON.stringify(result.raw, null, "\t")

    if (mode === 'raw') {
      res.mode = mode;
      // check body
      if (this.body) {
        res.raw = this.createRawBody();
      } // or check fields
      else {
        res.raw = this.createRawFields();
      }
    } // check file
    else if (mode === 'file') {
      res.mode = mode;
    } // check fields and filefields
    else if (mode === 'formdata') {
      res.mode = mode;
      res.formdata = this.createFormData();
    } else {
      res.mode = 'raw';
      // check body
      if (this.body) {
        res.raw = this.createRawBody();
      } // or check file
      else if(this.file) {
        res.mode = 'file';
      } // or check fields and filefields
      else {
        if(this.hasFileFields()) {
          res.mode = 'formdata';
          res.formdata = this.createFormData();
        } else if(this.hasFields()) {
          res.mode = 'raw';
          res.raw = this.createRawFields();
          res.formdata = this.createFormData();
        }
      }
    }
    return res;
  }

  protected createRawBody(): string | undefined {
    let res: string | undefined;
    if(this.body) {
      const raw = this._createRaw(this.body);
      if (typeof raw != 'undefined' && raw != null) {
        if (this.format === 'json' || typeof raw !== 'string') {
          res = JSON.stringify(raw, null, '\t');
        } else if (typeof raw === 'string') {
          res = raw;
        }
      }
    }
    return res;
  }

  protected createRawFields(): string | undefined {
    let res: string | undefined;
    if(this.hasFields()) {
      if (this.format === 'xml') {
        const json: JsontoxmlObject = this._createElementJsontoxmlObject(
          'element',
          this.fieldsBody
        );
        Object.keys(this.fields).forEach(name => {
          const child = this.fields[name];
          const jsonChild = this._createJsontoxmlObject(name, child);
          if (child.hasXml?.() && child.getXml) {
            const xmlObject = child.getXml();
            if (xmlObject?.attribute) {
              json.attrs = json.attrs || {};
              json.attrs[name] = jsonChild.text || '';
            } else {
              json.children = json.children || [];
              json.children.push(jsonChild);
            }
          } else {
            json.children = json.children || [];
            json.children.push(jsonChild);
          }
        });
        res = jsontoxml([json], {
          xmlHeader: true,
          indent: ' '
        });
      } else {
        const raw: Record<string, unknown> = {};
        Object.keys(this.fields).forEach(name => {
          raw[name] = this._createRaw(this.fields[name]);
        });
        res = JSON.stringify(raw, null, '\t');
      }
    }
    return res;
  }

  protected createFormData(): FormParameter[] {
    const res: FormParameter[] = [];
    if(this.hasFields()) {
      Object.keys(this.fields).forEach(name => {
        res.push(this._createFormDataEntity(name, this.fields[name]));
      });
    }
    if (this.hasFileFields()) {
      Object.keys(this.fileFields).forEach(name => {
        res.push(this._createFormDataEntity(name, this.fileFields[name], true));
      });
    }
    return res;
  }

  private _createElementJsontoxmlObject(
    name: string,
    helper?: PostmanHelperInterface
  ): JsontoxmlObject {
    const res: JsontoxmlObject = {
      name
    };
    if (helper?.hasXml?.() && helper.getXml) {
      let prefix = '';
      const xml: XMLObject | undefined = helper.getXml();
      if (xml?.name) {
        res.name = xml.name;
      }
      if (xml?.prefix) {
        prefix = xml.prefix;
      }
      if (xml?.namespace) {
        const xmlns = prefix ? `xmlns:${prefix}` : `xmlns:${res.name}`;
        res.attrs = {
          [xmlns]: xml.namespace
        };
      }
      if (prefix) {
        res.name = `${prefix}:${res.name}`;
      }
    }
    return res;
  }

  private _createJsontoxmlObject(
    name: string,
    helper: PostmanHelperInterface
  ): JsontoxmlObject {
    const res: JsontoxmlObject = this._createElementJsontoxmlObject(
      name,
      helper
    );
    const helperType = formatType(helper.getType());
    
    if (helper.getType() === 'array') {
      let text: string | undefined;
      const item = helper.getFirstItem();
      if (item) {
        const itemType = formatType(item.getType());
        if(item.hasDefaultValue()) {
          text = `${item.getDefaultValue()}`;
        } else if (item.hasExampleValue()) {
          text = `${item.getExampleValue()}`;
        } else if (itemType.format) {
          text = `(${itemType.format})`;
        } else if (itemType.type) {
          text = `(${itemType.type})`;
        } else if (helperType.format) {
          text = `(${helperType.format})`;
        } else if (helperType.type) {
          text = `(${helperType.type})`;
        }
      }
      if (text) {
        res.text = text;
      }
    } else if (helper.getType() === 'object') {
      const children = helper.getChildren();
      Object.keys(children).forEach(childName => {
        const child = children[childName];
        const jsonChild = this._createJsontoxmlObject(childName, child); 
        if(child.hasXml?.() && child.getXml) {
          const xmlObject = child.getXml();
          if (xmlObject?.attribute) {
            res.attrs = res.attrs || {};
            res.attrs[childName] = jsonChild.text || '';
          } else {
            res.children = res.children || [];
            res.children.push(jsonChild);
          }
        }
      });
    } else {
      let text: string | undefined;
      if(helper.hasDefaultValue()) {
        text = `${helper.getDefaultValue()}`;
      } else if (helper.hasExampleValue()) {
        text = `${helper.getExampleValue()}`;
      } else if (helperType.format) {
        text = `(${helperType.format})`;
      } else if (helperType.type) {
        text = `(${helperType.type})`;
      }
      if (text) {
        res.text = text;
      }
    }
    return res;
  }

  private _createRaw(
    helper: PostmanHelperInterface,
    deepLevel = 0
  ): unknown {
    let res: unknown;
    const helperType = formatType(helper.getType());
    if(deepLevel > 9) {
      return;
    }
    if(helper.hasDefaultValue()) {
      res = helper.getDefaultValue();
    } else if (helper.hasExampleValue()) {
      res = helper.getExampleValue();
    } else if (helper.getType() === 'alternatives') {
      const altHelper = helper.getAlternatives()[0];
      if (altHelper) {
        res = this._createRaw(altHelper, deepLevel + 1);
      }
    } else if (helper.getType() === 'object'){
      const children = helper.getChildren();
      const obj: Record<string, unknown> = {};
      Object.keys(children).forEach(
        name => {
          obj[name] = this._createRaw(children[name], deepLevel + 1);
        }
      );
      res = obj;
    } else if (helper.getType() === 'array') {
      const item = helper.getFirstItem();
      const arr: unknown[] = [];
      if(item) {
        const rawItem = this._createRaw(item, deepLevel + 1);
        if(rawItem) {
          arr.push(rawItem);
        }
      }
      res = arr;
    } else if (helperType.format) {
      res = `<${helperType.format}>`;
    } else {
      res = `<${helperType.type}>`;
    }
    return res;
  }

  private _createFormDataEntity(
    name: string,
    helper: PostmanHelperInterface,
    isFile = false
  ): FormParameter {
    let res: FormParameter;
    const helperType = formatType(helper.getType());
    if (helperType.format === 'binary' || isFile) {
      res = this._createSrcFormData(name, helper);
    } else {
      res = this._createValueFormData(name, helper);
    }

    const description = helper.getDescription();
    if (helper.hasDescriptionType?.() && helper.getDescriptionType) {
      res.description = {
        type: helper.getDescriptionType(),
        content: description
      };
    } else {
      res.description = description;
    }

    if (helper.hasContentType?.() && helper.getContentType) {
      res.contentType = helper.getContentType();
    }
    return res;
  }

  private _createSrcFormData(
    name: string,
    helper: PostmanHelperInterface
  ): SrcFormParameter {
    const res: SrcFormParameter = {
      key: name,
      type: 'file',
      disabled: !helper.isRequired()
    };

    if (helper.getType() === 'alternatives') {
      const altHelper = helper.getAlternatives()[0];
      if (altHelper) {
        return this._createSrcFormData(name, altHelper);
      }
    }
    
    if(helper.getType() === 'array') {
      res.src = [];
    } else {
      res.src = null;
    } 

    return res;
  }

  private _createValueFormData(
    name: string,
    helper: PostmanHelperInterface
  ): ValueFormParameter {
    const res: ValueFormParameter = {
      key: name,
      type: 'text',
      disabled: !helper.isRequired()
    };

    const raw = this._createRaw(helper);
    if (typeof raw != 'undefined' && raw != null) {
      if (typeof raw !== 'string') {
        res.value = JSON.stringify(raw);
      } else if(typeof raw === 'string') {
        res.value = raw;
      }
    }

    return res;
  }

}