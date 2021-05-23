**Usage**:
```ts
import routing from '@novice1/routing';
import { OpenAPI, Postman } from '@novice1/api-doc-generator';

import {
  ApiKeyUtil,
  ApiKeyLocation
} from '@novice1/api-doc-generator/utils/auth/all';

const apiKey = new ApiKeyUtil('ApiKeyAuth');
apiKey
  .setName('X-API-KEY')
  .setApiKeyLocation(ApiKeyLocation.header);
 
// add it to OpenAPI security schemes
const openapi = new OpenAPI();
openapi.addSecuritySchemes(apiKey);

// add it to Postman global authentication
const postman = new Postman();
postman.setAuth(apiKey);

// router
const router = routing()
  .get({
    path: '/something',
    auth: true,
    parameters: {
      // add security requirements for this route
      security: apiKey
    }
  }, function (req, res) {
    // do something ...
  });
```