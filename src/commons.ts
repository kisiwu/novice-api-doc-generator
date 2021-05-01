export interface Route {
  path: string;
  methods: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ProcessedRoute {
  path: string;
  method: string;
  schema?: unknown;
}

export interface DocGenerator {
  add(routes: Route[]): ProcessedRoute[];
  add(routes: Route): ProcessedRoute[];
  result(): unknown;
}