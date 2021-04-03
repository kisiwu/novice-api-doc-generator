import { ExampleObject, MediaTypeObject, ParameterObject, ReferenceObject, SchemaObject } from '../definitions';
export declare class ParameterCreator {
    #private;
    constructor(param: ParameterObject);
    isRequired(): boolean;
    setRequired(bool: boolean): ParameterCreator;
    setContent(content: Record<string, MediaTypeObject>): ParameterCreator;
    getSchemaProp(prop: string): unknown;
    setSchemaProp(prop: string, value: unknown): ParameterCreator;
    setSchema(value: SchemaObject | ReferenceObject): ParameterCreator;
    setDescription(value: string): ParameterCreator;
    getDescription(): string | undefined;
    setAllowEmptyValue(bool: boolean): ParameterCreator;
    setAllowReserved(bool: boolean): ParameterCreator;
    setExample(value: unknown): ParameterCreator;
    setExamples(value: Record<string, ExampleObject | ReferenceObject>): ParameterCreator;
    setExplode(bool: boolean): ParameterCreator;
    setDeprecated(bool: boolean): ParameterCreator;
    setStyle(style: string): ParameterCreator;
    hasStyle(): boolean;
    toObject(): ParameterObject;
}
