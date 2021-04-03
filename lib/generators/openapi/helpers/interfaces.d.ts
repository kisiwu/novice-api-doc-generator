/**
 * @module openapi-helpers-interfaces
 */
import { BaseHelperInterface } from '../../../helpers/baseHelper';
import { AdditionalProperties, DiscriminatorObject, EncodingObject, ExampleObject, ReferenceObject, XMLObject } from '../definitions';
export interface OpenApiHelperInterface extends BaseHelperInterface {
    getFirstItem(): OpenApiHelperInterface | undefined;
    getChildren(): Record<string, OpenApiHelperInterface>;
    getAlternatives(): OpenApiHelperInterface[];
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
}
