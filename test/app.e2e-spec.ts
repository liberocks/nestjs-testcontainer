import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { GenericContainer } from 'testcontainers';

import * as request from 'supertest';
import { AppModule } from './../src/app.module';

jest.setTimeout(60 * 1000);

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let container;

  beforeEach(async () => {
    container = await new GenericContainer('mongo:5.0.3')
      .withExposedPorts({ container: 27017, host: 5555 })
      .start();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    if (container) await container.stop();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
