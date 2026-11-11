# novice-api-doc-generator

Monorepo for the API documentation generator of [`@novice1`](https://www.npmjs.com/org/novice1).

It generates **OpenAPI 3.1.0** and **Postman Collection v2.1.0** documentation directly from the route metadata of your application, with helpers to support schemas from popular validation libraries.

📖 Documentation: <https://kisiwu.github.io/novice-api-doc-generator/latest/>

## Table of contents

- [Packages](#packages)
- [Examples](#examples)
- [Getting started](#getting-started)
- [Development](#development)
  - [Requirements](#requirements)
  - [Scripts](#scripts)
  - [Repository layout](#repository-layout)
- [Releasing](#releasing)
- [License](#license)

## Packages

| Package                                                          | Description                                                                           |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [`@novice1/api-doc-generator`](./packages/api-doc-generator)     | Core package. Provides the `OpenAPI` and `Postman` generators.                        |
| [`@novice1/api-doc-definitions`](./packages/api-doc-definitions) | TypeScript definitions (types and interfaces) for OpenAPI and Postman documentation.  |
| [`@novice1/api-doc-json-helper`](./packages/api-doc-json-helper) | JSON schema helpers, compatible with `@novice1/validator-json`.                       |
| [`@novice1/api-doc-joi-helper`](./packages/api-doc-joi-helper)   | [Joi](https://joi.dev) schema helpers, compatible with `@novice1/validator-joi`.      |
| [`@novice1/api-doc-zod-helper`](./packages/api-doc-zod-helper)   | [Zod](https://zod.dev) (v4) schema helpers, compatible with `@novice1/validator-zod`. |

Each package has its own README with installation and usage details.

## Examples

| Example                                     | Description                                                                         |
| ------------------------------------------- | ----------------------------------------------------------------------------------- |
| [`simple-routes`](./examples/simple-routes) | Express application with routes declared with JSON, Joi and Zod schemas, and tests. |

## Getting started

Install the generator, plus the helper matching your validation library:

```bash
npm install @novice1/api-doc-generator
# optional helpers
npm install @novice1/api-doc-json-helper
npm install @novice1/api-doc-joi-helper joi
npm install @novice1/api-doc-zod-helper zod
```

Then create a generator, add the metadata of your routes and get the documentation:

```ts
import { OpenAPI } from '@novice1/api-doc-generator';
import routing from '@novice1/routing';

const router = routing().get(
  {
    name: 'Get user',
    path: '/users/:id',
    description: 'Returns a user',
  },
  function (req, res) {
    res.json({});
  }
);

const openapi = new OpenAPI().setTitle('My API').setHost('http://localhost:8000');

openapi.add(router.getMeta());

console.log(openapi.result());
```

Use `Postman` instead of `OpenAPI` to generate a Postman collection. See the [`@novice1/api-doc-generator` README](./packages/api-doc-generator) for the full guide.

## Development

### Requirements

- [Node.js](https://nodejs.org) 22, 24 or 26 (the versions tested in CI)
- [pnpm](https://pnpm.io) (see the `packageManager` field in [package.json](./package.json))

### Scripts

Install the dependencies, then run the scripts from the root of the repository:

```bash
pnpm install
```

| Script                | Description                                          |
| --------------------- | ---------------------------------------------------- |
| `pnpm build`          | Build all packages and examples.                     |
| `pnpm lint`           | Run ESLint and type-check all workspaces.            |
| `pnpm test`           | Run the tests of all workspaces.                     |
| `pnpm format`         | Format the sources of the packages with Prettier.    |
| `pnpm format:check`   | Check the formatting of the packages.                |
| `pnpm doc`            | Generate the API reference with TypeDoc.             |
| `pnpm clean:build`    | Remove the build output (`lib`) of all workspaces.   |
| `pnpm clean:deps`     | Remove all `node_modules` folders.                   |
| `pnpm clean:coverage` | Remove the coverage reports.                         |
| `pnpm clean`          | Remove `node_modules`, `lib`, `docs` and `coverage`. |

Scripts can be scoped to a single workspace with pnpm filters, for example:

```bash
pnpm --filter @novice1/api-doc-generator test
```

### Repository layout

```
.
├── packages/    # Published packages
├── examples/    # Example applications (private)
├── .changeset/  # Release ledger
└── .github/     # CI workflows
```

The workspaces are defined in [pnpm-workspace.yaml](./pnpm-workspace.yaml). Packages depend on each other through the `workspace:` protocol.

## Releasing

Versions are tracked per package and recorded in each package's `CHANGELOG.md`. Release helpers are available at the root:

| Script                                                  | Description                           |
| ------------------------------------------------------- | ------------------------------------- |
| `pnpm release:build`                                    | Build the packages.                   |
| `pnpm release:test`                                     | Test the packages.                    |
| `pnpm version:patch` / `version:minor` / `version:major` | Bump the version of every package.    |
| `pnpm release:publish`                                  | Publish the packages publicly to npm. |

## License

[MIT](./LICENSE)
