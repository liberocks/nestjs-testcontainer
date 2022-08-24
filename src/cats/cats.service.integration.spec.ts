import { Test, TestingModule } from '@nestjs/testing';
import { GenericContainer } from 'testcontainers';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { pick } from 'lodash';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CatsService } from './cats.service';
import { Cat, CatSchema } from './schemas/cat.schema';

const CAT_PROPERTIES = ['name', 'breed', 'age'];

describe('CatsService', () => {
  let service: CatsService;
  let container: null | any = null;

  const mockCat = {
    name: 'Cat #1',
    breed: 'Breed #1',
    age: 4,
  };

  const catsArray = [
    {
      name: 'Cat #1',
      breed: 'Breed #1',
      age: 4,
    },
    {
      name: 'Cat #2',
      breed: 'Breed #2',
      age: 2,
    },
  ];

  beforeEach(async () => {
    container = await new GenericContainer('mongo:5.0.3')
      .withExposedPorts({ container: 27017, host: 5556 })
      .start();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: 'integration.env',
        }),
        MongooseModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            uri: config.get('MONGODB_URI'),
          }),
        }),
        MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }]),
      ],
      providers: [CatsService],
    }).compile();

    service = module.get<CatsService>(CatsService);
  });

  afterEach(async () => {
    await container.stop();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all cats', async () => {
    for (const cat of catsArray) {
      await service.create(cat);
    }

    const cats = await service.findAll();
    expect(cats.map((cat) => pick(cat, CAT_PROPERTIES))).toEqual(catsArray);
  });

  it('should insert a new cat', async () => {
    const newCat = await service.create({
      name: 'Cat #1',
      breed: 'Breed #1',
      age: 4,
    });

    expect(pick(newCat, CAT_PROPERTIES)).toEqual(mockCat);
  });
});
