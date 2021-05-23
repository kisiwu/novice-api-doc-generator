**Usage** (Postman):
```ts
import { Postman } from '@novice1/api-doc-generator';
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

// add it to Postman global authentication
const postman = new Postman();
postman.setAuth(groupAuth);

```