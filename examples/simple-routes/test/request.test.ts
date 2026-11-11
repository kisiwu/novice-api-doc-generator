import { router as jsonRouter } from '../src/routes/json-route';
import { expect } from 'chai';
import express from 'express';
import request from 'supertest';

describe('GET /app', () => {
  it('should return the version number from the query', async () => {
    const app = express();
    app.use(jsonRouter);

    const response = await request(app).get('/app').query({ version: 3 });
    expect(response.status).to.equal(200);
    expect(response.body).to.equal(3);
  });
});
