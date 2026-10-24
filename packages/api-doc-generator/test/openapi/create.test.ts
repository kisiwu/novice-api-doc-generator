import { OpenAPI } from '../../src';
import { expect } from 'chai';

describe('create OpenAPI instance', () => {
  it('works', () => {
    const openapi = new OpenAPI();
    openapi.setTitle('Test');
    const result = openapi.result();
    expect(result).to.be.an('object')
      .that.haveOwnProperty('info')
      .that.is.an('object')
      .that.haveOwnProperty('title').equals('Test');
    //console.log(result);
  });
});
