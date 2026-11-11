Example:
```ts
import {
  BasicAuthUtil
} from '@novice1/api-doc-generator';

const basicAuth = new BasicAuthUtil('basicAuthName');

postman.setDefaultSecurity(basicAuth);
```