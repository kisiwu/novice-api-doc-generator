/**
 * @module helpers-joi
 */
import { BaseHelperInterface } from './baseHelper';
import { Schema } from 'joi';
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
export declare type JoiSchema = Partial<Schema> & {
    _valids?: {
        _values?: Set<unknown>;
        [key: string]: unknown;
    };
    _singleRules?: Map<string, JoiRule>;
    _rules?: JoiRule[];
};
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
export declare class JoiHelper implements BaseHelperInterface {
    protected _joi: JoiSchema;
    constructor(joiObject?: JoiSchema | unknown);
    protected isJoi(): boolean;
    protected hasMeta(v: string): boolean;
    protected getMeta(v: string): unknown;
    isValid(): boolean;
    getType(): string;
    getDescription(): string;
    isRequired(): boolean;
    isUnique(): boolean;
    hasDefaultValue(): boolean;
    getDefaultValue(): unknown;
    hasExampleValue(): boolean;
    getExampleValue(): unknown;
    isDeprecated(): boolean;
    allowsEmptyValue(): boolean;
    getEnum(): unknown[];
    hasMin(): boolean;
    hasMax(): boolean;
    getMin(): number | undefined;
    getMax(): number | undefined;
    getUnit(): string;
}
export {};
