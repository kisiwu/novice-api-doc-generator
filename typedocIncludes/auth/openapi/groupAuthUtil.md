**Usage** (OpenAPI):
```ts
import {
  OpenAPI,
  BasicAuthUtil,
  BearerUtil,
  GroupAuthUtil
} from '@novice1/api-doc-generator';

const basicAuth = new BasicAuthUtil('basicAuthName');
const bearerAuth = new BearerUtil('bearerName');

const groupAuth = new GroupAuthUtil([
  basicAuth,
  bearerAuth
]);

// add it to OpenAPI security schemes
const openapi = new OpenAPI();
openapi.addSecuritySchemes(groupAuth);
```