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

const illegalInput = new ResponseUtil('IllegalInput');
illegalInput
  .setDescription('Illegal input for operation.');

const responses = new GroupResponseUtil([
  generalError,
  illegalInput
]);

openapi.addResponse(responses);
// or
openapi
  .addResponse(generalError)
  .addResponse(illegalInput);
```