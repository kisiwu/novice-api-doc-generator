"use strict";
var _mediaType;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaTypeCreator = void 0;
const tslib_1 = require("tslib");
const extend_1 = tslib_1.__importDefault(require("extend"));
class MediaTypeCreator {
    constructor(mediaType = {}) {
        _mediaType.set(this, void 0);
        tslib_1.__classPrivateFieldSet(this, _mediaType, mediaType);
    }
    setExample(value) {
        tslib_1.__classPrivateFieldGet(this, _mediaType).example = value;
        return this;
    }
    setExamples(examples) {
        tslib_1.__classPrivateFieldGet(this, _mediaType).examples = examples;
        return this;
    }
    setEncoding(encoding) {
        tslib_1.__classPrivateFieldGet(this, _mediaType).encoding = encoding;
        return this;
    }
    setSchema(schema) {
        tslib_1.__classPrivateFieldGet(this, _mediaType).schema = schema;
        return this;
    }
    toObject() {
        const copy = extend_1.default(true, {}, tslib_1.__classPrivateFieldGet(this, _mediaType));
        return copy;
    }
}
exports.MediaTypeCreator = MediaTypeCreator;
_mediaType = new WeakMap();
//# sourceMappingURL=mediaTypeService.js.map