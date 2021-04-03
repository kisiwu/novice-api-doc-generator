"use strict";
var _schema, _min, _max, _oneOf;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaCreator = void 0;
const tslib_1 = require("tslib");
const extend_1 = tslib_1.__importDefault(require("extend"));
class SchemaCreator {
    constructor(schema = {}) {
        _schema.set(this, void 0);
        _min.set(this, void 0);
        _max.set(this, void 0);
        _oneOf.set(this, void 0);
        tslib_1.__classPrivateFieldSet(this, _schema, schema);
        tslib_1.__classPrivateFieldSet(this, _oneOf, []);
    }
    addOneOf(schema) {
        tslib_1.__classPrivateFieldGet(this, _oneOf).push(schema);
        return this;
    }
    getOneOf() {
        return tslib_1.__classPrivateFieldGet(this, _oneOf);
    }
    isRequired() {
        var _a;
        let res = false;
        if ((_a = tslib_1.__classPrivateFieldGet(this, _schema).required) === null || _a === void 0 ? void 0 : _a.length) {
            res = true;
        }
        return res;
    }
    isType(typeName) {
        return typeName === tslib_1.__classPrivateFieldGet(this, _schema).type;
    }
    hasProperties() {
        return tslib_1.__classPrivateFieldGet(this, _schema).properties ? true : false;
    }
    getProperty(propertyName) {
        const props = tslib_1.__classPrivateFieldGet(this, _schema).properties || {};
        return props[propertyName];
    }
    getType() {
        return tslib_1.__classPrivateFieldGet(this, _schema).type;
    }
    getMin() {
        return tslib_1.__classPrivateFieldGet(this, _min);
    }
    getMax() {
        return tslib_1.__classPrivateFieldGet(this, _max);
    }
    getRequired() {
        return tslib_1.__classPrivateFieldGet(this, _schema).required;
    }
    addRequired(propertyName) {
        tslib_1.__classPrivateFieldGet(this, _schema).required = tslib_1.__classPrivateFieldGet(this, _schema).required || [];
        if (!tslib_1.__classPrivateFieldGet(this, _schema).required.includes(propertyName)) {
            tslib_1.__classPrivateFieldGet(this, _schema).required.push(propertyName);
        }
        return this;
    }
    setRequired(properties) {
        tslib_1.__classPrivateFieldGet(this, _schema).required = properties;
        return this;
    }
    setProperty(propertyName, schema) {
        tslib_1.__classPrivateFieldGet(this, _schema).properties = tslib_1.__classPrivateFieldGet(this, _schema).properties || {};
        tslib_1.__classPrivateFieldGet(this, _schema).properties[propertyName] = schema;
        return this;
    }
    setProperties(properties) {
        tslib_1.__classPrivateFieldGet(this, _schema).properties = properties;
        return this;
    }
    setSchema(schema) {
        tslib_1.__classPrivateFieldSet(this, _schema, schema);
        return this;
    }
    setDiscriminator(discriminator) {
        tslib_1.__classPrivateFieldGet(this, _schema).discriminator = discriminator;
        return this;
    }
    setXml(xml) {
        tslib_1.__classPrivateFieldGet(this, _schema).xml = xml;
        return this;
    }
    setType(typeName) {
        tslib_1.__classPrivateFieldGet(this, _schema).type = typeName;
        return this;
    }
    setFormat(format) {
        tslib_1.__classPrivateFieldGet(this, _schema).format = format;
        return this;
    }
    setDescription(value) {
        tslib_1.__classPrivateFieldGet(this, _schema).description = value;
        return this;
    }
    getDescription() {
        return tslib_1.__classPrivateFieldGet(this, _schema).description;
    }
    setAllowEmptyValue(bool) {
        tslib_1.__classPrivateFieldGet(this, _schema).allowEmptyValue = bool;
        return this;
    }
    setDefault(value) {
        tslib_1.__classPrivateFieldGet(this, _schema).default = value;
        return this;
    }
    setExample(value) {
        tslib_1.__classPrivateFieldGet(this, _schema).example = value;
        return this;
    }
    setEnum(value) {
        tslib_1.__classPrivateFieldGet(this, _schema).enum = value;
        return this;
    }
    setMin(value) {
        tslib_1.__classPrivateFieldSet(this, _min, value);
        return this;
    }
    setMax(value) {
        tslib_1.__classPrivateFieldSet(this, _max, value);
        return this;
    }
    setItems(schema) {
        tslib_1.__classPrivateFieldGet(this, _schema).items = schema;
        return this;
    }
    setUniqueItems(bool) {
        tslib_1.__classPrivateFieldGet(this, _schema).uniqueItems = bool;
        return this;
    }
    setAdditionalProperties(value) {
        tslib_1.__classPrivateFieldGet(this, _schema).additionalProperties = value;
        return this;
    }
    setDeprecated(bool) {
        tslib_1.__classPrivateFieldGet(this, _schema).deprecated = bool;
        return this;
    }
    toObject() {
        const copy = extend_1.default(true, {}, tslib_1.__classPrivateFieldGet(this, _schema));
        // min
        if (typeof tslib_1.__classPrivateFieldGet(this, _min) !== 'undefined') {
            if (copy.type === 'array') {
                copy.minItems = tslib_1.__classPrivateFieldGet(this, _min);
            }
            else if (copy.type === 'object') {
                copy.minProperties = tslib_1.__classPrivateFieldGet(this, _min);
            }
            else if (copy.type === 'string') {
                copy.minLength = tslib_1.__classPrivateFieldGet(this, _min);
            }
            else {
                copy.minimum = tslib_1.__classPrivateFieldGet(this, _min);
            }
        }
        // max
        if (typeof tslib_1.__classPrivateFieldGet(this, _max) !== 'undefined') {
            if (copy.type === 'array') {
                copy.maxItems = tslib_1.__classPrivateFieldGet(this, _max);
            }
            else if (copy.type === 'object') {
                copy.maxProperties = tslib_1.__classPrivateFieldGet(this, _max);
            }
            else if (copy.type === 'string') {
                copy.maxLength = tslib_1.__classPrivateFieldGet(this, _max);
            }
            else {
                copy.maximum = tslib_1.__classPrivateFieldGet(this, _max);
            }
        }
        // required
        if (Array.isArray(copy.required) && !copy.required.length) {
            delete copy.required;
        }
        return copy;
    }
}
exports.SchemaCreator = SchemaCreator;
_schema = new WeakMap(), _min = new WeakMap(), _max = new WeakMap(), _oneOf = new WeakMap();
//# sourceMappingURL=schemaService.js.map