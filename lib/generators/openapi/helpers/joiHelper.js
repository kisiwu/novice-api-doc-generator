"use strict";
/**
 * @module openapi-helpers-joi
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenApiJoiHelper = void 0;
const joiHelper_1 = require("../../../helpers/joiHelper");
class OpenApiJoiHelper extends joiHelper_1.JoiHelper {
    getFirstItem() {
        if (!this.isJoi()) {
            return;
        }
        let r;
        if (this._joi.$_terms
            && this._joi.$_terms.items
            && this._joi.$_terms.items[0]) {
            r = new OpenApiJoiHelper(this._joi.$_terms.items[0]);
        }
        return r;
    }
    getChildren() {
        const r = {};
        if (!this.isJoi()) {
            return r;
        }
        if (this._joi.$_terms
            && this._joi.$_terms.keys && this._joi.$_terms.keys.length) {
            this._joi.$_terms.keys.forEach((c) => r[c.key] = new OpenApiJoiHelper(c.schema));
        }
        return r;
    }
    getAlternatives() {
        const r = [];
        if (!this.isJoi()) {
            return r;
        }
        if (this._joi.$_terms
            && this._joi.$_terms.matches && this._joi.$_terms.matches.length) {
            this._joi.$_terms.matches.forEach((c) => {
                if (c.schema) {
                    r.push(new OpenApiJoiHelper(c.schema));
                }
            });
        }
        return r;
    }
    hasStyle() {
        if (!this.isJoi()) {
            return false;
        }
        return this._joi['$_terms']
            && this._joi['$_terms'].metas
            && this._joi['$_terms'].metas[0]
            && this._joi['$_terms'].metas[0].style
            && typeof this._joi['$_terms'].metas[0].style === 'string' ? true : false;
    }
    getStyle() {
        if (!this.isJoi()) {
            return '';
        }
        return this._joi['$_terms']
            && this._joi['$_terms'].metas
            && this._joi['$_terms'].metas[0]
            && this._joi['$_terms'].metas[0].style;
    }
    hasAdditionalProperties() {
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
    getAdditionalProperties() {
        if (!this.isJoi()) {
            return false;
        }
        return this._joi['$_terms']
            && this._joi['$_terms'].metas
            && this._joi['$_terms'].metas[0]
            && this._joi['$_terms'].metas[0].additionalProperties;
    }
    hasRef() {
        if (!this.isJoi()) {
            return false;
        }
        return this._joi['$_terms']
            && this._joi['$_terms'].metas
            && this._joi['$_terms'].metas[0]
            && this._joi['$_terms'].metas[0].ref
            && typeof this._joi['$_terms'].metas[0].ref === 'string' ? true : false;
    }
    getRef() {
        if (!this.isJoi()) {
            return;
        }
        return this._joi['$_terms']
            && this._joi['$_terms'].metas
            && this._joi['$_terms'].metas[0]
            && this._joi['$_terms'].metas[0].ref;
    }
    hasDiscriminator() {
        if (!this.isJoi()) {
            return false;
        }
        return this._joi['$_terms']
            && this._joi['$_terms'].metas
            && this._joi['$_terms'].metas[0]
            && this._joi['$_terms'].metas[0].discriminator
            && typeof this._joi['$_terms'].metas[0].discriminator === 'object' ? true : false;
    }
    getDiscriminator() {
        if (!this.isJoi()) {
            return;
        }
        return this._joi['$_terms']
            && this._joi['$_terms'].metas
            && this._joi['$_terms'].metas[0]
            && this._joi['$_terms'].metas[0].discriminator;
    }
    hasXml() {
        if (!this.isJoi()) {
            return false;
        }
        return this._joi['$_terms']
            && this._joi['$_terms'].metas
            && this._joi['$_terms'].metas[0]
            && this._joi['$_terms'].metas[0].xml
            && typeof this._joi['$_terms'].metas[0].xml === 'object' ? true : false;
    }
    getXml() {
        if (!this.isJoi()) {
            return;
        }
        return this._joi['$_terms']
            && this._joi['$_terms'].metas
            && this._joi['$_terms'].metas[0]
            && this._joi['$_terms'].metas[0].xml;
    }
    hasExamples() {
        if (!this.isJoi()) {
            return false;
        }
        return this._joi['$_terms']
            && this._joi['$_terms'].metas
            && this._joi['$_terms'].metas[0]
            && this._joi['$_terms'].metas[0].examples
            && typeof this._joi['$_terms'].metas[0].examples === 'object' ? true : false;
    }
    getExamples() {
        if (!this.isJoi()) {
            return;
        }
        return this._joi['$_terms']
            && this._joi['$_terms'].metas
            && this._joi['$_terms'].metas[0]
            && this._joi['$_terms'].metas[0].examples;
    }
    hasEncoding() {
        if (!this.isJoi()) {
            return false;
        }
        return this._joi['$_terms']
            && this._joi['$_terms'].metas
            && this._joi['$_terms'].metas[0]
            && this._joi['$_terms'].metas[0].encoding
            && typeof this._joi['$_terms'].metas[0].encoding === 'object' ? true : false;
    }
    getEncoding() {
        if (!this.isJoi()) {
            return;
        }
        return this._joi['$_terms']
            && this._joi['$_terms'].metas
            && this._joi['$_terms'].metas[0]
            && this._joi['$_terms'].metas[0].encoding;
    }
}
exports.OpenApiJoiHelper = OpenApiJoiHelper;
//# sourceMappingURL=joiHelper.js.map