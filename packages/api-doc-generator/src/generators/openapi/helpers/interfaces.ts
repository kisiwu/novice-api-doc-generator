import { BaseHelperInterface } from '../../../helpers/baseHelper';
import {
  AdditionalProperties,
  DiscriminatorObject,
  EncodingObject,
  ExampleObject,
  ReferenceObject,
  SchemaObject,
  XMLObject,
} from '../definitions';

export interface OpenAPIHelperInterface extends BaseHelperInterface {
  // required
  getFirstItem(): OpenAPIHelperInterface | undefined;
  getChildren(): Record<string, OpenAPIHelperInterface>;
  getAlternatives(): OpenAPIHelperInterface[];

  // optionals
  hasStyle?(): boolean;
  getStyle?(): string | undefined;
  hasAdditionalProperties?(): boolean;
  getAdditionalProperties?(): AdditionalProperties | undefined;
  hasRef?(): boolean;
  getRef?(): string | undefined;
  hasDiscriminator?(): boolean;
  getDiscriminator?(): DiscriminatorObject | undefined;
  hasXml?(): boolean;
  getXml?(): XMLObject | undefined;
  hasExamples?(): boolean;
  getExamples?(): Record<string, ExampleObject | ReferenceObject> | undefined;
  hasEncoding?(): boolean;
  getEncoding?(): Record<string, EncodingObject> | undefined;
  hasAnyOf?(): boolean;
  getAnyOf?(): SchemaObject[];
}
