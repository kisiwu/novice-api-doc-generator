Example:
```ts
import {
  BasicAuthUtil
} from '@novice1/api-doc-generator';

const basicAuth = new BasicAuthUtil('basicAuth');

openapi.addSecuritySchemes(basicAuth);
```