import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { GenericContainer } from 'testcontainers';
import { isEmpty } from 'lodash';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { Cat } from '../src/cats/schemas/cat.schema';

jest.setTimeout(60 * 1000);

describe('CatsController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let container: any;

  beforeEach(async () => {
    container = await new GenericContainer('mongo:5.0.3')
      .withExposedPorts({ container: 27017, host: 5555 })
      .start();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Reference the server instance
    server = app.getHttpServer();
  });

  afterEach(async () => {
    await container.stop();
    server.close();
  });

  it('/cats (POST)', async () => {
    // prepare data
    const cat = { name: 'Cat', age: 1, breed: 'Persian' };

    // execute process
    const result = await request(server).post('/cats').send(cat);

    // assess result
    expect(result.status).toBe(201);
    expect(result.body.name).toEqual(cat.name);
    expect(result.body.age).toEqual(cat.age);
    expect(result.body.breed).toEqual(cat.breed);
  });

  it('/cats (GET)', async () => {
    // prepare data
    const cat = { name: 'Cat', age: 1, breed: 'Persian' };

    // execute process
    await request(server).post('/cats').send(cat);
    const result = await request(server).get('/cats');

    // assess result
    expect(result.status).toBe(200);
    expect((result.body as Cat[]).length).toBe(1);
    expect((result.body as Cat[])[0].name).toBe(cat.name);
    expect((result.body as Cat[])[0].age).toBe(cat.age);
    expect((result.body as Cat[])[0].breed).toBe(cat.breed);
  });

  it('/cats/:id (GET)', async () => {
    // prepare data
    const cat = { name: 'Cat', age: 1, breed: 'Persian' };

    // execute process
    const init = await request(server).post('/cats').send(cat);
    const result = await request(server).get(`/cats/${init.body._id}`);

    // assess result
    expect(result.status).toBe(200);
    expect(result.body.name).toEqual(cat.name);
    expect(result.body.age).toEqual(cat.age);
    expect(result.body.breed).toEqual(cat.breed);
  });

  it('/cats/:id (DELETE)', async () => {
    // prepare data
    const cat = { name: 'Cat', age: 1, breed: 'Persian' };

    // execute process
    const init = await request(server).post('/cats').send(cat);
    await request(server).delete(`/cats/${init.body._id}`);
    const result = await request(server).get(`/cats/${init.body._id}`);

    // assess result
    expect(isEmpty(result.body)).toBe(true);
  });
});
