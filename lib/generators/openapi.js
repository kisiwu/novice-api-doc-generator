"use strict";
/**
 * @module openapi
 */
var _consumes, _result, _security, _helperClass, _responsesProperty, _generateComponentsRule;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenApi = exports.GenerateComponentsRules = void 0;
const tslib_1 = require("tslib");
/**
 * @todo: getters
 * @todo: change var, method names ...
 * @todo add debug logs
 */
const definitions_1 = require("./openapi/definitions");
const joiHelper_1 = require("./openapi/helpers/joiHelper");
const schemaService_1 = require("./openapi/services/schemaService");
const parameterService_1 = require("./openapi/services/parameterService");
const mediaTypeService_1 = require("./openapi/services/mediaTypeService");
const utils_1 = require("./openapi/utils");
const extend_1 = tslib_1.__importDefault(require("extend"));
var GenerateComponentsRules;
(function (GenerateComponentsRules) {
    GenerateComponentsRules["always"] = "always";
    GenerateComponentsRules["ifUndefined"] = "ifUndefined";
    GenerateComponentsRules["never"] = "never";
})(GenerateComponentsRules = exports.GenerateComponentsRules || (exports.GenerateComponentsRules = {}));
/**
 * @note For now it is not possible to only
 * send files outside of object property (multipart).
 * Well, at least not tried yet
 * but it definitely doesn't work with alternatives
 */
