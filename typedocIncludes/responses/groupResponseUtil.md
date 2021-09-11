**Usage**:
```ts
import routing from '@novice1/routing';
import {
  ContextResponseUtil,
  GroupResponseUtil,
  ResponseUtil
} from '@novice1/api-doc-generator';

const simpleResponse = new ResponseUtil('TextResponse');
simpleResponse.setDescription('A simple string response')
  .addMediaType('text/plain', {
    schema: {
      type: 'string',
      example: 'whoa!'
    }
  });

const notFound = new ResponseUtil('NotFound');
notFound
  .setDescription('Entity not found.');

/**
 * GroupResponseUtil extends BaseResponseUtil
 */ 
const GroupCtxtResponse = new GroupResponseUtil([
  (new ContextResponseUtil(simpleResponse))
    .setCode(200)
    .setDefault(true),
  (new ContextResponseUtil(notFound))
    .setCode(404)
]);

// router
const router = routing()
  .get({
    path: '/something',
    auth: true,
    parameters: {
      responses: GroupCtxtResponse
    }
  }, function (req, res) {
    // do something ...
  });
```