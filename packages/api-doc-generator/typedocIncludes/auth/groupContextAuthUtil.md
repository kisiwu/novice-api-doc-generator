Helps adding security requirements for a route.

**Usage**:
```ts
import routing from '@novice1/routing';

import {
  BasicAuthUtil,
  BearerUtil,
  GroupContextAuthUtil
} from '@novice1/api-doc-generator';

const basicAuth = new BasicAuthUtil('basicAuthName');
const bearerAuth = new BearerUtil('bearerName');

const router = routing()
  .get({
    path: '/something',
    auth: true,
    parameters: {
      // add security requirements for this route
      security: new GroupContextAuthUtil([
        basicAuth,
        bearerAuth,
      ])
    }
  }, function (req, res) {
    // do something ...
  });
```