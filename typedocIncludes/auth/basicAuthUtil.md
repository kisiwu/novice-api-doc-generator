**Usage**:
```ts
import routing from '@novice1/routing';
import {
  OpenAPI,
  Postman,
  BasicAuthUtil
} from '@novice1/api-doc-generator';

const basicAuth = new BasicAuthUtil('basicAuth');
 
// add it to OpenAPI security schemes
const openapi = new OpenAPI();
openapi.addSecuritySchemes(basicAuth);

// add it to Postman global authentication
const postman = new Postman();
postman.setAuth(basicAuth);

// router
const router = routing()
  .get({
    path: '/something',
    auth: true,
    parameters: {
      // add security requirements for this route
      security: basicAuth
    }
  }, function (req, res) {
    // do something ...
  });
```