import { EncodingObject, ExampleObject, MediaTypeObject, ReferenceObject, SchemaObject } from '../definitions';
export declare class MediaTypeCreator {
    #private;
    constructor(mediaType?: MediaTypeObject);
    setExample(value: unknown): MediaTypeCreator;
    setExamples(examples: Record<string, ExampleObject | ReferenceObject>): MediaTypeCreator;
    setEncoding(encoding: Record<string, EncodingObject>): MediaTypeCreator;
    setSchema(schema: SchemaObject | ReferenceObject): MediaTypeCreator;
    toObject(): MediaTypeObject;
}
