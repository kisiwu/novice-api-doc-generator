Example:
```ts
import {
  BasicAuthUtil
} from '@novice1/api-doc-generator/utils/auth/all';

const basicAuth = new BasicAuthUtil('basicAuth');

openapi.addSecuritySchemes(basicAuth);
```