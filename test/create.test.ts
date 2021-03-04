import { OpenApi } from '../src';
import { expect } from 'chai';

describe('create OpenApi instance', () => {
  it('works', () => {
    const openapi = new OpenApi();
    openapi.setTitle('Test');
    const result = openapi.result();
    expect(result).to.be.an('object')
      .that.haveOwnProperty('info')
      .that.is.an('object')
      .that.haveOwnProperty('title').equals('Test');
    console.log(result);
  });
});
