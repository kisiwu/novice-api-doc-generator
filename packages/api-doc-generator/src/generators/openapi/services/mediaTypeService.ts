import type {
  EncodingObject,
  ExampleObject,
  MediaTypeObject,
  ReferenceObject,
  SchemaObject,
} from '@novice1/api-doc-definitions/openapi';
import extend from 'extend';

export class MediaTypeCreator {
  #mediaType: MediaTypeObject;

  constructor(mediaType: MediaTypeObject = {}) {
    this.#mediaType = mediaType;
  }

  setExample(value: unknown): this {
    this.#mediaType.example = value;
    return this;
  }

  setExamples(examples: Record<string, ExampleObject | ReferenceObject>): this {
    this.#mediaType.examples = examples;
    return this;
  }

  setEncoding(encoding: Record<string, EncodingObject>): this {
    this.#mediaType.encoding = encoding;
    return this;
  }

  setSchema(schema: SchemaObject | ReferenceObject): this {
    this.#mediaType.schema = schema;
    return this;
  }

  toObject(): MediaTypeObject {
    const copy: MediaTypeObject = extend(true, {}, this.#mediaType);
    return copy;
  }
}
