**Usage**:
```ts
import routing from '@novice1/routing';
import { OpenAPI, Postman } from '@novice1/api-doc-generator';

import {
  ContextAuthUtil,
  OAuth2Util,
  GrantType
} from '@novice1/api-doc-generator';

// OAuth2 specifications
const oauth2 = new OAuth2Util('oAuth2AuthCode');
oauth2
  .setDescription('For more information, see https://api.slack.com/docs/oauth')
  .setGrantType(GrantType.authorizationCode)
  .setAuthUrl('https://slack.com/oauth/authorize')
  .setAccessTokenUrl('https://slack.com/api/oauth.access')
  .setScopes({
    'users:read': 'Read user information',
    'users:write': 'Modify user information',
    'im:read': 'Read messages',
    'im:write': 'Write messages',
    'im:history': 'Access the message archive',
    'search:read': 'Search messages, files, and so on'
  });
 
// add it to OpenAPI security schemes
// (required for OpenAPI)
const openapi = new OpenAPI();
openapi.addSecuritySchemes(oauth2);

// add it to Postman global authentication
// (optional for Postman)
const postman = new Postman();
postman.setAuth(oauth2);

// router
const router = routing()
  .get({
    path: '/messages',
    auth: true,
    parameters: {
      // add security requirements for this route
      security: new ContextAuthUtil(
        oauth2,
        // OAuth2 scopes for this route
        ['im:read']
      )
    }
  }, function (req, res) {
    // do something ...
  });
```