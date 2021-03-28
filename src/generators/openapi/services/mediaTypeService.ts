import extend from 'extend';
import { 
  EncodingObject,
  ExampleObject,
  MediaTypeObject,
  ReferenceObject,
  SchemaObject
} from '../definitions';

export class MediaTypeCreator {
  #mediaType: MediaTypeObject;

  constructor(mediaType: MediaTypeObject = {}) {
    this.#mediaType = mediaType;
  }

  setExample(value: unknown): MediaTypeCreator {
    this.#mediaType.example = value;
    return this;
  }

  setExamples(examples: Record<string, ExampleObject | ReferenceObject>): MediaTypeCreator {
    this.#mediaType.examples = examples;
    return this;
  }

  setEncoding(encoding: Record<string, EncodingObject>): MediaTypeCreator {
    this.#mediaType.encoding = encoding;
    return this;
  }

  setSchema(schema: SchemaObject | ReferenceObject): MediaTypeCreator {
    this.#mediaType.schema = schema;
    return this;
  }

  toObject(): MediaTypeObject{
    const copy: MediaTypeObject = extend(true, {}, this.#mediaType);
    return copy;
  }
} 