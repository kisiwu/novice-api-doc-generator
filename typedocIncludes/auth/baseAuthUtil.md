**Usage**:
```ts
import routing from '@novice1/routing';
import {
  OpenAPI,
  BearerUtil
} from '@novice1/api-doc-generator';

/**
 * BearerUtil extends BaseAuthUtil extends BaseContextAuthUtil
 */
const bearerAuth = new BearerUtil('bearerName');

const openapi = new OpenAPI();

// add it to the security schemes
openapi.addSecuritySchemes(bearerAuth);

const router = routing()
  .get({
    path: '/admin',
    auth: true,
    parameters: {
      // add security requirement for this route
      security: bearerAuth
    }
  }, function (req, res) {
    res.json({})
  });
```