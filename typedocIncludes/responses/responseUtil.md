**Usage**:
```ts
/**
 * ResponseUtil extends FullResponseUtil extends BaseResponseUtil
 */
const simpleResponse = new ResponseUtil('TextResponse');
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
```