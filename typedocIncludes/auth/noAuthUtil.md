**Usage**:
```ts
import routing from '@novice1/routing';

import {
  BasicAuthUtil,
  NoAuthUtil,
  GroupContextAuthUtil
} from '@novice1/api-doc-generator/utils/auth/all';

const basicAuth = new BasicAuthUtil('basicAuth');

const router = routing()
  .get({
    path: '/something',
    parameters: {
      // add security requirements for this route
      security: new GroupContextAuthUtil([
        new NoAuthUtil(),
        basicAuth
      ])
    }
  }, function (req, res) {
    // do something ...
  });
```