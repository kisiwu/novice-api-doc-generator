export interface ElementHelper {
  isValid(): boolean;
  getType(): string;
}

export interface GeneratorHelperInterface extends ElementHelper {
  getDescription(): string;
  isRequired(): boolean;
  hasDefaultValue(): boolean;
  getDefaultValue(): unknown;
  hasExampleValue(): boolean;
  getExampleValue(): unknown;
  isDeprecated(): boolean;
  allowsEmptyValue(): boolean;
  getEnum(): unknown[];
  getFirstItem(): GeneratorHelperInterface | undefined;
  hasMin(): boolean;
  hasMax(): boolean;
  getMin(): number | undefined;
  getMax(): number | undefined;
  getUnit(): string;
  hasRule(name: string): boolean; //@todo: make more specific method (e.g.: shouldBeUnique, should...)
  getRule(name: string): unknown; // should it still be used?
  getChildren(): Record<string, GeneratorHelperInterface>;
  getAlternatives(): GeneratorHelperInterface[];

  /**
   * methods for openapi
   */
  hasStyle?(): boolean;
  getStyle?(): unknown;
  hasAdditionalProperties?(): boolean;
  getAdditionalProperties?(): unknown;
  hasRef?(): boolean;
  getRef?(): unknown;
  hasDiscriminator?(): boolean;
  getDiscriminator?(): unknown;
  hasXml?(): boolean;
  getXml?(): unknown;
  hasExamples?(): boolean;
  getExamples?(): Record<string, Record<string, unknown>> | undefined;
  hasEncoding?(): boolean;
  getEncoding?(): Record<string, Record<string, unknown>> | undefined;
}

export class GeneratorHelper implements GeneratorHelperInterface {
  _arg: unknown;

  constructor(arg: unknown) {
    this._arg = arg;
  }
  isValid(): boolean {
    return false;
  }

  getType(): string {
    return '';
  }

  getDescription(): string {
    return '';
  }

  isRequired(): boolean {
    return false
  }

  hasDefaultValue(): boolean {
    return false
  }

  getDefaultValue(): unknown {
    return undefined
  }

  hasExampleValue(): boolean {
    return false
  }

  getExampleValue(): unknown {
    return undefined
  }

  isDeprecated(): boolean {
    return false;
  }
  hasStyle(): boolean {
    return false;
  }
  getStyle(): unknown {
    return;
  }

  allowsEmptyValue(): boolean {
    return false;
  }

  getEnum(): unknown[] {
    return [];
  }

  getFirstItem(): GeneratorHelperInterface | undefined {
    return undefined;
  }

  hasMin(): boolean {
    return false
  }

  hasMax(): boolean {
    return false
  }

  getMin(): number | undefined {
    return undefined
  }

  getMax(): number | undefined {
    return undefined
  }

  getUnit(): string {
    return ''
  }

  hasRule(name: string): boolean {
    return name ? false : false;
  }

  getRule(name: string): unknown {
    return name ? undefined : undefined;
  }

  getChildren(): Record<string, GeneratorHelperInterface> {
    return {};
  }

  getAlternatives(): GeneratorHelperInterface[] {
    return [];
  }
}