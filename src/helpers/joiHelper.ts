/**
 * @module helpers-joi
 */

import { BaseHelperInterface } from './baseHelper';
import { VALID_TYPES } from '../utils/genericUtils';
import { Schema } from 'joi'

interface JoiRule {
  name: string;
  method: string;
  args: {
    limit?: number;
    [key: string]: unknown;
  };
  _resolve?: unknown[];
  operator?: string;
  [key: string]: unknown;
}

export type JoiSchema = Partial<Schema> & {
  _valids?: {
    _values?: Set<unknown>;
    [key: string]: unknown;
  },
  _singleRules?: Map<string, JoiRule>;
  _rules?: JoiRule[];
}

/**
 * Types:
 * 
  'alternatives',
  'any',
  'array',
  'boolean',
  'date',
  'function',
  'link',
  'number',
  'object',
  'string',
  'symbol',
  'binary'
 */

export class JoiHelper implements BaseHelperInterface {
  protected _joi: JoiSchema;

  constructor(joiObject: JoiSchema | unknown = {}) {
    this._joi = joiObject && typeof joiObject === 'object' ? joiObject : {};
  }

  protected isJoi(): boolean {
    return (this._joi
      && typeof this._joi.type === 'string'
      && this._joi.$_terms
      && this._joi.$) ? true : false;
  }

  protected hasMeta(v: string): boolean {
    if (!this.isJoi()) {
      return false;
    }
    return typeof this._joi?.['$_terms']?.metas?.[0]?.[v] !== 'undefined' ? 
      true : false;
  }

  protected getMeta(v: string): unknown {
    if (!this.hasMeta(v)) {
      return;
    }
    return this._joi?.['$_terms']?.metas?.[0]?.[v];
  }

  isValid(): boolean {
    return this.isJoi();
  }

  getType(): string {
    let res = '';
    if (!this.isJoi()) {
      return res;
    }
    if (typeof this._joi.type === 'string') {
      res = this._joi.type;
    }

    // find format from 'metas' or '_rules
    const metaFormat: unknown = this.getMeta('format');
    if (metaFormat && typeof metaFormat === 'string' && VALID_TYPES.includes(metaFormat)) {
      res = metaFormat;
    } else if (this._joi._rules) {
      const rule = this._joi._rules.find(v => VALID_TYPES.includes(v.name));
      if (rule) {
        res = rule.name;
      }
    }

    if(res === 'dataUri') {
      res = 'uri';
    }

    return res;
  }

  getDescription(): string {
    let res = '';
    if (!this.isJoi()) {
      return res;
    }
    if (this._joi._flags
      && typeof this._joi._flags.description === 'string') {
      res = this._joi._flags.description;
    }
    return res;
  }

  isRequired(): boolean {
    let res = false;
    if (!this.isJoi()) {
      return res;
    }
    if (this._joi._flags
      && this._joi._flags.presence === 'required') {
      res = true;
    }
    return res;
  }

  isUnique(): boolean {
    let res = false;
    if (!this.isJoi()) {
      return res;
    }
    if (this._joi._rules
      && this._joi._rules.some(v => v.name == 'unique')) {
      res = true;
    }
    return res;
  }

  hasDefaultValue(): boolean {
    if (!this.isJoi()) {
      return false;
    }
    return this._joi._flags
      && typeof this._joi._flags.default !== 'undefined' ? true : false;
  }

  getDefaultValue(): unknown {
    if (!this.isJoi()) {
      return;
    }
    let res;
    if (this._joi._flags) {
      res = this._joi._flags.default;
    }
    return res;
  }

  hasExampleValue(): boolean {
    if (!this.isJoi()) {
      return false;
    }
    return this._joi['$_terms']
      && this._joi['$_terms'].examples
      && typeof this._joi['$_terms'].examples[0] !== 'undefined' ? true : false;
  }

  getExampleValue(): unknown {
    if (!this.isJoi()) {
      return;
    }
    let res;
    if (this._joi['$_terms'] && this._joi['$_terms'].examples) {
      res = this._joi['$_terms'].examples[0];
    }
    return res;
  }

  isDeprecated(): boolean {
    if (!this.isJoi()) {
      return false;
    }
    return this._joi['$_terms']
      && this._joi['$_terms'].metas
      && this._joi['$_terms'].metas[0]
      && this._joi['$_terms'].metas[0].deprecated ? true : false;
  }

  allowsEmptyValue(): boolean {
    let r = false;
    if (!this.isJoi()) {
      return r;
    }
    if (this._joi._valids
      && this._joi._valids._values) {
      const _values = this._joi._valids._values;
      r = ['', null].some(v => _values.has(v))
    }
    return r;
  }

  getEnum(): unknown[] {
    const r: unknown[] = [];
    if (!this.isJoi()) {
      return r;
    }
    if (this._joi._flags
      && this._joi._flags.only
      && this._joi._valids
      && this._joi._valids._values) {
      this._joi._valids._values.forEach(
        v => r.push(v)
      );
    }
    return r;
  }

  hasMin(): boolean {
    let r = false;
    if (!this.isJoi()) {
      return r;
    }
    if (this._joi._singleRules && this._joi._singleRules.has('min')) {
      r = true;
    }
    return r;
  }

  hasMax(): boolean {
    let r = false;
    if (!this.isJoi()) {
      return r;
    }
    if (this._joi._singleRules && this._joi._singleRules.has('max')) {
      r = true;
    }
    return r;
  }

  getMin(): number | undefined {
    if (!this.isJoi()) {
      return;
    }
    let r;
    if (this.hasMin() && this._joi._singleRules) {
      const min = this._joi._singleRules.get('min');
      if (min) {
        r = min.args.limit;
      }
    }
    return r;
  }

  getMax(): number | undefined {
    if (!this.isJoi()) {
      return;
    }
    let r;
    if (this.hasMax() && this._joi._singleRules) {
      const max = this._joi._singleRules.get('max');
      if (max) {
        r = max.args.limit;
      }
    }
    return r;
  }

  getUnit(): string {
    if (!this.isJoi()) {
      return '';
    }
    return this._joi._flags && this._joi._flags.unit;
  }
}