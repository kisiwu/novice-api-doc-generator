/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * RouteMeta interface was copied from "@novice1/routing"
 * to not import all of its dependencies.
 */
export interface RouteMeta<MetaParameters extends Record<string, any> = Record<string, any>, ResType = any> {
  path: string | RegExp;
  methods: Record<string, any>;
  name?: string;
  description?: string;
  tags?: string | string[];
  auth?: boolean;
  parameters?: MetaParameters;
  responses?: ResType;
}

export interface ProcessedRoute {
  path: string;
  method: string;
  schema?: unknown;
}

export interface DocGenerator {
  add(routes: RouteMeta[]): ProcessedRoute[];
  add(routes: RouteMeta): ProcessedRoute[];
  result(): unknown;
}
