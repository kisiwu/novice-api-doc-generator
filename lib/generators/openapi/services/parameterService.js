"use strict";
var _param;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParameterCreator = void 0;
const tslib_1 = require("tslib");
const extend_1 = tslib_1.__importDefault(require("extend"));
class ParameterCreator {
    constructor(param) {
        _param.set(this, void 0);
        tslib_1.__classPrivateFieldSet(this, _param, param);
    }
    isRequired() {
        let res = false;
        if (tslib_1.__classPrivateFieldGet(this, _param).required) {
            res = true;
        }
        return res;
    }
    setRequired(bool) {
        tslib_1.__classPrivateFieldGet(this, _param).required = bool;
        return this;
    }
    setContent(content) {
        tslib_1.__classPrivateFieldGet(this, _param).content = content;
        return this;
    }
    getSchemaProp(prop) {
        const schema = tslib_1.__classPrivateFieldGet(this, _param).schema || {};
        return schema[prop];
    }
    setSchemaProp(prop, value) {
        tslib_1.__classPrivateFieldGet(this, _param).schema = tslib_1.__classPrivateFieldGet(this, _param).schema || {};
        tslib_1.__classPrivateFieldGet(this, _param).schema[prop] = value;
        return this;
    }
    setSchema(value) {
        tslib_1.__classPrivateFieldGet(this, _param).schema = value;
        return this;
    }
    setDescription(value) {
        tslib_1.__classPrivateFieldGet(this, _param).description = value;
        return this;
    }
    getDescription() {
        return tslib_1.__classPrivateFieldGet(this, _param).description;
    }
    setAllowEmptyValue(bool) {
        tslib_1.__classPrivateFieldGet(this, _param).allowEmptyValue = bool;
        return this;
    }
    setAllowReserved(bool) {
        tslib_1.__classPrivateFieldGet(this, _param).allowReserved = bool;
        return this;
    }
    setExample(value) {
        tslib_1.__classPrivateFieldGet(this, _param).example = value;
        return this;
    }
    setExamples(value) {
        tslib_1.__classPrivateFieldGet(this, _param).examples = value;
        return this;
    }
    setExplode(bool) {
        tslib_1.__classPrivateFieldGet(this, _param).explode = bool;
        return this;
    }
    setDeprecated(bool) {
        tslib_1.__classPrivateFieldGet(this, _param).deprecated = bool;
        return this;
    }
    setStyle(style) {
        tslib_1.__classPrivateFieldGet(this, _param).style = style;
        return this;
    }
    hasStyle() {
        return typeof tslib_1.__classPrivateFieldGet(this, _param).style === 'undefined' ? false : true;
    }
    toObject() {
        const copy = extend_1.default(true, {}, tslib_1.__classPrivateFieldGet(this, _param));
        return copy;
    }
}
exports.ParameterCreator = ParameterCreator;
_param = new WeakMap();
//# sourceMappingURL=parameterService.js.map