/*
//@todo
import { JoiGeneratorHelper } from '../../../utils/joiGeneratorHelper';
import { OpenApiGeneratorHelperInterface } from './generatorHelper';
import {
  ExampleObject,
  ReferenceObject,
} from '../definitions';

export class OpenApiJoiGeneratorHelper extends JoiGeneratorHelper implements OpenApiGeneratorHelperInterface {
  getExamples(): Record<string, ExampleObject | ReferenceObject> | undefined {
    if (!this.isJoi()) {
      return;
    }
    return this._joi['$_terms']
      && this._joi['$_terms'].metas
      && this._joi['$_terms'].metas[0]
      && this._joi['$_terms'].metas[0].examples;
  }
}
*/