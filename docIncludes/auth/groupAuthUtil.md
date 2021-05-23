**Usage**:
```ts
import { OpenAPI, Postman } from '@novice1/api-doc-generator';
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
// (required to use authentication with OpenAPI)
const openapi = new OpenAPI();
openapi.addSecuritySchemes(groupAuth);

// add it to Postman global authentication
// (optional for Postman)
const postman = new Postman();
postman.setAuth(groupAuth);

```