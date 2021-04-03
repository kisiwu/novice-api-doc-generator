/**
 * @module openapi-helpers-joi
 */
import { JoiHelper } from '../../../helpers/joiHelper';
import { AdditionalProperties, DiscriminatorObject, EncodingObject, ExampleObject, ReferenceObject, XMLObject } from '../definitions';
import { OpenApiHelperInterface } from './interfaces';
export declare class OpenApiJoiHelper extends JoiHelper implements OpenApiHelperInterface {
    getFirstItem(): OpenApiJoiHelper | undefined;
    getChildren(): Record<string, OpenApiJoiHelper>;
    getAlternatives(): OpenApiJoiHelper[];
    hasStyle(): boolean;
    getStyle(): string;
    hasAdditionalProperties(): boolean;
    getAdditionalProperties(): AdditionalProperties;
    hasRef(): boolean;
    getRef(): string | undefined;
    hasDiscriminator(): boolean;
    getDiscriminator(): DiscriminatorObject | undefined;
    hasXml(): boolean;
    getXml(): XMLObject | undefined;
    hasExamples(): boolean;
    getExamples(): Record<string, ExampleObject | ReferenceObject> | undefined;
    hasEncoding(): boolean;
    getEncoding(): Record<string, EncodingObject> | undefined;
}