class OpenApi {
    constructor(helperClass = joiHelper_1.OpenApiJoiHelper) {
        _consumes.set(this, void 0);
        _result.set(this, void 0);
        _security.set(this, void 0);
        _helperClass.set(this, void 0);
        _responsesProperty.set(this, void 0);
        _generateComponentsRule.set(this, GenerateComponentsRules.always);
        tslib_1.__classPrivateFieldSet(this, _consumes, []);
        tslib_1.__classPrivateFieldSet(this, _helperClass, helperClass);
        tslib_1.__classPrivateFieldSet(this, _result, {
            openapi: '3.0.0',
            info: {
                version: '1.0.0',
                title: '@novice1 API',
                license: {
                    name: 'MIT',
                },
            },
            servers: [],
            paths: {},
            components: {},
            tags: []
        });
        tslib_1.__classPrivateFieldSet(this, _security, []);
    }
    setGenerateComponentsRule(v) {
        const value = GenerateComponentsRules[v];
        if (value) {
            tslib_1.__classPrivateFieldSet(this, _generateComponentsRule, value);
        }
        return this;
    }
    getGenerateComponentsRule() {
        return tslib_1.__classPrivateFieldGet(this, _generateComponentsRule);
    }
    setResponsesProperty(v) {
        tslib_1.__classPrivateFieldSet(this, _responsesProperty, v);
        return this;
    }
    getResponsesProperty() {
        return tslib_1.__classPrivateFieldGet(this, _responsesProperty);
    }
    setConsumes(v) {
        tslib_1.__classPrivateFieldSet(this, _consumes, v);
        return this;
    }
    getConsumes() {
        return tslib_1.__classPrivateFieldGet(this, _consumes);
    }
    removeCallback(name) {
        let r;
        if (tslib_1.__classPrivateFieldGet(this, _result).components.callbacks) {
            r = tslib_1.__classPrivateFieldGet(this, _result).components.callbacks[name];
            delete tslib_1.__classPrivateFieldGet(this, _result).components.callbacks[name];
        }
        return r;
    }
    hasCallback(name) {
        var _a, _b;
        let r = false;
        if ((_b = (_a = tslib_1.__classPrivateFieldGet(this, _result).components) === null || _a === void 0 ? void 0 : _a.callbacks) === null || _b === void 0 ? void 0 : _b[name]) {
            r = true;
        }
        return r;
    }
    addCallback(name, callback) {
        if (!tslib_1.__classPrivateFieldGet(this, _result).components.callbacks) {
            tslib_1.__classPrivateFieldGet(this, _result).components.callbacks = {};
        }
        tslib_1.__classPrivateFieldGet(this, _result).components.callbacks[name] = callback;
        return this;
    }
    /**
     *
     * @returns removed callbacks
     */
    cleanupCallbacks() {
        const r = {};
        const refs = JSON.stringify(tslib_1.__classPrivateFieldGet(this, _result)).match(/#\/components\/callbacks\/[^/"]*/g);
        if (tslib_1.__classPrivateFieldGet(this, _result).components.callbacks) {
            Object.keys(tslib_1.__classPrivateFieldGet(this, _result).components.callbacks).forEach(name => {
                var _a, _b;
                if (!(refs === null || refs === void 0 ? void 0 : refs.includes(`#/components/callbacks/${name}`))) {
                    if ((_b = (_a = tslib_1.__classPrivateFieldGet(this, _result).components) === null || _a === void 0 ? void 0 : _a.callbacks) === null || _b === void 0 ? void 0 : _b[name]) {
                        r[name] = tslib_1.__classPrivateFieldGet(this, _result).components.callbacks[name];
                        delete tslib_1.__classPrivateFieldGet(this, _result).components.callbacks[name];
                    }
                }
            });
        }
        return r;
    }
    removeLink(name) {
        let r;
        if (tslib_1.__classPrivateFieldGet(this, _result).components.links) {
            r = tslib_1.__classPrivateFieldGet(this, _result).components.links[name];
            delete tslib_1.__classPrivateFieldGet(this, _result).components.links[name];
        }
        return r;
    }
    hasLink(name) {
        var _a, _b;
        let r = false;
        if ((_b = (_a = tslib_1.__classPrivateFieldGet(this, _result).components) === null || _a === void 0 ? void 0 : _a.links) === null || _b === void 0 ? void 0 : _b[name]) {
            r = true;
        }
        return r;
    }
    addLink(name, link) {
        if (!tslib_1.__classPrivateFieldGet(this, _result).components.links) {
            tslib_1.__classPrivateFieldGet(this, _result).components.links = {};
        }
        tslib_1.__classPrivateFieldGet(this, _result).components.links[name] = link;
        return this;
    }
    /**
     *
     * @returns removed links
     */
    cleanupLinks() {
        const r = {};
        const refs = JSON.stringify(tslib_1.__classPrivateFieldGet(this, _result)).match(/#\/components\/links\/[^/"]*/g);
        if (tslib_1.__classPrivateFieldGet(this, _result).components.links) {
            Object.keys(tslib_1.__classPrivateFieldGet(this, _result).components.links).forEach(name => {
                var _a, _b;
                if (!(refs === null || refs === void 0 ? void 0 : refs.includes(`#/components/links/${name}`))) {
                    if ((_b = (_a = tslib_1.__classPrivateFieldGet(this, _result).components) === null || _a === void 0 ? void 0 : _a.links) === null || _b === void 0 ? void 0 : _b[name]) {
                        r[name] = tslib_1.__classPrivateFieldGet(this, _result).components.links[name];
                        delete tslib_1.__classPrivateFieldGet(this, _result).components.links[name];
                    }
                }
            });
        }
        return r;
    }
    removeExample(name) {
        let r;
        if (tslib_1.__classPrivateFieldGet(this, _result).components.examples) {
            r = tslib_1.__classPrivateFieldGet(this, _result).components.examples[name];
            delete tslib_1.__classPrivateFieldGet(this, _result).components.examples[name];
        }
        return r;
    }
    hasExample(name) {
        var _a, _b;
        let r = false;
        if ((_b = (_a = tslib_1.__classPrivateFieldGet(this, _result).components) === null || _a === void 0 ? void 0 : _a.examples) === null || _b === void 0 ? void 0 : _b[name]) {
            r = true;
        }
        return r;
    }
    addExample(name, example) {
        if (!tslib_1.__classPrivateFieldGet(this, _result).components.examples) {
            tslib_1.__classPrivateFieldGet(this, _result).components.examples = {};
        }
        tslib_1.__classPrivateFieldGet(this, _result).components.examples[name] = example;
        return this;
    }
    /**
     *
     * @returns removed examples
     */
    cleanupExamples() {
        const r = {};
        const refs = JSON.stringify(tslib_1.__classPrivateFieldGet(this, _result)).match(/#\/components\/examples\/[^/"]*/g);
        if (tslib_1.__classPrivateFieldGet(this, _result).components.examples) {
            Object.keys(tslib_1.__classPrivateFieldGet(this, _result).components.examples).forEach(name => {
                var _a, _b;
                if (!(refs === null || refs === void 0 ? void 0 : refs.includes(`#/components/examples/${name}`))) {
                    if ((_b = (_a = tslib_1.__classPrivateFieldGet(this, _result).components) === null || _a === void 0 ? void 0 : _a.examples) === null || _b === void 0 ? void 0 : _b[name]) {
                        r[name] = tslib_1.__classPrivateFieldGet(this, _result).components.examples[name];
                        delete tslib_1.__classPrivateFieldGet(this, _result).components.examples[name];
                    }
                }
            });
        }
        return r;
    }
    removeSchema(name) {
        let r;
        if (tslib_1.__classPrivateFieldGet(this, _result).components.schemas) {
            r = tslib_1.__classPrivateFieldGet(this, _result).components.schemas[name];
            delete tslib_1.__classPrivateFieldGet(this, _result).components.schemas[name];
        }
        return r;
    }
    hasSchema(name) {
        var _a, _b;
        let r = false;
        if ((_b = (_a = tslib_1.__classPrivateFieldGet(this, _result).components) === null || _a === void 0 ? void 0 : _a.schemas) === null || _b === void 0 ? void 0 : _b[name]) {
            r = true;
        }
        return r;
    }
    addSchema(name, schema) {
        if (!tslib_1.__classPrivateFieldGet(this, _result).components.schemas) {
            tslib_1.__classPrivateFieldGet(this, _result).components.schemas = {};
        }
        tslib_1.__classPrivateFieldGet(this, _result).components.schemas[name] = schema;
        return this;
    }
    /**
     *
     * @returns removed schemas
     */
    cleanupSchemas() {
        const r = {};
        const refs = JSON.stringify(tslib_1.__classPrivateFieldGet(this, _result)).match(/#\/components\/schemas\/[^/"]*/g);
        if (tslib_1.__classPrivateFieldGet(this, _result).components.schemas) {
            Object.keys(tslib_1.__classPrivateFieldGet(this, _result).components.schemas).forEach(name => {
                var _a, _b;
                if (!(refs === null || refs === void 0 ? void 0 : refs.includes(`#/components/schemas/${name}`))) {
                    if ((_b = (_a = tslib_1.__classPrivateFieldGet(this, _result).components) === null || _a === void 0 ? void 0 : _a.schemas) === null || _b === void 0 ? void 0 : _b[name]) {
                        r[name] = tslib_1.__classPrivateFieldGet(this, _result).components.schemas[name];
                        delete tslib_1.__classPrivateFieldGet(this, _result).components.schemas[name];
                    }
                }
            });
        }
        return r;
    }
    removeHeader(name) {
        let r;
        if (tslib_1.__classPrivateFieldGet(this, _result).components.headers) {
            r = tslib_1.__classPrivateFieldGet(this, _result).components.headers[name];
            delete tslib_1.__classPrivateFieldGet(this, _result).components.headers[name];
        }
        return r;
    }
    hasHeader(name) {
        var _a, _b;
        let r = false;
        if ((_b = (_a = tslib_1.__classPrivateFieldGet(this, _result).components) === null || _a === void 0 ? void 0 : _a.headers) === null || _b === void 0 ? void 0 : _b[name]) {
            r = true;
        }
        return r;
    }
    addHeader(name, header) {
        if (!tslib_1.__classPrivateFieldGet(this, _result).components.headers) {
            tslib_1.__classPrivateFieldGet(this, _result).components.headers = {};
        }
        tslib_1.__classPrivateFieldGet(this, _result).components.headers[name] = header;
        return this;
    }
    /**
     *
     * @returns removed headers
     */
    cleanupHeaders() {
        const r = {};
        const refs = JSON.stringify(tslib_1.__classPrivateFieldGet(this, _result)).match(/#\/components\/headers\/[^/"]*/g);
        if (tslib_1.__classPrivateFieldGet(this, _result).components.headers) {
            Object.keys(tslib_1.__classPrivateFieldGet(this, _result).components.headers).forEach(name => {
                var _a, _b;
                if (!(refs === null || refs === void 0 ? void 0 : refs.includes(`#/components/headers/${name}`))) {
                    if ((_b = (_a = tslib_1.__classPrivateFieldGet(this, _result).components) === null || _a === void 0 ? void 0 : _a.headers) === null || _b === void 0 ? void 0 : _b[name]) {
                        r[name] = tslib_1.__classPrivateFieldGet(this, _result).components.headers[name];
                        delete tslib_1.__classPrivateFieldGet(this, _result).components.headers[name];
                    }
                }
            });
        }
        return r;
    }
    removeParameter(name) {
        let r;
        if (tslib_1.__classPrivateFieldGet(this, _result).components.parameters) {
            r = tslib_1.__classPrivateFieldGet(this, _result).components.parameters[name];
            delete tslib_1.__classPrivateFieldGet(this, _result).components.parameters[name];
        }
        return r;
    }
    hasParameter(name) {
        var _a, _b;
        let r = false;
        if ((_b = (_a = tslib_1.__classPrivateFieldGet(this, _result).components) === null || _a === void 0 ? void 0 : _a.parameters) === null || _b === void 0 ? void 0 : _b[name]) {
            r = true;
        }
        return r;
    }
    addParameter(name, param) {
        if (!tslib_1.__classPrivateFieldGet(this, _result).components.parameters) {
            tslib_1.__classPrivateFieldGet(this, _result).components.parameters = {};
        }
        tslib_1.__classPrivateFieldGet(this, _result).components.parameters[name] = param;
        return this;
    }
    /**
     *
     * @returns removed parameters
     */
    cleanupParameters() {
        const r = {};
        const refs = JSON.stringify(tslib_1.__classPrivateFieldGet(this, _result)).match(/#\/components\/parameters\/[^/"]*/g);
        if (tslib_1.__classPrivateFieldGet(this, _result).components.parameters) {
            Object.keys(tslib_1.__classPrivateFieldGet(this, _result).components.parameters).forEach(name => {
                var _a, _b;
                if (!(refs === null || refs === void 0 ? void 0 : refs.includes(`#/components/parameters/${name}`))) {
                    if ((_b = (_a = tslib_1.__classPrivateFieldGet(this, _result).components) === null || _a === void 0 ? void 0 : _a.parameters) === null || _b === void 0 ? void 0 : _b[name]) {
                        r[name] = tslib_1.__classPrivateFieldGet(this, _result).components.parameters[name];
                        delete tslib_1.__classPrivateFieldGet(this, _result).components.parameters[name];
                    }
                }
            });
        }
        return r;
    }
    removeRequestBody(name) {
        let r;
        if (tslib_1.__classPrivateFieldGet(this, _result).components.requestBodies) {
            r = tslib_1.__classPrivateFieldGet(this, _result).components.requestBodies[name];
            delete tslib_1.__classPrivateFieldGet(this, _result).components.requestBodies[name];
        }
        return r;
    }
    hasRequestBody(name) {
        var _a, _b;
        let r = false;
        if ((_b = (_a = tslib_1.__classPrivateFieldGet(this, _result).components) === null || _a === void 0 ? void 0 : _a.requestBodies) === null || _b === void 0 ? void 0 : _b[name]) {
            r = true;
        }
        return r;
    }
    addRequestBody(name, requestBody) {
        if (!tslib_1.__classPrivateFieldGet(this, _result).components.requestBodies) {
            tslib_1.__classPrivateFieldGet(this, _result).components.requestBodies = {};
        }
        tslib_1.__classPrivateFieldGet(this, _result).components.requestBodies[name] = requestBody;
        return this;
    }
    /**
     *
     * @returns removed requestBodies
     */
    cleanupRequestBodies() {
        const r = {};
        const refs = JSON.stringify(tslib_1.__classPrivateFieldGet(this, _result)).match(/#\/components\/requestBodies\/[^/"]*/g);
        if (tslib_1.__classPrivateFieldGet(this, _result).components.requestBodies) {
            Object.keys(tslib_1.__classPrivateFieldGet(this, _result).components.requestBodies).forEach(name => {
                var _a, _b;
                if (!(refs === null || refs === void 0 ? void 0 : refs.includes(`#/components/requestBodies/${name}`))) {
                    if ((_b = (_a = tslib_1.__classPrivateFieldGet(this, _result).components) === null || _a === void 0 ? void 0 : _a.requestBodies) === null || _b === void 0 ? void 0 : _b[name]) {
                        r[name] = tslib_1.__classPrivateFieldGet(this, _result).components.requestBodies[name];
                        delete tslib_1.__classPrivateFieldGet(this, _result).components.requestBodies[name];
                    }
                }
            });
        }
        return r;
    }
    removeResponse(name) {
        let r;
        if (tslib_1.__classPrivateFieldGet(this, _result).components.responses) {
            r = tslib_1.__classPrivateFieldGet(this, _result).components.responses[name];
            delete tslib_1.__classPrivateFieldGet(this, _result).components.responses[name];
        }
        return r;
    }
    hasResponse(name) {
        var _a, _b;
        let r = false;
        if ((_b = (_a = tslib_1.__classPrivateFieldGet(this, _result).components) === null || _a === void 0 ? void 0 : _a.responses) === null || _b === void 0 ? void 0 : _b[name]) {
            r = true;
        }
        return r;
    }
    addResponse(name, response) {
        if (!tslib_1.__classPrivateFieldGet(this, _result).components.responses) {
            tslib_1.__classPrivateFieldGet(this, _result).components.responses = {};
        }
        tslib_1.__classPrivateFieldGet(this, _result).components.responses[name] = response;
        return this;
    }
    /**
     *
     * @returns removed responses
     */
    cleanupResponses() {
        const r = {};
        const refs = JSON.stringify(tslib_1.__classPrivateFieldGet(this, _result)).match(/#\/components\/responses\/[^/"]*/g);
        if (tslib_1.__classPrivateFieldGet(this, _result).components.responses) {
            Object.keys(tslib_1.__classPrivateFieldGet(this, _result).components.responses).forEach(name => {
                var _a, _b;
                if (!(refs === null || refs === void 0 ? void 0 : refs.includes(`#/components/responses/${name}`))) {
                    if ((_b = (_a = tslib_1.__classPrivateFieldGet(this, _result).components) === null || _a === void 0 ? void 0 : _a.responses) === null || _b === void 0 ? void 0 : _b[name]) {
                        r[name] = tslib_1.__classPrivateFieldGet(this, _result).components.responses[name];
                        delete tslib_1.__classPrivateFieldGet(this, _result).components.responses[name];
                    }
                }
            });
        }
        return r;
    }
    setSecuritySchemes(v) {
        tslib_1.__classPrivateFieldGet(this, _result).components.securitySchemes = v;
        return this;
    }
    removeSecurityScheme(name) {
        let r;
        if (tslib_1.__classPrivateFieldGet(this, _result).components.securitySchemes) {
            r = tslib_1.__classPrivateFieldGet(this, _result).components.securitySchemes[name];
            delete tslib_1.__classPrivateFieldGet(this, _result).components.securitySchemes[name];
        }
        return r;
    }
    hasSecurityScheme(name) {
        var _a, _b;
        let r = false;
        if ((_b = (_a = tslib_1.__classPrivateFieldGet(this, _result).components) === null || _a === void 0 ? void 0 : _a.securitySchemes) === null || _b === void 0 ? void 0 : _b[name]) {
            r = true;
        }
        return r;
    }
    addSecurityScheme(name, schema) {
        if (!tslib_1.__classPrivateFieldGet(this, _result).components.securitySchemes) {
            tslib_1.__classPrivateFieldGet(this, _result).components.securitySchemes = {};
        }
        tslib_1.__classPrivateFieldGet(this, _result).components.securitySchemes[name] = schema;
        return this;
    }
    /**
     *
     * @returns removed securitySchemes
     */
    cleanupSecuritySchemes() {
        const r = {};
        const refs = JSON.stringify(tslib_1.__classPrivateFieldGet(this, _result)).match(/#\/components\/securitySchemes\/[^/"]*/g);
        if (tslib_1.__classPrivateFieldGet(this, _result).components.securitySchemes) {
            Object.keys(tslib_1.__classPrivateFieldGet(this, _result).components.securitySchemes).forEach(name => {
                var _a, _b;
                if (!(refs === null || refs === void 0 ? void 0 : refs.includes(`#/components/securitySchemes/${name}`))) {
                    if ((_b = (_a = tslib_1.__classPrivateFieldGet(this, _result).components) === null || _a === void 0 ? void 0 : _a.securitySchemes) === null || _b === void 0 ? void 0 : _b[name]) {
                        r[name] = tslib_1.__classPrivateFieldGet(this, _result).components.securitySchemes[name];
                        delete tslib_1.__classPrivateFieldGet(this, _result).components.securitySchemes[name];
                    }
                }
            });
        }
        return r;
    }
    setComponents(k) {
        tslib_1.__classPrivateFieldGet(this, _result).components = k;
        return this;
    }
    /**
     * remove unused entities (possibly auto-generated) from components:
     * - headers
     * - responses
     * - requestBodies
     * - parameters
     * - schemas
     */
    cleanupComponents() {
        const r = {};
        const headers = this.cleanupHeaders();
        const responses = this.cleanupResponses();
        const requestBodies = this.cleanupRequestBodies();
        const parameters = this.cleanupParameters();
        const schemas = this.cleanupSchemas();
        if (Object.keys(headers).length) {
            r.header = headers;
        }
        if (Object.keys(responses).length) {
            r.responses = responses;
        }
        if (Object.keys(requestBodies).length) {
            r.requestBodies = requestBodies;
        }
        if (Object.keys(parameters).length) {
            r.parameters = parameters;
        }
        if (Object.keys(schemas).length) {
            r.schemas = schemas;
        }
        return r;
    }
    setTags(tags) {
        tslib_1.__classPrivateFieldGet(this, _result).tags = tags;
        return this;
    }
    removeTag(tagName) {
        let r;
        const idx = tslib_1.__classPrivateFieldGet(this, _result).tags.findIndex(t => t.name === tagName);
        if (idx > -1) {
            r = tslib_1.__classPrivateFieldGet(this, _result).tags[idx];
            tslib_1.__classPrivateFieldGet(this, _result).tags.slice(idx, 1);
        }
        return r;
    }
    addTag(tag) {
        return this.addTags(tag);
    }
    addTags(tags) {
        if (!Array.isArray(tags)) {
            tags = [tags];
        }
        tags.forEach(tag => {
            const t = tslib_1.__classPrivateFieldGet(this, _result).tags.find(t => t.name === tag.name);
            if (t) {
                Object.assign(t, tag);
            }
            else {
                tslib_1.__classPrivateFieldGet(this, _result).tags.push(tag);
            }
        });
        return this;
    }
    setDefaultSecurity(v) {
        tslib_1.__classPrivateFieldSet(this, _security, []);
        if (Array.isArray(v)) {
            v.forEach((value) => this.addDefaultSecurity(value));
        }
        else {
            this.addDefaultSecurity(v);
        }
        return this;
    }
    addDefaultSecurity(v) {
        if (v) {
            if (typeof v === 'string') {
                tslib_1.__classPrivateFieldGet(this, _security).push({
                    [v]: []
                });
            }
            else {
                tslib_1.__classPrivateFieldGet(this, _security).push(v);
            }
        }
        return this;
    }
    getDefaultSecurity() {
        return tslib_1.__classPrivateFieldGet(this, _security);
    }
    setInfo(v) {
        tslib_1.__classPrivateFieldGet(this, _result).info = v;
        return this;
    }
    getInfo() {
        return tslib_1.__classPrivateFieldGet(this, _result).info;
    }
    setInfoProperty(prop, v) {
        tslib_1.__classPrivateFieldGet(this, _result).info[prop] = v;
        return this;
    }
    setTitle(title) {
        tslib_1.__classPrivateFieldGet(this, _result).info.title = title;
        return this;
    }
    setDescription(description) {
        tslib_1.__classPrivateFieldGet(this, _result).info.description = description;
        return this;
    }
    setTermsOfService(termsOfService) {
        tslib_1.__classPrivateFieldGet(this, _result).info.termsOfService = termsOfService;
        return this;
    }
    setVersion(version) {
        tslib_1.__classPrivateFieldGet(this, _result).info.version = version;
        return this;
    }
    setContact(contact) {
        tslib_1.__classPrivateFieldGet(this, _result).info.contact = contact;
        return this;
    }
    setLicense(license) {
        if (typeof license === 'string') {
            tslib_1.__classPrivateFieldGet(this, _result).info.license = {
                name: license
            };
        }
        else {
            tslib_1.__classPrivateFieldGet(this, _result).info.license = license;
        }
        return this;
    }
    setServers(v) {
        tslib_1.__classPrivateFieldGet(this, _result).servers = [];
        let v2 = [];
        if (!Array.isArray(v)) {
            v2 = [v];
        }
        else {
            v2 = v;
        }
        v2.forEach(el => this.addServer(el));
        return this;
    }
    getServers() {
        return tslib_1.__classPrivateFieldGet(this, _result).servers;
    }
    addServer(v) {
        if (typeof v === 'string') {
            v = { url: v };
        }
        tslib_1.__classPrivateFieldGet(this, _result).servers.push(v);
        return this;
    }
    /**
     *
     * OpenApi.setServers({ url })
     */
    setHost(url) {
        return this.setServers({
            url
        });
    }
    setExternalDoc(externalDoc) {
        if (typeof externalDoc === 'string') {
            tslib_1.__classPrivateFieldGet(this, _result).externalDocs = { url: externalDoc };
        }
        else {
            tslib_1.__classPrivateFieldGet(this, _result).externalDocs = externalDoc;
        }
        return this;
    }
    add(routes) {
        let routes2 = [];
        if (!Array.isArray(routes)) {
            routes2 = [routes];
        }
        else {
            routes2 = routes;
        }
        const results = [];
        routes2.forEach((route) => {
            // format route to add by methods
            Object.keys(route.methods).forEach((method) => {
                if (!route.methods[method]) {
                    return;
                }
                const r = {
                    path: route.path,
                    method,
                };
                Object.keys(route).forEach((p) => {
                    r[p] = route[p];
                });
                const added = this._add(r);
                if (added) {
                    results.push(added);
                }
            });
        });
        return results;
    }
    remove(path, method) {
        const r = [];
        if (tslib_1.__classPrivateFieldGet(this, _result).paths[path]) {
            if (method) {
                if (tslib_1.__classPrivateFieldGet(this, _result).paths[path][method]) {
                    r.push({
                        path,
                        method,
                        schema: tslib_1.__classPrivateFieldGet(this, _result).paths[path][method]
                    });
                    delete tslib_1.__classPrivateFieldGet(this, _result).paths[path][method];
                }
                if (!Object.keys(tslib_1.__classPrivateFieldGet(this, _result).paths[path]).length) {
                    delete tslib_1.__classPrivateFieldGet(this, _result).paths[path];
                }
            }
            else {
                Object.keys(tslib_1.__classPrivateFieldGet(this, _result).paths[path]).forEach(m => {
                    r.push({
                        path,
                        method: m,
                        schema: tslib_1.__classPrivateFieldGet(this, _result).paths[path][m]
                    });
                });
                delete tslib_1.__classPrivateFieldGet(this, _result).paths[path];
            }
        }
        return r;
    }
    _getResponsesSchema(responses) {
        let r = {};
        if (responses
            && tslib_1.__classPrivateFieldGet(this, _responsesProperty)) {
            const tmp = responses[tslib_1.__classPrivateFieldGet(this, _responsesProperty)];
            if (tmp && typeof tmp === 'object') {
                Object.assign(r, tmp);
            }
        }
        else {
            r = responses || r;
        }
        return r;
    }
    _add(route) {
        const parameters = route.parameters || {};
        const responses = this._getResponsesSchema(route.responses);
        const path = utils_1.formatPath(route.path, parameters.params);
        const method = route.method;
        const description = route.description || '';
        const tags = route.tags || [];
        const auth = route.auth;
        const operationId = parameters.operationId;
        const undoc = parameters.undoc;
        let consumes = ['application/json'];
        let security = tslib_1.__classPrivateFieldGet(this, _security);
        // if it shouldn't be documented
        if (undoc) {
            return {
                path
            };
        }
        // format consumes
        if (!Array.isArray(parameters.consumes)) {
            if (parameters.consumes && typeof parameters.consumes === 'string') {
                consumes = [parameters.consumes];
            }
            else {
                if (tslib_1.__classPrivateFieldGet(this, _consumes).length) {
                    consumes = tslib_1.__classPrivateFieldGet(this, _consumes);
                }
            }
        }
        else {
            consumes = parameters.consumes;
        }
        // format security
        if (!Array.isArray(parameters.security)) {
            if (parameters.security && typeof parameters.security == 'object') {
                security = [security];
            }
            else if (parameters.security && typeof parameters.security == 'string') {
                security = [{ [parameters.security]: [] }];
            }
            else {
                security = tslib_1.__classPrivateFieldGet(this, _security);
            }
        }
        else {
            security = parameters.security.map((s) => {
                if (s && typeof s == 'string') {
                    s = { [s]: [] };
                }
                return s;
            });
        }
        const schema = {
            summary: description,
            tags: tags,
        };
        if (operationId) {
            schema.operationId = operationId;
        }
        if (auth) {
            if (!security.length) {
                // Log.warn("Missing 'security' for route: %s %s", method, path);
            }
            else {
                schema.security = security;
            }
        }
        // format parameters, requestBody, responses
        const formattedParameters = this._formatParameters(parameters);
        const formattedRequestBody = this._formatRequestBody(parameters, consumes);
        schema.responses = this._formatResponses(responses);
        if (formattedRequestBody && Object.keys(formattedRequestBody).length) {
            schema.requestBody = formattedRequestBody;
        }
        if (formattedParameters && formattedParameters.length) {
            schema.parameters = formattedParameters;
        }
        tslib_1.__classPrivateFieldGet(this, _result).paths[path] = tslib_1.__classPrivateFieldGet(this, _result).paths[path] || {};
        tslib_1.__classPrivateFieldGet(this, _result).paths[path][method] = schema;
        // Log.info('added route [%s %s]: %O', method, path, schema);
        return {
            path,
            method,
            schema: tslib_1.__classPrivateFieldGet(this, _result).paths[path][method],
        };
    }
    _formatResponses(routeResponses) {
        // format responses
        const responses = {};
        Object.keys(routeResponses).forEach((p) => {
            responses[p] = routeResponses[p];
        });
        // if none
        if (!Object.keys(responses).length) {
            responses.default = {
                description: 'none',
            };
        }
        return responses;
    }
    // format parameters methods
    _formatParameters(parameters) {
        // format parameters
        const res = [];
        const paramsHelper = new (tslib_1.__classPrivateFieldGet(this, _helperClass))(parameters);
        let children;
        if (paramsHelper.isValid()) {
            children = paramsHelper.getChildren();
        }
        if (parameters.headers) {
            this._pushPathParameters(definitions_1.ParameterLocations.header, parameters.headers, res);
        }
        else if (children && children.headers) {
            this._pushPathParameters(definitions_1.ParameterLocations.header, children.headers, res);
        }
        if (parameters.params) {
            this._pushPathParameters(definitions_1.ParameterLocations.path, parameters.params, res);
        }
        else if (children && children.params) {
            this._pushPathParameters(definitions_1.ParameterLocations.path, children.params, res);
        }
        if (parameters.query) {
            this._pushPathParameters(definitions_1.ParameterLocations.query, parameters.query, res);
        }
        else if (children && children.query) {
            this._pushPathParameters(definitions_1.ParameterLocations.query, children.query, res);
        }
        if (parameters.cookies) {
            this._pushPathParameters(definitions_1.ParameterLocations.cookie, parameters.cookies, res);
        }
        else if (children && children.cookies) {
            this._pushPathParameters(definitions_1.ParameterLocations.cookie, children.cookies, res);
        }
        return res;
    }
    _pushPathParameters(location, value, res) {
        var _a, _b;
        const valueHelper = value instanceof tslib_1.__classPrivateFieldGet(this, _helperClass) ? value : new (tslib_1.__classPrivateFieldGet(this, _helperClass))(value);
        let valueHelperType;
        let children;
        if (valueHelper.isValid()) {
            valueHelperType = utils_1.formatType(valueHelper.getType()).type;
            children = valueHelper.getChildren();
        }
        const getChildrenNames = () => {
            if (children) {
                return Object.keys(children);
            }
            return Object.keys(value);
        };
        const getChild = (name) => {
            if (children) {
                return children[name];
            }
            if (value instanceof tslib_1.__classPrivateFieldGet(this, _helperClass)) {
                return;
            }
            return new (tslib_1.__classPrivateFieldGet(this, _helperClass))(value[name]);
        };
        const handleChild = (name, helper, style) => {
            if (!helper.isValid())
                return;
            const defaultParamObject = {
                name,
                in: location
            };
            if (style) {
                defaultParamObject.style = style;
            }
            const parameterObject = this._createParameterObject(location, helper, defaultParamObject);
            // ReferenceObject | ParameterObject
            const pObject = this._autoParameterObjectToRef(helper, parameterObject);
            res.push(pObject);
        };
        getChildrenNames().forEach((name) => {
            const helper = getChild(name);
            if (helper) {
                handleChild(name, helper);
            }
        });
        // e.g.: enable additional query
        if (valueHelperType === 'object') {
            if (valueHelper.getAdditionalProperties
                && ((_a = valueHelper.hasAdditionalProperties) === null || _a === void 0 ? void 0 : _a.call(valueHelper))) {
                let style;
                if (valueHelper.getStyle
                    && ((_b = valueHelper.hasStyle) === null || _b === void 0 ? void 0 : _b.call(valueHelper))) {
                    style = 'form';
                }
                handleChild(location, valueHelper, style);
            }
        }
    }
    /**
     *
     * @param location path, query, header or cookie
     * @param helper
     * @param defaultParameterObject
     * @returns
     */
    _createParameterObject(location, helper, defaultParameterObject) {
        var _a, _b, _c, _d;
        const parameter = new parameterService_1.ParameterCreator(defaultParameterObject)
            .setRequired(helper.isRequired())
            .setSchema(utils_1.formatType(helper.getType()));
        const schema = this._createBasicSchema(helper);
        const description = schema.getDescription();
        if (description) {
            parameter.setDescription(description);
        }
        if (schema.isType('array')) {
            // allowing multiple values by repeating the query parameter
            if (location === 'query') {
                parameter.setExplode(true);
            }
        }
        if (schema.isType('object')) {
            // style ?
            if (!parameter.hasStyle()) {
                parameter.setStyle('deepObject');
            }
        }
        // examples
        if ((_a = helper.hasExamples) === null || _a === void 0 ? void 0 : _a.call(helper)) {
            const examples = (_b = helper.getExamples) === null || _b === void 0 ? void 0 : _b.call(helper);
            if (examples) {
                parameter.setExamples(examples);
            }
        }
        // handle deprecated
        if (helper.isDeprecated()) {
            parameter.setDeprecated(true);
        }
        // handle style
        if (!parameter.hasStyle()
            && ((_c = helper.hasStyle) === null || _c === void 0 ? void 0 : _c.call(helper))) {
            const style = (_d = helper.getStyle) === null || _d === void 0 ? void 0 : _d.call(helper);
            if (style) {
                parameter.setStyle(style);
            }
        }
        // allowEmptyValue
        if (location !== 'path' && helper.allowsEmptyValue()) {
            parameter.setAllowEmptyValue(helper.allowsEmptyValue());
        }
        let schemaObject = schema.toObject();
        // ReferenceObject | SchemaObject
        schemaObject = this._autoSchemaObjectToRef(helper, schemaObject);
        parameter.setSchema(schemaObject);
        return parameter.toObject();
    }
    // format body methods
    _formatRequestBody(parameters, consumes) {
        // format body
        let res = {};
        // body|files
        if (parameters.body || parameters.files) {
            this._pushRequestBody(parameters.body, parameters.files, consumes, res);
        }
        else {
            const bodyHelper = new (tslib_1.__classPrivateFieldGet(this, _helperClass))(parameters);
            if (bodyHelper.isValid()) {
                const children = bodyHelper.getChildren();
                if (children.body || children.files) {
                    this._pushRequestBody(children.body, children.files, consumes, res);
                }
                // ReferenceObject | RequestBodyObject
                res = this._autoRequestBodyObjectToRef(bodyHelper, res);
            }
        }
        return res;
    }
    _pushRequestBody(body, files, consumes, res) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        let schemaObject;
        let bodySchema;
        let filesSchema;
        let helperWithRef;
        let examples;
        let encoding;
        let contentIsRequired = false;
        if (body) {
            const bodyHelper = body instanceof tslib_1.__classPrivateFieldGet(this, _helperClass) ? body : new (tslib_1.__classPrivateFieldGet(this, _helperClass))(body);
            if (bodyHelper.isValid()) {
                bodySchema = this._createSchema(bodyHelper);
                if (this._getLocalRef(bodyHelper)) {
                    helperWithRef = bodyHelper;
                }
                if ((_a = bodyHelper.hasExamples) === null || _a === void 0 ? void 0 : _a.call(bodyHelper)) {
                    examples = (_b = bodyHelper.getExamples) === null || _b === void 0 ? void 0 : _b.call(bodyHelper);
                }
                if ((_c = bodyHelper.hasEncoding) === null || _c === void 0 ? void 0 : _c.call(bodyHelper)) {
                    encoding = (_d = bodyHelper.getEncoding) === null || _d === void 0 ? void 0 : _d.call(bodyHelper);
                }
                contentIsRequired = contentIsRequired || bodyHelper.isRequired();
                schemaObject = bodySchema.toObject();
            }
            else if (!(body instanceof tslib_1.__classPrivateFieldGet(this, _helperClass))) {
                bodySchema = new schemaService_1.SchemaCreator({
                    type: 'object',
                    required: [],
                    properties: {},
                });
                Object.keys(body).forEach(name => {
                    const childHelper = new (tslib_1.__classPrivateFieldGet(this, _helperClass))(body[name]);
                    if (!childHelper.isValid()) {
                        return;
                    }
                    const propertySchemaObject = this._createSchemaObject(childHelper, bodySchema, name);
                    bodySchema === null || bodySchema === void 0 ? void 0 : bodySchema.setProperty(name, propertySchemaObject);
                });
                contentIsRequired = contentIsRequired || bodySchema.isRequired();
                schemaObject = bodySchema.toObject();
            }
        }
        if (files && (!schemaObject || (bodySchema === null || bodySchema === void 0 ? void 0 : bodySchema.isType('object')))) {
            const filesHelper = files instanceof tslib_1.__classPrivateFieldGet(this, _helperClass) ? files : new (tslib_1.__classPrivateFieldGet(this, _helperClass))(files);
            // mix with bodySchema or create new
            const prop = bodySchema || new schemaService_1.SchemaCreator({
                type: 'object',
                required: [],
                properties: {},
            });
            if (filesHelper.isValid()) {
                if (!bodySchema && filesHelper.getType() !== 'object') {
                    filesSchema = this._createSchema(filesHelper, undefined, undefined, 'binary');
                    if (this._getLocalRef(filesHelper)) {
                        helperWithRef = filesHelper;
                    }
                    if ((_e = filesHelper.hasExamples) === null || _e === void 0 ? void 0 : _e.call(filesHelper)) {
                        examples = (_f = filesHelper.getExamples) === null || _f === void 0 ? void 0 : _f.call(filesHelper);
                    }
                    if ((_g = filesHelper.hasEncoding) === null || _g === void 0 ? void 0 : _g.call(filesHelper)) {
                        encoding = (_h = filesHelper.getEncoding) === null || _h === void 0 ? void 0 : _h.call(filesHelper);
                    }
                    schemaObject = filesSchema.toObject();
                }
                else if (filesHelper.getType() === 'object') {
                    const filesFields = filesHelper.getChildren();
                    Object.keys(filesFields).forEach(name => {
                        const childHelper = filesFields[name];
                        if (!childHelper.isValid()) {
                            return;
                        }
                        const propertySchemaObject = this._createSchemaObject(childHelper, prop, name, 'binary');
                        prop.setProperty(name, propertySchemaObject);
                    });
                    schemaObject = prop.toObject();
                }
                contentIsRequired = contentIsRequired || filesHelper.isRequired();
            }
            else if (!(files instanceof tslib_1.__classPrivateFieldGet(this, _helperClass))) {
                Object.keys(files).forEach(name => {
                    const childHelper = new (tslib_1.__classPrivateFieldGet(this, _helperClass))(files[name]);
                    if (!childHelper.isValid()) {
                        return;
                    }
                    const propertySchemaObject = this._createSchemaObject(childHelper, prop, name, 'binary');
                    prop.setProperty(name, propertySchemaObject);
                });
                contentIsRequired = contentIsRequired || prop.isRequired();
                schemaObject = prop.toObject();
            }
        }
        if (helperWithRef && schemaObject) {
            // ReferenceObject | SchemaObject
            schemaObject = this._autoSchemaObjectToRef(helperWithRef, schemaObject);
        }
        const mediaType = new mediaTypeService_1.MediaTypeCreator();
        if (schemaObject) {
            mediaType.setSchema(schemaObject);
        }
        if (examples) {
            mediaType.setExamples(examples);
        }
        if (encoding) {
            mediaType.setEncoding(encoding);
        }
        res.content = {};
        res.required = contentIsRequired;
        const content = mediaType.toObject();
        consumes.forEach((mime) => {
            if (res.content) {
                res.content[mime] = content;
            }
        });
    }
    // -- schema object creation methods
    /**
     * create non-alternative schema
     * @param helper
     * @param parentProp used for required children/items
     * @param name used for required children
     * @param format used for 'binary' format
     * @returns
     */
    _createBasicSchema(helper, parentProp, name, format) {
        var _a, _b;
        const prop = new schemaService_1.SchemaCreator(utils_1.formatType(helper.getType()));
        let description = '';
        // description
        if (helper.getDescription()) {
            description = helper.getDescription();
        }
        // unit
        if (helper.getUnit()) {
            if (description) {
                description += ` (${helper.getUnit()})`;
            }
            else {
                description = `(${helper.getUnit()})`;
            }
        }
        // description
        if (description) {
            prop.setDescription(description);
        }
        // default
        if (helper.hasDefaultValue()) {
            prop.setDefault(helper.getDefaultValue());
        }
        // example
        if (helper.hasExampleValue()) {
            prop.setExample(helper.getExampleValue());
        }
        // enum
        if (helper.getEnum().length) {
            prop.setEnum(helper.getEnum());
        }
        // required
        if (helper.isRequired()) {
            if ((parentProp === null || parentProp === void 0 ? void 0 : parentProp.isType('object')) && name) {
                parentProp.addRequired(name);
            }
            else if (parentProp === null || parentProp === void 0 ? void 0 : parentProp.isType('array')) {
                parentProp.setMin(typeof parentProp.getMin() !== 'undefined' ?
                    parentProp.getMin() : 1);
            }
        }
        // min, max, ...
        if (helper.hasMin()) {
            prop.setMin(helper.getMin());
        }
        if (helper.hasMax()) {
            prop.setMax(helper.getMax());
        }
        if (prop.isType('array')) {
            this._fillArraySchemaObject(helper, prop, format);
        }
        else if (format) {
            prop.setFormat(format);
            if (format === 'binary') {
                prop.setType('string');
            }
        }
        if (prop.isType('object')) {
            this._fillObjectSchemaObject(helper, prop);
        }
        if ((_a = helper.hasXml) === null || _a === void 0 ? void 0 : _a.call(helper)) {
            const xml = (_b = helper.getXml) === null || _b === void 0 ? void 0 : _b.call(helper);
            if (xml) {
                prop.setXml(xml);
            }
        }
        return prop;
    }
    /**
     *
     * @param helper
     * @param parentProp used for required children/items
     * @param name used for required children
     * @param format used for 'binary' format
     * @returns
     */
    _createSchema(helper, parentProp, name, format) {
        if (helper.getType() === 'alternatives') {
            return this._createAlternativeSchema(helper, parentProp, name);
        }
        return this._createBasicSchema(helper, parentProp, name, format);
    }
    /**
     *
     * @param helper
     * @param parentProp used for required children/items
     * @param name used for required children
     * @param format used for 'binary' format
     * @returns
     */
    _createSchemaObject(helper, parentProp, name, format) {
        if (helper.getType() === 'alternatives') {
            return this._createAlternativeSchemaObject(helper, parentProp, name);
        }
        const prop = this._createBasicSchema(helper, parentProp, name, format);
        // ReferenceObject | SchemaObject
        const schemaObject = this._autoSchemaObjectToRef(helper, prop.toObject());
        return schemaObject;
    }
    _createAlternativeSchema(altHelper, parentProp, name) {
        return new schemaService_1.SchemaCreator(this._createAlternativeSchemaObject(altHelper, parentProp, name));
    }
    _createAlternativeSchemaObject(altHelper, parentProp, name) {
        var _a, _b;
        const prop = new schemaService_1.SchemaCreator({ oneOf: [] });
        let description = '';
        // description
        if (altHelper.getDescription()) {
            description = altHelper.getDescription();
        }
        // unit
        if (altHelper.getUnit()) {
            if (description) {
                description += ` (${altHelper.getUnit()})`;
            }
            else {
                description = `(${altHelper.getUnit()})`;
            }
        }
        // description
        if (description) {
            prop.setDescription(description);
        }
        // default
        if (altHelper.hasDefaultValue()) {
            prop.setDefault(altHelper.getDefaultValue());
        }
        // example
        if (altHelper.hasExampleValue()) {
            prop.setExample(altHelper.getExampleValue());
        }
        // required
        if (altHelper.isRequired()) {
            if ((parentProp === null || parentProp === void 0 ? void 0 : parentProp.isType('object')) && name) {
                parentProp.addRequired(name);
            }
            else if (parentProp === null || parentProp === void 0 ? void 0 : parentProp.isType('array')) {
                parentProp.setMin(parentProp.getMin() || 1);
            }
        }
        // discriminator
        if ((_a = altHelper.hasDiscriminator) === null || _a === void 0 ? void 0 : _a.call(altHelper)) {
            const discriminator = (_b = altHelper.getDiscriminator) === null || _b === void 0 ? void 0 : _b.call(altHelper);
            if (discriminator) {
                prop.setDiscriminator(discriminator);
            }
        }
        const altSchemaObject = prop.toObject();
        altHelper.getAlternatives().forEach(helper => {
            var _a;
            if (helper.isValid()) {
                (_a = altSchemaObject === null || altSchemaObject === void 0 ? void 0 : altSchemaObject.oneOf) === null || _a === void 0 ? void 0 : _a.push(this._createSchemaObject(helper));
            }
        });
        return altSchemaObject;
    }
    _fillArraySchemaObject(helper, propSchema, format) {
        // only for "array"
        if (propSchema.isType('array')) {
            if (format === 'binary') {
                propSchema.setItems({
                    type: 'string',
                    format: format
                });
            }
            else {
                if (format) {
                    propSchema.setFormat(format);
                }
                // unique
                propSchema.setUniqueItems(helper.isUnique());
                // items
                const firstItem = helper.getFirstItem();
                if (firstItem && firstItem.isValid()) {
                    const schemaObject = this._createSchemaObject(firstItem, propSchema, 'items');
                    propSchema.setItems(schemaObject);
                }
                else {
                    propSchema.setItems(utils_1.formatType('any'));
                }
            }
        }
    }
    _fillObjectSchemaObject(helper, propSchema) {
        var _a, _b;
        // only for "object"
        if (propSchema.isType('object')) {
            // check if it has defined keys
            const children = helper.getChildren();
            if (Object.keys(children).length) {
                propSchema.setProperties({});
                Object.keys(children).forEach((k) => {
                    const schemaObject = this._createSchemaObject(children[k], propSchema, k);
                    propSchema.setProperty(k, schemaObject);
                });
            }
            // additional properties ?
            if ((_a = helper.hasAdditionalProperties) === null || _a === void 0 ? void 0 : _a.call(helper)) {
                const additionalProperties = (_b = helper.getAdditionalProperties) === null || _b === void 0 ? void 0 : _b.call(helper);
                if (additionalProperties) {
                    propSchema.setAdditionalProperties(additionalProperties);
                }
            }
        }
    }
    _autoSchemaObjectToRef(helper, schemaObject) {
        let newSchema = schemaObject;
        const ref = this._getLocalRef(helper, 'schemas');
        const remoteRef = this._getRemoteRef(helper);
        if (ref) {
            const entityName = this._localRefToEntityName(ref);
            if (entityName && newSchema) {
                if (tslib_1.__classPrivateFieldGet(this, _generateComponentsRule) === GenerateComponentsRules.always) {
                    this.addSchema(entityName, newSchema);
                }
                else if (tslib_1.__classPrivateFieldGet(this, _generateComponentsRule) === GenerateComponentsRules.ifUndefined) {
                    if (!this.hasSchema(entityName)) {
                        this.addSchema(entityName, newSchema);
                    }
                }
                newSchema = {
                    $ref: ref
                };
            }
        }
        else if (remoteRef) {
            newSchema = {
                $ref: remoteRef
            };
        }
        return newSchema;
    }
    _autoParameterObjectToRef(helper, paramObject) {
        let newParamObject = paramObject;
        const ref = this._getLocalRef(helper, 'parameters');
        const remoteRef = this._getRemoteRef(helper);
        if (ref) {
            const entityName = this._localRefToEntityName(ref);
            if (entityName && newParamObject) {
                if (tslib_1.__classPrivateFieldGet(this, _generateComponentsRule) === GenerateComponentsRules.always) {
                    this.addParameter(entityName, newParamObject);
                }
                else if (tslib_1.__classPrivateFieldGet(this, _generateComponentsRule) === GenerateComponentsRules.ifUndefined) {
                    if (!this.hasParameter(entityName)) {
                        this.addParameter(entityName, newParamObject);
                    }
                }
                newParamObject = {
                    $ref: ref
                };
            }
        }
        else if (remoteRef) {
            newParamObject = {
                $ref: remoteRef
            };
        }
        return newParamObject;
    }
    _autoRequestBodyObjectToRef(helper, schemaObject) {
        let newSchema = schemaObject;
        const ref = this._getLocalRef(helper, 'requestBodies');
        const remoteRef = this._getRemoteRef(helper);
        if (ref) {
            const entityName = this._localRefToEntityName(ref);
            if (entityName && newSchema) {
                if (helper.getDescription()) {
                    newSchema.description = helper.getDescription();
                }
                if (tslib_1.__classPrivateFieldGet(this, _generateComponentsRule) === GenerateComponentsRules.always) {
                    this.addRequestBody(entityName, newSchema);
                }
                else if (tslib_1.__classPrivateFieldGet(this, _generateComponentsRule) === GenerateComponentsRules.ifUndefined) {
                    if (!this.hasRequestBody(entityName)) {
                        this.addRequestBody(entityName, newSchema);
                    }
                }
                newSchema = {
                    $ref: ref
                };
            }
        }
        else if (remoteRef) {
            newSchema = {
                $ref: remoteRef
            };
        }
        return newSchema;
    }
    _getLocalRef(helper, componentCategory = 'schemas') {
        var _a, _b;
        let r;
        if ((_a = helper.hasRef) === null || _a === void 0 ? void 0 : _a.call(helper)) {
            const ref = (_b = helper.getRef) === null || _b === void 0 ? void 0 : _b.call(helper);
            if (ref && typeof ref === 'string') {
                const innerSchemaRefPrefix = `#/components/${componentCategory}/`;
                if (ref.startsWith(innerSchemaRefPrefix)) {
                    r = ref;
                }
            }
        }
        return r;
    }
    _getRemoteRef(helper) {
        var _a, _b;
        let r;
        if ((_a = helper.hasRef) === null || _a === void 0 ? void 0 : _a.call(helper)) {
            const ref = (_b = helper.getRef) === null || _b === void 0 ? void 0 : _b.call(helper);
            if (ref && typeof ref === 'string') {
                if (!ref.startsWith('#/')) {
                    r = ref;
                }
            }
        }
        return r;
    }
    _localRefToEntityName(ref) {
        const entityName = ref.substring(ref.lastIndexOf('/') + 1);
        return entityName;
    }
    result() {
        return extend_1.default(true, {}, tslib_1.__classPrivateFieldGet(this, _result));
    }
}
exports.OpenApi = OpenApi;
_consumes = new WeakMap(), _result = new WeakMap(), _security = new WeakMap(), _helperClass = new WeakMap(), _responsesProperty = new WeakMap(), _generateComponentsRule = new WeakMap();
//# sourceMappingURL=openapi.js.map