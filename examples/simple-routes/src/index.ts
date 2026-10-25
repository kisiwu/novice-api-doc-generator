import { joiDoc } from './routes/joi-route';
import { jsonDoc } from './routes/json-route';
import { zodDoc } from './routes/zod-route';
import type { Folder, Item } from '@novice1/api-doc-generator';

//// OpenAPI

console.log('--- OpenAPI JSON ');
console.log((jsonDoc.openapi.paths['/app'].get as { parameters?: unknown[] })?.parameters?.[0]);
console.log('--- OpenAPI Joi ');
console.log((joiDoc.openapi.paths['/app'].get as { parameters?: unknown[] })?.parameters?.[0]);
console.log('--- OpenAPI Zod ');
console.log((zodDoc.openapi.paths['/app'].get as { parameters?: unknown[] })?.parameters?.[0]);

//// Postman

console.log('--- Postman JSON ');
console.log(((jsonDoc.postman.item[0] as Folder).item[0] as Item).request.url?.query?.[0]);
console.log('--- Postman Joi ');
console.log(((joiDoc.postman.item[0] as Folder).item[0] as Item).request.url?.query?.[0]);
console.log('--- Postman Zod ');
console.log(((zodDoc.postman.item[0] as Folder).item[0] as Item).request.url?.query?.[0]);
