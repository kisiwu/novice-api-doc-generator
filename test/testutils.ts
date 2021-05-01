// auth utils
import {
  ContextAuthUtil,
  GroupContextAuthUtil
} from '../src/utils/auth/contextAuthUtils';
import {
  ApiKeyUtil, ApiKeyLocation
} from '../src/utils/auth/apiKeyUtil';
import {
  BearerUtil
} from '../src/utils/auth/bearerUtil';
import {
  //NoAuthUtil
} from '../src/utils/auth/noAuthUtil';
// response utils
import {
  ResponseUtil
} from '../src/utils/responses/responseUtil';
import {
  ContextResponseUtil,
  GroupContextResponseUtil
} from '../src/utils/responses/contextResponseUtils';

// auth

export const apiKeyAuth = new ApiKeyUtil('Google-auth');
apiKeyAuth.setApiKeyLocation(ApiKeyLocation.query)
  .setName('Authorization');
export const bearerAuth = new BearerUtil('OpenSource-auth');
bearerAuth.setBearerFormat('JWT')
  .setToken('unknown');

export const GroupCtxtAuth = new GroupContextAuthUtil([
  //new NoAuthUtil(),
  new ContextAuthUtil(bearerAuth),
  //new ContextAuthUtil(apiKeyAuth),
]);

// responses

const simpleResponse = new ResponseUtil(200);
simpleResponse.setHeaders({
  'X-Rate-Limit-Limit': {
    description: 'The number of allowed requests in the current period',
    schema: {
      type: 'integer'
    }
  },
  'X-Rate-Limit-Remaining': {
    description: 'The number of remaining requests in the current period',
    schema: {
      type: 'integer'
    }
  },
  'X-Rate-Limit-Reset': {
    description: 'The number of seconds left in the current period',
    schema: {
      type: 'integer'
    }
  }
})
  .setDescription('A simple string response')
  .addMediaType('text/plain', {
    schema: {
      type: 'string',
      example: 'whoa!'
    }
  });

export const GroupCtxtResponse = new GroupContextResponseUtil([
  (new ContextResponseUtil(simpleResponse))
    .setDefault(true)
]);