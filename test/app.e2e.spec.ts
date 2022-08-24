import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { GenericContainer } from 'testcontainers';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';

jest.setTimeout(60 * 1000);

describe('AppController (e2e)', () => {
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

  it('/ (GET)', () => {
    return request(server).get('/').expect(200).expect('Hello World!');
  });
});
