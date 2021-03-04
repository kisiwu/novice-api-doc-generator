export interface ElementHelper {
  isValid(): boolean;
  getType(): string;
}

export interface GeneratorHelperInterface extends ElementHelper {
  getDescription(): string;
  isRequired(): boolean;
  hasDefaultValue(): boolean;
  getDefaultValue(): unknown;
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
}