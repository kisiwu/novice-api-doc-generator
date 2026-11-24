---
'@novice1/api-doc-generator': patch
'@novice1/api-doc-json-helper': patch
---

- Fix JSON schema validity check to allow schemas with an explicit `enum` property
- Improve extendability in schema helpers by preserving subclass instances (`this`) when returning nested items
