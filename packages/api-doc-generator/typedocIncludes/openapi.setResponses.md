Example:
```ts
import {
  ResponseUtil,
  GroupResponseUtil
} from '@novice1/api-doc-generator';

const generalError = new ResponseUtil('GeneralError');
generalError
  .setDescription('General Error')
  .addMediaType('application/json', {
    schema: {
      $ref: '#/components/schemas/GeneralError'
    }
  });

const responses = new GroupResponseUtil([
  generalError,
  // ... other responses
]);

openapi.setResponses(generalError);
// or 
openapi.setResponses(responses);
```