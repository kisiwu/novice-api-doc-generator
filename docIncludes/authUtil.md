Example:
```ts
import {
  BasicAuthUtil,
  BearerUtil,
  GroupAuthUtil,
  ContextAuthUtil,
  GroupContextAuthUtil
} from '@novice1/api-doc-generator/utils/auth/all';

import routing from '@novice1/routing';

const basicAuth = new BasicAuthUtil('basicAuthName');
const bearerAuth = new BearerUtil('bearerName');

openapi.setSecuritySchemes(new GroupAuthUtil([
    basicAuth,
    bearerAuth
  ]));

const router = routing()
  .get({
    path: '/admin',
    auth: true,
    parameters: {
      security: new GroupContextAuthUtil([
        basicAuth,
        bearerAuth,
      ]);,
    }
  }, function (req, res) {
    res.json({})
  });
```