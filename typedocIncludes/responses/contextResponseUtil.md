```ts
import routing from '@novice1/routing';
import {
  ContextResponseUtil,
  ResponseUtil
} from '@novice1/api-doc-generator';

const notFound = new ResponseUtil('NotFound');
notFound
  .setDescription('Entity not found.');

// router
const router = routing()
  .get({
    path: '/something',
    auth: true,
    parameters: {
      responses: (new ContextResponseUtil(notFound))
        .setCode(404)
    }
  }, function (req, res) {
    // do something ...
  });
```