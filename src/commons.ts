import { RouteMeta } from '@novice1/routing'

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