"use strict";
/**
 * @module helpers-joi
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoiHelper = void 0;
const genericUtils_1 = require("../utils/genericUtils");
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
class JoiHelper {
    constructor(joiObject = {}) {
        this._joi = joiObject && typeof joiObject === 'object' ? joiObject : {};
    }
    isJoi() {
        return (this._joi
            && typeof this._joi.type === 'string'
            && this._joi.$_terms
            && this._joi.$) ? true : false;
    }
    hasMeta(v) {
        var _a, _b, _c, _d;
        if (!this.isJoi()) {
            return false;
        }
        return typeof ((_d = (_c = (_b = (_a = this._joi) === null || _a === void 0 ? void 0 : _a['$_terms']) === null || _b === void 0 ? void 0 : _b.metas) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d[v]) !== 'undefined' ?
            true : false;
    }
    getMeta(v) {
        var _a, _b, _c, _d;
        if (!this.hasMeta(v)) {
            return;
        }
        return (_d = (_c = (_b = (_a = this._joi) === null || _a === void 0 ? void 0 : _a['$_terms']) === null || _b === void 0 ? void 0 : _b.metas) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d[v];
    }
    isValid() {
        return this.isJoi();
    }
    getType() {
        let res = '';
        if (!this.isJoi()) {
            return res;
        }
        if (typeof this._joi.type === 'string') {
            res = this._joi.type;
        }
        // find format from 'metas' or '_rules
        const metaFormat = this.getMeta('format');
        if (metaFormat && typeof metaFormat === 'string' && genericUtils_1.VALID_TYPES.includes(metaFormat)) {
            res = metaFormat;
        }
        else if (this._joi._rules) {
            const rule = this._joi._rules.find(v => genericUtils_1.VALID_TYPES.includes(v.name));
            if (rule) {
                res = rule.name;
            }
        }
        if (res === 'dataUri') {
            res = 'uri';
        }
        return res;
    }
    getDescription() {
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
    isRequired() {
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
    isUnique() {
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
    hasDefaultValue() {
        if (!this.isJoi()) {
            return false;
        }
        return this._joi._flags
            && typeof this._joi._flags.default !== 'undefined' ? true : false;
    }
    getDefaultValue() {
        if (!this.isJoi()) {
            return;
        }
        let res;
        if (this._joi._flags) {
            res = this._joi._flags.default;
        }
        return res;
    }
    hasExampleValue() {
        if (!this.isJoi()) {
            return false;
        }
        return this._joi['$_terms']
            && this._joi['$_terms'].examples
            && typeof this._joi['$_terms'].examples[0] !== 'undefined' ? true : false;
    }
    getExampleValue() {
        if (!this.isJoi()) {
            return;
        }
        let res;
        if (this._joi['$_terms'] && this._joi['$_terms'].examples) {
            res = this._joi['$_terms'].examples[0];
        }
        return res;
    }
    isDeprecated() {
        if (!this.isJoi()) {
            return false;
        }
        return this._joi['$_terms']
            && this._joi['$_terms'].metas
            && this._joi['$_terms'].metas[0]
            && this._joi['$_terms'].metas[0].deprecated ? true : false;
    }
    allowsEmptyValue() {
        let r = false;
        if (!this.isJoi()) {
            return r;
        }
        if (this._joi._valids
            && this._joi._valids._values) {
            const _values = this._joi._valids._values;
            r = ['', null].some(v => _values.has(v));
        }
        return r;
    }
    getEnum() {
        const r = [];
        if (!this.isJoi()) {
            return r;
        }
        if (this._joi._flags
            && this._joi._flags.only
            && this._joi._valids
            && this._joi._valids._values) {
            this._joi._valids._values.forEach(v => r.push(v));
        }
        return r;
    }
    hasMin() {
        let r = false;
        if (!this.isJoi()) {
            return r;
        }
        if (this._joi._singleRules && this._joi._singleRules.has('min')) {
            r = true;
        }
        return r;
    }
    hasMax() {
        let r = false;
        if (!this.isJoi()) {
            return r;
        }
        if (this._joi._singleRules && this._joi._singleRules.has('max')) {
            r = true;
        }
        return r;
    }
    getMin() {
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
    getMax() {
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
    getUnit() {
        if (!this.isJoi()) {
            return '';
        }
        return this._joi._flags && this._joi._flags.unit;
    }
}
exports.JoiHelper = JoiHelper;
//# sourceMappingURL=joiHelper.js.map