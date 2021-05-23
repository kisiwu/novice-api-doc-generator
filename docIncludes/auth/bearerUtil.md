**Usage**:
```ts
import routing from '@novice1/routing';
import { OpenAPI, Postman } from '@novice1/api-doc-generator';

import {
  BearerUtil
} from '@novice1/api-doc-generator/utils/auth/all';

const bearer = new BearerUtil('bearerAuth');
bearer.setBearerFormat('JWT');
 
// add it to OpenAPI security schemes
const openapi = new OpenAPI();
openapi.addSecuritySchemes(bearer);

// add it to Postman global authentication
const postman = new Postman();
postman.setAuth(bearer);

// router
const router = routing()
  .get({
    path: '/something',
    auth: true,
    parameters: {
      // add security requirements for this route
      security: bearer
    }
  }, function (req, res) {
    // do something ...
  });
```