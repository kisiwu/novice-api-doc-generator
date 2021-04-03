/**
 * @module helpers-base
 */

export interface BaseHelperInterface {
  isValid(): boolean;
  getType(): string;
  getDescription(): string;
  isRequired(): boolean;
  isUnique(): boolean;
  hasDefaultValue(): boolean;
  getDefaultValue(): unknown;
  hasExampleValue(): boolean;
  getExampleValue(): unknown;
  isDeprecated(): boolean;
  allowsEmptyValue(): boolean;
  getEnum(): unknown[];
  hasMin(): boolean;
  hasMax(): boolean;
  getMin(): number | undefined;
  getMax(): number | undefined;
  getUnit(): string;
}