// auth utils
import {
  //NoAuthUtil,
  ApiKeyUtil, 
  ApiKeyLocation,
  BearerUtil,
  GroupAuthUtil,
  //ContextAuthUtil,
  GroupContextAuthUtil,
} from '../src/index';
// response utils
import {
  ResponseUtil,
  ContextResponseUtil,
  GroupResponseUtil
} from '../src/index';

// auth
export const apiKeyAuth = new ApiKeyUtil('Google-auth');
apiKeyAuth.setApiKeyLocation(ApiKeyLocation.query)
  .setName('Authorization');
export const bearerAuth = new BearerUtil('OpenSource-auth');
bearerAuth.setBearerFormat('JWT')
  .setToken('unknown');

export const GroupCtxtAuth = new GroupContextAuthUtil([
  //new NoAuthUtil(),
  //new ContextAuthUtil(bearerAuth),
  //new ContextAuthUtil(apiKeyAuth),
  bearerAuth,
  apiKeyAuth
]);

export const GroupAuth = new GroupAuthUtil([
  bearerAuth,
  apiKeyAuth,
]);

// responses

export const simpleResponse = new ResponseUtil('SimpleResponse').setHeaders({
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
      examples: ['whoa!']
    }
  });

export const GroupCtxtResponse = new GroupResponseUtil([
  (new ContextResponseUtil(simpleResponse))
    .setDefault(true)
    .setCode(200)
    .setRef('#/components/responses/SimpleResponse')
]);