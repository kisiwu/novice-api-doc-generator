Example:
```ts
import {
  BasicAuthUtil
} from '@novice1/api-doc-generator/utils/auth/basicAuthUtil';

const basicAuth = new BasicAuthUtil('basicAuthName');

openapi.setSecuritySchemes(basicAuth);
```