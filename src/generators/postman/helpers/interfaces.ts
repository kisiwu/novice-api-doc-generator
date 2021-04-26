/**
 * @module postman-helpers-interfaces
 */

 import { BaseHelperInterface } from '../../../helpers/baseHelper';
import { XMLObject } from '../../openapi/definitions';
 
 export interface PostmanHelperInterface extends BaseHelperInterface {
   // required
   getFirstItem(): PostmanHelperInterface | undefined;
   getChildren(): Record<string, PostmanHelperInterface>;
   getAlternatives(): PostmanHelperInterface[];
 
   // optionals
   hasContentType?(): boolean;
   getContentType?(): string | undefined;
   hasDescriptionType?(): boolean;
   getDescriptionType?(): string | undefined;
   hasXml?(): boolean;
   getXml?(): XMLObject | undefined;
 }
 