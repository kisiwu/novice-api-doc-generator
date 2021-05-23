**Usage** (OpenAPI):
```ts
import { OpenAPI } from '@novice1/api-doc-generator';
import {
  BasicAuthUtil,
  BearerUtil,
  GroupAuthUtil
} from '@novice1/api-doc-generator/utils/auth/all';

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