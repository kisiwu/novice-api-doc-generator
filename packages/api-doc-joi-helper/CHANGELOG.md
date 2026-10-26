# @novice1/api-doc-joi-helper

## 1.0.0

### Patch Changes

- The repository is now a monorepo.

  New packages:

  - `@novice1/api-doc-definitions`: shared definitions (types and interfaces) used by the generator and the schema helpers.
  - `@novice1/api-doc-joi-helper`: the Joi schema helper.

  Changes:

  - `@novice1/api-doc-generator`:
    - The default handled schema is now JSON schema instead of Joi. The JSON schema helper is now part of this package.
    - Imports `@novice1/api-doc-definitions` and re-exports it.
  - `@novice1/api-doc-json-helper`:
    - Imports `@novice1/api-doc-definitions`.
    - This is probably the last version: the JSON schema helper now lives in, and is maintained by, `@novice1/api-doc-generator`.
  - `@novice1/api-doc-zod-helper`:
    - Imports `@novice1/api-doc-definitions`.
    - Updated `zod` from `^4.3.6` to `~4.6.7`. Zod can introduce breaking changes even in minor versions, so only patch updates are accepted.
